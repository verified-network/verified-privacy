import {WebSocketProvider} from '@ethersproject/providers';

import template from '../utils/template';
import {configService} from '../services/config/config.service';
import 'babel-polyfill';

export default class RpcProviderService {
  constructor(
    config = configService,
    network = config.network.shortName,
    // jsonProvider = new StaticJsonRpcBatchProvider(config.rpc),
    // loggingProvider = new StaticJsonRpcBatchProvider(
    // config.loggingRpc
    // )
  ) {
    this.config = config;
    this.network = network;
    // this.jsonProvider = jsonProvider;
    // this.loggingProvider = loggingProvider
  }

  initBlockListener(newBlockHandler) {
    const wsProvider = new WebSocketProvider(this.config.ws);
    wsProvider.on('block', (newBlockNumber) => newBlockHandler(newBlockNumber));
  }

  async getBlockNumber() {
    return await this.jsonProvider.getBlockNumber();
  }

  getJsonProvider(networkKey) {
    const rpcUrl = template(this.config.getNetworkConfig(networkKey).rpc, {
      INFURA_KEY: this.config.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.config.env.ALCHEMY_KEY,
    });
    // return new StaticJsonRpcBatchProvider(rpcUrl);
  }
}

export const rpcProviderService = new RpcProviderService();
