import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import TableDropdown from 'components/ui/tableDropdown/TableDropdown';
import PayoutIssue from 'components/layouts/Investor/PayoutIssue';

const investorHeader = [
  {label: 'Beneficiary', val: 'beneficiaryAddress'},
  {label: 'Name', val: 'beneficiaryName'},
  {label: 'Currency', val: 'currency'},
  {label: 'Amount', val: 'amount'},
  {label: 'Payer', val: 'payer'},
  {label: 'Action', val: 'action'},
];

class Investors extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      beneficiaries: [],
      issueAddress: '',
      selectedInvestorAddress: '',
      payoutIssueModalVisibility: false,
    };
  }

  componentDidMount = () => {
    const issueAddress = this.props.match.params.issueAddress;

    this.setState({issueAddress});

    this.loadBeneficiaries(issueAddress);
  }

  loadBeneficiaries = (issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getBeneficiaries(issueAddress)
          .then((beneficiaries) => {
            this.setState({beneficiaries});
          })
          .catch((error) => {
            notifier.error('Error', 'Error loading beneficiaries');
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleAction = (selected) => {
    const PAYOUT = '0';

    const {index, beneficiaryAddress} = selected;

    if (index === PAYOUT) {
      this.setState({
        selectedInvestorAddress: beneficiaryAddress,
      });

      this.handlePayoutIssueModalOpen();
    }
  }

  handlePayoutIssueModalOpen = () => {
    this.setState({payoutIssueModalVisibility: true});
  };

  handlePayoutIssueModalClose = () => {
    this.setState({payoutIssueModalVisibility: false});
  };

  render() {
    const {loading, beneficiaries, payoutIssueModalVisibility, selectedInvestorAddress, issueAddress} = this.state;

    const rows = beneficiaries.map((element) => {
      element.action = (element.status !== '') ? (
            <TableDropdown dataObject={element}
              tableDropdownClass="tableDropDodownStyle"
              tableDropdownList={['Payout']}
              onSelect={this.handleAction}
            />) : '';

      return element;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <section id="investors">
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h1 className="pageHeading">Investors</h1>
            </Col>
          </Row>
        </section>
        <section id="productsData">
          <div className="marginTop20">
            <UiTable thead={investorHeader} tbodyData={rows}/>
          </div>
        </section>

        <PayoutIssue
          modalVisibility={payoutIssueModalVisibility}
          onModalHide={this.handlePayoutIssueModalClose}
          investorAddress ={selectedInvestorAddress}
          issueAddress = {issueAddress}
        />
      </div>
    );
  }
}

export default withRouter(Investors);
