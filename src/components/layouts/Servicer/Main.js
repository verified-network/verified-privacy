import React from 'react';
import {Route, Switch} from 'react-router-dom';
import AdminRoute from 'components/layouts/AdminRoute';
import IssuerHeader from 'components/layouts/Issuer/IssuerHeader';
import Sidebar from 'components/layouts/Common/Sidebar';
import Pay from 'components/layouts/Common/Pay';
import Organization from 'components/layouts/Issuer/Organization';
import Users from 'components/layouts/Issuer/Users';
import PaymentSuccess from 'components/layouts/Issuer/PaymentSuccess';
import IssueRequests from 'components/layouts/Issuer/IssueRequests';
import TransferRequests from 'components/layouts/Issuer/TransferRequests';
import PrimaryIssueRequests from 'components/layouts/Issuer/PrimaryIssueRequests';
import SecondaryIssueRequests from 'components/layouts/Issuer/SecondaryIssueRequests';
import WithdrawalRequests from 'components/layouts/Issuer/WithdrawalRequests';
import ErrorBoundary from 'components/layouts/Common/ErrorBoundary';
import Issues from 'components/layouts/Issuer/Issues';
import Investors from 'components/layouts/Issuer/Investors';
import Liquidity from 'components/layouts/Issuer/Liquidity';
import AssetManagers from 'components/layouts/Issuer/AssetManagers';
import AssetManagersList from 'components/layouts/Issuer/AssetManagersList';
import AdminLiquidity from 'components/layouts/Issuer/AdminLiquidity';
import RevenueShareholders from 'components/layouts/Issuer/RevenueShareholders';
import RevenueShareholdersPublic from 'components/layouts/Issuer/RevenueShareholdersPublic';
import FeeRates from 'components/layouts/Issuer/FeeRates';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ClientContractService from 'sources/contracts/ClientContractService';

class Main extends React.Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      role: '',
    };
  }

  componentDidMount() {

  }

  checkRoleAccess = () => {
    this.context.getPassword().then((password) => {
      const clientContract = new ClientContractService(password);

      clientContract.getRole().then((role) => {
        this.setState({role});
      });
    });
  }

  forRoles = (roles, content) => {
    const {role} = this.state;

    if ((roles.length > 0 && roles[0] === '*') || roles.includes(role)) {
      return content;
    }
  }

  render() {
    const {role} = this.state;

    return (
      <Route path="/issuer/">
        <IssuerHeader onNotificationsClick={this.handleNotificationClick} finishSetup={this.checkRoleAccess}/>

        <Sidebar group='issuer' role={role} main={
          <ErrorBoundary>
            <Switch>
              {this.forRoles(['*'], (
                <AdminRoute exact path="/issuer/transactions" component={Pay}/>
              ))}

              {this.forRoles(['*'], (
                <AdminRoute exact path="/issuer/dashboard" component={Pay}/>
              ))}

              {this.forRoles(['Admin', 'KYCAML'], (
                <AdminRoute exact path="/issuer/organization" component={Organization}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/users" component={Users}/>
              ))}

              {this.forRoles(['*'], (
                <AdminRoute exact path="/issuer/payment_success" component={PaymentSuccess}/>
              ))}

              {this.forRoles(['Custodian'], (
                <AdminRoute exact path="/issuer/issue_requests" component={IssueRequests}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/transfer_requests" component={TransferRequests}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/primary_issue_requests" component={PrimaryIssueRequests}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/secondary_issue_requests" component={SecondaryIssueRequests}/>
              ))}

              {this.forRoles(['Custodian'], (
                <AdminRoute exact path="/issuer/withdrawal_requests" component={WithdrawalRequests}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/issues" component={Issues}/>
              ))}

              {this.forRoles(['DP'], (
                <AdminRoute exact path="/issuer/issues/:issueAddress" component={Investors}/>
              ))}

              {this.forRoles(['AM'], (
                <AdminRoute exact path="/issuer/liquidity" component={Liquidity}/>
              ))}

              {this.forRoles(['Admin'], (
                <AdminRoute exact path="/issuer/asset_managers" component={AssetManagers}/>
              ))}

              {this.forRoles(['Admin'], (
                <AdminRoute exact path="/issuer/asset_managers/:platformAddress" component={AssetManagersList}/>
              ))}

              {this.forRoles(['Admin'], (
                <AdminRoute exact path="/issuer/admin_liquidity" component={AdminLiquidity}/>
              ))}

              {this.forRoles(['Admin'], (
                <>
                  <AdminRoute exact path="/issuer/revenue_shareholders_public" component={RevenueShareholdersPublic}/>
                  <AdminRoute exact path="/issuer/revenue_shareholders" component={RevenueShareholders}/>
                </>
              ))}

              {this.forRoles(['Admin'], (
                <AdminRoute exact path="/issuer/fee_rates" component={FeeRates}/>
              ))}
            </Switch>
          </ErrorBoundary>
        }
        />
      </Route>
    );
  }
}

export default Main;
