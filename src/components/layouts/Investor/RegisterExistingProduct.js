import 'react-picky/dist/picky.css';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import React, {Component} from 'react';
import {MESSAGES} from '../../../sources/messages.js';
import {Form, Col, Row, Container} from 'react-bootstrap';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import UiButton from '../../ui/button/Button';
import Currency, {CurrencyType} from '../../ui/currency/Currency';
import PreTradeContractService from 'sources/contracts/PreTradeContractService';
import Loader from 'components/ui/Loader';

class CreateProducts extends Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      newDepositaryRequest: '',
      currency: '',
      instrumentType: '',
      isin: '',
      company: '',
      securityType: '',
      noOfCertificates: '',
      faceValue: '',
      lockInReason: '',
      lockInReleaseDate: '',
    };
  }

  handleSubmit = () => {
    const {
      currency, instrumentType, isin, company, securityType, noOfCertificates,
      faceValue, lockInReason, lockInReleaseDate,
    } = this.state;

    this.context.getPassword().then((password) => {
      const preTradeContractService = new PreTradeContractService(password);

      const securityData = {
        currencyCode: currency.cashCounterPart,
        securityType,
        isin,
        company,
        instrumentType,
        noOfCertificates,
        faceValue,
        lockInReason,
        lockInReleaseDate,
      };

      this.runTransaction(() => {
        return preTradeContractService.registerSecurity(securityData);
      });
    });
  }

  runTransaction = (transaction) => {
    this.setState({loading: true});

    transaction()
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
  }

  handleCurrencyChange = (currency) => {
    this.setState({currency});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    const {
      loading, isin, company, noOfCertificates, faceValue, lockInReason, lockInReleaseDate, securityType,
    } = this.state;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <Container>
          <Row>
            <Col lg={{span: 6, offset: 3}} xs={12} sm={12}>
              <h1 className="text-center marginTop20">Register existing product</h1>
              <p className="marginTop20">Please fill in the details below</p>
            </Col>
          </Row>
          <Form>
            <Row>
              <Col className="marginTop20"lg={{span: 4, offset: 2}} md={12} xs={12} sm={12}>
                <Currency placeholderText='Currency' type={CurrencyType.FIAT} onChange={this.handleCurrencyChange}/>
              </Col>

              <Col className="marginTop20" lg={4} md={6} xs={12} sm={12}>
                <Form.Control
                  as="select"
                  placeholder="Instrument"
                  className="textForm custom-select dropdown"
                  name='instrumentType'
                  onChange={this.handleChange}
                >
                  <option className="marginTop20" value="" disabled='disabled' selected='selected'>
                    Instrument
                  </option>
                  <option value="Shares">Shares</option>
                  <option value="Bonds">Bonds</option>
                  <option value="Funds">Funds</option>
                  <option value="Asset backed products">Asset backed products</option>
                  <option value="Structured products">Structured products</option>
                </Form.Control>
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="ISIN"
                  fieldType="text"
                  value={isin}
                  name='isin'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <TextInput
                  placeholder="Company"
                  fieldType="text"
                  value={company}
                  name='company'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <Form.Row>
                  <Form.Control
                    as="select"
                    placeholder="Security"
                    className="textForm custom-select dropdown"
                    name='securityType'
                    onChange={this.handleChange}
                  >
                    <option className="marginTop20" value="" disabled='disabled' selected='selected'>
                      Security
                    </option>
                    <option value="Free">Free</option>
                    <option value="LockedIn">LockedIn</option>
                  </Form.Control>
                </Form.Row>
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <TextInput
                  placeholder="No of certificates"
                  fieldType="number"
                  value={noOfCertificates}
                  name='noOfCertificates'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Face value"
                  fieldType="number"
                  value={faceValue}
                  name='faceValue'
                  onChange={this.handleChange}
                />
              </Col>

              {securityType === 'LockedIn' ?
                <Col className="marginTop20" lg={4} md={6} xs={12} sm={12}>
                  <TextInput
                    placeholder="Locked in reason"
                    fieldType="text"
                    value={lockInReason}
                    name='lockInReason'
                    onChange={this.handleChange}
                  />
                </Col> : ''}

              {securityType === 'LockedIn' ? <Col className="marginTop20"
                lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Lock release date"
                  fieldType="date"
                  value={lockInReleaseDate}
                  name='lockInReleaseDate'
                  onChange={this.handleChange}
                />
              </Col> : ''}
            </Row>

            <Row>
              <Col
                lg={{span: 4, offset: 4}}
                md={{span: 6, offset: 3}}
                xs={{span: 10, offset: 1}}
                sm={{span: 10, offset: 1}}
                className="d-flex justify-content-center align-items-center marginTop20"
              >
                <UiButton
                  buttonText="Submit"
                  buttonClass="SignUpButton"
                  buttonVariant="primary"
                  onClick={this.handleSubmit}
                />
              </Col>
            </Row>
          </Form>
        </Container>
      </div>
    );
  }
}

export default CreateProducts;
