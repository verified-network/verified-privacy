import React, {Component} from 'react';
import {Col, Form, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService, {IssueStatus, ProductCategory} from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import Tabledropdown from 'components/ui/tableDropdown/TableDropdown';
import {MESSAGES} from 'sources/messages';
import IssueDetails from 'components/layouts/Investor/IssueDetails';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import IssueTerms from 'components/layouts/Issuer/IssueTerms';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import CorporateActions from 'components/layouts/Issuer/CorporateActions';

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
      issueTermsModalVisibility: false,
      issueDetailsModalVisibility: false,
      corporateActionsModalVisibility: false,
      startIssueModalVisibility: false,
      issues: [],
      selectedIssue: '',
      cutOffTime: '',
    };
  }

  componentDidMount = () => {
    this.loadIssues();
  };

  loadIssues = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getIssuesForCountry()
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
  };

  handleAction = (selected) => {
    const ISSUE_TERMS = 'Issue terms';
    const ASK_OFFERS_ON_EXCHANGES = 'Ask offers on exchanges';
    const START_ISSUE = 'Start issue';
    const VIEW_CORPORATE_ACTIONS = 'View corporate actions';
    const VIEW_SUBSCRIBERS = 'View subscribers';
    const ISSUE_DETAILS = 'Issue details';
    const SETTLE = 'Settle issue';

    const {indexLabel, address} = selected;

    if (indexLabel === ISSUE_TERMS) {
      this.setState({selectedIssue: selected});
      this.handleIssueTermsModalOpen();
    } else if (indexLabel === ASK_OFFERS_ON_EXCHANGES) {
      this.askOffers(address);
    } else if (indexLabel === START_ISSUE) {
      this.setState({selectedIssue: selected});
      this.handleStartIssueModalOpen();
    } else if (indexLabel === VIEW_CORPORATE_ACTIONS) {
      this.setState({selectedIssue: selected});
      this.handleCorporateActionsModalOpen();
    } else if (indexLabel === VIEW_SUBSCRIBERS) {
      this.handleViewSubscribers(address);
    } else if (indexLabel === ISSUE_DETAILS) {
      this.setState({selectedIssue: address});
      this.handleIssueDetailsModalOpen();
    } else if (indexLabel === SETTLE) {
      this.handleSettlement(address);
    }
  };

  askOffers = (issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.askOffers(issueAddress)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  };

  startIssue = () => {
    return this.context.getPassword().then((password) => {
      const {selectedIssue, cutOffTime} = this.state;

      const cutOffTimeTimestamp = Math.floor((new Date(cutOffTime)).getTime() / 1000).toString();

      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.startIssue(selectedIssue.address, cutOffTimeTimestamp)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
          this.handleStartIssueModalHide();
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  };

  handleSettlement = (issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.settle(issueAddress)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  };

  handleViewSubscribers = (issueAddress) => {
    this.props.history.push(`/issuer/issues/${issueAddress}`);
  }

  handleIssueTermsModalOpen = () => {
    this.setState({issueTermsModalVisibility: true});
  };

  handleIssueTermsModalHide = () => {
    this.setState({issueTermsModalVisibility: false});
  };

  handleStartIssueModalOpen = () => {
    this.setState({startIssueModalVisibility: true});
  };

  handleStartIssueModalHide = () => {
    this.setState({startIssueModalVisibility: false});
  };

  handleIssueDetailsModalOpen = () => {
    this.setState({issueDetailsModalVisibility: true});
  };

  handleIssueDetailsModalHide = () => {
    this.setState({issueDetailsModalVisibility: false});
  };

  handleCorporateActionsModalOpen = () => {
    this.setState({corporateActionsModalVisibility: true});
  };

  handleCorporateActionsModalClose = () => {
    this.setState({corporateActionsModalVisibility: false});
  };

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

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  };

  render() {
    const {
      loading, issueTermsModalVisibility, startIssueModalVisibility, issues, selectedIssue, cutOffTime,
      corporateActionsModalVisibility, issueDetailsModalVisibility,
    } = this.state;

    const investorRows = issues.map((element, index) => {
      const availableActions = [];

      if (!element.status) {
        availableActions.push('Issue terms');
      }

      if (element.status === IssueStatus.ISSUED) {
        availableActions.push('Ask offers on exchanges');
      }

      if (element.status === IssueStatus.OFFERED) {
        availableActions.push('Start issue');
      }

      if (element.status === IssueStatus.STARTED || element.status === IssueStatus.ALLOTTED) {
        availableActions.push('View subscribers');
      }

      if (element.status === IssueStatus.ALLOTTED) {
        availableActions.push('Settle issue');
      }

      if (element.productCategory === ProductCategory.BOND) {
        availableActions.push('Issue details');
      }

      if (element.status === IssueStatus.ALLOTTED) {
        availableActions.push('View corporate actions');

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

      element.action = (
        <Tabledropdown dataObject={element}
          tableDropdownClass="tableDropDodownStyle"
          tableDropdownList={availableActions}
          onSelect={this.handleAction}
        />);

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

      return element;
    });

    return (
      <div>
        {loading ? <Loader/> : ''}
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

        {issueTermsModalVisibility ? (
          <IssueTerms
            modalVisibility={issueTermsModalVisibility}
            onModalHide={this.handleIssueTermsModalHide}
            issue={selectedIssue}
          />
        ) : ''}

        <IssueDetails
          modalVisibility={issueDetailsModalVisibility}
          onModalHide = {this.handleIssueDetailsModalHide}
          issueAddress={selectedIssue}
        />

        {corporateActionsModalVisibility ? (
          <CorporateActions
            modalVisibility={corporateActionsModalVisibility}
            onModalHide={this.handleCorporateActionsModalClose}
            issue={selectedIssue}
          />) : ''}

        <ModalCard title='Start issue' visibility={startIssueModalVisibility} modalSize='md'
          onSubmit={this.startIssue} onHide={this.handleStartIssueModalHide}>
          <Form>
            <Row className='justify-content-center'>
              <Col xs={10}>
                <TextInput
                  placeholder="Cut off time"
                  fieldType="datetime-local"
                  value={cutOffTime}
                  name='cutOffTime'
                  onChange={this.handleChange}
                />
              </Col>
            </Row>
          </Form>
        </ModalCard>
      </div>
    );
  }
}

export default withRouter(Issues);
