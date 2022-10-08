import {networkId} from '../../composables/useNetwork';
import configs from '.';
import template from '../../utils/template';

export default class ConfigService {
  get env() {
    return {
      APP_ENV: process.env.VUE_APP_ENV || 'development',
      NETWORK: networkId,
      APP_DOMAIN: process.env.VUE_APP_DOMAIN || 'app.balancer.fi',
      APP_HOST: process.env.VUE_APP_HOST || 'balancer.fi',
      IPFS_NODE: process.env.VUE_APP_IPFS_NODE || 'cloudflare-ipfs.com',
      BLOCKNATIVE_DAPP_ID:
        process.env.VUE_APP_BLOCKNATIVE_DAPP_ID || 'MISSING_KEY',
      ALCHEMY_KEY:
        process.env.VUE_APP_ALCHEMY_KEY ||
        this.getNetworkConfig(networkId).keys.alchemy ||
        'MISSING_KEY',
      INFURA_PROJECT_ID:
        process.env.VUE_APP_INFURA_PROJECT_ID ||
        this.getNetworkConfig(networkId).keys.infura ||
        'MISSING_KEY',
      ENABLE_STABLE_POOLS: process.env.VUE_APP_ENABLE_STABLE_POOLS === 'true',
      PORTIS_DAPP_ID: process.env.VUE_APP_PORTIS_DAPP_ID || 'MISSING_KEY',
    };
  }

  get network() {
    return configs[networkId];
  }

  getNetworkConfig(key) {
    if (!Object.keys(configs).includes(key?.toString())) {
      throw new Error(`No config for network key: ${key}`);
    }
    return configs[key];
  }

  get rpc() {
    return template(this.network.rpc, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }

  get ws() {
    return template(this.network.ws, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }

  get loggingRpc() {
    return template(this.network.loggingRpc, {
      INFURA_KEY: this.env.INFURA_PROJECT_ID,
      ALCHEMY_KEY: this.env.ALCHEMY_KEY,
    });
  }
}

export const configService = new ConfigService();
