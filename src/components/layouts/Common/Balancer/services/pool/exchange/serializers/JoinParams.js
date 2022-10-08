import {AddressZero} from '@ethersproject/constants';
import {parseUnits} from '@ethersproject/units';

import {isManaged, isStableLike} from '../../../../composables/usePool';
import {encodeJoinStablePool} from '../../../../lib/utils/balancer/stablePoolEncoding';
import {encodeJoinWeightedPool} from '../../../../lib/utils/balancer/weightedPoolEncoding';

export default class JoinParams {
  constructor(exchange) {
    this.pool = exchange.pool;
    this.config = exchange.config;
    this.isStableLikePool = isStableLike(this.pool.poolType);
    this.isManagedPool = isManaged(this.pool.poolType);
    this.isSwapEnabled =
      this.isManagedPool && this.pool.onchain.swapEnabled;
    this.dataEncodeFn = this.isStableLikePool ?
      encodeJoinStablePool :
      encodeJoinWeightedPool;
    this.fromInternalBalance = false;
  }

  serialize(
    account,
    amountsIn,
    tokensIn,
    bptOut
  ) {
    const parsedAmountsIn = this.parseAmounts(amountsIn, tokensIn);
    const parsedBptOut = parseUnits(bptOut, this.pool.onchain.decimals);
    const txData = this.txData(parsedAmountsIn, parsedBptOut);
    const assets = this.parseTokensIn(tokensIn);

    return [
      this.pool.id,
      account,
      account,
      {
        assets,
        maxAmountsIn: parsedAmountsIn,
        userData: txData,
        fromInternalBalance: this.fromInternalBalance,
      },
    ];
  }

  value(amountsIn, tokensIn) {
    let value = '0';
    const nativeAsset = this.config.network.nativeAsset;

    amountsIn.forEach((amount, i) => {
      if (tokensIn[i] === nativeAsset.address) {
        value = amount;
      }
    });

    return parseUnits(value, nativeAsset.decimals);
  }

  parseAmounts(amounts, tokensIn) {
    const nativeAsset = this.config.network.nativeAsset;
    console.log('JoinParams parseAmounts top', nativeAsset);

    return amounts.map((amount, i) => {
      const token = tokensIn[i];
      // In WETH pools, tokenIn can include ETH so we need to check for this
      // and return the correct decimals.
      console.log('JoinParams parseAmounts decimals', this.pool);
      const decimals =
      nativeAsset.address === token ?
        nativeAsset.decimals :
        this.pool.onchain.tokens[token].decimals;

      return parseUnits(amount || '0', decimals);
    });
  }

  parseTokensIn(tokensIn) {
    const nativeAsset = this.config.network.nativeAsset;

    return tokensIn.map((address) =>
      address === nativeAsset.address ? AddressZero : address
    );
  }

  txData(amountsIn, minimumBPT) {
    if (this.pool.onchain.totalSupply === '0') {
      return this.dataEncodeFn({kind: 'Init', amountsIn});
    } else {
      // Managed Pools can only be joined proportionally if trading is halted
      // This code assumes the UI has disabled non-proportional "exact in for BPT out"
      // joins in this case
      if (this.isManagedPool && !this.isSwapEnabled) {
        return this.dataEncodeFn({
          kind: 'AllTokensInForExactBPTOut',
          bptAmountOut: minimumBPT,
        });
      } else {
        return this.dataEncodeFn({
          kind: 'ExactTokensInForBPTOut',
          amountsIn,
          minimumBPT,
        });
      }
    }
  }
}
