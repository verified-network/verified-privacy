/* eslint-disable new-cap */
import Currencies from 'sources/worker/Currencies';
import {CashContract, BondContract, PostTradeContract} from '@verified-network/verified-sdk';
import Response from 'sources/contracts/Response';

const EventsType = {
  CASH_ISSUED: 'CashIssued',
  CASH_REDEEMED: 'CashRedeemed',
  CASH_DEPOSITS: 'CashDeposits',
  CASH_TRANSFER: 'CashTransfer',
  BOND_ISSUED: 'BondIssued',
  BOND_PURCHASED: 'BondPurchased',
  BOND_REDEEMED: 'BondRedeemed',
  BOND_LIQUIDATED: 'BondLiquidated',
  TRADE_SETTLED: 'tradeSettled',
};

class Events {
  constructor(wallet) {
    this.wallet = wallet;
  }

  getWallet() {
    return this.wallet;
  }

  fetchNotEnteredEvents(fromBlock, lastEntryHash) {
    const cashEventsPromise = this.fetchCashEvents(fromBlock);
    const bondEventsPromise =  this.fetchBondEvents(fromBlock);
    // const securityEventsPromise =  this.fetchSecurityEvents(fromBlock);

    return Promise.all([cashEventsPromise, bondEventsPromise]).then((response) => {
        const all = [];

        for (const events of response){
          all.push(...events);
        }

        all.sort((a, b) => {
          if(a.blockNumber !== b.blockNumber){
            return a.blockNumber - b.blockNumber;
          }

          return a.transactionIndex - b.transactionIndex;
        });

        return all;
      })
  }

  fetchCashEvents(fromBlock) {
    const userAddress = this.getWallet().address;

    const currencies = new Currencies(this.getWallet());

    return currencies.getCashCurrencies().then((cashCurrencies) => {
      const promises = [];

      for (const cashCurrency of cashCurrencies) {
        const cashContract = new CashContract(this.getWallet(), cashCurrency.address);

        const cashIssueFilter = cashContract.contract.filters.CashIssued(userAddress, null, null);
        const cashIssuePromise = cashContract.contract.queryFilter(cashIssueFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.cashCommonAttributes(event, cashCurrency),
                data: {
                  party: event.args[0],
                  currency: Response.parseBytes32Value(event.args[1]),
                  amount: event.args[2].toString(),
                },
              };
            });
          });

        const cashRedeemedFilter = cashContract.contract.filters.CashRedeemed(userAddress, null, null);
        const cashRedeemedPromise = cashContract.contract.queryFilter(cashRedeemedFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.cashCommonAttributes(event, cashCurrency),
                data: {
                  party: event.args[0],
                  currency: Response.parseBytes32Value(event.args[1]),
                  amount: event.args[2].toString(),
                  redeemedFor: event.args[3].toString(),
                },
              };
            });
          });

        const cashDepositsFilter = cashContract.contract.filters.CashDeposits(userAddress, null, null);
        const cashDepositsPromise = cashContract.contract.queryFilter(cashDepositsFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.cashCommonAttributes(event, cashCurrency),
                data: {
                  party: event.args[0],
                  currency: Response.parseBytes32Value(event.args[1]),
                  amount: event.args[2].toString(),
                },
              };
            });
          });

        const cashTransferPartyFilter = cashContract.contract.filters.CashTransfer(userAddress);
        const cashTransferPartyPromise = cashContract.contract.queryFilter(cashTransferPartyFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.cashCommonAttributes(event, cashCurrency),
                data: {
                  party: event.args[0],
                  counterParty: event.args[1],
                  currency: Response.parseBytes32Value(event.args[2]),
                  amount: event.args[3].toString(),
                },
              };
            });
          });

        const cashTransferCounterPartyFilter = cashContract.contract.filters.CashTransfer(null, userAddress);
        const cashTransferCounterPartyPromise = cashContract.contract
          .queryFilter(cashTransferCounterPartyFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.cashCommonAttributes(event, cashCurrency),
                data: {
                  party: event.args[0],
                  counterParty: event.args[1],
                  currency: Response.parseBytes32Value(event.args[2]),
                  amount: event.args[3].toString(),
                },
              };
            });
          });

        promises.push(cashIssuePromise);
        promises.push(cashRedeemedPromise);
        promises.push(cashDepositsPromise);
        promises.push(cashTransferPartyPromise);
        promises.push(cashTransferCounterPartyPromise);
      }

      return Promise.all(promises).then((arrays) => {
        const all = [];

        for (const array of arrays) {
          all.push(...array);
        }

        return all;
      });
    });
  }

  fetchBondEvents(fromBlock) {
    const userAddress = this.getWallet().address;

    const currencies = new Currencies(this.getWallet());

    return currencies.getBondCurrencies().then((bondCurrencies) => {
      const promises = [];

      for (const bondCurrency of bondCurrencies) {
        const bondContract = new BondContract(this.getWallet(), bondCurrency.address);

        const bondIssueFilter = bondContract.contract.filters.BondIssued(userAddress);
        const bondIssuePromise = bondContract.contract.queryFilter(bondIssueFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.bondCommonAttributes(event, bondCurrency),
                data: {
                  party: event.args[0],
                  token: event.args[1],
                  bondName: Response.parseBytes32Value(event.args[2]),
                  amount: event.args[3].toString(),
                  currency: Response.parseBytes32Value(event.args[4]),
                  collateralAmount: event.args[5].toString(),
                  issueTime: event.args[6].toString(),
                },
              };
            });
          });

        const bondRedeemedFilter = bondContract.contract.filters.BondRedeemed(userAddress);
        const bondRedeemedPromise = bondContract.contract.queryFilter(bondRedeemedFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return { //TODO: Check against new Events
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.bondCommonAttributes(event, bondCurrency),
                data: {
                  party: event.args[0],
                  token: event.args[1],
                  tokenAmount: event.args[2].toString(),
                  tokenName: Response.parseBytes32Value(event.args[3]),
                  amount: event.args[4].toString(),
                  currency: Response.parseBytes32Value(event.args[5]),
                },
              };
            });
          });

        const bondPurchasedFilter = bondContract.contract.filters.BondPurchased(userAddress);
        const bondPurchasedPromise = bondContract.contract.queryFilter(bondPurchasedFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.bondCommonAttributes(event, bondCurrency),
                data: {
                  party: event.args[0],
                  token: event.args[1],
                  bondName: Response.parseBytes32Value(event.args[2]),
                  amount: event.args[3].toString(),
                  currency: Response.parseBytes32Value(event.args[4]),
                  paidInAmount: event.args[5].toString(),
                  purchaseTime: event.args[6].toString(),
                },
              };
            });
          });

        const bondLiquidatedFilter = bondContract.contract.filters.BondLiquidated(userAddress);
        const bondLiquidatedPromise = bondContract.contract.queryFilter(bondLiquidatedFilter, fromBlock)
          .then((events) => {
            return events.map((event) => {
              return {
                logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
                ...this.bondCommonAttributes(event, bondCurrency),
                data: {
                  party: event.args[0],
                  token: event.args[1],
                  tokenAmount: event.args[2].toString(),
                  tokeName: Response.parseBytes32Value(event.args[3]),
                  amount: event.args[4].toString(),
                  currency: Response.parseBytes32Value(event.args[5]),
                },
              };
            });
          });

        promises.push(bondIssuePromise);
        promises.push(bondRedeemedPromise);
        promises.push(bondPurchasedPromise);
        promises.push(bondLiquidatedPromise);
      }

      return Promise.all(promises).then((arrays) => {
        const all = [];

        for (const array of arrays) {
          all.push(...array);
        }

        return all;
      });
    });
  }

  fetchSecurityEvents(fromBlock) {
    const userAddress = this.getWallet().address;

    const postTradeContract = new PostTradeContract(this.getWallet());

    const securityTransferorFilter = postTradeContract.contract.filters.tradeSettled(userAddress, null);
    const securityTransfereeFilter = postTradeContract.contract.filters.tradeSettled(null, userAddress);

    const securityPromise = postTradeContract.contract
      .queryFilter(securityTransferorFilter, fromBlock)
      .then(fromTransferor => {
        return postTradeContract.contract.queryFilter(securityTransfereeFilter, fromBlock)
          .then(fromTransferee => {
            const all = [];
            all.push(...fromTransferor);
            all.push(...fromTransferee);

            return all;
          });
      })
      .then((events) => {
        return events.map((event) => {
          return {
            logId: `${event.blockHash}-${event.transactionHash}-${event.logIndex}`,
            name: event.event,
            contract: 'PostTradeContract',
            contractAddress: event.address,
            contractName: Response.parseBytes32Value(event.args[3]),
            blockNumber: event.blockNumber,
            transactionIndex: event.transactionIndex,
            transactionHash: event.transactionHash,
            data: {
              transferor: event.args[0],
              transferee: event.args[1],
              unitsToTransfer: event.args[2].toString(),
              security: Response.parseBytes32Value(event.args[3]),
              price: event.args[4].toString(),
              currency: Response.parseBytes32Value(event.args[4]),
            },
          };
        });
      });

    return securityPromise;
  }

  cashCommonAttributes(event, cashCurrency) {
    return {
      name: event.event,
      contract: 'CashContract',
      contractAddress: event.address,
      contractName: cashCurrency.name,
      blockNumber: event.blockNumber,
      transactionIndex: event.transactionIndex,
      transactionHash: event.transactionHash,
    };
  }

  bondCommonAttributes(event, bondCurrency) {
    return {
      name: event.event,
      contract: 'BondContract',
      contractAddress: event.address,
      contractName: bondCurrency.name,
      blockNumber: event.blockNumber,
      transactionIndex: event.transactionIndex,
      transactionHash: event.transactionHash,
    };
  }
}

export {EventsType};
export default Events;
