import React, {Component} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import CashContractService from '../../../sources/contracts/CashContractService';
import Loader from 'components/ui/Loader';
import Currency, {CurrencyType} from '../../ui/currency/Currency';
import notifier from 'components/ui/notifier';
import {MESSAGES} from '../../../sources/messages.js';

class MakePayment extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      beneficiaryAccountAddress: '',
      amount: '',
      currency: '',
    };
  }

  handleSubmit = () => {
    const {beneficiaryAccountAddress, currency, amount} = this.state;

    return this.context.getPassword().then((password) => {
      const contract = new CashContractService(password);

      this.setState({loading: true});

      contract.transferToAddress(currency, beneficiaryAccountAddress, amount)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
            this.handleModalHide();
          })
          .catch((e) => {
            notifier.error('Error', e.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  resetInputs = () => {
    this.setState({
      amount: '',
      currency: '',
      beneficiaryAccountAddress: '',
      loading: false,
    });
  }

  handleCurrencyChange = (currency) => {
    this.setState({currency});
  }

  render() {
    const {loading, amount, beneficiaryAccountAddress} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Make payment' visibility={modalVisibility}
        onSubmit={this.handleSubmit} onHide={this.handleModalHide} modalSize='xs'>
        {loading ? <Loader/> : ''}

        <Form>
          <Row className="align-items-center">
            <Col lg={12} md={12} xs={12} sm={12}>
              <TextInput
                placeholder="Beneficiary account address"
                fieldType="text"
                value={beneficiaryAccountAddress}
                name={'beneficiaryAccountAddress'}
                onChange={this.handleChange}
              />
            </Col>
            <Col lg={6} md={6} xs={12} sm={12}>
              <TextInput
                placeholder="Amount to pay"
                fieldType="text"
                value={amount}
                name={'amount'}
                onChange={this.handleChange}
              />
            </Col>
            <Col lg={6} xs={12} md={6} sm={12} className="marginTop10">
              <Currency placeholderText='Digital cash to pay with' type={CurrencyType.CASH}
                onChange={this.handleCurrencyChange}/>
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}
export default MakePayment;
