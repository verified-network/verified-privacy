import React from 'react';
import Config from 'sources/Config';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import KycContractService from 'sources/contracts/KycContractService';

class RazorPaymentModal extends React.Component {
  static contextType = PasswordStore;

  componentDidMount() {
    this.initPayment();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.show && prevProps && !prevProps.show) {
      this.initPayment();
    }
  }

  handlePaymentStatusChange = (status) => {
    if (typeof this.props.onPaymentStatusChange === 'function') {
      this.props.onPaymentStatusChange(status);
    }
  }

  initPayment() {
    if (!this.props.show) {
      return;
    }

    return this.context.getPassword().then((password) => {
      const kycContract = new KycContractService(password);

      this
          .loadScript(Config.razor.checkoutScript)
          .then(() => {
            return kycContract.getFullName();
          })
          .then((fullName) => {
            return kycContract.getEmail().then((email) => ({fullName, email}));
          })
          .then(({fullName, email}) => {
            const {orderId, apiKey, amount, currency} = this.props.paymentRequest;

            const options = {
              'key': apiKey,
              'name': 'Verified Network',
              'order_id': orderId,
              'amount': amount,
              'currency': currency,
              'handler': (response) => {
                // On success
                this.handlePaymentStatusChange(true);
                notifier.success('Success', 'Payment success.');
              },
              'prefill': {
                'name': fullName,
                'email': email,
              },
              'modal': {
                escape: false,
                ondismiss: () => {
                  this.props.onHide();
                },
              },
            };

            const paymentModal = new window.Razorpay(options);

            paymentModal.on('payment.failed', () => {
              this.handlePaymentStatusChange(false);
              notifier.error('Error', 'Error on payment.');
            });

            paymentModal.open();
          })
          .catch(() => {
            notifier.error('Error', 'Can not initialize razorpay payment process.');
          });
    });
  }

  loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  render() {
    return null;
  }
}

export default RazorPaymentModal;
