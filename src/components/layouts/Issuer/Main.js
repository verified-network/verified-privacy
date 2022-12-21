import React from 'react';
import {Route, Switch} from 'react-router-dom';
import PrivateRoute from 'components/layouts/PrivateRoute';
import InvestorHeader from 'components/layouts/Issuer/InvestorHeader';
import Sidebar from 'components/layouts/Common/Sidebar';
import ErrorBoundary from 'components/layouts/Common/ErrorBoundary';
import InvestorProducts from 'components/layouts/Issuer/Products';
import RegisterExistingProduct from 'components/layouts/Issuer/RegisterExistingProduct';
import RegisterNewProduct from 'components/layouts/Issuer/RegisterNewProduct';
import ServiceAssets from 'components/layouts/Issuer/ServiceAssets';
import Issues from 'components/layouts/Issuer/Issues';
import RegisterAccount from 'components/layouts/Issuer/RegisterAccount';
import Liquidity from '../Servicer/Liquidity';
import AssetManagersList from '../Servicer/AssetManagersList';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Route path="/investor/">
        <InvestorHeader onNotificationsClick={this.handleNotificationClick} />

        <Sidebar group='investor' main={
          <ErrorBoundary>
            <Switch>
              <PrivateRoute exact path="/investor/admin/asset-manager/:platformAddress" component={AssetManagersList} />
              <PrivateRoute exact path="/investor/am/liquidity" component={Liquidity} />
              <PrivateRoute path="/investor/products" component={InvestorProducts} />
              <PrivateRoute exact path="/investor/register_account" component={RegisterAccount} />
              <PrivateRoute exact path="/investor/register_existing_product" component={RegisterExistingProduct} />
              <PrivateRoute exact path="/investor/register_new_product" component={RegisterNewProduct} />
              <PrivateRoute exact path="/investor/service_assets" component={ServiceAssets} />
              <PrivateRoute exact path="/investor/issues" component={Issues} />
            </Switch>
          </ErrorBoundary>
        } />
      </Route>
    );
  }
}

export default Main;
