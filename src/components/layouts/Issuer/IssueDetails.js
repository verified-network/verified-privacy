import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import ProductContractService from 'sources/contracts/ProductContractService';

class IssueDetails extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      details: {},
    };
  }

  componentDidMount() {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {issueAddress} = this.props.issueAddress;

      if (!issueAddress) {
        return;
      }

      productContract.getBondDetails(issueAddress)
        .then((details) => {
          this.setState({details});
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

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  resetInputs = () => {
    this.setState({
      loading: false,
    });
  }

  render() {
    const {loading, details} = this.state;
    const {modalVisibility, issueAddress} = this.props;

    return (
      <VerticallyModal
        key={`issue-${issueAddress}`}
        showModal={modalVisibility}
        modalOnHide={this.handleModalHide}
        modalSize={'md'}
        modalHeading={<h3>Issue details</h3>}
        modalButton01={
          <UiButton
            buttonVariant="primary"
            buttonClass="SignUpButton"
            buttonText="Close"
            type="submit"
            onClick={this.handleModalHide}
          />
        }
      >
        {loading ? <Loader/> : ''}
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Coupon frequency in months: {details['couponFrequencyInMonths']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            First coupon date: {details['firstCouponDate']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Next coupon date: {details['nextCouponDate']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Next installment: {details['nextInstallment']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Maturity date: {details['maturityDate']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Date of issue: {details['dateOfIssue']}
          </Col>
        </Row>
      </VerticallyModal>
    );
  }
}

export default IssueDetails;
