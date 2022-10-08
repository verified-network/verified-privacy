import {
  EthereumTxType,
  ethereumTxType,
} from '../../composables/useEthereumTxType';

import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';

const USE_BLOCKNATIVE_GAS_PLATFORM =
  process.env.VUE_APP_USE_BLOCKNATIVE_GAS_PLATFORM === 'false' ? false : true;
const GAS_LIMIT_BUFFER = 0.1;

export default class GasPriceService {
  constructor(
    configService = new ConfigService(),
    blocknativeProvider = new BlocknativeProvider(),
    polygonProvider = new PolygonProvider()
  ) {
    this.configService = configService;
    this.blocknativeProvider = blocknativeProvider;
    this.polygonProvider = polygonProvider;
  }

  async getLatest() {
    switch (this.configService.network.key) {
    case '1':
      return await this.blocknativeProvider.getLatest();
    case '137':
      return await this.polygonProvider.getLatest();
    default:
      return null;
    }
  }

  async getGasSettingsForContractCall(
    contractWithSigner,
    action,
    params,
    options,
    forceEthereumLegacyTxType = false
  ) {
    const gasLimitNumber = await contractWithSigner.estimateGas[action](
      ...params,
      options
    );

    const gasSettings = {};

    const gasLimit = gasLimitNumber.toNumber();
    gasSettings.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));

    if (
      USE_BLOCKNATIVE_GAS_PLATFORM &&
      options.gasPrice == null &&
      options.maxFeePerGas == null &&
      options.maxPriorityFeePerGas == null
    ) {
      const gasPrice = await this.getLatest();
      if (gasPrice != null) {
        if (
          ethereumTxType === EthereumTxType.EIP1559 &&
          gasPrice.maxFeePerGas != null &&
          gasPrice.maxPriorityFeePerGas != null &&
          !forceEthereumLegacyTxType
        ) {
          gasSettings.maxFeePerGas = gasPrice.maxFeePerGas;
          gasSettings.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
        } else {
          gasSettings.gasPrice = gasPrice.price;
        }
      }
    }
    return gasSettings;
  }
}

export const gasPriceService = new GasPriceService();
