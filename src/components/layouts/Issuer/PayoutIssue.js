import React, {Component} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import ProductContractService from 'sources/contracts/ProductContractService';
import Currency, {CurrencyType} from 'components/ui/currency/Currency';

class PayoutIssue extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      currency: '',
      amount: '',
    };
  }

  handleSubmit = () => {
    const {currency, amount} = this.state;
    const investorAddress = this.props.investorAddress;
    const issueAddress = this.props.issueAddress;

    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.payout(issueAddress, investorAddress, currency.name, amount)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleCurrencyChange = (currency) => {
    this.setState({currency});
  };

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  resetInputs = () => {
    this.setState({
      loading: false,
      currency: '',
      amount: '',
      beneficiary: '',
    });
  }

  render() {
    const {loading, amount} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Payout issue' visibility={modalVisibility} modalSize='md'
        onSubmit={this.handleSubmit} onHide={this.handleModalHide}>
        {loading ? <Loader/> : ''}

        <Form>
          <Row className="align-items-center">
            <Col xs={12}>
              <Currency placeholderText='Currency' type={CurrencyType.CASH}
                onChange={this.handleCurrencyChange}/>
            </Col>
            {}
            <Col xs={12} className="marginTop10">
              <TextInput
                placeholder="Amount"
                fieldType="text"
                value={amount}
                name='amount'
                onChange={this.handleChange}
              />
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export default PayoutIssue;
