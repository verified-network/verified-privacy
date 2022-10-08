import {ethers} from 'ethers';
import {CashContract} from '@verified-network/verified-sdk';
import ContractService from 'sources/contracts/ContractService';
import paymentGateway from 'sources/api/PaymentGateway';
import Response from './Response';
import FactoryContractService from './FactoryContractServiceL2';
import workerInstance from 'sources/worker/WorkerInstance';

class CashContractService extends ContractService {
  constructor(password) {
    super(password);
    this.userAddress = this.getWallet().address;
  }

  issueTokensWithFiat(debitAmount, currencyToDebit, currencyToIssue) {
    return paymentGateway.createCashIssueRequest(
        this.getWallet().address, debitAmount, currencyToDebit.name, currencyToIssue.address
    ).then((response) => {
      // this.transactionHooks.issueTokensWithFiat(debitAmount, currencyToDebit, currencyToIssue);

      return response;
    });
  }

  issueTokensWithEther(tokenToIssue, etherAmount) {
    const wallet = this.getWallet();

    return wallet
        .sendTransaction({
          to: tokenToIssue.address,
          value: ethers.utils.parseEther(etherAmount),
        })
        .then((transactionResponse) => {
          // this.transactionHooks.issueTokensWithEtherRequest(tokenToIssue, etherAmount);

          return transactionResponse;
        });
  }

  /**
   * Exchange tokens for others
   * @param {Object} fromToken From token
   * @param {Object} toToken To token
   * @param {int} fromTokenAmount Specified in the currency paid in
   *
   * @return {Promise<void>}
   */
  exchangeTokens(fromToken, toToken, fromTokenAmount) {
    const cashContract = new CashContract(this.getWallet(), fromToken.address);

    return cashContract.transferFrom(this.userAddress, toToken.address, fromTokenAmount)
        .then((transactionResponse) => {
          // this.transactionHooks.exchangeTokens(fromToken, toToken, fromTokenAmount);

          return Response.empty(transactionResponse);
        });
  }

  /**
   * Transfer tokens to other wallet
   * @param {Object} fromToken From token
   * @param {String} toAddress Destination wallet
   * @param {int} amount
   *
   * @return {Promise<void>}
   */
  transferToAddress(fromToken, toAddress, amount) {
    const cashContract = new CashContract(this.getWallet(), fromToken.address);

    return cashContract.transferFrom(this.getWallet().address, toAddress, amount)
        .then((transactionResponse) => {
          // this.transactionHooks.transferToAddress(fromToken, toAddress, amount);

          return Response.empty(transactionResponse);
        });
  }

  /**
   * Pay with fiat money
   * @param {Object} fromToken
   * @param {string} toAddress
   * @param {string} amount
   * @param {Object} payCurrency
   * @return {Promise<void>}
   */
  payIn(fromToken, toAddress, amount, payCurrency) {
    amount = amount.toString();
    payCurrency = payCurrency.toUpperCase();

    const cashContract = new CashContract(this.getWallet(), fromToken.address);
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getCashCounterPartByFiat(payCurrency)
        .then((cashCurrency) => {
          workerInstance.addPayInOfFiatCallEntry({amount, toAddress, payCurrency});

          return cashContract.payIn(amount, toAddress, cashCurrency.cashCounterPart);
        })
        .then((response) => {
          return Response.empty(response);
        });
  }

  repayLoan(currencyName, bondTokenAddress, amount) {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getCashCurrencyByName(currencyName)
        .then((cashCurrency) => {
          const cashContract = new CashContract(this.getWallet(), cashCurrency.address);

          return cashContract.transferFrom(cashCurrency.address, bondTokenAddress, amount)
              .then((response) => Response.empty(response));
        });
  }

  purchaseBond(debitCurrency, debitAmount, bondTokenAddress) {
    const cashContract = new CashContract(this.getWallet(), debitCurrency.address);

    return cashContract.transferFrom(this.getWallet().address, bondTokenAddress, debitAmount)
        .then((response) => Response.empty(response));
  }

  withdraw(fromToken, amount) {
    const cashContract = new CashContract(this.getWallet(), fromToken.address);

    return cashContract.transferFrom(this.getWallet().address, fromToken.address, amount)
        .then((response) => {
          // this.transactionHooks.withdraw(fromToken, amount);

          return Response.empty(response);
        });
  }

  notifyCashIssue(tokenAddress, callback) {
    setTimeout(() => { // Fixme: Just for testing
      callback({
        status: 0,
        response: {result: ['0x7079C0a4CFECf0B575eaF7C103AfA197e847B217', 'VXUSD', '200']},
      });
    }, 3000);

    const cashContract = new CashContract(this.getWallet(), tokenAddress);
    // return cashContract.notifyCashIssue(callback);
    return cashContract.notifyCashIssue((event) => {
      console.log('Real cash issue:', event);
    });
  }

  notifyCashRedemption(tokenAddress, callback) {
    setTimeout(() => { // Fixme: Just for testing
      callback({
        status: 0,
        response: {result: ['0x7079C0a4CFECf0B575eaF7C103AfA197e847B217', 'ether', '200']},
      });
    }, 3000);

    const cashContract = new CashContract(this.getWallet(), tokenAddress);
    return cashContract.notifyCashRedemption((event) => {
      console.log('Real cash redem:', event);
    });
    // return cashContract.notifyCashRedemption(callback);
  }

  notifyCashExchange(tokenAddress, callback) {
    setTimeout(() => { // Fixme: Just for testing
      callback({
        status: 0,
        response: {result: ['0x7079C0a4CFECf0B575eaF7C103AfA197e847B217', 'VXEUR', '200']},
      });
    }, 3000);

    const cashContract = new CashContract(this.getWallet(), tokenAddress);
    // return cashContract.notifyCashExchange(callback);
    return cashContract.notifyCashExchange((event) => {
      console.log('Real exchange event:', event);
    });
  }

  balanceOf(token) {
    const cashContract = new CashContract(this.getWallet(), token.address);

    return cashContract.balanceOf(this.userAddress)
        .then((response) => {
          return Response.value(response);
        });
  }

  allBalances() {
    const factoryContractService = new FactoryContractService(this.getPassword());

    return factoryContractService.getCashCurrencies()
        .then((currencies) => {
          const promises = currencies.map((currency) => {
            return this.balanceOf(currency)
                .then((balance) => {
                  currency.balance = balance;
                  return currency;
                });
          });

          return Promise.all(promises);
        });
  }
}

export default CashContractService;
