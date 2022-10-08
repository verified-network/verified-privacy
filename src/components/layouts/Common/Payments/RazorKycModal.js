import React from 'react';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import Loader from '../../../ui/Loader';
import notifier from 'components/ui/notifier';
import TextInput from 'components/ui/textinput/TextInput';
import paymentGateway from 'sources/api/PaymentGateway';
import ClientContractService from 'sources/contracts/ClientContractService';
import PasswordStore from 'components/layouts/Common/PasswordStore';

class RazorKycModal extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      businessName: '',
      businessType: '',
      ifscCode: '',
      beneficiaryName: '',
      accountNumber: '',
    };
  }

  handleKycStatusChange = (status) => {
    if (typeof this.props.onKycStatusChange === 'function') {
      this.props.onKycStatusChange(status);
    }
  }

  handleSubmit = () => {
    const {
      businessName,
      businessType,
      ifscCode,
      beneficiaryName,
      accountNumber,
    } = this.state;

    this.context.getPassword()
        .then((password) => {
          this.setState({loading: true});
          const clientContractService = new ClientContractService(password);
          const userAddress = clientContractService.getWallet().address;

          return paymentGateway
              .createAccount(userAddress, {
                businessName,
                businessType,
                ifscCode,
                beneficiaryName,
                accountNumber,
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
  };

  handleHide = () => {
    this.props.onHide();
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    const {show} = this.props;
    const {loading, businessName, businessType, ifscCode, beneficiaryName, accountNumber} = this.state;

    return (
      <VerticallyModal
        key={'paymentModal'}
        showModal={show}
        modalOnHide={this.handleHide}
        modalSize={'md'}
        modalHeading={<h3>Account details</h3>}
        modalButton01={
          <UiButton buttonVariant="primary" buttonClass="SignUpButton"
            buttonText='Submit'
            type="submit"
            onClick={this.handleSubmit}
          />
        }
        closeButton={true}
      >
        {loading ? <Loader/> : ''}
        <form>
          <TextInput
            placeholder="Business name"
            fieldType="text"
            value={businessName}
            name='businessName'
            onChange={this.handleChange}
          />

          <TextInput
            placeholder="Business type"
            fieldType="text"
            value={businessType}
            name='businessType'
            onChange={this.handleChange}
          />

          <TextInput
            placeholder="IFSC code"
            fieldType="text"
            value={ifscCode}
            name='ifscCode'
            onChange={this.handleChange}
          />

          <TextInput
            placeholder="Beneficiary name"
            fieldType="text"
            value={beneficiaryName}
            name='beneficiaryName'
            onChange={this.handleChange}
          />

          <TextInput
            placeholder="Account number"
            fieldType="text"
            value={accountNumber}
            name='accountNumber'
            onChange={this.handleChange}
          />
        </form>
      </VerticallyModal>
    );
  }
}

export default RazorKycModal;
