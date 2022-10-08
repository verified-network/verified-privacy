import React from 'react';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import paymentGateway from 'sources/api/PaymentGateway';
import RazorKycModal from 'components/layouts/Common/Payments/RazorKycModal';
import StripeKycModal from 'components/layouts/Common/Payments/StripeKycModal';

class GatewayKycModal extends React.Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);
  }

  handleKycStatusChange = (status) => {
    if (typeof this.props.onKycStatusChange === 'function') {
      this.props.onKycStatusChange(status);
    }
  }

  render() {
    const {show, onHide, paymentGatewayName} = this.props;

    switch (paymentGatewayName) {
      case paymentGateway.Gateways.STRIPE: {
        return <StripeKycModal show={show} onHide={onHide} onKycStatusChange={this.handleKycStatusChange}/>;
      }

      case paymentGateway.Gateways.RAZOR: {
        return <RazorKycModal show={show} onHide={onHide} onKycStatusChange={this.handleKycStatusChange}/>;
      }

      default:
        return null;
    }
  }
}

export default GatewayKycModal;
