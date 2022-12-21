import {
  OrderPoolContract, PoolFactoryContract, SecuritiesRegistryContract, TradeContract,
} from '@verified-network/verified-sdk';

import Response from './Response';
import ContractService from './ContractService';
import FactoryContractService from './FactoryContractServiceL2';
import KycContractService from 'sources/contracts/KycContractService';

const OrderStatus = {
  OPEN: 'Open',
  CANCELLED: 'Cancelled',
};

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const NULL_REF = '0x0000000000000000000000000000000000000000000000000000000000000000';

class OrderPoolContractService extends ContractService {
  constructor(password) {
    super(password);

    this.securitiesRegistryContract = new SecuritiesRegistryContract(this.getWallet());
    this.poolFactory = new PoolFactoryContract(this.getWallet());
    this.tradeContract = new TradeContract(this.getWallet());
  }

  createOrder(currency, company, isin, price, amount, orderType, order) {
    const currencyAddress = currency.address;

    return this._getSecurityAndOrderPoolAddress(currency, company, isin)
      .then(({orderPoolAddress, securityAddress}) => {
        const orderPoolContract = new OrderPoolContract(this.getWallet(), orderPoolAddress);

        return orderPoolContract
          .newOrder(securityAddress, currencyAddress, price, amount, orderType, order)
          .then((response) => Response.empty(response));
      });
  }

  getOrders() {
    return this.tradeContract.getOrders(true)
      .then((response) => Response.array(response))
      .then((orderRefs) => orderRefs.filter((ref) => ref !== NULL_REF))
      .then((orderRefs) => {
        const promises = orderRefs.map((orderRef) => {
          return this.getOrder(orderRef);
        });

        return Promise.all(promises);
      });
  }

  cancelOrder(orderRef) {
    return this._getOrderPoolContractByOrderRef(orderRef)
      .then((orderPoolContract) => {
        return orderPoolContract.cancelOrder(orderRef);
      })
      .then((response) => Response.empty(response));
  }

  editOrder(orderRef, price, quantity) {
    return this._getOrderPoolContractByOrderRef(orderRef)
      .then((orderPoolContract) => {
        return orderPoolContract.editOrder(orderRef, price, quantity);
      })
      .then((response) => Response.empty(response));
  }

  getOrder(orderRef) {
    const kycContractService = new KycContractService(this.getPassword());

    return this.tradeContract.getOrder(orderRef)
      .then((response) => Response.array(response))
      .then((order) => {
        return this.tradeContract.getTrade(orderRef)
          .then((response) => Response.array(response))
          .then((prices) => {
            const dtTimeStamp = parseInt(order[10]) * 1000;
            const dt = (new Date(dtTimeStamp)).toLocaleString();

            return {
              ref: orderRef,
              party: order[0],
              security: order[1],
              price: order[2],
              orderType: Response.parseBytes32Value(order[3]),
              order: Response.parseBytes32Value(order[4]),
              status: Response.parseBytes32Value(order[5]),
              currency: Response.parseBytes32Value(order[6]),
              securityName: Response.parseBytes32Value(order[7]),
              quantity: order[8],
              dt,
              bid: prices[0],
              ask: prices[1],
            };
          });
      })
      .then(((response) => {
        return kycContractService.getFullName(response.userAddress)
          .then((userName) => {
            response.partyName = userName;
            return response;
          });
      }));
  }

  _getOrderPoolContractByOrderRef(orderRef) {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return this.getOrder(orderRef).then((order) => {
      const currencyName = order.currency;
      const securityAddress = order.security;

      return factoryContractService.getCashCurrencyByName(currencyName)
        .then((currency) => {
          return this._getOrderPoolAddress(currency, securityAddress)
            .then((orderPoolAddress) => {
              return new OrderPoolContract(this.getWallet(), orderPoolAddress);
            });
        });
    });
  }

  _getSecurityAndOrderPoolAddress(currency, company, isin) {
    return this.securitiesRegistryContract.getToken(currency.name, company, isin)
      .then((response) => Response.value(response))
      .then((securityAddress) => {
        if (securityAddress === NULL_ADDRESS) {
          return Promise.reject(new Error('Security token doesn’t exist.'));
        }

        return this._getOrderPoolAddress(currency, securityAddress)
          .then((orderPoolAddress) => {
            return {orderPoolAddress, securityAddress};
          });
      });
  }

  _getOrderPoolAddress(currency, securityAddress) {
    const currencyAddress = currency.address;

    return this.poolFactory.getPool(securityAddress, currencyAddress)
      .then((response) => Response.value(response));
  }
}

export {OrderStatus};
export default OrderPoolContractService;
