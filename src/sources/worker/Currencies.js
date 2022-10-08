import {FactoryContract, VerifiedWallet} from '@verified-network/verified-sdk';
import Response from 'sources/contracts/Response';

const CASH_CURRENCY = 'ViaCash';
const BOND_CURRENCY = 'ViaBond';

let cache = null;

const UNKNOWN_CURRENCY = {
  name: 'Unknown',
  address: '...',
};

class Currencies {
  constructor(wallet) {
    this.wallet = wallet;
  }

  getWallet() {
    return this.wallet;
  }

  getCashCurrencies() {
    return this._getDigitalCurrencies()
        .then((currencies) => {
          return currencies.map((element) => {
            element.fiatCounterPart = element.name.substr(2);
            return element;
          }).filter((element) => {
            return element.type === CASH_CURRENCY;
          });
        });
  }

  getFiatCurrencies() {
    return this.getCashCurrencies().then((currencies) => {
      return currencies.map((element) => {
        const res = element;
        res.cashCounterPart = element.name;
        res.name = element.name.substr(2);
        res.type = 'Fiat';
        delete res.address;

        return res;
      });
    });
  }

  getBondCurrencies() {
    return this._getDigitalCurrencies()
        .then((currencies) => {
          return currencies.filter((element) => {
            return element.type === BOND_CURRENCY;
          });
        });
  }

  getCashCurrencyByAddress(address) {
    return this.getCashCurrencies().then((currencies) => {
      const currency = currencies.find((currency) => {
        return currency.address === address;
      });

      return currency ?? UNKNOWN_CURRENCY;
    });
  }

  getCashCurrencyByName(name) {
    return this.getCashCurrencies().then((currencies) => {
      const currency = currencies.find((currency) => {
        return currency.name === name;
      });

      return currency ?? UNKNOWN_CURRENCY;
    });
  }

  getCashCounterPartByFiat(fiat) {
    return this.getFiatCurrencies().then((currencies) => {
      return currencies.find((currency) => {
        return currency.name.toUpperCase() === fiat.toUpperCase();
      });
    });
  }

  static getCashCurrencyNameByFiatName(fiatName) {
    return ('VX' + fiatName).toUpperCase();
  }

  static getFiatCurrencyNameByCashName(cashName) {
    return (cashName.substr(2)).toUpperCase();
  }

  _getDigitalCurrencies() {
    if (cache) {
      return Promise.resolve(cache);
    }

    const factoryContract = new FactoryContract(this.getWallet());

    return factoryContract.getTokenCount()
        .then((response) => Response.value(response))
        .then((tokenCount) => {
          const promises = [];

          for (let i = 0; i < tokenCount; i++) {
            const promise = factoryContract.getToken(i.toString())
                .then((response) => Response.value(response));

            promises.push(promise);
          }

          return Promise.all(promises);
        })
        .then((addresses) => {
          const promises = addresses.map((address) => {
            return factoryContract.getNameAndType(address)
                .then((response) => Response.array(response))
                .then((result) => {
                  const name = Response.parseBytes32Value(result[0]);
                  const type = Response.parseBytes32Value(result[1]);

                  return {address, name, type};
                });
          });

          return Promise.all(promises);
        })
        .then((currencies) => {
          cache = currencies;
          return currencies;
        });
  }
}

export default Currencies;
