import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import i18n from '../translations/i18n';
import {I18nextProvider} from 'react-i18next';

require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/Verified-common.css');

import LogIn from './layouts/Common/Login';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import PasswordModal from 'components/layouts/Common/PasswordModal';
import IssuerMain from 'components/layouts/Issuer/Main';
import LocalSessionManager from 'sources/utils/LocalSessionManager';
import {PushNotificationProvider} from '../notifications/notificationsHandler';
import {ApolloClient, InMemoryCache, ApolloProvider} from '@apollo/client';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/verified-network/balancer',
  cache: new InMemoryCache(),
});

const queryClient = new QueryClient();

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    const that = this;

    this.state = {
      passwordModalVisibility: false,
      passwordsRequests: [],

      passwordStoreData: {
        password: '',

        isPasswordStored() {
          return this.password && this.password !== '';
        },

        getPassword(forSettingWallet = false) {
          if (this.isPasswordStored()) {
            return Promise.resolve(this.password);
          } else {
            if (forSettingWallet || LocalSessionManager.isWalletStored()) {
              that.setState({passwordModalVisibility: true});
            }

            return new Promise((resolve) => {
              that.state.passwordsRequests.push(resolve);
            });
          }
        },

        setPassword(password) {
          this.password = password;
        },

        destroyPassword() {
          this.password = '';
        },
      },
    };

    this.handlePasswordSubmit = this.handlePasswordSubmit.bind(this);
  }

  handlePasswordSubmit(password) {
    this.state.passwordStoreData.setPassword(password);

    for (let i = this.state.passwordsRequests.length - 1; i >= 0; i--) {
      const passwordRequest = this.state.passwordsRequests[i];
      passwordRequest(password);
    }

    this.state.passwordsRequests = [];
    this.setState({passwordModalVisibility: false});
  }

  render() {
    const {passwordStoreData, passwordModalVisibility} = this.state;

    return (
      <I18nextProvider i18n={i18n}>
        <ApolloProvider client={client}>
          <PushNotificationProvider>
            <Router>
              <Route exact path={['/login', '/']}>
                <LogIn userRole='investor' />
              </Route>

              <PasswordModal show={passwordModalVisibility} onSubmit={this.handlePasswordSubmit} />
              <PasswordStore.Provider value={passwordStoreData}>
                <QueryClientProvider client={queryClient}>
                  <IssuerMain />
                </QueryClientProvider>
              </PasswordStore.Provider>
            </Router>
          </PushNotificationProvider>
        </ApolloProvider>
      </I18nextProvider>
    );
  }
}

AppComponent.defaultProps = {};

export default AppComponent;
