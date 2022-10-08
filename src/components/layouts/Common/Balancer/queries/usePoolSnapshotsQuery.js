import {isStablePhantom} from '../composables/usePool';
import PoolSnapshots from '../services/balancer/subgraph/entities/poolSnapshots';
import {coingeckoService} from '../services/coingecko/coingecko.service';

export const usePoolSnapshotsQuery = async (pool, days = 30, options) => {
  if (!pool) throw new Error('No pool');

  let snapshots = {};
  let prices = {};

  const poolSnapshots = new PoolSnapshots();
  const isStablePhantomPool = isStablePhantom(pool.poolType);
  if (isStablePhantomPool) {
    snapshots = await poolSnapshots.get(pool.id, days);

    return {
      prices,
      snapshots,
    };
  } else {
    const tokens = pool.tokenAddresses;
    [prices, snapshots] = await Promise.all([
      coingeckoService.prices.getTokensHistorical(tokens, days),
      poolSnapshots.get(pool.id, days),
    ]);
  }

  return {prices, snapshots};
};
