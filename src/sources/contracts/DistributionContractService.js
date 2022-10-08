import {DistributionContract} from '@verified-network/verified-sdk';
import ContractService from 'sources/contracts/ContractService';
import Response from 'sources/contracts/Response';

class DistributionContractService extends ContractService {
  constructor(password) {
    super(password);

    this.distributionContract = new DistributionContract(this.getWallet());
  }

  getPaymentFeeCollected(currencyName) {
    return this.distributionContract.getPaymentFeeCollected(currencyName)
        .then((response) => {
          return Response.value(response);
        })
        .then((response) => response.toString());
  }

  getLoanFeeCollected(currencyName) {
    return this.distributionContract.getLoanFeeCollected(currencyName)
        .then((response) => {
          return Response.value(response);
        })
        .then((response) => response.toString());
  }

  getFeeCollected(currencyName) {
    const paymentPromise = this.getPaymentFeeCollected(currencyName);
    const loanPromise = this.getLoanFeeCollected(currencyName);

    return Promise.all([paymentPromise, loanPromise])
        .then((result) => {
          return {
            payment: result[0],
            loan: result[1],
          };
        });
  }

  shareFeeCollected() {
    return this.distributionContract.shareFee()
        .then((response) => Response.empty(response));
  }

  addRevenueShareholder(type, shareholderAddress, currencyName) {
    return this.distributionContract.addRevenueShareholder(type, shareholderAddress, currencyName)
        .then((response) => Response.empty(response));
  }

  getRevenueShareholders(type, currencyName) {
    return this.distributionContract.getRevenueShareholders(type, currencyName)
        .then((response) => {
          return response;
        })
        .then((response) => Response.array(response))
        .then((response) => {
          return {
            address: response[0],
            type,
            currencyName,
          };
        });
  }
}

export default DistributionContractService;
