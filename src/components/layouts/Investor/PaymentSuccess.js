import queryString from 'query-string';
import React, {Component} from 'react';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import {Col, Row, Container} from 'react-bootstrap';
import paymentGateway from 'sources/api/PaymentGateway';
import CashContractService from 'sources/contracts/CashContractService';
import workerInstance from 'sources/worker/WorkerInstance';
import ClientContractService from 'sources/contracts/ClientContractService';

class PaymentSuccess extends Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      paymentData: null,
    };
  }

  componentDidMount() {
    const getData = queryString.parse(this.props.location.search);
    const paymentId = getData.payment_intent;

    this.context.getPassword().then((password) => {
      const clientContractService = new ClientContractService(password);
      const cashContractService = new CashContractService(password);

      const investorAddress = cashContractService.getWallet().address;

      clientContractService.getManager().then((issuerAddress) => {
        paymentGateway.getWithdrawRequest(investorAddress, paymentId).then((cashIssue) => {
          this.setState({paymentData: cashIssue});

          workerInstance.addCashIssueRequestEntry(issuerAddress, cashIssue);
        });
      });
    });
  }

  render() {
    const {paymentData} = this.state;

    return (
      <div>
        <section id='payment_success'>
          <Container>
            <Row>
              <Col lg={{span: 6, offset: 3}} xs={12} sm={12}>
                <h2 className="verifiedAccount">Your payment is successfully completed</h2>
                <p className="marginTop20 subHeading">
                </p>
              </Col>
              {paymentData ?
                          <Col>
                            <Row>Client address: {paymentData.userAddress}</Row>
                            <Row>Currency: {paymentData.currency}</Row>
                            <Row>Amount: {paymentData.amount}</Row>
                            <Row>Date: {(new Date(paymentData.date)).toString()}</Row>
                            <Row>Payment ref: {paymentData.paymentRef}</Row>
                            <Row>Status: {paymentData.status}</Row>
                          </Col> :
                          ''
              }
            </Row>
          </Container>
        </section>
      </div>
    );
  }
}

export default PaymentSuccess;
