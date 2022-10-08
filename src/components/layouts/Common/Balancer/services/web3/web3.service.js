import {Network} from '@balancer-labs/sdk';
import {Contract} from '@ethersproject/contracts';
import {ErrorCode} from '@ethersproject/logger';

import {networkId} from '../../composables/useNetwork';
import {twentyFourHoursInSecs} from '../../composables/useTime';
import {configService} from '../../services/config/config.service';
// import { gasPriceService } from '@/services/gas-price/gas-price.service';
import ContractService from 'sources/contracts/ContractService';

import {
  rpcProviderService as _rpcProviderService,
  rpcProviderService,
} from '../../rpc-provider/rpc-provider.service';


const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

export default class Web3Service extends ContractService {
  constructor(password) {
    // this.rpcProviderService = rpcProviderService;
    super(password);
    this.config = configService;
    this.wallet = this.getWallet();
    // this.appProvider = this.rpcProviderService.jsonProvider;
    // this.ensProvider = this.rpcProviderService.getJsonProvider(Network.MAINNET);
  }

  setUserProvider(provider) {
    this.userProvider = provider;
  }

  setWallet(wallet) {
    this.wallet = wallet;
  }

  async getEnsName(address) {
    try {
      return await this.ensProvider.lookupAddress(address);
    } catch (error) {
      return null;
    }
  }

  async getEnsAvatar(address) {
    try {
      return '';
    } catch (error) {
      return null;
    }
  }

  async getProfile(address) {
    return {
      ens: await this.getEnsName(address),
      avatar: '',
    };
  }

  async getUserAddress() {
    const signer = this.userProvider.getSigner();
    const userAddress = await signer.getAddress();
    return userAddress;
  }

  async sendTransaction(
    contractAddress,
    abi,
    action,
    params = [],
    options = {},
    forceEthereumLegacyTxType = false
  ) {
    const signer = this.wallet;
    const contract = new Contract(contractAddress, abi, signer);

    console.log('Contract: ', contractAddress);
    console.log('Action: ', action);
    console.log('Params: ', params);

    try {
      const gasPriceSettings = await gasPriceService.getGasSettingsForContractCall(
        contract,
        action,
        params,
        options,
        forceEthereumLegacyTxType
      );
      options = {...options, ...gasPriceSettings};

      return await contract[action](...params, options);
    } catch (e) {
      const error = e;

      if (
        error.code === RPC_INVALID_PARAMS_ERROR_CODE &&
        EIP1559_UNSUPPORTED_REGEX.test(error.message)
      ) {
        // Sending tx as EIP1559 has failed, retry with legacy tx type
        return this.sendTransaction(
          contractAddress,
          abi,
          action,
          params,
          options,
          true
        );
      } else if (
        error.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
        this.config.env.APP_ENV !== 'development'
      ) {
        const sender = await signer.getAddress();
      }
      return Promise.reject(error);
    }
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

  async getTimeTravelBlock(period) {
    const currentBlock = await rpcProviderService.getBlockNumber();
    const blocksInDay = Math.round(twentyFourHoursInSecs / this.blockTime);

    switch (period) {
    case '24h':
      return currentBlock - blocksInDay;
    default:
      return currentBlock - blocksInDay;
    }
  }

  async callStatic(
    contractAddress,
    abi,
    action,
    params = [],
    options = {}
  ) {
    console.log('Sending transaction');
    console.log('Contract', contractAddress);
    console.log('Action', `"${action}"`);
    console.log('Params', params);
    const signer = this.userProvider.getSigner();
    const contract = new Contract(contractAddress, abi, signer);
    const contractWithSigner = contract.connect(signer);
    return await contractWithSigner.callStatic[action](...params, options);
  }
}

// export const web3Service = new Web3Service();
