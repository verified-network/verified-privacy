import Response from 'sources/contracts/Response';
import {
  SystemContract, HolderContract, LedgerContract, AccountContract,
} from '@verified-network/verified-sdk';

const Ledgers = {
  DIGITAL_CASH_TRANSFERS: {
    name: 'digital cash transfers',
    group: 'indirect expenses',
  },
  DIGITAL_CASH: {
    name: 'digital cash',
    group: 'cash in hand',
  },
  CASH: {
    name: 'cash',
    group: 'cash in hand',
  },
  DIGITAL_ASSETS: {
    name: 'digital assets',
    group: 'current assets',
  },
  BANK: {
    name: 'bank',
    group: 'banks',
  },
  DIGITAL_BOND: {
    name: 'digital bond',
    group: '-', // FIXME: Add group
  },
  DIGITAL_SECURITY: {
    name: 'digital security',
    group: '-', // FIXME: Add group
  },
  forIssuer: (address) => ({
    name: address.substr(22),
    group: 'suppliers',
  }),
  forInvestor: (address) => ({
    name: address.substr(22),
    group: 'customers',
  }),
};

const VoucherType = {
  JOURNAL: 'Journal',
  CASH: 'Cash',
  BANK: 'Bank',
  SALE: 'Sale',
  PURCHASE: 'Purchase',
};

const Accounts = {
  'CASH_TOKEN_REQUEST': 'Cash token request',
  'CASH_TOKEN_ISSUE': 'Cash token issue',
  'CASH_TOKEN_REDEMPTION_REQUEST': 'Cash token redemption request',
  'CASH_TOKEN_REDEMPTION': 'Cash token redemption',
  'CASH_WITHDRAWAL': 'Cash withdrawal',
  'PAYMENT_TRANSFER': 'Payment transfer',
  'CASH_TOKEN_EXCHANGE': 'Cash token exchange',
  'BOND_TOKEN_REQUEST': 'Cash token exchange',
  'BOND_PURCHASE': 'Bond purchase',
  'BOND_SALE': 'Bond sale',
  'BOND_REDEMPTION': 'Bond redemption',
  'SECURITY_PURCHASE': 'Security purchase',
  'SECURITY_SALE': 'Security sale',
};

const EntryType = {
  DEBIT: 'Debit',
  CREDIT: 'Credit',
};

class AccountContractService {
  constructor(wallet) {
    this.wallet = wallet;

    this.systemContract = new SystemContract(this.getWallet());
  }

  getWallet() {
    return this.wallet;
  }

  postEntry({
    type, clientAddress, counterPartAddress, ledger, accountName, currency, amount,
    voucherType, description, transactionHash,
  }) {
    return this._postEntry({
      entryType: type, clientAddress, counterPartAddress, ledger, accountName, currency, amount,
      voucherType, description, transactionHash,
    });
  }

  postDebit({
    clientAddress, counterPartAddress, ledger, accountName, currency, amount,
    voucherType, description, transactionHash,
  }) {
    return this._postEntry({
      entryType: EntryType.DEBIT, clientAddress, counterPartAddress, ledger, accountName, currency, amount,
      voucherType, description, transactionHash,
    });
  }

  postCredit({
    clientAddress, counterPartAddress, ledger, accountName, currency, amount,
    voucherType, description, transactionHash,
  }) {
    return this._postEntry({
      entryType: EntryType.CREDIT, clientAddress, counterPartAddress, ledger, accountName, currency, amount,
      voucherType, description, transactionHash,
    });
  }

  getBlockNumber() {
    return this._getOrCreateHolder(this.getWallet().address, 'default')
      .then((holderAddress) => {
        const holderContract = new HolderContract(this.getWallet(), holderAddress);

        return holderContract.getBlock()
          .then((response) => {
            return Response.value(response);
          })
          .then((value) => {
            return value.toString();
          });
      });
  }

  setBlockNumber(blockNumber) {
    return this._getHolderAddress(this.getWallet().address, 'default')
      .then((holderAddress) => {
        const holderContract = new HolderContract(this.getWallet(), holderAddress);

        return holderContract.setBlock(blockNumber)
          .then((response) => {
            return Response.empty(response);
          });
      });
  }

  _postEntry({
    entryType, clientAddress, counterPartAddress, ledger, accountName, currency, amount, voucherType, description,
    transactionHash,
  }) {
    const holderName = 'default';

    const setupAccount = () => this._setupAccount(
      clientAddress, holderName, ledger.name, ledger.group, accountName, currency,
    );

    return setupAccount()
      .then((accountContract) => {
        return this._getOrCreateHolder(counterPartAddress, 'default')
          .then((counterPartHolder) => {
            console.log('CounterPartyHolder', counterPartHolder);

            const now = new Date();
            const date = formatDate(now);

            console.log('Date:', date);

            return accountContract
              .postEntry(counterPartHolder, amount, entryType, date, description, voucherType, transactionHash);
          });
        // .then((response) => Response.empty(response)); //FIXME: Uncomment this
      });
  }

  /**
   * Setup an account an return its AccountContract
   * @param {String} clientAddress
   * @param {String} holderName
   * @param {String} ledgerName
   * @param {String} ledgerGroup
   * @param {String} accountName
   * @param {String} currency
   * @return {Promise<AccountContract>}
   * @private
   */
  _setupAccount(clientAddress, holderName, ledgerName, ledgerGroup, accountName, currency) {
    return this._getHolderAddress(clientAddress, holderName)
      .then((holderAddress) => {
        return holderAddress || this._createHolder(clientAddress, holderName);
      })
      .then((holderAddress) => {
        console.log('Step 1 (Holder address):', holderAddress);
        return this._getLedgerAddress(holderAddress, ledgerName, ledgerGroup)
          .then((ledgerAddress) => {
            return ledgerAddress || this._createLedger(holderAddress, ledgerName, ledgerGroup);
          });
      })
      .then((ledgerAddress) => {
        console.log('Step 2 (Ledger address):', ledgerAddress);
        return this._getAccountAddress(ledgerAddress, accountName, currency)
          .then((accountAddress) => {
            return accountAddress || this._createAccount(ledgerAddress, accountName, currency);
          });
      })
      .then((accountAddress) => {
        console.log('Step 3 (Account address):', accountAddress);

        return new AccountContract(this.getWallet(), accountAddress);
      });
  }

  _getOrCreateHolder(clientAddress, holderName) {
    return this._getHolderAddress(clientAddress, holderName)
      .then((holderAddress) => {
        if (holderAddress) {
          return holderAddress;
        }

        return this._createHolder(clientAddress, holderName);
      });
  }

  _getHolderAddress(clientAddress, holderName) {
    const accountCreatorAddress = this.getWallet().address;

    return this.systemContract.getAccountHolders(accountCreatorAddress)
      .then((response) => Response.array(response))
      .then((holders) => {
        // Each promise return holderDetails of holder
        const promises = holders.map((holder) => {
          return this.systemContract
            .getHolderDetails(holder)
            .then((response) => Response.array(response))
            .then((response) => {
              return {
                address: holder,
                clientAddress: response[1],
                name: Response.parseBytes32Value(response[0]),
              };
            });
        });

        return Promise.all(promises);
      })
      .then((holders) => {
        for (const holder of holders) {
          if (holder['name'] === holderName && holder['clientAddress'] === clientAddress) {
            return holder['address'];
          }
        }

        return null;
      });
  }

  /**
   * Create a holder and return its address
   * @param {String} clientAddress
   * @param {String} holderName
   * @private
   * @return {Promise<String>} holderAddress
   */
  _createHolder(clientAddress, holderName) {
    return this.systemContract.createHolder(holderName, clientAddress)
      .then((response) => Response.empty(response))
      .then(() => {
        return this._getHolderAddress(clientAddress, holderName);
      });
  }

  _getLedgerAddress(holderAddress, ledgerName, ledgerGroup) {
    return this.systemContract.getAccountLedgers(holderAddress)
      .then((response) => Response.array(response))
      .then((ledgers) => {
        const promises = ledgers.map((ledger) => {
          return this.systemContract.getLedgerDetails(ledger)
            .then((response) => Response.array(response))
            .then((response) => {
              return {
                address: ledger,
                name: Response.parseBytes32Value(response[0]),
                group: Response.parseBytes32Value(response[1]),
              };
            });
        });

        return Promise.all(promises);
      })
      .then((ledgers) => {
        for (const ledger of ledgers) {
          if (ledger['name'] === ledgerName && ledger['group'] === ledgerGroup) {
            return ledger['address'];
          }
        }

        return null;
      });
  }

  /**
   * Create a ledger and return its address
   * @param {String} holderAddress
   * @param {String} ledgerName
   * @param {String} ledgerGroup
   * @return {Promise<String>} ledgerAddress
   * @private
   */
  _createLedger(holderAddress, ledgerName, ledgerGroup) {
    const holderContract = new HolderContract(this.getWallet(), holderAddress);

    return holderContract.createLedger(ledgerName, ledgerGroup)
      .then((response) => Response.empty(response))
      .then(() => {
        return this._getLedgerAddress(holderAddress, ledgerName, ledgerGroup);
      });
  }

  _getAccountAddress(ledgerAddress, accountName, currency) {
    return this.systemContract.getLedgerAccounts(ledgerAddress)
      .then((response) => Response.array(response))
      .then((accounts) => {
        const promises = accounts.map((account) => {
          return this.systemContract.getAccountDetails(account)
            .then((response) => Response.array(response))
            .then((response) => {
              return {
                address: account,
                name: Response.parseBytes32Value(response[0]),
                currency: Response.parseBytes32Value(response[1]),
              };
            });
        });

        return Promise.all(promises);
      })
      .then((accounts) => {
        for (const account of accounts) {
          if (account['name'] === accountName && account['currency'] === currency) {
            return account['address'];
          }
        }

        return null;
      });
  }

  _createAccount(ledgerAddress, accountName, currency) {
    console.log('Ledger:', ledgerAddress, accountName, currency);

    const ledgerContract = new LedgerContract(this.getWallet(), ledgerAddress);

    return ledgerContract.createAccount(accountName, currency)
      .then((response) => Response.empty(response))
      .then(() => {
        return this._getAccountAddress(ledgerAddress, accountName, currency);
      });
  }
}

function formatDate(date) {
  const unixTime = parseInt(date.getTime() / 1000);

  return unixTime.toString();
}

export {EntryType, Accounts, Ledgers, VoucherType, formatDate};
export default AccountContractService;
