import {toJsTimestamp} from '../../../../../composables/useTime';
import BalancerSubgraphClient from '../../balancer-subgraph.client';
import poolQueryBuilder from './query';

const DAY = 60 * 60 * 24;

export default class PoolShares {
  service;
  query;

  constructor(service, query = poolQueryBuilder) {
    this.client = new BalancerSubgraphClient();
    this.query = query;
  }

  async get(
    poolId,
    days,
    args = {},
    attrs = {}
  ) {
    const currentTimestamp = Math.ceil(Date.now() / 1000);
    const dayTimestamp = currentTimestamp - (currentTimestamp % DAY);
    const timestamps = [];
    for (let i = 0; i < days; i++) {
      timestamps.push(dayTimestamp - i * DAY);
    }
    attrs = {...attrs, __aliasFor: 'poolSnapshot'};
    const query = Object.fromEntries(
      timestamps.map((timestamp) => {
        const timestampArgs = {...args, id: `${poolId}-${timestamp}`};
        const timestampFragment = this.query(timestampArgs, attrs).poolSnapshot;
        return [`_${timestamp}`, timestampFragment];
      })
    );
    const data = await this.client.get(query);
    return this.serialize(data);
  }

  serialize(snapshotData) {
    return Object.fromEntries(
      Object.entries(snapshotData)
        .map((entry) => {
          const [id, data] = entry;
          const timestamp = toJsTimestamp(parseInt(id.substr(1)));
          if (!data) {
            return [timestamp, null];
          }
          const {
            amounts,
            totalShares,
            swapVolume,
            swapFees,
            liquidity,
          } = data;

          return [
            timestamp,
            {
              timestamp,
              amounts,
              totalShares,
              swapVolume,
              swapFees,
              liquidity,
            },
          ];
        })
        .filter((entry) => !!entry[1])
    );
  }
}
