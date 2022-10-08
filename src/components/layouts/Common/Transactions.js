import React, {Component} from 'react';
import UiTable from '../../ui/table/Table';
import 'styles/less/TablewithTabs.less';
import '../../ui/Search/search.less';
import PasswordStore from 'components/layouts/Common/PasswordStore';
require('normalize.css/normalize.css');
require('styles/App.css');

class UserTransaction extends Component {
  static contextType = PasswordStore;

  render() {
    const {transactionData} = this.props;

    const transactionHeaders = [
      {label: 'Tx. Date', val: 'date'},
      {label: 'Type', val: 'type'},
      {label: 'Party', val: 'partyName'},
      {label: 'Amount', val: 'amount'},
      {label: 'Voucher', val: 'voucher'},
      {label: 'Description', val: 'description'},
    ];

    return (
      <>
        <div className='w-100'>
          <section id="transactionTable">
            <UiTable thead={transactionHeaders} tbodyData={transactionData}/>
          </section>
        </div>
      </>
    );
  }
}

export default UserTransaction;
