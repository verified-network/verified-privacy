import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import Tabledropdown from '../../ui/tableDropdown/TableDropdown';
import notifier from 'components/ui/notifier';
import '../../../styles/css/organization.less';
import '../../../styles/less/TablewithTabs.less';
import '../../../styles/css/request.less';
import '../../ui/Search/search.less';
import Loader from '../../ui/Loader';
import {withRouter} from 'react-router-dom';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import {MESSAGES} from '../../../sources/messages.js';
import {SettlementStatus} from '../../../sources/contracts/PostTradeContractService';
import ProductContractService from '../../../sources/contracts/ProductContractService';

const RequestTabs = {
  ISSUE_REQUESTS: 'issue_requests',
  APPROVAL_REQUESTS: 'approval_requests',
  REGISTRATION_REQUESTS: 'registration_requests',
  TRANSFER_REQUESTS: 'transfer_requests',
  PRODUCT_REQUESTS: 'product_requests',
};

const productRequestHeader = [
  {label: 'Category', val: 'productCategory', sort: true},
  {label: 'Issue', val: 'issue', sort: true},
  {label: 'Issuer', val: 'issuer', sort: true},
  {label: 'Issuer', val: 'issuerData'},
  {label: 'Arranger', val: 'arrangerData'},
  {label: 'Documents', val: 'registrationDocumentsLink'},
  {label: 'Status', val: 'status', sort: true},
  {label: 'Action', val: 'action'},
];

class PrimaryIssueRequests extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      productRequestData: [],
    };
  }

  componentDidMount = () => {
    this.loadProductRequestData();
  }

  handleProductRequestOption = (selected) => {
    const CONFIRM_OPTION = '0';

    const {index, ref} = selected;

    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const productContractService = new ProductContractService(password);

      if (index === CONFIRM_OPTION) {
        productContractService.confirmProduct(ref)
          .then(() => {
            notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
          })
          .catch((error) => {
            notifier.error('Error', error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
      }
    });
  }

  loadProductRequestData = () => {
    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const productContract = new ProductContractService(password);

      productContract.getProductsByCountry()
        .then((requests) => {
          const requestRows = requests.map((element, id) => {
            element.id = id;

            element.issuerData = (
              <div className='d-flex flex-column align-items-start'>
                <p>Name: {element.issuerName}</p>
                <p>Address: {element.issuerAddress}</p>
                <p>Country: {element.issuerCountry}</p>
                <p>Email: {element.issuerSignatoryEmail}</p>
              </div>
            );

            element.arrangerData = (
              <div className='d-flex flex-column align-items-start'>
                <p>Name: {element.arrangerName}</p>
                <p>Address: {element.arrangerAddress}</p>
                <p>Country: {element.arrangerCountry}</p>
                <p>Email: {element.arrangerSignatoryEmail}</p>
              </div>
            );

            element.registrationDocumentsLink = this.renderFileElement(element.registrationDocuments, 'link');

            element.action = (element.status === SettlementStatus.PENDING) ? (
              <Tabledropdown dataObject={element}
                tableDropdownClass="tableDropDodownStyle"
                tableDropdownList={['Confirm']}
                onSelect={this.handleProductRequestOption}
              />) : '';

            return element;
          });

          this.setState({productRequestData: requestRows});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading products requests ' + error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  renderFileElement = (url, label) => {
    if (url) {
      return (<a href={url}>{label}</a>);
    } else {
      return null;
    }
  };

  render() {
    const {loading, productRequestData} = this.state;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <div>
          <section>
            <Row className="d-flex dropdwnbtns">
              <Col lg={5} sm={4} xs={12}>
                <h1>Primary issue requests</h1>
              </Col>
            </Row>
          </section>
          <section id="requestsTable">
            <UiTable thead={productRequestHeader} tbodyData={productRequestData}/>
          </section>
        </div>
      </div>
    );
  }
}

export {RequestTabs};

export default withRouter(PrimaryIssueRequests);
