import React from 'react';
import {Route, Switch} from 'react-router-dom';
import PrivateRoute from 'components/layouts/PrivateRoute';
import IssuerHeader from 'components/layouts/Issuer/IssuerHeader';
import Sidebar from 'components/layouts/Common/Sidebar';
import ErrorBoundary from 'components/layouts/Common/ErrorBoundary';
import RegisterExistingProduct from 'components/layouts/Issuer/RegisterExistingProduct';
import RegisterNewProduct from 'components/layouts/Issuer/RegisterNewProduct';
import Issues from 'components/layouts/Issuer/Issues';
import Liquidity from '../Servicer/Liquidity';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Route path="/issuer/">
        <IssuerHeader onNotificationsClick={this.handleNotificationClick} />

        <Sidebar group='issuer' main={
          <ErrorBoundary>
            <Switch>
              <PrivateRoute exact path="/issuer/am/liquidity" component={Liquidity} />
              <PrivateRoute exact path="/issuer/register_existing_product" component={RegisterExistingProduct} />
              <PrivateRoute exact path="/issuer/register_new_product" component={RegisterNewProduct} />
              <PrivateRoute exact path="/issuer/issues" component={Issues} />
            </Switch>
          </ErrorBoundary>
        } />
      </Route>
    );
  }
}

export default Main;
