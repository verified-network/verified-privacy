import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import Tabledropdown from '../../ui/tableDropdown/TableDropdown';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import BondContractService from 'sources/contracts/BondContractService';
import {MESSAGES} from 'sources/messages';

const bondTab = 'bonds';
const securityTab = 'security';

const CLAIM_REPAYMENT_ACTION = 'Claim repayment';

const bondHeaders = [
  {label: 'Issue date', val: 'issueDate'},
  {label: 'Bond', val: 'id'},
  {label: 'Currency', val: 'currency'},
  {label: 'Amount purchased', val: 'purchaseAmount'},
  {label: 'Paid currency', val: 'paidInCurrency'},
  {label: 'Paid amount', val: 'paidInAmount'},
  {label: 'Action', val: 'action'},
];

const securityHeaders = [
  {label: 'Company', val: 'company', sort: true},
  {label: 'ISIN', val: 'isin', sort: true},
  {label: 'Issuer', val: 'issuer', sort: true},
  {label: 'Issuer name', val: 'issuerName', sort: true},
  {label: 'Currency', val: 'currency', sort: true},
  {label: 'Price', val: 'price', sort: true},
  {label: 'Balance', val: 'balance', sort: true},
  {label: 'Credit Score', val: 'creditScore', sort: true},
  {label: 'Action', val: 'action'},
];

class Portfolio extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      selectedTab: bondTab,
      securityData: [],
      bondData: [],
    };
  }

  componentDidMount = () => {
    this.getSelectedData(this.state.selectedTab);
  }

  loadSecurityData = () => {
    return this.context.getPassword().then((password) => {
      const securityRegistryContract = new SecurityRegistryContractService(password);

      this.setState({loading: true});

      securityRegistryContract.getSecuritiesInvested()
          .then((securitiesInvested) => {
            this.setState({securityData: securitiesInvested});
          })
          .catch((error) => {
            notifier.error('Error', error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  loadBondData = () => {
    return this.context.getPassword().then((password) => {
      const bond = new BondContractService(password);

      this.setState({loading: true});

      bond.getPurchases()
          .then((bondData) => {
            this.setState({bondData: bondData});
          })
          .catch(() => {
            notifier.error('Error', 'Error loading bond data');
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleSecurityOption = (row) => {

  }

  handleBondOption = (row) => {
    const action = row.indexLabel;

    if (action === CLAIM_REPAYMENT_ACTION) {
      this.claimLoanRepayment(row);
    }
  }

  claimLoanRepayment = (row) => {
    return this.context.getPassword().then((password) => {
      const bondContract = new BondContractService(password);

      this.setState({loading: true});

      const bondTokenAddress = row.id;
      const purchasedAmount = row.purchaseAmount;

      bondContract.claimLoanRepayment(bondTokenAddress, purchasedAmount)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
          })
          .catch((e) => {
            notifier.error('Error', e.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  getSelectedData = (selectedTab) => {
    if (selectedTab === securityTab) {
      this.loadSecurityData();
    } else if (selectedTab === bondTab) {
      this.loadBondData();
    }
  }

  handleSelectedTabChange = (selectedTab) => {
    this.getSelectedData(selectedTab);
    this.setState({selectedTab});
  }

  render() {
    const {loading, securityData, bondData, selectedTab} = this.state;

    const securityRows = securityData.map((object) => {
      object.action = (
        object.status !== '' ? (
          <Tabledropdown
            tableDropdownClass="tableDropDodownStyle"
            tableDropdownList={['Asset profile', 'Price', 'Credit score', 'Corporate actions']}
            dataObject={object}
            onSelect={this.handleSecurityOption}
          />
        ) : ''
      );

      return object;
    });

    const bondRows = bondData.map((bond) => {
      bond.action = (
        <Tabledropdown dataObject={bond}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={[CLAIM_REPAYMENT_ACTION]}
          onSelect={this.handleBondOption}
        />);

      return bond;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <>
          <section id="portfolio">
            <Row>
              <Col xs={12}>
                <h1 className="pageHeading">Portfolio</h1>
              </Col>

              <div className='w-100'>
                <section id="transactionTable">
                  <Tabs defaultActiveKey={bondTab} activeKey={selectedTab} onSelect={this.handleSelectedTabChange}>
                    <Tab eventKey={bondTab} title="Bonds">
                      <UiTable thead={bondHeaders} tbodyData={bondRows}/>
                    </Tab>

                    <Tab eventKey={securityTab} title="Securities">
                      <UiTable thead={securityHeaders} tbodyData={securityRows}/>
                    </Tab>
                  </Tabs>
                </section>
              </div>
            </Row>
          </section>
        </>
      </div>
    );
  }
}

export default Portfolio;
