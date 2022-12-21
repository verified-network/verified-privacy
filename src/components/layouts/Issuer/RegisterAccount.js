import React, {Component} from 'react';
import {Row, Col, Form, InputGroup, Button, Modal, Container} from 'react-bootstrap';
import PreTradeContractService from 'sources/contracts/PreTradeContractService';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import Currency, {CurrencyType} from '../../ui/currency/Currency';
import {MESSAGES} from 'sources/messages';
import UploadFormButton from 'components/ui/UploadFormButton/UploadFormButton';
import KycContractService from 'sources/contracts/KycContractService';
import AccountDocumentsSpecification from 'sources/AccountDocumentsSpecification.json';
import UiButton from 'components/ui/button/Button';

class RegisterAccount extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      currency: '',
      userCountry: '',
      investorType: '',
      registrationDocuments: '',
      requiredDocumentsModalVisibility: false,
    };
  }

  componentDidMount() {
    this.loadUserCountry();
  }

  loadUserCountry = () => {
    this.context.getPassword().then((password) => {
      this.setState({loading: true});

      const kycContract = new KycContractService(password);

      kycContract.getCountry()
        .then((country) => {
          this.setState({userCountry: country});
        })
        .finally(() => {
          this.setState({loading: false});
        });
    });
  }

  handleSubmit = () => {
    this.context.getPassword().then((password) => {
      const {currency, registrationDocumentsFile} = this.state;

      this.setState({loading: true});

      const preTradeContractService = new PreTradeContractService(password);

      preTradeContractService.registerDematAccount(currency.name, registrationDocumentsFile)
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

  findDocuments = (country, investorType) => {
    let countrySpecification = (AccountDocumentsSpecification.find((element) => (element.code === country)));

    if (!countrySpecification) {
      countrySpecification = (AccountDocumentsSpecification.find((element) => (element.code === 'DEFAULT')));
    }

    return countrySpecification.account.find((element) => (element.category === investorType));
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
    const {userCountry, investorType, requiredDocumentsModalVisibility} = this.state;

    if (!userCountry || !investorType) {
      return '';
    }

    const specification = this.findDocuments(userCountry, investorType);

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

  handleCurrencyChange = (currency) => {
    this.setState({currency});
  }

  handleModalHide = () => {
    this.resetInputs();
    this.props.onModalHide();
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
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

  handleRequiredDocumentsModalOpen = () => {
    const {investorType} = this.state;

    if (investorType) {
      this.setState({requiredDocumentsModalVisibility: true});
    } else {
      notifier.error('Error', 'Please, select investor type first.');
    }
  };

  handleRequiredDocumentsModalClose = () => {
    this.setState({requiredDocumentsModalVisibility: false});
  };

  resetInputs = () => {
    this.setState({
      currency: '',
      investorType: '',
    });
  }

  render() {
    const {loading, registrationDocuments} = this.state;

    return (
      <div>
        {loading ? <Loader/> : ''}
        <Container>
          <Row>
            <Col lg={{span: 6, offset: 3}} xs={12} sm={12}>
              <h1 className="text-center marginTop20">Register account</h1>
              <p className="marginTop20">Please fill in the details below</p>
            </Col>
          </Row>
          <Form>
            <Row className="align-items-center">
              <Col lg={{span: 6, offset: 3}} xs={12} className="marginTop20">
                <Currency placeholderText='Currency' type={CurrencyType.CASH}
                  onChange={this.handleCurrencyChange}/>
              </Col>

              <Col lg={{span: 6, offset: 3}} xs={12} className="marginTop20">
                <Form.Control
                  as="select"
                  placeholder="Investor type"
                  className="textForm custom-select dropdown"
                  name='investorType'
                  onChange={this.handleChange}
                >
                  <option className="marginTop20" value="" disabled='disabled' selected='selected'>
                    Investor type
                  </option>
                  <option value="Retail investor">Retail investor</option>
                  <option value="Professional investor">Professional investor</option>
                  <option value="Business">Business</option>
                </Form.Control>
              </Col>

              <Col className="marginTop20" lg={{span: 6, offset: 3}} xs={12}>
                <InputGroup className="d-flex flex-nowrap">
                  <UploadFormButton placeholderText="Registration documents" value={registrationDocuments}
                    accept="application/zip"
                    onChange={(event) => this.handleAttachmentChange('registrationDocuments', event)}
                  />
                  <Button variant="outline-info" onClick={this.handleRequiredDocumentsModalOpen}>?</Button>
                </InputGroup>
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
          </Form>
        </Container>

        {this.renderRequiredDocumentsModal()}
      </div>
    );
  }
}

export default RegisterAccount;
