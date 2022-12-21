import React, {Component} from 'react';
import {Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import VerticallyModal from 'components/ui/modal/VerticallyModal';
import UiButton from 'components/ui/button/Button';
import ProductContractService from 'sources/contracts/ProductContractService';

class ProductDetails extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      details: {},
    };
  }

  componentDidMount() {
    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      const {ownedAddress} = this.props;

      if (!ownedAddress) {
        return;
      }

      productContract.productDetails(ownedAddress)
        .then((details) => {
          this.setState({details});
        })
        .catch((error) => {
          notifier.error('Error loading product details.');
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value});
  };

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  resetInputs = () => {
    this.setState({
      loading: false,
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
    const {loading, details} = this.state;
    const {modalVisibility, ownedAddress} = this.props;

    return (
      <VerticallyModal
        key={`product-${ownedAddress}`}
        showModal={modalVisibility}
        modalOnHide={this.handleModalHide}
        modalSize={'lg'}
        modalHeading={<h3>Product details</h3>}
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
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Product ref: {details['ref']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Product category: {details['productCategory']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer name: {details['issuerName']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer address: {details['issuerAddress']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer country: {details['issuerCountry']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer signatory email: {details['issuerSignatoryEmail']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Arranger name: {details['arrangerName']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Arranger address: {details['arrangerAddress']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Arranger country: {details['arrangerCountry']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Arranger signatory email: {details['arrangerSignatoryEmail']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issue: {details['issue']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer: {details['issuer']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Status: {details['status']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Issuer registration certificate: {details['issuerRegistrationCertificate']}
          </Col>
        </Row>
        <Row>
          <Col sm='6' style={{'text-align': 'left'}}>
            Arranger registration certificate: {details['arrangerRegistrationCertificate']}
          </Col>
          <Col sm='6' style={{'text-align': 'left'}}>
            Registration documents: {this.renderFileElement(details['registrationDocuments'], 'open')}
          </Col>
        </Row>
      </VerticallyModal>
    );
  }
}

export default ProductDetails;
