import {Vault__factory} from '@balancer-labs/typechain';
import {MaxUint256} from '@ethersproject/constants';

import {configService} from '../config/config.service';

import Web3Service, {web3Service} from '../web3/web3.service';

export default class VaultService {
  constructor(
    config = configService,
    web3 = web3Service
  ) {
    this.config = config;
    this.web3 = web3;
    this.abi = Vault__factory.abi;
  }

  get address() {
    return this.config.network.addresses.vault;
  }

  swap(
    single,
    funds,
    tokenOutAmount,
    options = {},
    password
  ) {
    console.log('vault.serice swap', {single, funds, tokenOutAmount, options});
    const web3 = new Web3Service(password);
    return web3.sendTransaction(
      this.address,
      this.abi,
      'swap',
      [single, funds, tokenOutAmount, MaxUint256],
      options
    );
  }

  batchSwap(
    swapKind,
    swaps,
    tokenAddresses,
    funds,
    limits,
    options = {}
  ) {
    return this.web3.sendTransaction(
      this.address,
      this.abi,
      'batchSwap',
      [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      options
    );
  }
}

export const vaultService = new VaultService();
