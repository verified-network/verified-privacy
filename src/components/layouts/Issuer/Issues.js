import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService, {IssueStatus, ProductCategory} from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import Tabledropdown from 'components/ui/tableDropdown/TableDropdown';
import RegisterCorporateAction from 'components/layouts/Issuer/RegisterCorporateAction';
import IssueDetails from 'components/layouts/Issuer/IssueDetails';
import DateRangePicker from 'react-bootstrap-daterangepicker';

const issuesHeader = [
  {label: 'Type', val: 'productCategory'},
  {label: 'Issue', val: 'issueData'},
  {label: 'Price', val: 'priceData'},
  {label: 'Minimum subscription', val: 'minSubscription'},
  {label: 'Currency', val: 'currency'},
  {label: 'Credit score', val: 'creditScore'},
  {label: 'Offer docs', val: 'offeringDocumentsUrl'},
  {label: 'Payment', val: 'payment'},
  {label: 'Status', val: 'status', sort: true},
  {label: 'Action', val: 'action'},
];

class Issues extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      registerCorporateActionModalVisibility: false,
      issueDetailsModalVisibility: false,
      issues: [],
      selectedIssue: '',
    };
  }

  componentDidMount = () => {
    this.loadIssues();
  }

  loadIssues = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getIssuesForClient()
        .then((issues) => {
          this.setState({issues});
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleAction = (selected) => {
    const VIEW_INVESTORS_OPTION = '0';
    const REGISTER_CORPORATE_OPTION = '1';
    const ISSUE_DETAILS = '2';

    const {index, address} = selected;

    if (index === REGISTER_CORPORATE_OPTION) {
      this.handleRegisterCorporateActionModalOpen();
    } else if (index === VIEW_INVESTORS_OPTION) {
      this.handleViewInvestors(address);
    } else if (index === ISSUE_DETAILS) {
      this.setState({selectedIssue: address});
      this.handleIssueDetailsModalOpen();
    }
  }

  handleViewInvestors = (issueAddress) => {
    this.props.history.push(`/investor/issues/${issueAddress}`);
  }

  handleRegisterCorporateActionModalOpen = () => {
    this.setState({registerCorporateActionModalVisibility: true});
  }

  handleRegisterCorporateActionModalHide = () => {
    this.setState({registerCorporateActionModalVisibility: false});
  }

  handleIssueDetailsModalOpen = () => {
    this.setState({issueDetailsModalVisibility: true});
  }

  handleIssueDetailsModalHide = () => {
    this.setState({issueDetailsModalVisibility: false});
  }

  handlePaymentDateChange = (row, picker) => {
    return this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const date = parseInt(picker.timeStamp / 1000).toString();
      const issues = this.state.issues;
      const issueAddress = issues[row].address;

      // Force table re-render
      issues[row] = {...issues[row], paymentStatus: ''};
      this.setState({issues});

      const productContract = new ProductContractService(password);

      productContract.getPaymentStatus(issueAddress, date)
        .then((status) => {
          // Force table re-render
          issues[row] = {...issues[row], paymentStatus: status};
          this.setState({issues});
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  };

  renderFileElement = (url, label) => {
    if (url) {
      return (<a href={url}>{label}</a>);
    } else {
      return null;
    }
  };

  render() {
    const {
      loading, registerCorporateActionModalVisibility, issueDetailsModalVisibility, issues, selectedIssue,
    } = this.state;
    const investorRows = [];
    issues.map((element, index) => {
      if (!element || typeof element !== 'object') return false;
      if (element.status === IssueStatus.ALLOTTED) {
        const availableActions = ['View investors', 'Register corporate action'];

        if (element.productCategory === ProductCategory.BOND) {
          availableActions.push('Issue details');
        }

        element.action = (
          <Tabledropdown dataObject={element}
            tableDropdownClass="tableDropDodownStyle"
            tableDropdownList={availableActions}
            onSelect={this.handleAction}
          />);

        element.payment = (
          <>
            <p>{element.paymentStatus}</p>
            <DateRangePicker
              initialSettings={{
                singleDatePicker: true,
                showDropdowns: true,
              }}
              onApply={(picker) => this.handlePaymentDateChange(index, picker)}
            >
              <button className="btn btn-primary">
                Show
              </button>
            </DateRangePicker>
          </>
        );
      }

      element.issueData = (
        <div className='d-flex flex-column align-items-start'>
          <div>{element.address}</div>
          {element.status ? (
            <>
              <div>ISIN: {element.isin}</div>
              <div>Issue size: {element.issueSize}</div>
              <div>Offer type: {element.offerType}</div>
            </>
          ) : ''}
        </div>
      );

      element.priceData = element.status ? (
        <div className='d-flex flex-column align-items-start'>
          {element.coupon ? <div>Coupon: {element.coupon}</div> : ''}
          {element.faceValue ? <div>Face value: {element.faceValue}</div> : ''}

          <div>Price: {element.price}</div>
          <div>Offer price: {element.offerPrice}</div>
          <div>Min ask price: {element.minAskPrice}</div>
        </div>
      ) : '';

      element.offeringDocumentsUrl = this.renderFileElement(element.offeringDocuments, 'link');

      investorRows.push(element);
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <section id="issues">
          <Row>
            <Col xs={12} sm={12} md={6} lg={6}>
              <h1 className="pageHeading">Issues</h1>
            </Col>
          </Row>
        </section>
        <section id="productsData">
          <div className="marginTop20">
            <UiTable thead={issuesHeader} tbodyData={investorRows}/>
          </div>
        </section>

        <RegisterCorporateAction
          modalVisibility={registerCorporateActionModalVisibility}
          onModalHide = {this.handleRegisterCorporateActionModalHide}
        />

        <IssueDetails
          modalVisibility={issueDetailsModalVisibility}
          onModalHide = {this.handleIssueDetailsModalHide}
          issueAddress={selectedIssue}
        />
      </div>
    );
  }
}

export default withRouter(Issues);
