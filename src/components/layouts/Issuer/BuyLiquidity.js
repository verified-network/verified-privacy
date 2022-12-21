import React, {Component} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from '../../ui/textinput/TextInput';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import LiquidityContractService from 'sources/contracts/LiquidityContractService';

const availableCurrencies = {
  ETHER: 'Ether',
  USDC: 'USDC',
  DAI: 'DAI',
};

class BuyLiquidity extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      modalVisibility: false,
      amount: '',
      loading: false,
      currencyToDebit: '',
    };
  }

  handleSubmit = () => {
    const {amount, currencyToDebit} = this.state;

    if (currencyToDebit === 'Ether') {
      this.context.getPassword().then((password) => {
        const liquidityContract = new LiquidityContractService(password);

        this.setState({loading: true});

        liquidityContract.buyLiquidityWithEther(amount)
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
    } else {
      this.context.getPassword().then((password) => {
        const liquidityContract = new LiquidityContractService(password);

        this.setState({loading: true});

        liquidityContract.buyLiquidity(currencyToDebit, amount)
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
  };

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleModalHide = () => {
    this.resetInputs();
    this.props.onHide();
  };

  resetInputs = () => {
    this.setState({
      amount: '',
      currencyToDebit: '',
    });
  };

  render() {
    const {loading, amount} = this.state;
    const {show} = this.props;

    const cardTitle = 'Buy liquidity';

    return (
      <ModalCard title={cardTitle} visibility={show} modalSize='xs'
        onSubmit={this.handleSubmit} onHide={this.handleModalHide}>
        {loading ? <Loader/> : ''}
        <Form>
          <Row className="align-items-center">
            <Col xs='12'>
              <Form.Control
                as="select"
                placeholder="Currency to debit in"
                className="textForm custom-select dropdown"
                name='currencyToDebit'
                onChange={this.handleChange}
              >
                <option className="marginTop20" value="" disabled='disabled' selected='selected'>
                  Currency to debit in
                </option>
                <option value="Ether">{availableCurrencies.ETHER}</option>
                <option value="DAI">{availableCurrencies.DAI}</option>
                <option value="USDC">{availableCurrencies.USDC}</option>
              </Form.Control>
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
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export default BuyLiquidity;
