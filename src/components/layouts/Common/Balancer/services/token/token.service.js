import {configService as _configService} from '../config/config.service';
import {rpcProviderService as _rpcProviderService} from '../../rpc-provider/rpc-provider.service';
import AllowancesConcern from './concerns/allowances.concern';
import BalancesConcern from './concerns/balances.concern';
import MetadataConcern from './concerns/metadata.concern';
import ContractService from 'sources/contracts/ContractService';
import usePassword from '../../composables/usePassword';

export default class TokenService extends ContractService {
  constructor(
    metadataConcernClass = MetadataConcern,
    balancesConcernClass = BalancesConcern,
    allowancesConcernClass = AllowancesConcern,
    configService = _configService
  ) {
    super(usePassword.getPassword());
    this.configService = configService;
    this.provider = this.getWallet();
    this.wallet = this.provider;
    this.metadata = new metadataConcernClass(this);
    this.balances = new balancesConcernClass(this);
    this.allowances = new allowancesConcernClass(this);
  }
}
