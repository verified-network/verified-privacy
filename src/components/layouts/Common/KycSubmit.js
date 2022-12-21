import VerticallyModal from 'components/ui/modal/VerticallyModal';
import {Button} from 'react-bootstrap';
import React from 'react';
import {withTranslation} from 'react-i18next';
import paymentGateway from 'sources/api/PaymentGateway';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ClientContractService from 'sources/contracts/ClientContractService';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import VerifyButton, {start} from '@passbase/button/react';
import Config from 'sources/Config';
import passbaseApi from 'sources/api/Passbase';
import Country from 'components/ui/country/Country';

class KycSubmit extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      kycFeePayed: false,
      paymentRequest: null,
      paymentModalVisibility: false,
      passbaseMetadata: '',
      country: '',
    };
  }

  componentDidMount() {
    this.checkKycFee();
  }

  checkKycFee() {
    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const clientContract = new ClientContractService(password);

      paymentGateway
        .getKycPaymentStatus(clientContract.getWallet().address)
        .then((status) => {
          this.setState({kycFeePayed: status});
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handlePayKycClick = () => {
    if (!this.validate()) {
      return;
    }

    const {country} = this.state;

    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const clientContract = new ClientContractService(password);
      const userAddress = clientContract.getWallet().address;

      paymentGateway
        .createKycPayment(userAddress, country)
        .then((paymentRequest) => {
          if (paymentRequest.status !== paymentGateway.SUCCESS_PAYMENT) {
            this.setState({
              paymentModalVisibility: true,
              paymentRequest,
            });
          }
        })
        .catch((e) => {
          notifier.error('Error', e.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleKycSubmitClick = () => {
    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const clientContract = new ClientContractService(password);
      const userAddress = clientContract.getWallet().address;

      passbaseApi
        .getEncryptedMetadata(userAddress)
        .then((metadata) => {
          this.setState({
            passbaseMetadata: metadata,
            loading: true,
          });

          // In passbase docs they do it in this way (with the setTimeout)
          setTimeout(() => {
            start();

            this.setState({
              loading: false,
            });
          }, 5000);
        })
        .catch((e) => {
          notifier.error('Error', e.toString());
        })
        .finally(() => {
          setTimeout(() => {
            this.setState({loading: false});
          }, 7000);
        });
    });
  }

  handlePaymentModalHide = () => {
    this.setState({paymentModalVisibility: false});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handlePaymentStatusChange = () => {
    this.checkKycFee();
  }

  handleCountryChange = (country) => {
    this.setState({country: country.code});
  }

  validate() {
    const {country} = this.state;

    if (!country) {
      notifier.error('Error', 'Please, select a country.');
      return false;
    }

    return true;
  }

  render() {
    const {visibility, onLogout, t} = this.props;
    const {loading, kycFeePayed, paymentModalVisibility, paymentRequest, passbaseMetadata} = this.state;

    let kycFeeMessage = '';
    let kycFeeButton = '';

    if (kycFeePayed) {
      kycFeeMessage = (
        <p className="mt-2 text-justify">
          {t('Before you can start using verified, you need to complete the KYC process.')}
        </p>
      );

      kycFeeButton = <Button onClick={this.handleKycSubmitClick} className="p-2 m-2">{t('Start KYC process')}</Button>;
    } else {
      kycFeeMessage = (
        <form>
          <p className="mt-2 text-justify">
            {t('YOU_NEED_TO_PAY_OUR_KYC_FEE')}
          </p>

          <Country placeholderText={t('SELECT_YOUR_COUNTRY')} onChange={this.handleCountryChange}/>
        </form>
      );

      kycFeeButton = (
        <Button type='submit' onClick={this.handlePayKycClick} className="p-2 m-2">
          {t('Pay KYC fee')}
        </Button>
      );
    }

    return (
      <>
        <VerticallyModal
          key="kycNotSubmitted" closeButton={false} showModal={visibility} modalSize={'md'}
          modalHeading={<h3>{t('KYC Process not completed')}</h3>}
          modalButton01={<Button onClick={onLogout} className="p-2 m-2">{t('Cancel and logout')}</Button>}
          modalButton02={kycFeeButton}
        >
          {loading ? <Loader/> : ''}

          {kycFeeMessage}
        </VerticallyModal>

        <VerifyButton apiKey={Config.passbaseApiKey} onSubmitted={this.handlePassbaseSubmitted} hidden='true'
          metaData={passbaseMetadata} key={passbaseMetadata}
          onFinish={() => {
            window.location.reload();
          }}
        />
      </>
    );
  }
}

export default withTranslation()(KycSubmit);
