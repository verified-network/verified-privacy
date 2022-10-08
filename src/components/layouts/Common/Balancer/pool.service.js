import {differenceInWeeks} from 'date-fns';
import {getAddress} from 'ethers/lib/utils';

import {isStable} from './composables/usePool';
import {oneSecondInMs} from './composables/useTime';
import {bnum} from './utils';
import 'babel-polyfill';

export default class PoolService {
  constructor(pool) {
    this.pool = {...pool};
    this.format();
  }

  format() {
    this.pool.address = this.address;
    this.pool.isNew = this.isNew;
    this.pool.tokenAddresses = this.pool.tokensList.map((t) => getAddress(t));
    this.formatPoolTokens();
    return this.pool;
  }

  get address() {
    return getAddress(this.pool.id.slice(0, 42));
  }

  get bptPrice() {
    return bnum(this.pool.totalLiquidity)
      .div(this.pool.totalShares)
      .toString();
  }

  setTotalLiquidity(
    prices,
    currency
  ) {
    const liquidityConcern = new this.liquidity(this.pool);
    const totalLiquidity = liquidityConcern.calcTotal(prices, currency);
    return (this.pool.totalLiquidity = totalLiquidity);
  }

  async setAPR(
    poolSnapshot,
    prices,
    currency,
    protocolFeePercentage,
    stakingBalApr,
    stakingRewardApr = '0'
  ) {
    const aprConcern = new this.apr(this.pool);
    const apr = await aprConcern.calc(
      poolSnapshot,
      prices,
      currency,
      protocolFeePercentage,
      stakingBalApr,
      stakingRewardApr
    );

    return (this.pool.apr = apr);
  }

  formatPoolTokens() {
    const tokens = this.pool.tokens.map((token) => ({
      ...token,
      address: getAddress(token.address),
    }));

    if (isStable(this.pool.poolType)) return (this.pool.tokens = tokens);

    return (this.pool.tokens = tokens.sort(
      (a, b) => parseFloat(b.weight) - parseFloat(a.weight)
    ));
  }

  setFeesSnapshot(poolSnapshot) {
    if (!poolSnapshot) return '0';

    const feesSnapshot = bnum(this.pool.totalSwapFee)
      .minus(poolSnapshot.totalSwapFee)
      .toString();

    return (this.pool.feesSnapshot = feesSnapshot);
  }

  setVolumeSnapshot(poolSnapshot) {
    if (!poolSnapshot) return '0';

    const volumeSnapshot = bnum(this.pool.totalSwapVolume)
      .minus(poolSnapshot.totalSwapVolume)
      .toString();

    return (this.pool.volumeSnapshot = volumeSnapshot);
  }

  get isNew() {
    return (
      differenceInWeeks(Date.now(), this.pool.createTime * oneSecondInMs) < 1
    );
  }
}
