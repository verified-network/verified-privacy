import axios from 'axios';
import {jsonToGraphQLQuery} from 'json-to-graphql-query';

import {configService as _configService} from '../../../services/config/config.service';
import 'babel-polyfill';
export default class BalancerSubgraphClient {
  url;

  constructor(configService = _configService) {
    this.url = configService.network.subgraph;
  }

  async get(query) {
    try {
      const payload = this.toPayload(query);
      const {
        data: {data},
      } = await axios.post(this.url, payload);
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  toPayload(query) {
    return JSON.stringify({query: jsonToGraphQLQuery({query})});
  }
}

export const balancerSubgraphClient = new BalancerSubgraphClient();
