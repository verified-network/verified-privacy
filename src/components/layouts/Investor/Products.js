import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import UiTable from '../../ui/table/Table';
import UiButton from 'components/ui/button/Button';
import '../../../styles/css/organization.less';
import '../../../styles/css/order.less';
import Loader from '../../ui/Loader';
import notifier from 'components/ui/notifier';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import ProductContractService from 'sources/contracts/ProductContractService';
import {withRouter} from 'react-router-dom';

const productHeader = [
  {label: 'Category', val: 'productCategory'},
  {label: 'Issuer', val: 'issuerData'},
  {label: 'Arranger', val: 'arrangerData'},
  {label: 'Documents', val: 'registrationDocumentsLink'},
  {label: 'Status', val: 'status', sort: true},
];

class Products extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      products: [],
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

  renderFileElement = (url, label) => {
    if (url) {
      return (<a href={url}>{label}</a>);
    } else {
      return null;
    }
  };

  handleRegisterNewProduct = () => {
    this.props.history.push('/investor/register_new_product');
  }

  render() {
    const {loading, products} = this.state;

    const productRows = products.map((product) => {
      product.issuerData = (
        <div className='d-flex flex-column align-items-start'>
          <p>Name: {product.issuerName}</p>
          <p>Address: {product.issuerAddress}</p>
          <p>Country: {product.issuerCountry}</p>
          <p>Email: {product.issuerSignatoryEmail}</p>
        </div>
      );

      product.arrangerData = (
        <div className='d-flex flex-column align-items-start'>
          <p>Name: {product.arrangerName}</p>
          <p>Address: {product.arrangerAddress}</p>
          <p>Country: {product.arrangerCountry}</p>
          <p>Email: {product.arrangerSignatoryEmail}</p>
        </div>
      );

      product.registrationDocumentsLink = this.renderFileElement(product.registrationDocuments, 'link');

      return product;
    });

    return (
      <div>
        {loading ? <Loader /> : ''}
        <>
          <section id="products">
            <Row>
              <Col lg={6} sm={12} xs={12} className="d-flex justify-content-start">
                <h1 className="pageHeading">Products</h1>
              </Col>
              <Col lg={6} sm={12} xs={12} md={3} className="d-flex justify-content-end">
                <UiButton buttonText="Register new product" buttonClass="SignUpButton managerBtn"
                  buttonVariant="primary" onClick={this.handleRegisterNewProduct}
                />
              </Col>
            </Row>
          </section>
          <section id="productsData">
            <div className="marginTop20">
              <UiTable thead={productHeader} tbodyData={productRows}/>
            </div>
          </section>
        </>
      </div>
    );
  }
}

export default withRouter(Products);
