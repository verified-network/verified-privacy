import ContractService from './ContractService';
import {BalancerSecondaryIssueManager} from '@verified-network/verified-sdk';

class BalancerSecondaryIssueManagerService extends ContractService {
  constructor(password, platformAddress) {
    super(password);
    this.walletL1 = this.getL1Wallet();
    this.userAddress = this.walletL1.address;
    this.primaryIssueContract = new BalancerSecondaryIssueManager(this.walletL1, platformAddress);
  }

  issueSecondary(security, currency, amount, isin) {
    return this.primaryIssueContract.issueSecondary(security, currency, amount, isin);
  }
}

export default BalancerSecondaryIssueManagerService;
