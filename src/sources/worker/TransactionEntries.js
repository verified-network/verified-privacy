// This class is Called after each Client Side Transaction

import {Ledgers, VoucherType, Accounts, EntryType} from '../contracts/AccountContractService';
import {EventsType} from 'sources/worker/Events';

const ETHER_CURRENCY = 'ether';

class TransactionEntriesBuilder {
  constructor(wallet) {
    this.wallet = wallet;
  }

  buildEntriesByEvent(event) {
    return this._buildEntriesByEvent(event)
      .map((entry) => {
        entry.event = event;
        entry.transactionHash = event.transactionHash;
        return entry;
      });
  }

  _buildEntriesByEvent(event) {
    switch (event.name) {
      case EventsType.CASH_DEPOSITS: {
        return this.processCashDepositEvent(event);
      }

      case EventsType.CASH_ISSUED: {
        return this.processCashIssueEvent(event);
      }

      case EventsType.CASH_REDEEMED: {
        return this.processCashRedemptionEvent(event);
      }

      case EventsType.CASH_TRANSFER: {
        return this.processCashTransferEvent(event);
      }

      case EventsType.BOND_ISSUED: {
        return this.processBondIssuedEvent(event);
      }

      case EventsType.BOND_PURCHASED: {
        return this.processBondPurchasedEvent(event);
      }

      case EventsType.BOND_LIQUIDATED: {
        return this.processBondLiquidatedEvent(event);
      }

      case EventsType.BOND_REDEEMED: {
        return this.processBondRedeemedEvent(event);
      }

      case EventsType.TRADE_SETTLED: {
        return this.processTradeSettledEvent(event);
      }

      case 'CashIssueRequestWithFiat': {
        return this.processIssueTokensWithFiatRequest(event);
      }

      case 'WithdrawalOfFiatRequest': {
        return this.processPayoutOfFiatRequest(event);
      }

      case 'PayInOfFiatCall': {
        return this.processPaInOfFiatCall(event);
      }
    }
  }

  processCashDepositEvent(event) {
    const userAddress = this.wallet.address;

    const eventCurrency = event.data.currency;
    const eventAmount = event.data.amount;
    const contractAddress = event.contractAddress;
    const contractName = event.contractName;

    if (eventCurrency === ETHER_CURRENCY) {
      // Sending ether and requesting cash tokens
      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: contractAddress,
        ledger: Ledgers.DIGITAL_ASSETS,
        accountName: Accounts.CASH_TOKEN_REQUEST,
        currency: eventCurrency,
        amount: eventAmount,
        voucherType: VoucherType.JOURNAL,
        description: `issue of ${contractName} cash`,
      };

      return [debitEntry];
    } else {
      // Exchanging cash tokens
      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: contractAddress,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.CASH_TOKEN_EXCHANGE,
        currency: eventCurrency,
        amount: eventAmount,
        voucherType: VoucherType.JOURNAL,
        description: `exchange of ${contractName} cash`,
      };

      return [debitEntry];
    }
  }

  processCashIssueEvent(event) {
    const userAddress = this.wallet.address;

    const contractAddress = event.contractAddress;
    const eventCurrency = event.data.currency;
    const eventAmount = event.data.amount;

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_ISSUE,
      currency: eventCurrency,
      amount: eventAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${eventCurrency} ${eventAmount}`,
    };

    return [creditEntry];
  }

  processCashRedemptionEvent(event) {
    const userAddress = this.wallet.address;
    const contractAddress = event.contractAddress;
    const contractName = event.contractName;
    const eventRedeemedForAmount = event.data.redeemedFor;
    const eventAmount = event.data.amount;
    const eventCurrency = event.data.currency;

    const debitEntry = {
      type: EntryType.DEBIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_REDEMPTION,
      currency: contractName,
      amount: eventRedeemedForAmount,
      voucherType: VoucherType.JOURNAL,
      description: `redemption of ${eventCurrency}`,
    };

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.CASH_TOKEN_REDEMPTION,
      currency: eventCurrency,
      amount: eventAmount,
      voucherType: VoucherType.JOURNAL,
      description: `redemption of ${contractName}`,
    };

    return [debitEntry, creditEntry];
  }

  processCashTransferEvent(event) {
    const userAddress = this.wallet.address;
    const contractName = event.contractName;
    const eventParty = event.data.party;
    const eventCounterParty = event.data.counterParty;
    const eventAmount = event.data.amount;
    const eventCurrency = event.data.currency;

    // Logged in user is sender
    if (eventParty === userAddress) {
      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: eventCounterParty,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.PAYMENT_TRANSFER,
        currency: eventCurrency,
        amount: eventAmount,
        voucherType: VoucherType.CASH,
        description: `transfer of ${contractName}`,
      };

      return [debitEntry];
    } else if (eventCounterParty === userAddress) {
      // Logged in user is receiver
      const creditEntry = {
        type: EntryType.CREDIT,
        clientAddress: userAddress,
        counterPartAddress: eventParty,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.PAYMENT_TRANSFER,
        currency: eventCurrency,
        amount: eventAmount,
        voucherType: VoucherType.CASH,
        description: `transfer of ${contractName}`,
      };

      return [creditEntry];
    }
  }

  processBondIssuedEvent(event) {
    const userAddress = this.wallet.address;

    const contractAddress = event.contractAddress;

    const {bondName, amount, currency, collateralAmount} = event.data;

    const debitEntry = {
      type: EntryType.DEBIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.BOND_TOKEN_REQUEST,
      currency: currency,
      amount: collateralAmount,
      voucherType: VoucherType.JOURNAL,
      description: `issue of ${bondName} bond`,
    };

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_SALE,
      currency: bondName,
      amount: amount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${amount} ${bondName} bond`,
    };

    return [debitEntry, creditEntry];
  }

  processBondPurchasedEvent(event) {
    const userAddress = this.wallet.address;

    const contractAddress = event.contractAddress;

    const {bondName, amount, currency, paidInAmount} = event.data;

    const debitEntry = {
      type: EntryType.DEBIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.BOND_PURCHASE,
      currency: currency,
      amount: paidInAmount,
      voucherType: VoucherType.PURCHASE,
      description: `purchase of ${bondName} bond tokens`,
    };

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_PURCHASE,
      currency: bondName,
      amount: amount,
      voucherType: VoucherType.SALE,
      description: `To credit of ${amount} ${bondName} bond tokens`,
    };

    return [debitEntry, creditEntry];
  }

  processBondRedeemedEvent(event) {
    const userAddress = this.wallet.address;

    const contractAddress = event.contractAddress;
    const contractName = event.contractName;

    const {
      tokenAmount,
      tokenName,
      party,
      amount,
      currency,
    } = event.data;

    // Paid in token is not the bond token itself. In this case, cash token is paid by bond issuer to repay a loan
    if (tokenName !== contractName) {
      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: contractAddress,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.BOND_REDEMPTION,
        currency: tokenName,
        amount: tokenAmount,
        voucherType: VoucherType.JOURNAL,
        description: `redemption of ${contractName} bond`,
      };

      const creditEntry = {
        type: EntryType.CREDIT,
        clientAddress: userAddress,
        counterPartAddress: party,
        ledger: Ledgers.DIGITAL_ASSETS,
        accountName: Accounts.BOND_REDEMPTION,
        currency: currency,
        amount: amount,
        voucherType: VoucherType.JOURNAL,
        description: `To credit of ${amount} ${currency} bond`,
      };

      return [debitEntry, creditEntry];
    } else {
      // Paid in token is the bond token itself. In this case, unsold bond tokens are returned by bond issuer to get
      // back collateral

      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: contractAddress,
        ledger: Ledgers.DIGITAL_BOND,
        accountName: Accounts.BOND_REDEMPTION,
        currency: tokenName,
        amount: tokenAmount,
        voucherType: VoucherType.JOURNAL,
        description: `redemption of ${contractName} bond`,
      };

      const creditEntry = {
        type: EntryType.CREDIT,
        clientAddress: userAddress,
        counterPartAddress: contractAddress,
        ledger: Ledgers.DIGITAL_ASSETS,
        accountName: Accounts.BOND_REDEMPTION,
        currency: currency,
        amount: amount,
        voucherType: VoucherType.JOURNAL,
        description: `To credit of ${amount} ${currency}`,
      };

      return [debitEntry, creditEntry];
    }
  }

  processBondLiquidatedEvent(event) {
    const userAddress = this.wallet.address;

    const contractAddress = event.contractAddress;
    const contractName = event.contractName;

    const {
      tokenAmount,
      tokenName,
      amount,
      currency,
    } = event.data;

    const debitEntry = {
      type: EntryType.DEBIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_REDEMPTION,
      currency: tokenName,
      amount: tokenAmount,
      voucherType: VoucherType.JOURNAL,
      description: `redemption of ${contractName} bond`,
    };

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: contractAddress,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.BOND_REDEMPTION,
      currency: currency,
      amount: amount,
      voucherType: VoucherType.JOURNAL,
      description: `redemption of ${contractName} bond`,
    };

    return [debitEntry, creditEntry];
  }

  processTradeSettledEvent(event) {
    const userAddress = this.wallet.address;

    const {
      transferor,
      transferee,
      unitsToTransfer,
      security,
      price,
      currency,
    } = event.data;

    const amount = price * unitsToTransfer;

    if (transferee === userAddress) {
      const debitEntry = {
        type: EntryType.DEBIT,
        clientAddress: userAddress,
        counterPartAddress: transferor,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.SECURITY_PURCHASE,
        currency: currency,
        amount: amount,
        voucherType: VoucherType.PURCHASE,
        description: `By debit of ${amount} ${currency}`,
      };

      return [debitEntry];
    } else if (transferor === userAddress) {
      // Logged in user is receiver
      const creditEntry = {
        type: EntryType.CREDIT,
        clientAddress: userAddress,
        counterPartAddress: transferee,
        ledger: Ledgers.DIGITAL_SECURITY,
        accountName: Accounts.SECURITY_PURCHASE,
        currency: currency,
        amount: amount,
        voucherType: VoucherType.SALE,
        description: `To credit of ${amount} ${currency}`,
      };

      return [creditEntry];
    }
  }

  processIssueTokensWithFiatRequest(event) {
    const userAddress = this.wallet.address;

    const payment = event.payment;
    const issuerAddress = event.issuerAddress;

    const debitCurrency = payment.currency;
    const debitAmount = payment.amount;

    const debitEntry = {
      clientAddress: userAddress,
      counterPartAddress: issuerAddress,
      ledger: Ledgers.BANK,
      accountName: Accounts.CASH_TOKEN_REQUEST,
      currency: debitCurrency,
      amount: debitAmount,
      voucherType: VoucherType.BANK,
      description: `By debit of ${debitAmount} ${debitCurrency}`,
    };

    return [debitEntry];
  }

  processPayoutOfFiatRequest(event) {
    const payment = event.payment;
    const investorAddress = payment.userAddress;
    const userAddress = this.wallet.address;
    const debitCurrency = payment.currency;
    const debitAmount = payment.amount;

    const debitEntry = {
      clientAddress: userAddress,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_WITHDRAWAL,
      currency: debitCurrency,
      amount: debitAmount,
      voucherType: VoucherType.BANK,
      description: `By debit of ${debitAmount} ${debitCurrency}`,
    };

    return [debitEntry];
  }

  processPaInOfFiatCall(event) {
    const data = event.data;
    const userAddress = this.wallet.address;
    const investorAddress = data.toAddress;
    const amount = data.amount;
    const currency = data.payCurrency;

    const creditEntry = {
      type: EntryType.CREDIT,
      clientAddress: userAddress,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_REQUEST,
      currency: currency,
      amount: amount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${amount} ${currency}`,
    };

    return [creditEntry];
  }

  /*
  // Sending ether and requesting cash tokens
  issueTokensWithEtherRequest(tokenToIssue, etherAmount) {
    const debitEntry = {
      clientAddress: this.getWallet().address,
      counterPartAddress: tokenToIssue.address,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.CASH_TOKEN_REQUEST,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${etherAmount} eth.`,
    };

    const creditEntry = {
      clientAddress: tokenToIssue.address,
      counterPartAddress: this.getWallet().address,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_REQUEST,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${etherAmount} eth.`,
    };

    this.accountContractService.postCredit(creditEntry)
        .then(() => {
          this.accountContractService.postDebit(debitEntry);
        });
  }

  // Sending ether and requesting cash tokens
  // To call with info from verified-graph
  issueTokensWithEtherEvent(tokenToIssue, etherAmount) {
    const cashContractService = new CashContractService(this.getPassword());

    cashContractService.notifyCashIssue(tokenToIssue.address, (response) => {
      const eventData = response.response.result;
      const address = eventData[0];
      const issuedAmount = eventData[2];

      const isEventFromUser = (address === this.getWallet().address);

      if (isEventFromUser) {
        const originDebitEntry = {
          clientAddress: this.getWallet().address,
          counterPartAddress: tokenToIssue.address,
          ledger: Ledgers.DIGITAL_CASH,
          accountName: Accounts.CASH_TOKEN_REQUEST,
          currency: tokenToIssue.name,
          amount: issuedAmount,
          voucherType: VoucherType.JOURNAL,
          description: `By debit of ${etherAmount} eth.`,
        };

        const originCreditEntry = {
          clientAddress: tokenToIssue.address,
          counterPartAddress: this.getWallet().address,
          ledger: Ledgers.DIGITAL_CASH,
          accountName: Accounts.CASH_TOKEN_REQUEST,
          currency: tokenToIssue.name,
          amount: issuedAmount,
          voucherType: VoucherType.JOURNAL,
          description: `To credit of ${etherAmount} eth.`,
        };

        this.accountContractService.postCredit(originCreditEntry)
            .then(() => {
              this.accountContractService.postDebit(originDebitEntry);
            });
      }
    });
  }

  // Sending fiat and requesting cash tokens
  issueTokensWithFiatRequest(debitAmount, currencyToDebit, currencyToIssue) {
    const clientContractService = new ClientContractService(this.getPassword());

    return clientContractService.getManager((manager) => {
      const debitEntry = {
        clientAddress: this.getWallet().address,
        counterPartAddress: manager,
        ledger: Ledgers.BANK,
        accountName: Accounts.CASH_TOKEN_REQUEST,
        currency: currencyToDebit.name,
        amount: debitAmount,
        voucherType: VoucherType.JOURNAL,
        description: `Request cash tokens with ${debitAmount} ${currencyToDebit.name}`,
      };

      const creditEntry = {
        clientAddress: manager,
        counterPartAddress: this.getWallet().address,
        ledger: Ledgers.BANK,
        accountName: Accounts.CASH_TOKEN_REQUEST,
        currency: currencyToDebit.name,
        amount: debitAmount,
        voucherType: VoucherType.JOURNAL,
        description: `Request cash tokens with ${debitAmount} ${currencyToDebit.name}`,
      };

      return this.accountContractService.postCredit(debitEntry)
          .then(() => {
            return this.accountContractService.postDebit(creditEntry);
          });
    });
  }

  // Sending fiat and requesting cash tokens
  issueTokensWithFiatEvent(currencyToIssue) {
    const cashContractService = new CashContractService(this.getPassword());

    cashContractService.notifyCashIssue(currencyToIssue.address, (response) => {
      const eventData = response.response.result;

      const address = eventData[0];
      const creditAmount = eventData[2];

      const debitAmount = 5;
      const currencyToDebit = {};

      const isEventFromUser = (address === this.getWallet().address);

      const clientContractService = new ClientContractService(this.getPassword());

      if (isEventFromUser) {
        return clientContractService.getManager((manager) => {
          const debitEntry = {
            clientAddress: this.getWallet().address,
            counterPartAddress: manager,
            ledger: Ledgers.BANK,
            accountName: Accounts.CASH_TOKEN_REQUEST,
            currency: currencyToDebit.name,
            amount: debitAmount,
            voucherType: VoucherType.BANK,
            description: `Request cash tokens with ${debitAmount} ${currencyToDebit.name}`,
          };

          const creditEntry = {
            clientAddress: manager,
            counterPartAddress: this.getWallet().address,
            ledger: Ledgers.BANK,
            accountName: Accounts.CASH_TOKEN_REQUEST,
            currency: currencyToDebit.name,
            amount: debitAmount,
            voucherType: VoucherType.JOURNAL,
            description: `Request cash tokens with ${debitAmount} ${currencyToDebit.name}`,
          };

          return this.accountContractService.postCredit(creditEntry)
              .then(() => {
                return this.accountContractService.postDebit(debitEntry);
              });
        });
      }
    });
  }

  // Pay in of fiat to issue cash tokens
  payInCall(fromToken, investorAddress, payedAmount, payedCurrency) {
    const issuerAddress = this.getWallet().address;

    const factoryContractService = new FactoryContractService(this.getPassword());

    const issuedAmount = 'unknown'; // FIXME

    factoryContractService.getCashCurrencyByAddress(fromToken.address).then((tokenToIssue) => {
      const debitEntry = {
        clientAddress: issuerAddress,
        counterPartAddress: investorAddress,
        ledger: Ledgers.BANK,
        accountName: Accounts.CASH_TOKEN_REQUEST,
        currency: tokenToIssue.name,
        amount: issuedAmount,
        voucherType: VoucherType.JOURNAL,
        description: `By debit of ${payedAmount} ${payedCurrency} towards issue of ${tokenToIssue.name} cash tokens`,
      };

      const creditEntry = {
        clientAddress: investorAddress,
        counterPartAddress: issuerAddress,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.CASH_TOKEN_REQUEST,
        currency: tokenToIssue.name,
        amount: issuedAmount,
        voucherType: VoucherType.JOURNAL,
        description: `To credit of ${payedAmount} ${payedCurrency} towards issue of ${tokenToIssue.name} cash tokens`,
      };

      return this.accountContractService.postDebit(debitEntry)
          .then(() => {
            return this.accountContractService.postCredit(creditEntry);
          });
    });
  }

  // Pay in of fiat to issue cash tokens
  payInEvent() {
    // const investorAddress = this.getWallet().address;
    // const issuerAddress = '';
    //
    // const debitEntry = {
    //   clientAddress: issuerAddress,
    //   counterPartAddress: investorAddress,
    //   ledger: Ledgers.BANK,
    //   accountName: Accounts.CASH_TOKEN_REQUEST,
    //   currency: tokenToIssue.name,
    //   amount: eventAmount,
    //   voucherType: VoucherType.JOURNAL,
    //   description: `By debit of ${payedAmount} ${payedCurrency} towards issue of ${tokenToIssue.name} cash tokens`,
    // };
    //
    // const creditEntry = {
    //   clientAddress: investorAddress,
    //   counterPartAddress: issuerAddress,
    //   ledger: Ledgers.DIGITAL_CASH,
    //   accountName: Accounts.CASH_TOKEN_REQUEST,
    //   currency: tokenToIssue.name,
    //   amount: eventAmount,
    //   voucherType: VoucherType.JOURNAL,
    //   description: `To credit of ${payedAmount} ${payedCurrency} towards issue of ${tokenToIssue.name} cash tokens`,
    // };
    //
    // return this.accountContractService.postDebit(debitEntry)
    //     .then(() => {
    //       return this.accountContractService.postCredit(creditEntry);
    //     });
  }

  // Transferring cash tokens
  transferToAddressCall(fromToken, toAddress, amount) {
    const originAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: originAddress,
      counterPartAddress: toAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.PAYMENT_TRANSFER,
      currency: fromToken.name,
      amount: amount,
      voucherType: VoucherType.CASH,
      // description: `By debit of ${amount} ${fromToken.name} towards payment transfer.`,
      description: `By debit of ${amount} ${fromToken.name}.`,
    };

    const creditEntry = {
      clientAddress: toAddress,
      counterPartAddress: originAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.PAYMENT_TRANSFER,
      currency: fromToken.name,
      amount: amount,
      voucherType: VoucherType.CASH,
      // description: `To credit of ${amount} ${fromToken.name} towards payment transfer.`,
      description: `To credit of ${amount} ${fromToken.name}`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  transferToAddressEvent(fromToken, toAddress, amount) {
    const originAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: originAddress,
      counterPartAddress: toAddress,
      ledger: Ledgers.DIGITAL_CASH_TRANSFERS,
      accountName: Accounts.PAYMENT_TRANSFER,
      currency: fromToken.name,
      amount: amount,
      voucherType: VoucherType.CASH,
      // description: `By debit of ${amount} ${fromToken.name} towards payment transfer.`,
      description: `By debit of ${amount} ${fromToken.name}`,
    };

    const creditEntry = {
      clientAddress: toAddress,
      counterPartAddress: originAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.PAYMENT_TRANSFER,
      currency: fromToken.name,
      amount: amount,
      voucherType: VoucherType.CASH,
      // description: `To credit of ${amount} ${fromToken.name} towards payment transfer.`,
      description: `To credit of ${amount} ${fromToken.name}`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  exchangeTokensCall(fromToken, toToken, fromTokenAmount) {
    const userAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: userAddress,
      counterPartAddress: fromToken.address,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_EXCHANGE,
      currency: fromToken.name,
      amount: fromTokenAmount,
      voucherType: VoucherType.CASH,
      description: `By debit of ${fromTokenAmount} ${fromToken.name} towards cash token exchange.`,
    };

    const creditEntry = {
      clientAddress: fromToken.address,
      counterPartAddress: userAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_EXCHANGE,
      currency: fromToken.name,
      amount: fromTokenAmount,
      voucherType: VoucherType.CASH,
      description: `To credit of ${fromTokenAmount} ${fromToken.name} towards cash token exchange.`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  exchangeTokensEvent() {
    // Expected from graph
    const toTokenAddress = '';
    const toTokenName = '';
    const toTokenAmount = '';
    const fromTokenAmount = '';
    const fromTokenName = '';

    const userAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: toTokenAddress,
      counterPartAddress: userAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_EXCHANGE,
      currency: toTokenName,
      amount: toTokenAmount,
      voucherType: VoucherType.CASH,
      description: `By debit of ${fromTokenAmount} ${fromTokenName}
                    towards cash token exchange.`,
    };

    const creditEntry = {
      clientAddress: userAddress,
      counterPartAddress: toTokenAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_EXCHANGE,
      currency: toTokenName,
      amount: toTokenAmount,
      voucherType: VoucherType.CASH,
      description: `To credit of ${fromTokenAmount} ${fromTokenName}
                    towards cash token exchange.`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Redeeming cash tokens, payout of ether
  withdrawCall(fromToken, withdrawAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: fromToken.address,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.CASH_TOKEN_REDEMPTION_REQUEST,
      currency: fromToken.name,
      amount: withdrawAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${withdrawAmount} ${fromToken.name} towards cash token redemption.`,
    };

    const creditEntry = {
      clientAddress: fromToken.name,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.CASH_TOKEN_REDEMPTION_REQUEST,
      currency: fromToken.name,
      amount: withdrawAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${withdrawAmount} ${fromToken.name} towards cash token redemption.`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Redeeming cash tokens, payout of ether
  withdrawEvent(fromToken, withdrawAmount) {
    const cashContractService = new CashContractService(this.getPassword());
    const investorAddress = this.getWallet().address;

    cashContractService.notifyCashRedemption(fromToken.address, (response) => {
      const eventData = response.response.result;
      const eventAddress = eventData[0];
      const eventCurrency = eventData[1];
      const eventAmount = eventData[2];

      const isEventFromUser = (eventAddress === this.getWallet().address);

      if (isEventFromUser) {
        const debitEntry = {
          clientAddress: fromToken.address,
          counterPartAddress: investorAddress,
          ledger: Ledgers.DIGITAL_ASSETS,
          accountName: Accounts.CASH_TOKEN_REDEMPTION_REQUEST,
          currency: eventCurrency,
          amount: eventAmount,
          voucherType: VoucherType.JOURNAL,
          description: `By debit of ${withdrawAmount} ${fromToken.name} towards cash token redemption.`,
        };

        const creditEntry = {
          clientAddress: investorAddress,
          counterPartAddress: fromToken.name,
          ledger: Ledgers.DIGITAL_ASSETS,
          accountName: Accounts.CASH_TOKEN_REDEMPTION_REQUEST,
          currency: eventCurrency,
          amount: eventAmount,
          voucherType: VoucherType.JOURNAL,
          description: `To credit of ${withdrawAmount} ${fromToken.name} towards cash token redemption.`,
        };

        return this.accountContractService.postDebit(debitEntry)
            .then(() => {
              return this.accountContractService.postCredit(creditEntry);
            });
      }
    });
  }

  // Pay out of fiat by redeeming cash tokens
  payoutWithdraw(payment) {
    const issuerAddress = this.getWallet().address;
    const investorAddress = payment.userAddress;
    const cashCurrency = FactoryContractService.getCashCurrencyNameByFiatName(payment.currency);
    const fiatCurrency = payment.currency;
    const amount = (payment.amount).toString();

    if (payment.status === PaymentGateway.SUCCESS_PAYMENT) {
      const investorDebitEntry = {
        clientAddress: issuerAddress,
        counterPartAddress: investorAddress,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.CASH_WITHDRAWAL,
        currency: fiatCurrency,
        amount: amount,
        voucherType: VoucherType.BANK,
        description: `By debit of ${amount} ${cashCurrency} towards payment of ${fiatCurrency} fiat currency`,
      };

      const investorCreditEntry = {
        clientAddress: investorAddress,
        counterPartAddress: issuerAddress,
        ledger: Ledgers.BANK,
        accountName: Accounts.CASH_WITHDRAWAL,
        currency: fiatCurrency,
        amount: amount,
        voucherType: VoucherType.BANK,
        description: `To credit of ${amount} ${fiatCurrency} towards redemption of ${amount} ${cashCurrency} tokens`,
      };

      const issuerDebitEntry = {
        clientAddress: issuerAddress,
        counterPartAddress: investorAddress,
        ledger: Ledgers.DIGITAL_CASH,
        accountName: Accounts.CASH_WITHDRAWAL,
        currency: fiatCurrency,
        amount: amount,
        voucherType: VoucherType.BANK,
        description: `By debit of ${amount} ${cashCurrency} towards payment of ${fiatCurrency} fiat currency`,
      };

      const issuerCreditEntry = {
        clientAddress: investorAddress,
        counterPartAddress: issuerAddress,
        ledger: Ledgers.BANK,
        accountName: Accounts.CASH_WITHDRAWAL,
        currency: fiatCurrency,
        amount: amount,
        voucherType: VoucherType.BANK,
        description: `To credit of ${amount} ${fiatCurrency} towards redemption of ${amount} ${cashCurrency} tokens`,
      };

      return this.accountContractService.postDebit(investorDebitEntry)
          .then(() => {
            return this.accountContractService.postCredit(investorCreditEntry);
          })
          .then(() => {
            return this.accountContractService.postCredit(issuerCreditEntry);
          })
          .then(() => {
            return this.accountContractService.postDebit(issuerDebitEntry);
          });
    }
  }

  // Sending ether and requesting bond tokens
  purchaseBondWithEtherCall(tokenToIssue, etherAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: tokenToIssue.address,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.BOND_TOKEN_REQUEST,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${etherAmount} eth towards issue of bond tokens`,
    };

    const creditEntry = {
      clientAddress: tokenToIssue.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_TOKEN_REQUEST,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${etherAmount} eth towards issue of bond tokens`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Sending ether and requesting bond tokens
  purchaseBondWithEtherEvent(tokenToIssue, etherAmount) {
    const investorAddress = this.getWallet().address;

    const bondToken = {};
    const bondAmount = 0;

    const debitEntry = {
      clientAddress: tokenToIssue.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_TOKEN_REQUEST,
      currency: bondToken.name,
      amount: bondAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${etherAmount} eth towards issue of bond tokens`,
    };

    const creditEntry = {
      clientAddress: investorAddress,
      counterPartAddress: tokenToIssue.address,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_TOKEN_REQUEST,
      currency: bondToken.name,
      amount: bondAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${etherAmount} eth towards issue of bond tokens`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Purchasing bond tokens
  purchaseBondWithCashCall(tokenToIssue, tokenToDebit, debitAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: tokenToIssue.address,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.BOND_PURCHASE,
      currency: tokenToDebit.name,
      amount: debitAmount,
      voucherType: VoucherType.PURCHASE,
      description: `By debit of ${debitAmount} ${tokenToDebit.name} towards issue of bond tokens`,
    };

    const creditEntry = {
      clientAddress: tokenToIssue.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_SALE,
      currency: tokenToDebit.name,
      amount: debitAmount,
      voucherType: VoucherType.PURCHASE,
      description: `To credit of ${debitAmount} ${tokenToDebit.name} towards issue of bond tokens`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Purchasing bond tokens
  purchaseBondWithCashEvent(tokenToIssue, tokenToDebit, debitAmount) {
    const investorAddress = this.getWallet().address;

    const bondToken = {};
    const bondAmount = 0;

    const debitEntry = {
      clientAddress: tokenToIssue.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_SALE,
      currency: bondToken.name,
      amount: bondAmount,
      voucherType: VoucherType.SALE,
      description: `By debit of ${debitAmount} ${tokenToDebit.name} towards sale of bonds`,
    };

    const creditEntry = {
      clientAddress: investorAddress,
      counterPartAddress: tokenToIssue.address,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_PURCHASE,
      currency: bondToken.name,
      amount: bondAmount,
      voucherType: VoucherType.SALE,
      description: `To credit of ${debitAmount} ${tokenToDebit.name} towards sale of bonds`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Redeeming bond tokens (repaying loan)
  redeemBondCall(tokenToRedeem, tokenToDebit, debitAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: tokenToRedeem.address,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.BOND_REDEMPTION,
      currency: tokenToDebit.name,
      amount: debitAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${debitAmount} ${tokenToDebit.name} towards bond token redemption`,
    };

    const creditEntry = {
      clientAddress: tokenToRedeem.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_REDEMPTION,
      currency: tokenToDebit.name,
      amount: debitAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${debitAmount} ${tokenToDebit.name} towards bond token redemption`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  redeemBondEtherEvent() {
    const investorAddress = this.getWallet().address;

    const redeemedBond = {};
    const etherAmount = 0;
    const debitAmount = 0;
    const tokenToDebit = {};

    const debitEntry = {
      clientAddress: redeemedBond.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_REDEMPTION,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${debitAmount} ${tokenToDebit.name} towards bond token redemption`,
    };

    const creditEntry = {
      clientAddress: investorAddress,
      counterPartAddress: redeemedBond.address,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.BOND_REDEMPTION,
      currency: ETHER_CURRENCY,
      amount: etherAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${debitAmount} ${tokenToDebit.name} towards bond token redemption`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Redeeming  bond tokens (repaying loan)
  redeemBondCashEvent() {
    const investorAddress = this.getWallet().address;

    const returnAmount = 0;
    const returnToken = {};
    const redeemedBond = {};

    const debitEntry = {
      clientAddress: redeemedBond.address,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_BOND,
      accountName: Accounts.BOND_REDEMPTION,
      currency: returnToken.name,
      amount: returnAmount,
      voucherType: VoucherType.JOURNAL,
      description: `By debit of ${returnAmount} ${returnToken.name} towards bond token redemption`,
    };

    const creditEntry = {
      clientAddress: investorAddress,
      counterPartAddress: redeemedBond.address,
      ledger: Ledgers.DIGITAL_ASSETS,
      accountName: Accounts.BOND_REDEMPTION,
      currency: returnToken.name,
      amount: returnAmount,
      voucherType: VoucherType.JOURNAL,
      description: `To credit of ${returnAmount} ${returnToken.name} towards bond token redemption`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Redeeming  bond tokens (for receiving payment against redemption of bond tokens) // TODO

  // Liquidating  bond tokens (for defaulting loan) // TODO

  // Purchasing security tokens
  purchaseSecurityCall(payCurrency, payAmount, securityAddress) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: securityAddress,
      ledger: Ledgers.DIGITAL_CASH,
      accountName: Accounts.SECURITY_SALE,
      currency: payCurrency.name,
      amount: payAmount,
      voucherType: VoucherType.PURCHASE,
      description: `By debit of ${payAmount} ${payCurrency.name} towards purchase of securities`,
    };

    const creditEntry = {
      clientAddress: securityAddress,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_SECURITY,
      accountName: Accounts.SECURITY_SALE,
      currency: payCurrency.name,
      amount: payAmount,
      voucherType: VoucherType.PURCHASE,
      description: `To credit of ${payAmount} ${payCurrency.name} towards sale of securities`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Purchasing security tokens
  purchaseSecurityEvent(payCurrency, payAmount, securityAddress, securityName, securityAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: securityAddress,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_SECURITY,
      accountName: Accounts.SECURITY_SALE,
      currency: securityName,
      amount: securityAmount,
      voucherType: VoucherType.PURCHASE,
      description: `By debit of ${securityAmount} ${securityName} towards sale of securities`,
    };

    const creditEntry = {
      clientAddress: investorAddress,
      counterPartAddress: securityAddress,
      ledger: Ledgers.DIGITAL_SECURITY,
      accountName: Accounts.SECURITY_PURCHASE,
      currency: securityName,
      amount: securityAmount,
      voucherType: VoucherType.PURCHASE,
      description: `To credit of ${securityAmount} ${securityName} towards sale of securities`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }

  // Selling security tokens
  sellSecurityEvent(securityAddress, securityName, securityAmount) {
    const investorAddress = this.getWallet().address;

    const debitEntry = {
      clientAddress: investorAddress,
      counterPartAddress: securityAddress,
      ledger: Ledgers.DIGITAL_SECURITY,
      accountName: Accounts.SECURITY_SALE,
      currency: securityName,
      amount: securityAmount,
      voucherType: VoucherType.SALE,
      description: `By debit of ${securityAmount} ${securityName} towards sale of securities`,
    };

    const creditEntry = {
      clientAddress: securityAddress,
      counterPartAddress: investorAddress,
      ledger: Ledgers.DIGITAL_SECURITY,
      accountName: Accounts.SECURITY_PURCHASE,
      currency: securityName,
      amount: securityAmount,
      voucherType: VoucherType.SALE,
      description: `To credit of ${securityAmount} ${securityName} towards sale of securities`,
    };

    return this.accountContractService.postDebit(debitEntry)
        .then(() => {
          return this.accountContractService.postCredit(creditEntry);
        });
  }
  */
}

export default TransactionEntriesBuilder;
