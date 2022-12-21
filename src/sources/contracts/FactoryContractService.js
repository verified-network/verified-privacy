import Response from 'sources/contracts/Response';
import LocalCache from 'sources/utils/LocalCache';

const CASH_CURRENCY = 'ViaCash';
const BOND_CURRENCY = 'ViaBond';

const isCached = (CACHE_KEY) => LocalCache.itemExists(CACHE_KEY);
const retrieveFromCache = (CACHE_KEY) => LocalCache.getItem(CACHE_KEY);
const storeInCache = (value, CACHE_KEY) => LocalCache.setItem(CACHE_KEY, value);

const UNKNOWN_CURRENCY = {
  name: 'Unknown',
  address: '...',
};

class FactoryContractService {
  constructor(wallet, CACHE_KEY, Contract) {
    this.wallet = wallet;
    this.cache_key = CACHE_KEY || 'digital_currencies';
    this.Contract = Contract;
  }

  getCashCurrencies() {
    return this._getDigitalCurrencies().then((currencies) => {
      return currencies
        .map((element) => {
          element.fiatCounterPart = element.name.substr(2);
          return element;
        })
        .filter((element) => {
          return element.type == CASH_CURRENCY;
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
    return this._getDigitalCurrencies().then((currencies) => {
      return currencies.filter((element) => {
        return element.type == BOND_CURRENCY;
      });
    });
  }

  getBondCurrencyByName(name) {
    return this.getBondCurrencies().then((currencies) => {
      const currency = currencies.find((currency) => {
        return currency.name === name;
      });

      return currency ?? UNKNOWN_CURRENCY;
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
      const counterPart = currencies.find((currency) => {
        return currency.name.toUpperCase() === fiat.toUpperCase();
      });

      return counterPart;
    });
  }

  static getCashCurrencyNameByFiatName(fiatName) {
    return ('VX' + fiatName).toUpperCase();
  }

  static getFiatCurrencyNameByCashName(cashName) {
    return cashName.substr(2).toUpperCase();
  }

  _getDigitalCurrencies() {
    if (isCached(this.cache_key)) {
      return Promise.resolve(retrieveFromCache(this.cache_key));
    }

    const factoryContract = new this.Contract(this.wallet);

    return factoryContract
      .getTokenCount()
      .then((response) => Response.value(response))
      .then((tokenCount) => {
        const promises = [];

        for (let i = 0; i < tokenCount; i++) {
          const promise = factoryContract.getToken(i.toString()).then((response) => Response.value(response));

          promises.push(promise);
        }

        return Promise.all(promises);
      })
      .then((addresses) => {
        const promises = addresses.map((address) => {
          return factoryContract
            .getNameAndType(address)
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
        storeInCache(currencies, this.cache_key);
        return currencies;
      });
  }
}

export default FactoryContractService;
