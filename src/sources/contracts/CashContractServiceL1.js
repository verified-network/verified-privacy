import {ethers} from 'ethers';
import ContractServiceL1 from 'sources/contracts/ContractServiceL1';
import Response from 'sources/contracts/Response';
import {VerifiedCash} from '@verified-network/verified-sdk';

export const ethaddress = '0x0000000000000000000000000000000000000000';

class CashContractServiceL1 extends ContractServiceL1 {
  constructor(password) {
    super(password);
    this.userAddress = this.getWallet().address;
  }

  issueTokensWithEther(tokenToIssue, etherAmount) {
    const wallet = this.getWallet();

    const cashInvestor = new VerifiedCash(wallet, tokenToIssue.address);

    return wallet
      .sendTransaction({
        to: tokenToIssue.address,
        value: ethers.utils.parseEther(etherAmount),
      })
      .then(() => cashInvestor.requestIssue(ethaddress, ethers.utils.parseEther(etherAmount), wallet.address))
      .then((transactionResponse) => {
        return Response.empty(transactionResponse);
      });
  }
}

export default CashContractServiceL1;
