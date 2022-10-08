import React, {Component} from 'react';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import {Col, Form, Row} from 'react-bootstrap';
import TextInput from 'components/ui/textinput/TextInput';
import {MESSAGES} from 'sources/messages';
import LocalSessionManager from 'sources/utils/LocalSessionManager';

const PasswordModalMode = {
  ENTER_PASSWORD: 'enter_password',
  CREATE_PASSWORD: 'create_password',
};

class PasswordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: '',
      confirmPassword: '',
      passwordError: '',
      confirmPasswordError: '',
    };

    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.resetFields = this.resetFields.bind(this);
  }

  resetFields() {
    this.setState({
      password: '',
      confirmPassword: '',
      passwordError: '',
      confirmPasswordError: '',
    });
  }

  handlePasswordSubmit() {
    const {password, confirmPassword} = this.state;
    const {onSubmit} = this.props;

    this.setState({
      passwordError: '',
      confirmPasswordError: '',
    });

    if (this.isEnterPasswordMode()) {
      if (LocalSessionManager.checkPassword(password)) {
        onSubmit(password);
        this.resetFields();
      } else {
        this.setState({passwordError: MESSAGES.VALIDATION.WRONG_PASSWORD});
      }
    } else {
      if (password.length < 10) {
        this.setState({passwordError: MESSAGES.VALIDATION.PASSWORD_LENGTH});
      } else if (confirmPassword !== password) {
        this.setState({confirmPasswordError: MESSAGES.VALIDATION.CONFIRM_PASSWORD});
      } else {
        onSubmit(password);
        this.resetFields();
      }
    }
  }

  handleHide = () => {
    this.resetFields();
  };

  handlePasswordChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  handleSubmitKeyUp = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.handlePasswordSubmit();
    }
  };

  isEnterPasswordMode = () => {
    return (this.props.mode !== PasswordModalMode.CREATE_PASSWORD);
  };

  render() {
    const {password, confirmPassword, passwordError, confirmPasswordError} = this.state;
    const {mode, show} = this.props;

    const isEnterPasswordMode = this.isEnterPasswordMode();

    return (
      <VerticallyModal
        key={'passwordModal' + mode}
        showModal={show}
        modalOnHide={this.handleHide}
        modalSize={'md'}
        modalHeading={<h3>{`${isEnterPasswordMode ? 'Enter Password' : 'Create Password'}`}</h3>}
        modalButton01={
          <UiButton buttonVariant="primary" buttonClass="SignUpButton"
            buttonText={isEnterPasswordMode ? 'Submit' : 'Create'}
            type="submit"
            onClick={this.handlePasswordSubmit}
          />
        }
        onKeyUp={this.handleSubmitKeyUp}
        closeButton={false}
        style={{'zIndex': '1100'}}
      >
        <Form>
          <Row className="align-items-center">
            <Col lg={12} md={12} xs={12} sm={12}>
              <TextInput
                placeholder="Enter Password"
                fieldType="password"
                value={password}
                name={'password'}
                onChange={this.handlePasswordChange}
                onKeyPress={this.handleSubmitKeyUp}
              />
              <p className='errorMsg'>{passwordError}</p>
            </Col>
            {isEnterPasswordMode ? '' :
              <Col lg={12} md={12} xs={12} sm={12}>
                <TextInput
                  placeholder="Confirm Password"
                  fieldType="password"
                  value={confirmPassword}
                  name={'confirmPassword'}
                  onChange={this.handlePasswordChange}
                  onKeyPress={this.handleSubmitKeyUp}
                />
                <p className='errorMsg'>{confirmPasswordError}</p>
              </Col>}
          </Row>
        </Form>
      </VerticallyModal>
    );
  }
}

export {PasswordModalMode};
export default PasswordModal;
