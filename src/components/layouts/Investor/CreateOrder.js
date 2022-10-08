require('normalize.css/normalize.css');
require('styles/App.css');

import TextInput from '../../ui/textinput/TextInput';
import React, {Component} from 'react';
import {Form, Col, Row, Container} from 'react-bootstrap';
import '../../ui/button/button.less';
import '../../../styles/typo.css';
import '../../ui/textinput/textinput.less';
import UiButton from '../../ui/button/Button';
import '../../ui/dropdown/dropdown.less';
import {MESSAGES} from 'sources/messages';
import {withRouter} from 'react-router-dom';
import Currency, {CurrencyType} from '../../ui/currency/Currency';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import OrderPoolContractService from 'sources/contracts/OrderPoolContractService';
import notifier from 'components/ui/notifier';
import Loader from 'components/ui/Loader';
import {getUrlParams} from '../../../utils/filters'

class CreateOrder extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    const search = props.location.search;
    const urlParams = search ? getUrlParams(search) : "";
    
    this.state = {
      loading: false,
      isin: urlParams ? urlParams.isin : '',
      order: '',
      quantity: '',
      orderType: '',
      price: urlParams ? urlParams.price : '',
      currency: '',
      company: urlParams ? urlParams.company : '',
      tokenAddress: '',
      editOrderRef: '',
      orderOptions: ['Buy', 'Sell'],
      orderTypeOptions: ['Market', 'Limit', 'StopLoss'],
      urlParams
    };
  }

  componentDidMount() {
    const editOrderRef = this.props.match.params.orderRef;

    if (editOrderRef) {
      this.setState({editOrderRef});
      this.loadOrderData(editOrderRef);
    }
  }

  loadOrderData = (orderRef) => {
    return this.context.getPassword().then((password) => {
      const orderPoolContract = new OrderPoolContractService(password);

      this.setState({loading: true});

      orderPoolContract.getOrder(orderRef)
          .then((order) => {
            this.setState({
              order: order.order,
              quantity: order.quantity,
              orderType: order.orderType,
              price: order.price,
              currency: order.currency,
              company: order.securityName,
              editOrderRef: order.ref,
              isin: order.security, // This is not really the isin, it is the securityAddress
            });
          })
          .catch((error) => {
            notifier.error('Error', error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleSubmit = () => {
    const isEditMode = !!this.state.editOrderRef;

    if (isEditMode) {
      this.editOrder();
    } else {
      this.createOrder();
    }
  }

  createOrder = () => {
    const {order, quantity, orderType, price, currency, company, isin} = this.state;

    return this.context.getPassword().then((password) => {
      const orderPoolContract = new OrderPoolContractService(password);

      this.setState({loading: true});

      orderPoolContract.createOrder(currency, company, isin, price, quantity, orderType, order)
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

  editOrder = () => {
    const {editOrderRef, quantity, price} = this.state;

    return this.context.getPassword().then((password) => {
      const orderPoolContract = new OrderPoolContractService(password);

      this.setState({loading: true});

      orderPoolContract.editOrder(editOrderRef, price, quantity)
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

  onLoadCurrencies = (currencies=[]) => {
    if(this.state.urlParams && this.state.urlParams.currency) {
      let selected = '';
      console.log("onLoadCurrencies currencies", currencies);
      currencies.map(c => {
        if(c.name === this.state.urlParams.currency) {
          selected = c;
        }
      });
      if(selected) {
        this.handleCurrencyChange(selected);
      };
    }
  }
  
  handleCurrencyChange = (currency) => {
    this.setState({currency});
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  }

  render() {
    const {
      loading, isin, order, quantity, orderType, price, orderOptions, orderTypeOptions,
      company, editOrderRef, currency,
    } = this.state;
    const isEditMode = !!editOrderRef;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <Container className='marginTop20'>
          <Row>
            <Col lg={{span: 6, offset: 3}} xs={12} sm={12}>
              <h2>{isEditMode ? 'Edit' : 'Create'} Order</h2>
              <p className="marginTop20">Please fill in the details below</p>
            </Col>
          </Row>
          <Form>
            <Row>
              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Security Identifier"
                  fieldType="text"
                  name={'isin'}
                  value={isin}
                  onChange={this.handleChange}
                  disabled={isEditMode}
                />
              </Col>

              <Col className="marginTop20" lg={4} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Company"
                  fieldType="text"
                  name={'company'}
                  value={company}
                  onChange={this.handleChange}
                  disabled={isEditMode}
                />
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <Form.Control
                  as="select"
                  placeholder="Order"
                  className="textForm custom-select dropdown"
                  defaultValue={order}
                  name={'order'}
                  onChange={this.handleChange}
                  disabled={isEditMode}
                >
                  <option className="marginTop20" value="">
                    Order
                  </option>
                  {orderOptions.map( (item) =>
                    <option selected={item === order} value={item}>
                      {item}
                    </option>
                  )}
                </Form.Control>
              </Col>
              <Col className="marginTop20" lg={4} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Quantity"
                  fieldType="number"
                  name={'quantity'}
                  value={quantity}
                  onChange={this.handleChange}
                />
              </Col>
              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <Form.Control
                  as="select"
                  placeholder="Order Type"
                  className="textForm custom-select dropdown"
                  defaultValue={orderType}
                  name={'orderType'}
                  onChange={this.handleChange}
                  disabled={isEditMode}
                >
                  <option className="marginTop20" value="">
                    Order Type
                  </option>
                  {orderTypeOptions.map((item) => <option selected={item === orderType} value={item}>{item}</option>)}
                </Form.Control>
              </Col>
              <Col className="marginTop20" lg={4} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Price"
                  fieldType="number"
                  value={price}
                  name={'price'}
                  onChange={this.handleChange}
                />
              </Col>
              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                {isEditMode ? (
                  <TextInput placeholder="Currency" fieldType="string" value={currency} disabled='true'/>
                ) : (
                  <Currency placeholderText='Currency' type={CurrencyType.CASH}
                    onLoadCurrencies={this.onLoadCurrencies}
                    selectedCurrency={this.state.currency}
                    onChange={this.handleCurrencyChange}/>
                )}
              </Col>
            </Row>
            <Row className="d-flex justify-content-center">
              <UiButton
                buttonText="Submit"
                buttonClass="SignUpButton"
                buttonVariant="primary"
                onClick={this.handleSubmit}
              />
            </Row>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(CreateOrder);
