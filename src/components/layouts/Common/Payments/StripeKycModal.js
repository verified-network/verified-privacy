import React from 'react';
import Loader from '../../../ui/Loader';
import ClientContractService from 'sources/contracts/ClientContractService';
import paymentGateway from 'sources/api/PaymentGateway';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';

class StripeKycModal extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.redirectToKyc();
  }

  handleKycStatusChange = (status) => {
    if (typeof this.props.onKycStatusChange === 'function') {
      this.props.onKycStatusChange(status);
    }
  }

  redirectToKyc() {
    this.context.getPassword()
        .then((password) => {
          this.setState({loading: true});

          const clientContractService = new ClientContractService(password);
          const userAddress = clientContractService.getWallet().address;

          return paymentGateway.createAccount(userAddress)
              .then(() => {
                return paymentGateway.createAccountLink(userAddress)
                    .then((link) => {
                      if (link) {
                        window.location.replace(link);
                      }
                    });
              });
        })
        .then(() => {
          this.handleKycStatusChange(true);
        })
        .catch((error) => {
          this.handleKycStatusChange(false);
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
  }

  render() {
    const {loading} = this.state;

    return (
      <>
        {loading ?
            <Loader/> : ''
        }
      </>
    );
  }
}

export default StripeKycModal;
