import '../../ui/navbar/header.less';
import 'styles/typo.css';

import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import notifier from 'components/ui/notifier';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Form, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ClientContractService from 'sources/contracts/ClientContractService';
import LocalCache from 'sources/utils/LocalCache';
import Notification from '../../ui/notification/Notification';
import { MESSAGES } from 'sources/messages';
import AuthApi from 'sources/api/Auth';
import PasswordModal, { PasswordModalMode } from 'components/layouts/Common/PasswordModal';
import EventsContractService, { EventType } from 'sources/contracts/EventsContractService';
import LocalSessionManager from 'sources/utils/LocalSessionManager';
import WalletModal, { WalletModalMode } from 'components/layouts/Investor/WalletModal';
import KycContractService, { KycStatus } from 'sources/contracts/KycContractService';
import KycSubmit from 'components/layouts/Common/KycSubmit';
import { withTranslation } from 'react-i18next';
import workerInstance from 'sources/worker/WorkerInstance';
import logo from '../../../assets/images/logo/verified_logo_white.svg';
import Encryption from 'sources/utils/Encryption';
import { ENCRYPTION_KEY, WEBSITE_URL } from '../../../sources/Config';
import { usePushNotification } from '../../../notifications/notificationsHandler';
import initialTransactionsManager from 'sources/utils/InitialTransactionsManager';

class CommonHeader extends Component {
  static contextType = PasswordStore;

  constructor() {
    super();
    this.state = {
      loading: false,
      walletModalVisibility: false,
      walletModalMode: '',
      createPasswordModalVisibility: false,
      createPasswordModalCallback: null,
      kycPendingForApproval: false,
      kycNotSubmitted: false,
    };

    this.processRole = this.processRole.bind(this);
  }

  componentDidMount = () => {
    this.loginUser();

    this.context.getPassword().then((password) => {
      const clientContract = new ClientContractService(password);

      workerInstance.init(clientContract.getWallet().privateKey);

      workerInstance.setPostedEntries(LocalSessionManager.getPostedEvents());

      workerInstance.onEntryPosted((logId) => {
        LocalSessionManager.addPostedEvent(logId);
      });

      setTimeout(() => {
        initialTransactionsManager.addTransaction(() => {
          return new Promise(((resolve) => {
            workerInstance.sync();
            resolve();
          }));
        });
      }, 5000);
    });
  }

  loginUser = () => {
    this.startLoading();
    const query = window.location.search;
    let token = "";
    if (query && query.includes("access_token")) {
      token = this.getTokenFromUrl();
    } else {
      token = LocalSessionManager.getAuthToken();
    }

    AuthApi.getLoggedUser(token)
      .then((response) => {
        const userId = response.email;
        LocalSessionManager.setLoggedUsername(userId);
        LocalSessionManager.storeAuthToken(token);

        this.processLoggedUser();
      })
      .catch((error = {}) => {
        const status = error.response?.status;
        if (status === 401) { // Unauthorized error
          this.handleLogoutClick();
        } else {
          this.processLoggedUser();
        }
        console.log("Error getLoggedUser", { error, response: error.response.status });
        notifier.error('Error', 'Error in login ' + error);
        // location.replace('/'); //Fixme: Uncomment it, it is just for testing
      })
      .finally(() => {
        this.finishLoading();
      });
  }

  getTokenFromUrl = () => {
    let token = "";
    try {
      const query = window.location.search;
      const splitArr = query.split("?access_token=")
      if (splitArr[1]) {
        const accessToken = splitArr[1];
        token = Encryption.decryptString(accessToken, ENCRYPTION_KEY);
      }
    } catch (error) {
      //
    }
    return token;
  }

  processLoggedUser = () => {
    if (LocalSessionManager.isPasswordStored()) {
      this.afterLogin();
    } else {
      this.openCreatePasswordModalWithCallback((password) => {
        LocalSessionManager.setPassword(password);
        this.context.setPassword(password);

        this.closeCreatePasswordModal();
        this.openCreateOrImportWallet();
      });
    }
  };

  afterLogin = () => {
    if (LocalSessionManager.isWalletStored()) {
      this.processRole();
    } else {
      this.openCreateOrImportWallet();
    }
  };

  processRole = () => {
    this.context.getPassword().then((password) => {
      const clientContract = new ClientContractService(password);

      this.startLoading();

      clientContract.isUserIssuer().then((isUserIssuer) => {
        sessionStorage.setItem('isDashboardVisited', true);

        const currentRole = isUserIssuer ? 'investor' : 'investor';

        if (isUserIssuer) {
          sessionStorage.setItem('isAdmin', true);
        }

        if (this.props.role !== currentRole) {
          // We dont need processKyc here because it will be done when user arrive to redirected dashboard
          this.props.history.push(`/${currentRole}/dashboard`);
        } else {
          this.processKyc();
          notifier.success('Success', MESSAGES.SUCCESS.WALLET_IMPORT_SUCCESS);
        }
      }).catch((error) => {
        notifier.error('Error', error?.toString());
      }).finally(() => {
        this.finishLoading();
      });
    });
  };

  processKyc = () => {
    this.context.getPassword().then((password) => {
      const kycContract = new KycContractService(password);
      const clientContract = new ClientContractService(password);

      this.startLoading();

      return kycContract
        .getStatus()
        .then((status) => {
          clientContract.isUserAdmin().then((isUserAdmin) => {
            const isKycNotSubmitted = !isUserAdmin && (status === KycStatus.NOT_SUBMITTED ||
              status === KycStatus.REJECTED);
            if (status === KycStatus.ACCEPTED) {
              this.props.storeFcmToken(password);
            }
            if (isKycNotSubmitted) {
              this.setState({ kycNotSubmitted: true });
            } else if (status === KycStatus.PENDING_FOR_APPROVAL) {
              this.setState({ kycPendingForApproval: true });
            } else {
              if (this.props.finishSetup) {
                this.props.finishSetup();
              }
            }
          });
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.finishLoading();
        });
    });
  };

  subscribeToEvents() {
    this.context.getPassword().then((password) => {
      const eventsContractService = new EventsContractService(password);

      eventsContractService.subscribe((event) => {
        if (event.type === EventType.CASH_ISSUE) {
          const data = event.data;
          notifier.info('Cash Issue', `You get credited by ${data.amount} ${data.currency}`, 10000);
        }
      });
    });
  }

  handleWalletLoaded = () => {
    this.processRole();
  }

  startLoading() {
    this.setState({ loading: true });
  }

  finishLoading() {
    this.setState({ loading: false });
  }

  handleLogoutClick = (from) => {
    sessionStorage.clear();
    LocalCache.clear();
    LocalSessionManager.storeAuthToken('');
    location.href = `${WEBSITE_URL}/social-login/logout`;
  };

  handleNotificationClick = (type) => {
    if (type === 'import_wallet') {
      this.setState({
        walletModalVisibility: true,
        walletModalMode: WalletModalMode.CREATE_WALLET,
      });
    } else if (type === 'view_wallet') {
      this.setState({
        walletModalVisibility: true,
        walletModalMode: WalletModalMode.SHOW_WALLET,
      });
    } else if (type === 'change_pin') {
      this.context.destroyPassword();
      this.context.getPassword().then((oldPassword) => {
        this.openCreatePasswordModalWithCallback((newPassword) => {
          this.closeCreatePasswordModal();

          LocalSessionManager.changePassword(oldPassword, newPassword);
          this.context.setPassword(newPassword);
        });
      });
    }
  };

  openCreatePasswordModalWithCallback(callback) {
    this.setState({
      createPasswordModalVisibility: true,
      createPasswordModalCallback: callback,
    });
  }

  closeCreatePasswordModal() {
    this.setState({
      createPasswordModalVisibility: false,
    });
  }

  openCreateOrImportWallet() {
    this.setState({
      walletModalVisibility: true,
      walletModalMode: WalletModalMode.CREATE_WALLET,
    });
  }

  handleCreatePassword = (password) => {
    this.state.createPasswordModalCallback(password);
  };

  handleCreatePasswordHide = () => {
    this.closeCreatePasswordModal();
  };

  handleWalletModalHide = () => {
    this.setState({ walletModalVisibility: false });
  }

  render() {
    const {
      loading, createPasswordModalVisibility, walletModalVisibility, walletModalMode, kycPendingForApproval,
      kycNotSubmitted,
    } = this.state;

    const { navItems, role } = this.props;

    return (
      <header className="bg" style={{ height: '75px' }}>
        {loading ? <Loader /> : ''}
        <Navbar expand="lg">
          <LinkContainer to={`/${role}/dashboard`}>
            <Navbar.Brand>
              <img src={logo} alt='Logo' />{' '}
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              {navItems}
            </Nav>
            <Form inline>
              <Notification
                tooltiptext={
                  <>
                    <p className="notifications" onClick={() => this.handleNotificationClick('import_wallet')}>
                      Import wallet
                    </p>
                    <NavDropdown.Divider />
                    <p className="notifications" onClick={() => this.handleNotificationClick('view_wallet')}>
                      View wallet
                    </p>
                    <NavDropdown.Divider />
                    <p className="notifications" onClick={() => this.handleNotificationClick('change_pin')}>
                      Change PIN
                    </p>
                  </>
                }
                Icon={
                  <i className="fa fa-bell-o fa-2x iconColor" aria-hidden="true" />
                }
              />
              <Button variant="outline-light" onClick={() => this.handleLogoutClick()}>Log Out</Button>
            </Form>
          </Navbar.Collapse>
        </Navbar>

        <WalletModal mode={walletModalMode} show={walletModalVisibility}
          onHide={this.handleWalletModalHide} onWalletLoaded={this.handleWalletLoaded}
        />

        <PasswordModal mode={PasswordModalMode.CREATE_PASSWORD} show={createPasswordModalVisibility}
          onHide={this.handleCreatePasswordHide} onSubmit={this.handleCreatePassword}
        />

        <VerticallyModal
          key="kycPending" closeButton={false} showModal={kycPendingForApproval} modalSize={'md'}
          modalHeading={<h3>Your KYC is pending for approval</h3>}
          modalButton01={<Button onClick={this.handleLogoutClick} className="mt-4">Log out</Button>}
        >
          <p className="mt-2">
            When the verification has been completed, you will receive an email from us approving your Account!
          </p>
        </VerticallyModal>

        {kycNotSubmitted ? (
          <KycSubmit onLogout={this.handleLogoutClick} visibility={kycNotSubmitted} />
        ) : ''}
      </header>
    );
  }
}

const CommonHeaderComponent = (props) => {
  const pushNotification = usePushNotification();
  return <CommonHeader {...props} {...pushNotification} />
}

export default withTranslation()(withRouter(CommonHeaderComponent));