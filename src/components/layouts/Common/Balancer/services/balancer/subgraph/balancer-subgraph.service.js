import {Network} from '@balancer-labs/sdk';
import {networkId} from '../../../composables/useNetwork';
import {balancerSubgraphClient} from './balancer-subgraph.client';
import PoolActivities from './entities/poolActivities';
import Pools from './entities/pools';
import PoolShares from './entities/poolShares';
import PoolSnapshots from './entities/poolSnapshots';
import TradePairSnapshots from './entities/tradePairs';

export default class BalancerSubgraphService {
  pools;
  poolShares;
  poolActivities;
  poolSwaps;
  poolSnapshots;
  tradePairSnapshots;

  constructor() {
    // Init entities
    this.client = balancerSubgraphClient,
    this.pools = new Pools(this);
    this.poolShares = new PoolShares(this);
    this.poolActivities = new PoolActivities(this);
    // this.poolSwaps = new PoolSwaps(this);
    this.poolSnapshots = new PoolSnapshots(this);
    this.tradePairSnapshots = new TradePairSnapshots(this);
  }

  get blockTime() {
    switch (networkId) {
    case Network.MAINNET:
      return 13;
    case Network.POLYGON:
      return 2;
    case Network.ARBITRUM:
      return 3;
    case Network.KOVAN:
      // Should be ~4s but this causes subgraph to return with unindexed block error.
      return 1;
    default:
      return 13;
    }
  }
}

export const balancerSubgraphService = new BalancerSubgraphService();
