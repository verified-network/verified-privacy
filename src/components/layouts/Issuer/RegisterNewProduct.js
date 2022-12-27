import 'react-picky/dist/picky.css';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import React, {Component} from 'react';
import UploadFormButton from 'components/ui/UploadFormButton/UploadFormButton';
import {MESSAGES} from 'sources/messages';
import {Form, Col, Row, Container, InputGroup, Button, Modal} from 'react-bootstrap';
import notifier from 'components/ui/notifier';
import KycDocumentsSpecification from 'sources/KycDocumentsSpecification.json';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import UiButton from '../../ui/button/Button';
import Country from 'components/ui/country/Country';
import Loader from 'components/ui/Loader';
//import ProductContractService from '../../../sources/contracts/ProductContractService';
import {withTranslation} from 'react-i18next';

const DEFAULT_USER_TYPE = 'business';

class RegisterNewProduct extends Component {
  static contextType = PasswordStore;

  constructor() {
    super();

    this.state = {
      loading: false,
      productCategory: '',
      registrationDocuments: '',
      requiredDocumentsModalVisibility: false,
      issuerName: '',
      issuerAddress: '',
      issuerEmail: '',
      issuerCountry: '',
      arrangerName: '',
      arrangerAddress: '',
      arrangerEmail: '',
      arrangerCountry: '',
    };
  }

  handleSubmit = () => {
    const {
      issuerName, issuerAddress, issuerEmail, issuerCountry, arrangerName, arrangerAddress,
      arrangerEmail, arrangerCountry, productCategory, registrationDocumentsFile,
    } = this.state;

    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      /*const productContract = new ProductContractService(password);

      productContract
        .createProduct( productCategory, issuerName, issuerAddress, issuerCountry, issuerEmail,
          arrangerName, arrangerAddress, arrangerCountry, arrangerEmail, registrationDocumentsFile
        )
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
        })
        .catch((error) => {
          notifier.error('Error', error.toString());
        })
        .finally(() => {
          this.setState({loading: false});
        });*/
    });
  }

  handleAttachmentChange = (key, event) => {
    const file = event.currentTarget.files[0];
    const acceptType = event.currentTarget.accept;

    if (file.type.match(acceptType)) {
      this.setState({
        [key]: file.name,
        [key + 'File']: file,
      });
    } else {
      notifier.error('Error', 'Wrong file format, please try again');
    }
  };

  handleIssuerCountryChange = (country) => {
    this.setState({issuerCountry: country.code});
  }

  handleArrangerCountryChange = (country) => {
    this.setState({arrangerCountry: country.code});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleRequiredDocumentsModalClose = () => {
    this.setState({requiredDocumentsModalVisibility: false});
  };

  handleRequiredDocumentsModalOpen = () => {
    const {issuerCountry} = this.state;

    if (issuerCountry) {
      this.setState({requiredDocumentsModalVisibility: true});
    } else {
      notifier.error('Error', 'Please, select issuer country first.');
    }
  };

  findDocuments = (country) => {
    let countrySpecification = (KycDocumentsSpecification.find((element) => (element.code === country)));

    if (!countrySpecification) {
      countrySpecification = (KycDocumentsSpecification.find((element) => (element.code === 'DEFAULT')));
    }

    return countrySpecification.account.find((element) => (element.category === DEFAULT_USER_TYPE));
  };

  renderDocumentsList = (documents) => {
    if (!documents || documents.length === 0) {
      return (<strong> No documents required </strong>);
    }

    return (
      <ol className="list-unstyled">
        {documents.map((element, documentIndex) => {
          return (
            <li className="mt-2" style={{'listStyle': 'decimal inside'}} key={documentIndex}>
              {element.document}
              <ol>
                {element.points && element.points.map((point, pointIndex) => {
                  return (
                    <li style={{'listStyle': 'lower-alpha inside'}} key={pointIndex}>
                      <em>{point}</em>
                    </li>
                  );
                })
                }
              </ol>
            </li>
          );
        })}
      </ol>
    );
  };

  renderRequiredDocumentsModal = () => {
    const {issuerCountry, requiredDocumentsModalVisibility} = this.state;

    if (!issuerCountry) {
      return '';
    }

    const specification = this.findDocuments(issuerCountry);

    const optionalDocuments = specification.requirements.optional;
    const compulsoryDocuments = specification.requirements.compulsory;

    return (
      <Modal show={requiredDocumentsModalVisibility} centered onHide={this.handleRequiredDocumentsModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Required documents</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-left">
          <h5>Compulsory:</h5>
          {this.renderDocumentsList(compulsoryDocuments)}

          <hr/>

          <h5>Optional:</h5>
          {this.renderDocumentsList(optionalDocuments)}
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    const t = this.props.t;

    const {
      loading, registrationDocuments, issuerName, issuerAddress, issuerEmail, arrangerName, arrangerAddress,
      arrangerEmail,
    } = this.state;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <Container>
          <Row>
            <Col lg={{span: 6, offset: 3}} xs={12} sm={12}>
              <h1 className="text-center marginTop20">Register new product</h1>
              <p className="marginTop20">Please fill in the details below</p>
            </Col>
          </Row>
          <Form>
            <Row>
              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <Form.Control
                  as="select"
                  placeholder="Product category"
                  className="textForm custom-select dropdown"
                  name='productCategory'
                  onChange={this.handleChange}
                >
                  <option className="marginTop20" value="" disabled="disabled" selected='selected'>
                    Product category
                  </option>
                  <option value="Shares">Shares</option>
                  <option value="Bond">Bond</option>
                </Form.Control>
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <InputGroup className="d-flex flex-nowrap">
                  <UploadFormButton placeholderText="Registration documents" value={registrationDocuments}
                    accept="application/zip"
                    onChange={(event) => this.handleAttachmentChange('registrationDocuments', event)}
                  />
                  <Button variant="outline-info" onClick={this.handleRequiredDocumentsModalOpen}>?</Button>
                </InputGroup>
              </Col>

              <hr class="mt-5 mb-5"/>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Issuer name"
                  fieldType="text"
                  value={issuerName}
                  name='issuerName'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <TextInput
                  placeholder="Issuer email"
                  fieldType="text"
                  value={issuerEmail}
                  name='issuerEmail'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Issuer address"
                  fieldType="text"
                  value={issuerAddress}
                  name='issuerAddress'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <Country placeholderText={t('ISSUER_COUNTRY')} onChange={this.handleIssuerCountryChange}/>
              </Col>

              <hr class="mt-5 mb-5"/>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Arranger name"
                  fieldType="text"
                  value={arrangerName}
                  name='arrangerName'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <TextInput
                  placeholder="Arranger email"
                  fieldType="text"
                  value={arrangerEmail}
                  name='arrangerEmail'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={{span: 4, offset: 2}} md={6} xs={12} sm={12}>
                <TextInput
                  placeholder="Arranger address"
                  fieldType="text"
                  value={arrangerAddress}
                  name='arrangerAddress'
                  onChange={this.handleChange}
                />
              </Col>

              <Col className="marginTop20" lg={4} xs={12} sm={12}>
                <Country placeholderText={t('ARRANGER_COUNTRY')} onChange={this.handleArrangerCountryChange}/>
              </Col>
            </Row>

            <Row>
              <Col
                lg={{span: 4, offset: 4}}
                md={{span: 6, offset: 3}}
                xs={{span: 10, offset: 1}}
                sm={{span: 10, offset: 1}}
                className="d-flex justify-content-center align-items-center marginTop20"
              >
                <UiButton
                  buttonText="Submit"
                  buttonClass="SignUpButton"
                  buttonVariant="primary"
                  onClick={this.handleSubmit}
                />
              </Col>
            </Row>

            {this.renderRequiredDocumentsModal()}
          </Form>
        </Container>
      </div>
    );
  }
}

export default withTranslation()(RegisterNewProduct);
