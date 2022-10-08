import {BalancerHelpers__factory, Vault__factory} from '@balancer-labs/typechain';

import {callStatic, sendTransaction} from '../../../lib/utils/balancer/web3';
import {configService} from '../../config/config.service';

import ExitParams from './serializers/ExitParams';
import JoinParams from './serializers/JoinParams';
import ContractService from 'sources/contracts/ContractService';
import {default as ERC20ABI} from '../../../lib/abi/ERC20.json';

export default class ExchangeService extends ContractService {
  constructor(password, pool, config = configService) {
    super(password);
    this.wallet = this.getWallet();
    this.userAddress = this.wallet.address;
    this.pool = pool;
    this.config = config;
    this.vaultAddress = this.config.network.addresses.vault;
    this.helpersAddress = this.config.network.addresses.balancerHelpers;
  }

  async queryJoin(amountsIn, tokensIn, bptOut = '0') {
    const provider = this.wallet;
    const account = this.userAddress;
    const txParams = this.joinParams.serialize(account, amountsIn, tokensIn, bptOut);

    return await callStatic(provider, this.helpersAddress, BalancerHelpers__factory.abi, 'queryJoin', txParams);
  }

  async approve(options) {
    const provider = this.wallet;
    const appNetworkConfig = configService.network;
    const vaultAddress = appNetworkConfig.addresses.vault;
    return await sendTransaction(provider, vaultAddress, ERC20ABI, 'approve', options);
  }

  async join(amountsIn, tokensIn, bptOut = '0') {
    const provider = this.wallet;
    const account = this.userAddress;
    const txParams = this.joinParams.serialize(account, amountsIn, tokensIn, bptOut);
    const value = this.joinParams.value(amountsIn, tokensIn);

    return await sendTransaction(provider, this.vaultAddress, Vault__factory.abi, 'joinPool', txParams, {value});
  }

  async queryExit(amountsOut, tokensOut, bptIn, exitTokenIndex, exactOut) {
    const provider = this.wallet;
    const account = this.userAddress;
    const txParams = this.exitParams.serialize(account, amountsOut, tokensOut, bptIn, exitTokenIndex, exactOut);

    return await callStatic(provider, this.helpersAddress, BalancerHelpers__factory.abi, 'queryExit', txParams);
  }

  async exit(amountsOut, tokensOut, bptIn, exitTokenIndex, exactOut) {
    const provider = this.wallet;
    const account = this.userAddress;
    const txParams = this.exitParams.serialize(account, amountsOut, tokensOut, bptIn, exitTokenIndex, exactOut);

    return await sendTransaction(provider, this.vaultAddress, Vault__factory.abi, 'exitPool', txParams);
  }

  get joinParams() {
    return new JoinParams(this);
  }

  get exitParams() {
    return new ExitParams(this);
  }
}
