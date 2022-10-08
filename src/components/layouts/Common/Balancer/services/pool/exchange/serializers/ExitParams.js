import {AddressZero} from '@ethersproject/constants';
import {parseUnits} from '@ethersproject/units';

import {isStableLike} from '../../../../composables/usePool';
import {encodeExitStablePool} from '../../../../lib/utils/balancer/stablePoolEncoding';
import {encodeExitWeightedPool} from '../../../../lib/utils/balancer/weightedPoolEncoding';

export default class ExitParams {
  constructor(exchange) {
    this.pool = exchange.pool;
    this.config = exchange.config;
    this.isStableLike = isStableLike(exchange.pool.poolType);
    this.dataEncodeFn = this.isStableLike ?
      encodeExitStablePool :
      encodeExitWeightedPool;
    this.toInternalBalance = false;
  }

  serialize(
    account,
    amountsOut,
    tokensOut,
    bptIn,
    exitTokenIndex,
    exactOut
  ) {
    const parsedAmountsOut = this.parseAmounts(amountsOut);
    const parsedBptIn = parseUnits(bptIn, this.pool.onchain.decimals);
    const assets = this.parseTokensOut(tokensOut);
    const txData = this.txData(
      parsedAmountsOut,
      parsedBptIn,
      exitTokenIndex,
      exactOut
    );

    return [
      this.pool.id,
      account,
      account,
      {
        assets,
        minAmountsOut: parsedAmountsOut.map((amount) =>
          // This is a hack to get around rounding issues for MetaStable pools
          // TODO: do this more elegantly
          amount.gt(0) ? amount.sub(1) : amount
        ),
        userData: txData,
        toInternalBalance: this.toInternalBalance,
      },
    ];
  }

  parseAmounts(amounts) {
    return amounts.map((amount, i) => {
      const token = this.pool.tokenAddresses[i];
      return parseUnits(amount, this.pool.onchain.tokens[token].decimals);
    });
  }

  parseTokensOut(tokensOut) {
    const nativeAsset = this.config.network.nativeAsset;

    return tokensOut.map((address) =>
      address === nativeAsset.address ? AddressZero : address
    );
  }

  txData(
    amountsOut,
    bptIn,
    exitTokenIndex,
    exactOut
  ) {
    const isSingleAssetOut = exitTokenIndex !== null;

    if (isSingleAssetOut) {
      return this.dataEncodeFn({
        kind: 'ExactBPTInForOneTokenOut',
        bptAmountIn: bptIn,
        exitTokenIndex,
      });
    } else if (exactOut) {
      return this.dataEncodeFn({
        amountsOut,
        maxBPTAmountIn: bptIn,
      });
    } else {
      return this.dataEncodeFn({
        kind: 'ExactBPTInForTokensOut',
        bptAmountIn: bptIn,
      });
    }
  }
}
