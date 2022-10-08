import { FactoryContract } from '@verified-network/verified-sdk';
import ContractService from 'sources/contracts/ContractService';
import FactoryContractService from './FactoryContractService';

const CACHE_KEY = 'digital_currencies';
class FactoryContractServiceL2 extends FactoryContractService {
  constructor(password) {
    const contractServiceL2 = new ContractService(password);
    super(contractServiceL2.getWallet(), CACHE_KEY, FactoryContract);
  }
}

export default FactoryContractServiceL2;
