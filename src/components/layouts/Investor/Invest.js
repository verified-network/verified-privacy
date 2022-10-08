import React from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import Carousel from '../../ui/carrousel/Carrousel';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import UiTable from 'components/ui/table/Table';
import BondContractService from 'sources/contracts/BondContractService';
import Tabledropdown from 'components/ui/tableDropdown/TableDropdown';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import Currency, {CurrencyType} from 'components/ui/currency/Currency';
import CashContractService from 'sources/contracts/CashContractService';
import {MESSAGES} from 'sources/messages';

const bondTab = 'bonds';
const securityTab = 'security';

const PURCHASE_BOND_ACTION = 'Purchase bond';
const INVEST_ACTION = 'Invest';
const TRANSACTION_HISTORY_ACTION = 'Trading history';
const PRICE_DEPTH_CHART_ACTION = 'Price/Depth Chart';

const bondHeaders = [
  {label: 'Issue date', val: 'issueDate'},
  {label: 'Bond', val: 'id'},
  {label: 'Issuer', val: 'issuer'},
  {label: 'Issuer name', val: 'issuerName'},
  {label: 'Currency', val: 'currency'},
  {label: 'Amount purchased', val: 'purchasedAmount'},
  {label: 'Paid currency', val: 'paidInCurrency'},
  {label: 'Paid amount', val: 'paidInAmount'},
  {label: 'Action', val: 'action'},
];

const securityHeaders = [
  {label: 'Company', val: 'company', sort: true},
  {label: 'Currency', val: 'currency', sort: true},
  {label: 'ISIN', val: 'isin', sort: true},
  {label: 'Credit Score', val: 'creditScore', sort: true},
  {label: 'Price', val: 'price', sort: true},
  {label: 'Balance', val: 'balance', sort: true},
  {label: 'Action', val: 'action'},
];

class Invest extends React.Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      selectedTab: 'bonds',
      securityData: [],
      bondData: [],
      purchaseBondModalVisibility: false,
      purchaseBondCurrency: '',
      purchaseBondAmount: '',
      selectedRow: {},
    };
  }

  componentDidMount() {
    this.loadBondData();
    this.loadSecurityData();
  }

  loadBondData = () => {
    return this.context.getPassword().then((password) => {
      const bond = new BondContractService(password);

      this.setState({loading: true});

      bond.getAllBondIssues()
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
  };

  loadSecurityData = () => {
    return this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const registryContract = new SecurityRegistryContractService(password);

      registryContract.getSecuritiesInvested()
          .then((securities) => {
            this.setState({securityData: securities});
          })
          .catch((error) => {
            notifier.error('Error', 'Error loading invested securities');
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  purchaseBond = () => {
    return this.context.getPassword().then((password) => {
      const cashContract = new CashContractService(password);

      this.setState({loading: true});

      const {selectedRow, purchaseBondCurrency, purchaseBondAmount} = this.state;
      const bondTokenAddress = selectedRow.id;

      cashContract.purchaseBond(purchaseBondCurrency, purchaseBondAmount, bondTokenAddress)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
            this.handlePurchaseBondModalHide();
          })
          .catch((e) => {
            notifier.error('Error', e.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleBondOption = (row) => {
    const action = row.indexLabel;

    if (action === PURCHASE_BOND_ACTION) {
      this.setState({selectedRow: row});
      this.handlePurchaseBondModalOpen();
    }
  }

  handleSecurityOption = (row) => {
    const action = row.indexLabel;
    console.log("Invest handleSecurityOption row", row);

    const query = `?isin=${row.isin}&currency=${row.currency}&company=${row.company}&price=${row.price}`;

    if (action === INVEST_ACTION) {
      this.props.history.push(`/investor/create_order${query}`);
    } else {
      this.props.history.push(`/investor/security/history/${row.isin}`);
    }
  }

  getSelectedData = (selectedTab) => {
    if (selectedTab === securityTab) {
      this.loadSecurityData();
    } else if (selectedTab === bondTab) {
      this.loadBondData();
    }
  }

  handlePurchaseBondModalOpen = () => {
    this.setState({purchaseBondModalVisibility: true});
  }

  handlePurchaseBondModalHide = () => {
    this.setState({
      purchaseBondModalVisibility: false,
      purchaseBondCurrency: '',
      purchaseBondAmount: '',
    });
  }

  handlePurchaseBondCurrencyChange = (currency) => {
    this.setState({purchaseBondCurrency: currency});
  }

  handleSelectedTabChange = (selectedTab) => {
    this.getSelectedData(selectedTab);
    this.setState({selectedTab});
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  render() {
    const {
      loading, selectedTab, securityData, bondData, purchaseBondModalVisibility, purchaseBondAmount,
    } = this.state;

    const items = securityData.map((security) => {
      return {
        name: security.isin,
        value: security.balance,
      };
    });

    const bondRows = bondData.map((bond) => {
      bond.action = (
        <Tabledropdown dataObject={bond}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={[PURCHASE_BOND_ACTION]}
          onSelect={this.handleBondOption}
        />);

      return bond;
    });

    const securityRows = securityData.map((bond) => {
      bond.action = (
        <Tabledropdown dataObject={bond}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={[INVEST_ACTION, TRANSACTION_HISTORY_ACTION, PRICE_DEPTH_CHART_ACTION]}
          onSelect={this.handleSecurityOption}
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
                    <UiTable thead={securityHeaders} tbodyData={securityRows}/>
                  </Tab>
                </Tabs>
              </section>
            </div>
          </Row>
        </section>

        <ModalCard title='Purchase bond' visibility={purchaseBondModalVisibility}
          onSubmit={this.purchaseBond} onHide={this.handlePurchaseBondModalHide} modalSize='xs'>
          {loading ? <Loader/> : ''}

          <Form>
            <Row className="align-items-center">
              <Col xs={12} className="marginTop10">
                <Currency placeholderText='Currency to pay' type={CurrencyType.CASH}
                  onChange={this.handlePurchaseBondCurrencyChange}/>
              </Col>
              <Col xs={12}>
                <TextInput
                  placeholder="Amount to pay"
                  fieldType="text"
                  value={purchaseBondAmount}
                  name={'purchaseBondAmount'}
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
          </Form>
        </ModalCard>
      </>
    );
  }
}

export default Invest;
