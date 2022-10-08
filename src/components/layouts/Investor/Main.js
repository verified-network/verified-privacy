import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PrivateRoute from 'components/layouts/PrivateRoute';
import InvestorHeader from 'components/layouts/Investor/InvestorHeader';
import Sidebar from 'components/layouts/Common/Sidebar';
import ErrorBoundary from 'components/layouts/Common/ErrorBoundary';
import Pay from 'components/layouts/Common/Pay';
import Balancer from 'components/layouts/Common/Balancer';
import Finance from 'components/layouts/Investor/Finance';
import Invest from 'components/layouts/Investor/Invest';
import Orders from 'components/layouts/Investor/Orders';
import CreateOrder from 'components/layouts/Investor/CreateOrder';
import InvestorProducts from 'components/layouts/Investor/Products';
import RegisterExistingProduct from 'components/layouts/Investor/RegisterExistingProduct';
import RegisterNewProduct from 'components/layouts/Investor/RegisterNewProduct';
import Transactions from 'components/layouts/Common/Transactions';
import ServiceAssets from 'components/layouts/Investor/ServiceAssets';
import Issues from 'components/layouts/Investor/Issues';
import Investors from 'components/layouts/Investor/Investors';
import Portfolio from 'components/layouts/Investor/Portfolio';
import PaymentSuccess from 'components/layouts/Investor/PaymentSuccess';
import RegisterAccount from 'components/layouts/Investor/RegisterAccount';
import SecurityHistory from 'components/layouts/Investor/SecurityHistory';
import Liquidity from '../Issuer/Liquidity';
import AssetManagersList from '../Issuer/AssetManagersList';
import PoolDetailPage from '../Common/Balancer/poolDetail';

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
              <PrivateRoute exact path="/investor/pay" component={Pay} />
              <PrivateRoute exact path="/investor/dashboard" component={Balancer} />
              <PrivateRoute exact path="/investor/admin/asset-manager/:platformAddress" component={AssetManagersList} />
              <PrivateRoute exact path="/investor/am/liquidity" component={Liquidity} />
              <PrivateRoute exact path="/investor/pool/:type/:pool_id" component={PoolDetailPage} />
              <PrivateRoute exact path="/investor/finance" component={Finance} />
              <PrivateRoute exact path="/investor/invest" component={Invest} />
              <PrivateRoute exact path="/investor/orders" component={Orders} />
              <PrivateRoute exact path="/investor/create_order" component={CreateOrder} />
              <PrivateRoute exact path="/investor/security/history/:isin" component={SecurityHistory} />
              <PrivateRoute path="/investor/edit_order/:orderRef" component={CreateOrder} />
              <PrivateRoute path="/investor/products" component={InvestorProducts} />
              <PrivateRoute exact path="/investor/register_account" component={RegisterAccount} />
              <PrivateRoute exact path="/investor/register_existing_product" component={RegisterExistingProduct} />
              <PrivateRoute exact path="/investor/register_new_product" component={RegisterNewProduct} />
              <PrivateRoute exact path="/investor/transactions" component={Transactions} />
              <PrivateRoute exact path="/investor/service_assets" component={ServiceAssets} />
              <PrivateRoute exact path="/investor/issues" component={Issues} />
              <PrivateRoute exact path="/investor/issues/:issueAddress" component={Investors} />
              <PrivateRoute exact path="/investor/portfolio" component={Portfolio} />
              <PrivateRoute exact path="/investor/payment_success" component={PaymentSuccess} />
            </Switch>
          </ErrorBoundary>
        } />
      </Route>
    );
  }
}

export default Main;
