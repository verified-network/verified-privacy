import { VerifiedBond } from '@verified-network/verified-sdk';
import { ethaddress } from './CashContractServiceL1';
import ContractServiceL1 from './ContractServiceL1';
import { ethers } from 'ethers';

class BondContractServiceL1 extends ContractServiceL1 {
  constructor(password) {
    super(password);
  }

  issueTokensWithEther(tokenToIssue, etherAmount) {
    const wallet = this.getWallet();

    const bondUSDInvestor = new VerifiedBond(wallet, tokenToIssue.address);

    return wallet
      .sendTransaction({
        to: tokenToIssue.address,
        value: ethers.utils.parseEther(etherAmount),
      })
      .then(() => {
        bondUSDInvestor
          .requestIssue(ethaddress, ethers.utils.parseEther(etherAmount), wallet.address)
          .then((res) => res);
      });
  }
}

export default BondContractServiceL1;
