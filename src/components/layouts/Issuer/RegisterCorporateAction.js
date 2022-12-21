import React, {Component} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from '../../../sources/messages.js';
import CorporateActionsSpecification from 'sources/CorporateActionsSpecification.json';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';

class RegisterCorporateAction extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      isin: '',
      category: '',
      action: '',
    };
  }

  handleSubmit = () => {
    const {isin, category, action} = this.state;

    return this.context.getPassword().then((password) => {
      const securityRegistry = new SecurityRegistryContractService(password);

      this.setState({loading: true});

      securityRegistry.registerCorporateAction(category, action, isin)
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
      isin: '',
      category: '',
      action: '',
    });
  }

  categories = () => {
    return CorporateActionsSpecification.map((element) => element.category);
  }

  actions = () => {
    const {category} = this.state;

    if (!category) {
      return [];
    }

    const element = CorporateActionsSpecification.find(
      (element) => element.category === category
    );

    return element.sub_categories;
  }

  render() {
    const {loading, isin} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Register corporate action' visibility={modalVisibility}
        onSubmit={this.handleSubmit} onHide={this.handleModalHide}>
        {loading ? <Loader/> : ''}

        <Form>
          <Row className="align-items-center">
            <Col lg={12} md={12} xs={12} sm={12}>
              <Form.Control
                as="select"
                placeholder="Category"
                className="textForm custom-select dropdown"
                name='category'
                onChange={this.handleChange}
              >
                <option className="marginTop20" value="">Category</option>

                {this.categories().map((category) => (
                  <option value={category}>{category}</option>
                ))}
              </Form.Control>
            </Col>
            <Col lg={6} md={6} xs={12} sm={12}>
              <Form.Control
                as="select"
                placeholder="Action"
                className="textForm custom-select dropdown"
                name='action'
                onChange={this.handleChange}
              >
                <option className="marginTop20" value="">Action</option>

                {this.actions().map((action) => (
                  <option value={action}>{action}</option>
                ))}
              </Form.Control>
            </Col>
            <Col lg={6} xs={12} md={6} sm={12} className="marginTop10">
              <TextInput
                placeholder="ISIN"
                fieldType="text"
                value={isin}
                name={'isin'}
                onChange={this.handleChange}
              />
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}
export default RegisterCorporateAction;
