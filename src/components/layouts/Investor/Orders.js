import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable, {sortByIntegerValue, sortByDateValue} from '../../ui/table/Table';
import UiButton from '../../ui/button/Button';
import Tabledropdown from '../../ui/tableDropdown/TableDropdown';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import {MESSAGES} from '../../../sources/messages.js';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import OrderPoolContractService, {OrderStatus} from 'sources/contracts/OrderPoolContractService';
import {withRouter} from 'react-router-dom';

const orderHeader = [
  {label: 'ISIN', val: 'security', sort: true},
  {label: 'Party', val: 'party', sort: true},
  {label: 'Party name', val: 'partyName', sort: true},
  {label: 'Security name', val: 'securityName', sort: true},
  {label: 'Buy/Sell', val: 'order', sort: true},
  {label: 'Quantity', val: 'quantity', sort: true, sortFunc: sortByIntegerValue},
  {label: 'Type', val: 'orderType', sort: true},
  {label: 'Price', val: 'price', sort: true, sortFunc: sortByIntegerValue},
  {label: 'Currency', val: 'currency', sort: true},
  {label: 'Order time', val: 'dt', sort: true, sortFunc: sortByDateValue},
  {label: 'Status', val: 'status', sort: true},
  {label: 'Bid', val: 'bid', sort: true, sortFunc: sortByIntegerValue},
  {label: 'Ask', val: 'ask', sort: true, sortFunc: sortByIntegerValue},
  {label: 'Action', val: 'action'},
];

class Orders extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      orderData: [],
    };
  }

  componentDidMount = () => {
    this.loadOrders();
  }

  loadOrders = () => {
    return this.context.getPassword().then((password) => {
      const orderPoolContract = new OrderPoolContractService(password);

      this.setState({loading: true});

      orderPoolContract.getOrders()
          .then((orders) => {
            this.setState({orderData: orders});
          })
          .catch((error) => {
            notifier.error('Error', error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  handleOrderOption = (row) => {
    const EDIT_OPTION = '0';
    const CANCEL_OPTION = '1';

    const orderRef = row.ref;

    if (row.index === EDIT_OPTION) {
      this.editOrder(orderRef);
    } else if (row.index === CANCEL_OPTION) {
      this.cancelOrder(orderRef);
    }
  }

  cancelOrder = (orderRef) => {
    return this.context.getPassword().then((password) => {
      const orderPoolContract = new OrderPoolContractService(password);

      this.setState({loading: true});

      orderPoolContract.cancelOrder(orderRef)
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

  editOrder = (orderRef) => {
    this.props.history.push(`/investor/edit_order/${orderRef}`);
  }

  handleCreateOrder = () => {
    this.props.history.push('/investor/create_order');
  }

  render() {
    const {loading, orderData} = this.state;

    const orderRows = orderData.map((object) => {
      object.action = (
        object.status === OrderStatus.OPEN ? (
          <Tabledropdown
            tableDropdownClass="tableDropDodownStyle"
            tableDropdownList={['Edit', 'Cancel']}
            dataObject={object}
            onSelect={this.handleOrderOption}
          />
        ) : ''
      );

      return object;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <>
          <section id="orders">
            <Row>
              <Col lg={6} sm={12} xs={12} className="d-flex justify-content-start">
                <h1 className="pageHeading">Orders</h1>
              </Col>
              <Col lg={6} sm={12} xs={12} md={3} className="d-flex justify-content-end">
                <UiButton buttonText="Create order" buttonClass="SignUpButton managerBtn"
                  buttonVariant="primary" onClick={this.handleCreateOrder}
                />
              </Col>
            </Row>
          </section>
          <section id="ordersData">
            <div className="marginTop20">
              <UiTable thead={orderHeader} tbodyData={orderRows}/>
            </div>
          </section>
        </>
      </div>
    );
  }
}

export default withRouter(Orders);
