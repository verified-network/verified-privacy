import BalancerSubgraphClient from '../../balancer-subgraph.client';
import queryBuilder from './query';

export default class PoolActivities {
  service;
  query;

  constructor(service, query = queryBuilder) {
    this.client = new BalancerSubgraphClient();
    this.query = query;
  }

  async get(args = {}, attrs = {}) {
    const query = this.query(args, attrs);
    const {joinExits} = await this.client.get(query);
    return this.serializeActivity(joinExits);
  }

  serializeActivity(poolActivities) {
    return poolActivities.map((poolActivity) => ({
      ...poolActivity,
      timestamp: poolActivity.timestamp * 1000,
    }));
  }
}
