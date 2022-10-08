import {VerifiedWallet} from '@verified-network/verified-sdk';
import Config from '../Config';
import ContractService from './ContractService';

class ContractServiceL1 extends ContractService {
  constructor(password) {
    super(password);

    this.wallet = new VerifiedWallet(this.getWallet().privateKey, Config.publicProvider);
  }

  getWallet = () => {
    return this.wallet;
  };
}

export default ContractServiceL1;
