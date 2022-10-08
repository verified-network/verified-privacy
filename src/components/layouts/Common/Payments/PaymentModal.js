import React from 'react';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import StripePaymentModal from 'components/layouts/Common/Payments/StripePaymentModal';
import RazorPaymentModal from 'components/layouts/Common/Payments/RazorPaymentModal';
import PaymentGateway from 'sources/api/PaymentGateway';

class PaymentModal extends React.Component {
  static contextType = PasswordStore;

  handlePaymentStatusChange = (status) => {
    if (typeof this.props.onPaymentStatusChange === 'function') {
      this.props.onPaymentStatusChange(status);
    }
  }

  render() {
    const {paymentRequest, show, onHide} = this.props;

    if (paymentRequest) {
      const paymentGateway = paymentRequest.gateway_name;

      switch (paymentGateway) {
        case PaymentGateway.Gateways.STRIPE: {
          return <StripePaymentModal show={show} paymentRequest={paymentRequest} onHide={onHide}/>;
        }

        case PaymentGateway.Gateways.RAZOR: {
          return <RazorPaymentModal show={show} paymentRequest={paymentRequest} onHide={onHide}
            onPaymentStatusChange={this.handlePaymentStatusChange}
          />;
        }
      }
    }

    return null;
  }
}

export default PaymentModal;
