import BalancerSubgraphClient from '../../balancer-subgraph.client';
import poolQueryBuilder from './query';

export default class PoolShares {
  constructor(service, query = poolQueryBuilder) {
    this.client = new BalancerSubgraphClient();
  }

  async get(args = {}, attrs = {}) {
    const query = poolQueryBuilder(args, attrs);
    const data = await this.client.get(query);
    return data.poolShares;
  }
}
