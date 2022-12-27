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
import PreTradeContractService from '../../../sources/contracts/PreTradeContractService';

const registrationRequestHeader = [
  {label: 'User ID', val: 'requestBy'},
  {label: 'User name', val: 'requestByName'},
  {label: 'Instrument', val: 'instrumentType'},
  {label: 'ISIN', val: 'isin'},
  {label: 'Face value', val: 'faceValue'},
  {label: 'Certificates', val: 'noOfCertificates'},
  {label: 'Lock in reason', val: 'lockInReason'},
  {label: 'Lock in release date', val: 'lockInReleaseDate'},
  {label: 'Status', val: 'approvalStatus'},
  {label: 'Action', val: 'action'},
];

class SecondaryIssueRequests extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      registrationRequestData: [],
    };
  }

  componentDidMount = () => {
    this.loadRegistrationRequestData();
  }

  handleRegistrationRequestOption = (selected) => {
    const CONFIRM_OPTION = '0';
    const REJECT_OPTION = '1';

    const {index, requestBy, ref} = selected;

    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const preTradeContractService = new PreTradeContractService(password);

      let action = null;

      if (index === CONFIRM_OPTION) {
        action = () => preTradeContractService.confirmSecurity(requestBy, ref);
      } else if (index === REJECT_OPTION) {
        action = () => preTradeContractService.declineSecurity(requestBy, ref);
      }

      action()
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
  }

  loadRegistrationRequestData = () => {
    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const preTradeContractService = new PreTradeContractService(password);

      preTradeContractService.getSecuritiesRequests()
        .then((requests) => {
          const requestRows = requests.map((element, id) => {
            element.id = id;

            element.action = element.approvalStatus === 'Pending' ? (
              <Tabledropdown dataObject={element}
                tableDropdownClass="tableDropDodownStyle"
                tableDropdownList={['Confirm', 'Reject']}
                onSelect={this.handleRegistrationRequestOption}
              />) : '';

            return element;
          });

          this.setState({registrationRequestData: requestRows});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading registration requests ' + error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  render() {
    const {loading, registrationRequestData} = this.state;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <div>
          <section>
            <Row className="d-flex dropdwnbtns">
              <Col lg={5} sm={4} xs={12}>
                <h1>Secondary issue requests</h1>
              </Col>
            </Row>
          </section>
          <section id="requestsTable">
            <UiTable thead={registrationRequestHeader} tbodyData={registrationRequestData}/>
          </section>
        </div>
      </div>
    );
  }
}

export default withRouter(SecondaryIssueRequests);
