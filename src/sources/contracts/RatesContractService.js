import ContractService from './ContractService';
import {RatesContract} from '@verified-network/verified-sdk';
import Response from './Response';

const FeeTypes = {
  ISSUING: 'issuing',
  TRADING: 'trading',
  REMITTANCE: 'remittance',
  REDEMPTION: 'redemption',
};

class RatesContractService extends ContractService {
  constructor(password) {
    super(password);

    this.ratesContract = new RatesContract(this.getWallet());
  }

  setFeeTo(target, fee, feeType) {
    return this.ratesContract
        .setFeeTo(target, fee, feeType)
        .then((response) => Response.empty(response));
  }

  getMargin(assetName) {
    return this.ratesContract
        .getMargin(assetName)
        .then((response) => Response.value(response));
  }

  setMargin(margin, assetName) {
    return this.ratesContract
        .setMargin(margin, assetName)
        .then((response) => Response.empty(response));
  }

  getFeeToSetter() {
    return this.ratesContract
        .getFeeToSetter()
        .then((response) => Response.value(response));
  }

  setFeeToSetter(address) {
    return this.ratesContract
        .setFeeToSetter(address)
        .then((response) => Response.empty(response));
  }
}

export {FeeTypes};
export default RatesContractService;
