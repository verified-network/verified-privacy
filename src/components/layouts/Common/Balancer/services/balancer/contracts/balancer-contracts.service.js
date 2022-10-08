import {
  InvestmentPool__factory,
  StablePool__factory,
  WeightedPool__factory,
} from '@balancer-labs/typechain';

import ERC20_ABI from '../../../lib/abi/ERC20.json';
import IERC4626 from '../../../lib/abi/IERC4626.json';
import LinearPoolAbi from '../../../lib/abi/LinearPool.json';
import StablePhantomPool from '../../../lib/abi/StablePhantomPool.json';
import StaticATokenLMAbi from '../../../lib/abi/StaticATokenLM.json';
import {configService as _configService} from '../../config/config.service';
import {rpcProviderService as _rpcProviderService} from '../../../rpc-provider/rpc-provider.service';
import ContractService from 'sources/contracts/ContractService';
import Vault from './contracts/vault';

export default class BalancerContractsService extends ContractService {
  constructor(password) {
    super(password);
    this.configService = _configService;
    // this.sdk = balancer;
    this.provider = this.getWallet();
    console.log('BalancerContractsService constructor', this.provider);
    this.config = this.configService.network;

    // Init contracts
    this.vault = new Vault(this);
    // this.batchRelayer = new BatchRelayer(this);
    // this.veBAL = new veBAL(this);
  }

  // Combine all the ABIs and remove duplicates
  get allPoolABIs() {
    return Object.values(
      Object.fromEntries(
        [
          ...WeightedPool__factory.abi,
          ...StablePool__factory.abi,
          ...InvestmentPool__factory.abi,
          ...StablePhantomPool,
          ...LinearPoolAbi,
          ...StaticATokenLMAbi,
          ...ERC20_ABI,
          ...IERC4626,
        ].map((row) => [row.name, row])
      )
    );
  }
}
