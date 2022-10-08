import React, { Component } from 'react';
import { Form, Modal } from 'react-bootstrap';
import SocialButton from '../../ui/SocialButton';
import { IdentityProvider, buildLoginUrl } from '../../../sources/LoginUrl';
//  import {Images} from '../../../assets';
import GoogleLogo from '../../../assets/images/google_icon.svg';
import FacebookLogo from '../../../assets/images/facebook_icon.svg';
import TwitterLogo from '../../../assets/images/twitter_icon.svg';
import MicrosoftLogo from '../../../assets/images/microsoft_icon.svg';
import VerifiedLogo from '../../../assets/images/logo/logo-small.svg';
import './login.css';
import LocalSessionManager from 'sources/utils/LocalSessionManager';
import { LOGOUT_URL } from '../../../sources/Config';

class LogIn extends Component {
  loginUrl(identityProvider) {
    const { userRole } = this.props;
    return buildLoginUrl(identityProvider, userRole);
  }

  componentDidMount(){
    const token = LocalSessionManager.getAuthToken();
    if(token) {
      location.href = "/investor/dashboard"
    } else {
      location.href = LOGOUT_URL;
    }
  }

  render() {
    return (
      <div className="login-container">
        <Modal show={true} size="lg" aria-labelledby="contained-modal-title-vcenter" centered
          dialogClassName="login-dialog-content">
          <Modal.Body>
            <div className="login-header" xs={6}>
              <img className='login-logo' src={VerifiedLogo} alt={'Verified Logo'} />
            </div>
            <h2 className="verifiedAccount fw-bold login-heading">Login to your  <span className="text-primary">
              Verified Wallet
            </span></h2>

            <Form className="d-flex flex-column">
              <SocialButton
                buttonText="Google"
                imgSrc={GoogleLogo}
                buttonVariant="primary"
                buttonLink={this.loginUrl(IdentityProvider.GOOGLE)}
                type="submit"
              />
              <SocialButton
                buttonText="Facebook"
                imgSrc={FacebookLogo}
                buttonVariant="primary"
                buttonLink={this.loginUrl(IdentityProvider.FACEBOOK)}
                type="submit"
              />
              <SocialButton
                buttonText="Twitter"
                imgSrc={TwitterLogo}
                buttonVariant="primary"
                buttonLink={this.loginUrl(IdentityProvider.TWITTER)}
                type="submit"
              />
              <SocialButton
                buttonText="Microsoft"
                imgSrc={MicrosoftLogo}
                buttonVariant="primary"
                buttonLink={this.loginUrl(IdentityProvider.MICROSOFT)}
                type="submit"
              />
              <p className="login-dialog-policy-text text-xs md:text-base  px-1 md:px-0 pt-2 text-center">
                By connecting to the Verified Wallet, you agree to Verified network ’{' '}
                <span className="text-primary">Terms of Service</span> and acknowledge
                that you have read and understand the verified network{' '}
                <span className="text-primary"> Protocol Disclaimer.</span>
              </p>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default LogIn;
