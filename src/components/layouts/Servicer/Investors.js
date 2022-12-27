import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService, {IssueStatus} from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import TableDropdown from 'components/ui/tableDropdown/TableDropdown';
import AllotIssue from 'components/layouts/Issuer/AllotIssue';
import PayoutIssue from 'components/layouts/Investor/PayoutIssue';
import IssuePayments from 'components/layouts/Investor/IssuePayments';

const investorHeader = [
  {label: 'Investor', val: 'investorData'},
  {label: 'Asset', val: 'assetData'},
  {label: 'Platform', val: 'platform'},
  {label: 'Price', val: 'price'},
  {label: 'Amount', val: 'amount'},
  {label: 'Payment', val: 'openPayments'},
  {label: 'Allotment', val: 'status'},
  {label: 'Action', val: 'action'},
];

class Investors extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      subscribers: [],
      issueAddress: '',
      issue: {},
      allotIssueModalVisibility: false,
      payoutIssueModalVisibility: false,
      paymentsModalVisibility: false,
      selectedInvestor: {},
    };
  }

  componentDidMount = () => {
    const issueAddress = this.props.match.params.issueAddress;

    this.setState({issueAddress});

    this.loadSubscribers(issueAddress);
    this.loadIssue(issueAddress);
  }

  loadIssue = (issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getIssuesForCountry()
        .then((issues) => {
          const issue = issues.find((issue) => {
            return issue.address === issueAddress;
          });

          this.setState({issue});
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  loadSubscribers = (issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getSubscribers(issueAddress)
        .then((subscribers) => {
          this.setState({subscribers});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading subscribers');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleAction = (selected) => {
    const PAYOUT = 'Payout';
    const ALLOT = 'Allot';

    const {indexLabel} = selected;

    if (indexLabel === PAYOUT) {
      if (indexLabel === PAYOUT) {
        this.setState({
          selectedInvestor: selected,
        });

        this.handlePayoutIssueModalOpen();
      }
    } else if (indexLabel === ALLOT) {
      this.setState({
        selectedInvestor: selected,
      });

      this.handleAllotIssueModalOpen();
    }
  }

  handleAllotIssueModalOpen = () => {
    this.setState({allotIssueModalVisibility: true});
  };

  handleAllotIssueModalClose = () => {
    this.setState({allotIssueModalVisibility: false});
  };

  handlePayoutIssueModalOpen = () => {
    this.setState({payoutIssueModalVisibility: true});
  };

  handlePayoutIssueModalClose = () => {
    this.setState({payoutIssueModalVisibility: false});
  };

  handlePaymentsModalOpen = () => {
    this.setState({paymentsModalVisibility: true});
  };

  handlePaymentsModalClose = () => {
    this.setState({paymentsModalVisibility: false});
  };

  render() {
    const {
      loading, subscribers, issue, allotIssueModalVisibility, payoutIssueModalVisibility, selectedInvestor,
      paymentsModalVisibility,
    } = this.state;

    const rows = subscribers.map((element) => {
      element.investorData = (
        <div className='d-flex flex-column align-items-start'>
          <div>{element.investorAddress}</div>
          <div>{element.investorName}</div>
        </div>
      );

      element.assetData = (
        <div className='d-flex flex-column align-items-start'>
          <div>{element.assetAddress}</div>
          {/* <div>{element.assetName}</div>*/}
        </div>
      );

      const availableActions = [];

      if (issue.status === IssueStatus.CLOSED) {
        availableActions.push('Allot');
      }

      if (issue.status === IssueStatus.ALLOTTED) {
        availableActions.push('Payout');

        element.openPayments = (
          <button className="btn btn-primary" onClick={this.handlePaymentsModalOpen}>
            Status
          </button>
        );
      }

      element.action = (element.status !== '') ? (
        <TableDropdown dataObject={element}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={availableActions}
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

        <AllotIssue
          modalVisibility={allotIssueModalVisibility}
          onModalHide={this.handleAllotIssueModalClose}
          issue={issue}
        />

        <PayoutIssue
          modalVisibility={payoutIssueModalVisibility}
          onModalHide={this.handlePayoutIssueModalClose}
          investorAddress ={selectedInvestor.investorAddress}
          issueAddress = {issue.address}
        />

        {issue.address && paymentsModalVisibility ? (
          <IssuePayments
            modalVisibility={paymentsModalVisibility}
            onModalHide={this.handlePaymentsModalClose()}
            investorAddress ={selectedInvestor.investorAddress}
            issueAddress = {issue.address}
          />
        ) : ''}
      </div>
    );
  }
}

export default withRouter(Investors);
