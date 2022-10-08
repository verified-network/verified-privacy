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

class Withdraw extends Component {
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

    return this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const contract = new CashContractService(password);

      contract.withdraw(currency, amount)
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
    });
  }

  handleCurrencyChange = (currency) => {
    this.setState({currency});
  }

  render() {
    const {loading, amount} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Withdraw' caption={'Digital cash to bank'} visibility={modalVisibility} modalSize='xs'
        onSubmit={this.handleSubmit} onHide={this.handleModalHide}>
        {loading ? <Loader/> : ''}

        <Form>
          <Row className="align-items-center">
            <Col xs={12}className="marginTop10">
              <Currency placeholderText='Currency to pay' type={CurrencyType.CASH}
                onChange={this.handleCurrencyChange}/>
            </Col>
            <Col xs={12}>
              <TextInput
                placeholder="Amount to pay"
                fieldType="text"
                value={amount}
                name={'amount'}
                onChange={this.handleChange}
              />
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export default Withdraw;
