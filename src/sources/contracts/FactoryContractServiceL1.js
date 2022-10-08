import { VerifiedFactory } from '@verified-network/verified-sdk';
import ContractServiceL1 from 'sources/contracts/ContractServiceL1';
import FactoryContractService from './FactoryContractService';

const CACHE_KEY = 'digital_currencies_l1';
class FactoryContractServiceL1 extends FactoryContractService {
  constructor(password) {
    const contractServiceL1 = new ContractServiceL1(password);
    super(contractServiceL1.getWallet(), CACHE_KEY, VerifiedFactory);
  }
}

export default FactoryContractServiceL1;
