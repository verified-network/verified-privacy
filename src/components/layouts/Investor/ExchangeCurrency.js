import React, {Component} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from '../../ui/textinput/TextInput';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import CashContractService from '../../../sources/contracts/CashContractService';
import Currency, {CurrencyType} from '../../ui/currency/Currency';
import {MESSAGES} from '../../../sources/messages.js';

class ExchangeCurrency extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      modalVisibility: false,
      currencyToIssue: '',
      currencyToDebit: '',
      amount: '',
    };
  }

  handleSubmit = () => {
    const {amount, currencyToIssue, currencyToDebit} = this.state;

    this.setState({loading: true});

    return this.context.getPassword().then((password) => {
      const contract = new CashContractService(password);

      contract.exchangeTokens(currencyToDebit, currencyToIssue, amount)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
          })
          .catch((e) => {
            notifier.error('Error', e.toString());
          })
          .finally(() => {
            this.setState({loading: false});
            this.handleModalHide();
          });
    });
  };

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleCurrencyToIssueChange = (currency) => {
    this.setState({currencyToIssue: currency});
  }

  handleCurrencyToDebitChange = (currency) => {
    this.setState({currencyToDebit: currency});
  }

  handleModalOpen = () => {
    this.setState({modalVisibility: true});
  }

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  resetInputs = () => {
    this.setState({
      amount: '',
      currencyToIssue: '',
      currencyToDebit: '',
    });
  }

  render() {
    const {loading, amount} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Exchange currency' visibility={modalVisibility}
        onSubmit={this.handleSubmit} onHide={this.handleModalHide} modalSize='xs'>
        {loading ? <Loader/> : ''}
        <Form>
          <Row className="align-items-center">
            <Col xs={12}>
              <Currency placeholderText='Currency to debit in' type={CurrencyType.CASH}
                onChange={this.handleCurrencyToDebitChange}/>
            </Col>

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
              <Currency placeholderText='Currency to issue in' type={CurrencyType.CASH}
                onChange={this.handleCurrencyToIssueChange}/>
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export default ExchangeCurrency;
