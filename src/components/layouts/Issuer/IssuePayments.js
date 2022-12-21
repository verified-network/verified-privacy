import React, {Component} from 'react';
import UiTable from '../../ui/table/Table';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';

const tableHeader = [
  {label: 'Currency', val: 'currency'},
  {label: 'Amount', val: 'amount'},
  {label: 'Payout date', val: 'date'},
  {label: 'Payer', val: 'payer'},
];

class IssuePayments extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      payments: [],
    };
  }

  componentDidMount = () => {
    const investorAddress = this.props.investorAddress;
    const issueAddress = this.props.issueAddress;
    this.loadPaymentsFor(investorAddress, issueAddress);
  }

  loadPaymentsFor = (investorAddress, issueAddress) => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getPaymentStatusFor(issueAddress, investorAddress)
        .then((payments) => {
          this.setState({payments});
        })
        .catch((error) => {
          notifier.error('Error', 'Error loading payments.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleModalHide = () => {
    this.props.onModalHide();
  }

  render() {
    const {issueAddress, investorAddress, modalVisibility} = this.props;
    const {loading, payments} = this.state;

    return (
      <VerticallyModal
        key={`issue-${issueAddress}-${investorAddress}`}
        showModal={modalVisibility}
        modalOnHide={this.handleModalHide}
        modalSize={'md'}
        modalHeading={<h3>Payments</h3>}
        modalButton01={
          <UiButton
            buttonVariant="primary"
            buttonClass="SignUpButton"
            buttonText="Close"
            type="submit"
            onClick={this.handleModalHide}
          />
        }
      >
        {loading ? <Loader/> : ''}
        <UiTable thead={tableHeader} tbodyData={payments}/>
      </VerticallyModal>
    );
  }
}

export default withRouter(IssuePayments);
