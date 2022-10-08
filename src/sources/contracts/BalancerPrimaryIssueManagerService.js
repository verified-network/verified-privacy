import ContractService from './ContractService';
import {BalancerPrimaryIssueManager} from '@verified-network/verified-sdk';

class BalancerPrimaryIssueManagerService extends ContractService {
  constructor(password, platformAddress) {
    super(password);
    this.walletL1 = this.getL1Wallet();
    this.userAddress = this.walletL1.address;
    this.primaryIssueContract = new BalancerPrimaryIssueManager(this.walletL1, platformAddress);
  }

  offer(owned, isin, offered, tomatch, desired, min) {
    return this.primaryIssueContract.offer(owned, isin, offered, tomatch, desired, min, this.userAddress)
  }

}

export default BalancerPrimaryIssueManagerService;
