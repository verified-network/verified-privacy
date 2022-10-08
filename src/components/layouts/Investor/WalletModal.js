import React, {Component} from 'react';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import {Col, Form, Row} from 'react-bootstrap';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import TextInput from 'components/ui/textinput/TextInput';
import LocalSessionManager from '../../../sources/utils/LocalSessionManager';
import FormSelector from '../../ui/formSelector/formSelector';
import Ethers from '../../../sources/utils/Ethers';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';

const WalletModalMode = {
  CREATE_WALLET: 'create_wallet',
  SHOW_WALLET: 'show_wallet',
};

const Step = {
  SELECT_MODE: 'select_mode',
  IMPORT_WALLET: 'import_wallet',
  GENERATE_WALLET: 'generate_wallet',
};

const CREATE_WALLET_OPTION = 'Create wallet';
const IMPORT_WALLET_OPTION = 'Import wallet';

class WalletModal extends Component {
    static contextType = PasswordStore;

    constructor(props) {
      super(props);

      this.state = {
        mnemonicCode: '',
        mnemonicCodeError: '',
        walletAddress: '',
        step: Step.SELECT_MODE,
        selectOrImport: '',
        loading: false,
      };

      this.handleWalletSubmit = this.handleWalletSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.resetFields = this.resetFields.bind(this);
    }

    handleWalletSubmit() {
      if (this.props.mode === WalletModalMode.SHOW_WALLET) {
        this.handleHide();
      } else {
        this.handleCreateWalletSubmit();
      }
    }

    handleCreateWalletSubmit = () => {
      const {mnemonicCode, step, selectOrImport} = this.state;

      if (step === Step.SELECT_MODE) {
        this.resetFields();

        if (selectOrImport === IMPORT_WALLET_OPTION) {
          this.setState({step: Step.IMPORT_WALLET});
        } else if (selectOrImport === CREATE_WALLET_OPTION) {
          this.setState({step: Step.GENERATE_WALLET});
        } else {
          notifier.error('Error', 'Select an option');
        }
      } else if (step === Step.IMPORT_WALLET || step === Step.GENERATE_WALLET) {
        this.context.getPassword(true).then((password) => {
          if (Ethers.isValidMnemonic(mnemonicCode)) {
            LocalSessionManager.setWallet(mnemonicCode, password);
            this.props.onWalletLoaded();

            this.handleHide();
          } else {
            notifier.error('Error', 'Invalid mnemonic.');
          }
        });
      }
    }

  handleHide = () => {
    this.resetFields();
    this.props.onHide();
  };

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmitKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handleWalletSubmit();
    }
  };

  handleSelectOrImportChange = (event) => {
    this.setState({selectOrImport: event.target.value});
  }

  resetFields = () => {
    this.setState({
      mnemonicCode: '',
      walletAddress: '',
      mnemonicCodeError: '',
      step: Step.SELECT_MODE,
      selectOrImport: '',
    });
  };

  generateMnemonics = () => {
    const mnemonicCode = Ethers.generateMnemonics();
    this.setState({mnemonicCode});
  }

  loadMnemonics = () => {
    this.context.destroyPassword();
    this.context.getPassword().then((password) => {
      const mnemonicCode = LocalSessionManager.getWallet(password);
      const walletAddress = LocalSessionManager.getWalletAddress(password);
      this.setState({mnemonicCode, walletAddress});
    });
  }

  renderShowWallet = () => {
    const {mnemonicCode, walletAddress} = this.state;

    return (
      <Col lg={12} md={12} xs={12} sm={12}>
        {mnemonicCode ?
        <>
          <p>{`Mnemonic code is "${mnemonicCode}"`}</p>
          <hr/>
          <p>{`Wallet address is "${walletAddress}"`}</p>
        </> :
                  <UiButton
                    buttonVariant="primary"
                    buttonClass="SignUpButton"
                    buttonText='Show'
                    onClick={this.loadMnemonics}
                  />

        }
      </Col>
    );
  }

  renderCreateWallet = () => {
    const {step, selectOrImport, mnemonicCode, mnemonicCodeError} = this.state;

    return (
      <>
        {
            step === Step.SELECT_MODE ?
            <Col lg={12} md={12} xs={12} sm={12}>
              <FormSelector
                optionsValue={[
                  'Select option',
                  CREATE_WALLET_OPTION,
                  IMPORT_WALLET_OPTION,
                ]}
                defaultValue={selectOrImport}
                onChange={this.handleSelectOrImportChange}
                selectorClass="textForm custom-select dropdown"
              />
            </Col> : ''
        }

        {
            step === Step.GENERATE_WALLET ?
            <Col lg={12} md={12} xs={12} sm={12}>
              <UiButton
                buttonVariant="primary"
                buttonClass="SignUpButton"
                buttonText={'Click here to get Mnemonic Code'}
                onClick={this.generateMnemonics}
              />
              {mnemonicCode ?
                <div>
                  <p>{`${mnemonicCode}`}</p>
                </div> :
                ''}
            </Col> : ''
        }

        {
            step === Step.IMPORT_WALLET ?
            <Col lg={12} md={12} xs={12} sm={12}>
              <TextInput
                placeholder="Enter mnemonic code"
                fieldType="text"
                value={mnemonicCode}
                name={'mnemonicCode'}
                onChange={this.handleChange}
              />
              <p className='errorMsg'>{mnemonicCodeError}</p>
            </Col> : ''
        }
      </>
    );
  }

  render() {
    const {show, mode} = this.props;
    const {loading} = this.state;

    return (
      <VerticallyModal
        key="walletModal"
        closeButton={false}
        showModal={show}
        modalSize={'md'}
        modalHeading={<h3>{'Wallet'}</h3>}
        modalButton01={
          <UiButton
            buttonVariant="primary"
            buttonClass="SignUpButton"
            buttonText={mode === WalletModalMode.SHOW_WALLET ? 'Close' : 'Next'}
            onClick={() => this.handleWalletSubmit()}
          />
        }
      >
        {loading ? <Loader/> : ''}
        <Form>
          <Row className="align-items-center">
            {mode === WalletModalMode.SHOW_WALLET ? this.renderShowWallet() : this.renderCreateWallet()}
          </Row>
        </Form>
      </VerticallyModal>
    );
  }
}

export {WalletModalMode};
export default WalletModal;
