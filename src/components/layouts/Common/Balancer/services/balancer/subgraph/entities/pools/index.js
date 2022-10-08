import {getAddress} from '@ethersproject/address';
import {twentyFourHoursInSecs} from '../../../../../composables/useTime';
import {configService as _configService} from '../../../../config/config.service';
import BalancerSubgraphClient from '../../balancer-subgraph.client';
import queryBuilder from './query';

export default class Pools {
  constructor(
    service,
    query = queryBuilder,
    configService = _configService,
  ) {
    this.service = service;
    this.query = query;
    this.networkId = configService.env.NETWORK;
  }

  async get(args = {}, attrs = {}) {
    const query = this.query(args, attrs);
    const data = await this.client.get(query);
    console.log('subgraph pools data', {query, args, data});
    return data.pools;
  }

  async decorate(
    pools,
    period,
    prices,
    currency,
    gauges,
    tokens
  ) {
    // Get past state of pools
    const blockNumber = await this.timeTravelBlock(period);
    const block = {number: blockNumber};
    const isInPoolIds = {id_in: pools.map((pool) => pool.id)};
    const poolSnapshotQuery = this.query({where: isInPoolIds, block});
    let poolSnapshots = [];
    try {
      const data = await this.service.client.get(
        poolSnapshotQuery
      );
      poolSnapshots = data.pools;
    } catch {
      // eslint-disable-previous-line no-empty
    }

    const poolDecorator = new this.poolDecoratorClass(pools);

    return await poolDecorator.decorate(
      gauges,
      prices,
      currency,
      poolSnapshots,
      tokens
    );
  }

  async timeTravelBlock(period) {
    const currentBlock = await this.service.rpcProviderService.getBlockNumber();
    const blocksInDay = Math.round(
      twentyFourHoursInSecs / this.service.blockTime
    );

    switch (period) {
    case '24h':
      return currentBlock - blocksInDay;
    default:
      return currentBlock - blocksInDay;
    }
  }

  addressFor(poolId) {
    return getAddress(poolId.slice(0, 42));
  }
}
