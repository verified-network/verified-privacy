import {BondContract, TokenContract} from '@verified-network/verified-sdk';
import CashContractService from './CashContractService';
import ContractService from './ContractService';
import FactoryContractService from './FactoryContractServiceL2';
import Response from './Response';
import KycContractService from 'sources/contracts/KycContractService';

class BondContractService extends ContractService {
  constructor(password) {
    super(password);
    this.cashContractService = new CashContractService(password);
  }

  initStripePayment(payAmount, payCurrency, issueCurrency) {
    return this.cashContractService.initStripePayment(payAmount, payCurrency, issueCurrency);
  }

  issueTokensWithEther(tokenToIssue, etherAmount) {
    return this.cashContractService.issueTokensWithEther(tokenToIssue, etherAmount);
  }

  issueTokensWithCash(bondToken, cashToken, cashAmount) {
    return this.cashContractService.exchangeTokens(cashToken, bondToken, cashAmount);
  }

  getIssues() {
    return this.allBalances();
  }

  getPurchases() {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getBondCurrencies()
      .then((currencies) => {
        const promises = currencies.map((currency) => {
          const bondContract = new BondContract(this.getWallet(), currency.address);

          return bondContract.getBonds()
            .then((response) => Response.array(response))
            .then((bondAddresses) => {
              return bondAddresses.map((bondAddress) => {
                return bondContract
                  .getBondPurchases(this.getWallet().address, bondAddress)
                  .then((response) => Response.array(response))
                  .then((response) => {
                    return {
                      id: bondAddress,
                      currency: currency.name,
                      purchaseAmount: response[0],
                      paidInAmount: response[1],
                      paidInCurrency: Response.parseBytes32Value(response[2]),
                      issueDate: (new Date(response[3] * 1000)).toLocaleString(),
                    };
                  });
              });
            });
        });

        return Promise.all(promises)
          .then((res) => {
            const all = [];

            for (const current of res) {
              all.push(...current);
            }

            return Promise.all(all);
          });
      });
  }

  allBalances() {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getBondCurrencies()
      .then((currencies) => {
        const promises = currencies.map((currency) => {
          const bondContract = new BondContract(this.getWallet(), currency.address);

          return bondContract.getBonds()
            .then((response) => Response.array(response))
            .then((bondAddresses) => {
              return bondAddresses.map((bondAddress) => {
                return bondContract
                  .getBondIssues(this.getWallet().address, bondAddress)
                  .then((response) => Response.array(response))
                  .then((response) => {
                    return {
                      id: bondAddress,
                      currency: currency.name,
                      parValue: response[0],
                      purchasedIssueAmount: response[1],
                      paidInAmount: response[2],
                      paidInCurrency: Response.parseBytes32Value(response[3]),
                      issueDate: (new Date(response[4] * 1000)).toLocaleString(),
                    };
                  });
              });
            });
        });

        return Promise.all(promises)
          .then((res) => {
            const all = [];

            for (const current of res) {
              all.push(...current);
            }

            return Promise.all(all)
              .then((all) => {
                return all.filter((element) => element.parValue !== '0');
              });
          });
      });
  }

  // Issues by others
  getAllBondIssues() {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getBondCurrencies()
      .then((currencies) => {
        const promises = currencies.map((currency) => {
          const bondContract = new BondContract(this.getWallet(), currency.address);

          return bondContract.getBonds()
            .then((response) => Response.array(response))
            .then((bondAddresses) => {
              return bondAddresses.map((bondAddress) => {
                const tokenContract = new TokenContract(this.getWallet(), bondAddress);

                return tokenContract.getIssuer()
                  .then((response) => Response.value(response))
                  .then((issuer) => {
                    return bondContract
                      .getBondIssues(issuer, bondAddress)
                      .then((response) => Response.array(response))
                      .then((response) => {
                        return {
                          id: bondAddress,
                          currency: currency.name,
                          parValue: response[0],
                          purchasedAmount: response[1],
                          paidInAmount: response[2],
                          paidInCurrency: Response.parseBytes32Value(response[3]),
                          issueDate: (new Date(response[4] * 1000)).toLocaleString(),
                          issuer,
                        };
                      })
                      .then((response) => { // FIXME: We need all users to have access to kycContract.getName
                        const kycContractService = new KycContractService(this.getPassword());

                        return kycContractService.getFullName(issuer)
                          .then((issuerName) => {
                            response.issuerName = issuerName;
                            return response;
                          });
                      });
                  });
              });
            });
        });

        return Promise.all(promises)
          .then((res) => {
            const all = [];

            for (const current of res) {
              all.push(...current);
            }

            return Promise.all(all)
              .then((all) => {
                return all.filter((element) => element.parValue !== '0');
              });
          });
      });
  }

  redeemBond(currencyName, bondTokenAddress, unsoldAmount) {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getBondCurrencyByName(currencyName)
      .then((currency) => {
        const tokenContract = new TokenContract(this.getWallet(), bondTokenAddress);

        return tokenContract.transferFrom(this.getWallet().address, bondTokenAddress, unsoldAmount.toString())
          .then((response) => Response.empty(response));
      });
  }

  claimLoanRepayment(bondTokenAddress, amountPurchased) {
    const tokenContract = new TokenContract(this.getWallet(), bondTokenAddress);

    return tokenContract.transferFrom(this.getWallet().address, bondTokenAddress, amountPurchased)
      .then((response) => Response.empty(response));
  }
}

export default BondContractService;

