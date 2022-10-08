import BalancerSubgraphClient from '../../balancer-subgraph.client';
import tradePairSnapshotQueryBuilder from './query';

export default class TradePairSnapshots {
  constructor(
    service,
    query = tradePairSnapshotQueryBuilder
  ) {
    this.service = new BalancerSubgraphClient();
    this.query = query;
  }

  async get(args = {}, attrs = {}) {
    const query = this.query(args, attrs);
    const data = await this.client.get(query);
    return data.tradePairSnapshots;
  }
}
