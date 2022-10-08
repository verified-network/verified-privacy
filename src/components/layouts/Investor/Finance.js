import React from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import BondContractService from '../../../sources/contracts/BondContractService';
import Carousel from '../../ui/carrousel/Carrousel';
import UiTable from 'components/ui/table/Table';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';
import Tabledropdown from 'components/ui/tableDropdown/TableDropdown';
import TextInput from 'components/ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import CashContractService from 'sources/contracts/CashContractService';
import {MESSAGES} from 'sources/messages';

const bondTab = 'bonds';
const securityTab = 'security';

const REPAY_LOAN_ACTION = 'Repay loan';
const REDEEM_BOND_ACTION = 'Redeem bond';

const bondHeaders = [
  {label: 'Issue date', val: 'issueDate'},
  {label: 'Bond', val: 'id'},
  {label: 'Currency', val: 'currency'},
  {label: 'Amount issued', val: 'parValue'},
  {label: 'Amount borrowed', val: 'purchasedIssueAmount'},
  {label: 'Action', val: 'action'},
];

const securityHeaders = [
  {label: 'Company', val: 'company', sort: true},
  {label: 'Currency', val: 'currency', sort: true},
  {label: 'ISIN', val: 'isin', sort: true},
  {label: 'Credit Score', val: 'creditScore', sort: true},
  {label: 'Price', val: 'price', sort: true},
  {label: 'Balance', val: 'balance', sort: true},
];

class Finance extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      bondData: [],
      securityData: [],
      selectedTab: 'bonds',
      repayLoanModalVisibility: false,
      repayLoanAmount: '',
      repayLoanSelectedBond: {},
    };
  }

  componentDidMount() {
    this.loadBondData();
  }

  loadBondData = () => {
    return this.context.getPassword().then((password) => {
      const bond = new BondContractService(password);

      this.setState({loading: true});

      bond.getIssues()
          .then((balances) => {
            this.setState({bondData: balances});
          })
          .catch((error) => {
            notifier.error('Error', 'Error loading bond balances ' + error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  };

  loadSecurityData = () => {
    return this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const registryContract = new SecurityRegistryContractService(password);

      registryContract.getSecuritiesIssued()
          .then((securities) => {
            this.setState({securityData: securities});
          })
          .catch((error) => {
            notifier.error('Error', 'Error loading bond balances ' + error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleBondOption = (selectedItem) => {
    const action = selectedItem.indexLabel;

    if (action === REPAY_LOAN_ACTION) {
      this.setState({repayLoanSelectedBond: selectedItem});
      this.handleRepayLoanModalOpen();
    } else if (action === REDEEM_BOND_ACTION) {
      this.redeemBond(selectedItem);
    }
  }

  repayLoanAction = () => {
    const {repayLoanAmount, repayLoanSelectedBond} = this.state;

    const repayCurrency = repayLoanSelectedBond.currency;
    const bondTokenAddress = repayLoanSelectedBond.id;

    return this.context.getPassword().then((password) => {
      const cashContract = new CashContractService(password);

      this.setState({loading: true});

      cashContract.repayLoan(repayCurrency, bondTokenAddress, repayLoanAmount)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
            this.handleRepayLoanModalClose();
          })
          .catch((e) => {
            notifier.error('Error', e.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  redeemBond = (selectedItem) => {
    return this.context.getPassword().then((password) => {
      const bondContract = new BondContractService(password);

      this.setState({loading: true});

      const bondAddress = selectedItem.id;
      const currency = selectedItem.currency;
      const unsoldAmount = selectedItem.parValue - selectedItem.purchasedIssueAmount;

      bondContract.redeemBond(currency, bondAddress, unsoldAmount)
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

  handleRepayLoanModalOpen = () => {
    this.setState({repayLoanModalVisibility: true});
  };

  handleRepayLoanModalClose = () => {
    this.setState({
      repayLoanModalVisibility: false,
      repayLoanAmount: '',
    });
  };

  handleSelectedTabChange = (selectedTab) => {
    this.getSelectedData(selectedTab);
    this.setState({selectedTab});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    const {loading, selectedTab, bondData, securityData, repayLoanModalVisibility, repayLoanAmount} = this.state;

    const items = bondData.map((item) => {
      return {
        name: item.currency,
        value: item.parValue,
      };
    });

    const bondRows = bondData.map((bond) => {
      bond.action = (
        <Tabledropdown dataObject={bond}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={[REPAY_LOAN_ACTION, REDEEM_BOND_ACTION]}
          onSelect={this.handleBondOption}
        />);

      return bond;
    });

    return (
      <>
        {loading ? <Loader /> : ''}
        <section className='p-0 mt-0'>
          <Carousel items={items}/>

          <Row>
            <div className='w-100'>
              <section id="transactionTable">
                <Tabs defaultActiveKey={bondTab} activeKey={selectedTab} onSelect={this.handleSelectedTabChange}>
                  <Tab eventKey={bondTab} title="Bonds">
                    <UiTable thead={bondHeaders} tbodyData={bondRows}/>
                  </Tab>

                  <Tab eventKey={securityTab} title="Securities">
                    <UiTable thead={securityHeaders} tbodyData={securityData}/>
                  </Tab>
                </Tabs>
              </section>
            </div>
          </Row>

          <ModalCard title='Repay loan' visibility={repayLoanModalVisibility}
            onSubmit={this.repayLoanAction} onHide={this.handleRepayLoanModalClose} modalSize='xs'>
            {loading ? <Loader/> : ''}

            <Form>
              <Row className="align-items-center">
                <Col xs={12}>
                  <TextInput
                    placeholder="Amount to pay"
                    fieldType="text"
                    value={repayLoanAmount}
                    name={'repayLoanAmount'}
                    onChange={this.handleChange}
                  />
                </Col>
              </Row>
            </Form>
          </ModalCard>
        </section>
      </>
    );
  }
}

export default Finance;
