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

const issuesHeader = [
  {label: 'Issue', val: 'productCategory'},
  {label: 'Price', val: 'issuerData'},
  {label: 'Minimum', val: 'arrangerData'},
  {label: 'Currency', val: '-'},
  {label: 'Credit score', val: '-'},
  {label: 'Offer docs', val: '-'},
  {label: 'Issue', val: '-'},
  {label: 'Payment', val: '-'},
  {label: 'Status', val: '-', sort: true},
  {label: 'Action', val: '-'},
];

class ServiceAssets extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      issues: [],
    };
  }

  componentDidMount = () => {
    this.loadProducts();
  }

  loadProducts = () => {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.getProducts()
          .then((products) => {
            this.setState({products});
          })
          .catch((error) => {
            notifier.error('Error', error.toString());
          })
          .finally(() => {
            this.setState({loading: false});
          });
    });
  }

  render() {
    const {loading, issues} = this.state;

    const productRows = issues.map((element) => {
      element.action = (element.status !== '') ? (
            <Tabledropdown dataObject={element}
              tableDropdownClass="tableDropDodownStyle"
              tableDropdownList={['Confirm']}
              onSelect={this.handle}
            />) : '';

      return element;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <>
          <section id="products">
            <Row>
              <Col xs={12} sm={12} md={6} lg={6}>
                <h1 className="pageHeading">Service assets</h1>
              </Col>
            </Row>
          </section>
          <section id="productsData">
            <div className="marginTop20">
              <UiTable thead={issuesHeader} tbodyData={productRows}/>
            </div>
          </section>
        </>
      </div>
    );
  }
}

export default withRouter(ServiceAssets);
