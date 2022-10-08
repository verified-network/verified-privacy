import React, { Component } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from '../../ui/textinput/TextInput';
import FormSelector from '../../ui/formSelector/formSelector';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import CashContractService from '../../../sources/contracts/CashContractService';
import BondContractService from '../../../sources/contracts/BondContractService';
import PaymentModal from 'components/layouts/Common/Payments/PaymentModal';
import Currency, { CurrencyType } from '../../ui/currency/Currency';
import { MESSAGES } from '../../../sources/messages.js';
import paymentGateway from 'sources/api/PaymentGateway';
import workerInstance from 'sources/worker/WorkerInstance';
import ClientContractService from 'sources/contracts/ClientContractService';
import CashContractServiceL1 from 'sources/contracts/CashContractServiceL1';
import BondContractServiceL1 from 'sources/contracts/BondContractServiceL1';

const DebitType = {
  ETHER_BALANCE: 'Ether balance',
  VERIFIED_CASH: 'Verified cash',
  FIAT_MONEY: 'Fiat money',
};

const MoneyScreenMode = {
  ADD_MONEY: 'AddMoney',
  BORROW_MONEY: 'BorrowMoney',
};

class AddOrBorrowMoney extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      modalVisibility: false,
      amount: '',
      debitType: '',
      loading: false,
      currencyToIssue: '',
      currencyToDebit: '',
      paymentModalVisibility: false,
      paymentRequest: null,
    };
  }

  makeFiatMoneyPayment = (amount, currencyToIssue, currencyToDebit) => {
    return this.context.getPassword().then((password) => {
      // This is only for Add Money, you can not borrow money with fiat

      const cashContract = new CashContractService(password);

      this.setState({ loading: true });

      cashContract
        .issueTokensWithFiat(amount, currencyToDebit, currencyToIssue)
        .then((response) => {
          this.setState({
            paymentRequest: response,
            paymentModalVisibility: true,
          });
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    });
  };

  makeEtherPayment = (amount, currencyToIssue) => {
    return this.context.getPassword().then((password) => {
      const mode = this.props.mode;

      if (mode === MoneyScreenMode.ADD_MONEY) {
        const contract = new CashContractServiceL1(password);
        return contract.issueTokensWithEther(currencyToIssue, amount);
      } else {
        const contract = new BondContractServiceL1(password);
        return contract.issueTokensWithEther(currencyToIssue, amount);
      }
    });
  };

  makeVerifiedPayment = (amount, currencyToIssue, currencyToDebit) => {
    return this.context.getPassword().then((password) => {
      const mode = this.props.mode;

      if (mode === MoneyScreenMode.ADD_MONEY) {
        const contract = new CashContractService(password);
        return contract.exchangeTokens(currencyToDebit, currencyToIssue, amount);
      } else {
        const contract = new BondContractService(password);
        return contract.issueTokensWithCash(currencyToIssue, currencyToDebit, amount);
      }
    });
  };

  handleSubmit = () => {
    const { amount, debitType, currencyToIssue, currencyToDebit } = this.state;

    let payAction = null;

    if (debitType === DebitType.ETHER_BALANCE || debitType === DebitType.VERIFIED_CASH) {
      if (debitType === DebitType.ETHER_BALANCE) {
        payAction = this.makeEtherPayment(amount, currencyToIssue);
      } else if (debitType === DebitType.VERIFIED_CASH) {
        payAction = this.makeVerifiedPayment(amount, currencyToIssue, currencyToDebit);
      }

      this.setState({ loading: true });

      payAction
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((e) => {
          notifier.error('Error', e.toString());
        })
        .finally(() => {
          this.setState({ loading: false });
          this.handleModalHide();
        });
    } else {
      this.makeFiatMoneyPayment(amount, currencyToIssue, currencyToDebit);
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleCurrencyToIssueChange = (currency) => {
    this.setState({ currencyToIssue: currency });
  };

  handleCurrencyToDebitChange = (currency) => {
    this.setState({ currencyToDebit: currency });
  };

  handleModalOpen = () => {
    this.setState({ modalVisibility: true });
  };

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  };

  resetInputs = () => {
    this.setState({
      amount: '',
      debitType: '',
      currencyToIssue: '',
      currencyToDebit: '',
    });
  };

  handlePaymentModalHide = () => {
    this.setState({ paymentModalVisibility: false });
  };

  handlePaymentStatusChange(status) {
    if (status) {
      this.context.getPassword().then((password) => {
        const clientContractService = new ClientContractService(password);

        const paymentId = this.state.paymentRequest.paymentRef;

        const cashContractService = new CashContractService(password);

        const investorAddress = cashContractService.getWallet().address;

        clientContractService.getManager().then((issuerAddress) => {
          paymentGateway.getCashIssueRequest(investorAddress, paymentId).then((cashIssue) => {
            workerInstance.addCashIssueRequestEntry(issuerAddress, cashIssue);
          });
        });
      });
    }
  }

  render() {
    const { loading, amount, debitType, paymentModalVisibility, paymentRequest } = this.state;
    const { mode, modalVisibility } = this.props;

    let availableCurrenciesType = null;
    let cardTitle = null;

    if (mode === MoneyScreenMode.ADD_MONEY) {
      availableCurrenciesType = CurrencyType.CASH;
      cardTitle = 'Add money to account';
    } else if (mode === MoneyScreenMode.BORROW_MONEY) {
      availableCurrenciesType = CurrencyType.BOND;
      cardTitle = 'Borrow money';
    } else {
      // This must not happen
      // eslint-disable-next-line no-console
      console.error('Unknown AddOrBorrow Component View Mode');
    }

    const debitOptions = ['Debit', DebitType.ETHER_BALANCE, DebitType.VERIFIED_CASH];

    if (mode === MoneyScreenMode.ADD_MONEY) {
      debitOptions.push(DebitType.FIAT_MONEY);
    }

    return (
      <ModalCard
        title={cardTitle}
        visibility={modalVisibility}
        modalSize="xs"
        onSubmit={this.handleSubmit}
        onHide={this.handleModalHide}>
        {loading ? <Loader /> : ''}
        <Form>
          <PaymentModal
            show={paymentModalVisibility}
            paymentRequest={paymentRequest}
            onPaymentStatusChange={this.handlePaymentStatusChange}
            onHide={this.handlePaymentModalHide}
          />

          <Row className="align-items-center">
            <Col xs={12}>
              <FormSelector
                optionsValue={debitOptions}
                name={'debitType'}
                onChange={this.handleChange}
                selectorClass="textForm custom-select dropdown"
              />
            </Col>

            {debitType === DebitType.VERIFIED_CASH ? (
              <Col xs="12">
                <Currency
                  placeholderText="Currency to debit in"
                  type={CurrencyType.CASH}
                  onChange={this.handleCurrencyToDebitChange}
                />
              </Col>
            ) : (
              ''
            )}

            {debitType === DebitType.FIAT_MONEY ? (
              <Col xs="12">
                <Currency
                  placeholderText="Currency to debit in"
                  type={CurrencyType.FIAT}
                  onChange={this.handleCurrencyToDebitChange}
                />
              </Col>
            ) : (
              ''
            )}

            <Col xs={12}>
              <TextInput
                placeholder="Amount to debit in"
                fieldType="text"
                value={amount || ''}
                name={'amount'}
                onChange={this.handleChange}
              />
            </Col>

            <Col xs={12}>
              <Currency
                placeholderText="Currency to issue in"
                type={availableCurrenciesType}
                onChange={this.handleCurrencyToIssueChange}
                isL1={debitType === DebitType.ETHER_BALANCE}
              />
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export { MoneyScreenMode };
export default AddOrBorrowMoney;
