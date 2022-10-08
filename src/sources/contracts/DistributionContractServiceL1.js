import {VerifiedDistribution} from '@verified-network/verified-sdk';
import DistributionContractService from 'sources/contracts/DistributionContractService';

class DistributionContractServiceL1 extends DistributionContractService {
  constructor(password) {
    super(password);
    this.distributionContract = new VerifiedDistribution(this.getL1Wallet());
  }
}

export default DistributionContractServiceL1;
