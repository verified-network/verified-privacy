import React, {Component} from 'react';
import {Form, Col, Row} from 'react-bootstrap';
import '../../../styles/typo.css';
import TextInput from '../../ui/textinput/TextInput';
import ModalCard from 'components/ui/card/ModalCard';
import PasswordStore from 'components/layouts/Common/PasswordStore';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import ProductContractService, {AllotmentStatus} from 'sources/contracts/ProductContractService';

class AllotIssue extends Component {
  static contextType = PasswordStore;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      allotmentStatus: '',
      amount: '',
    };
  }

  handleSubmit = () => {
    const {investor} = this.props;
    const {allotmentStatus, amount} = this.state;

    const issueAddress = investor.address;
    const platform = investor.platform;
    const pool = investor.poolid;
    const investorAddress = investor.investorAddress;
    const asset = investor.assetAddress;

    return this.context.getPassword().then((password) => {
      const productContract = new ProductContractService(password);

      this.setState({loading: true});

      productContract.allotIssue(issueAddress, allotmentStatus, platform, pool, investorAddress, amount, asset)
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
      amount: '',
    });
  }

  render() {
    const {loading, amount, allotmentStatus} = this.state;
    const {modalVisibility} = this.props;

    return (
      <ModalCard title='Allot issue' visibility={modalVisibility} modalSize='md'
        onSubmit={this.handleSubmit} onHide={this.handleModalHide}>
        {loading ? <Loader/> : ''}

        <Form>
          <Row className="align-items-center">
            <Col xs={12}>
              <Form.Control
                as="select"
                placeholder="Action"
                className="textForm custom-select dropdown"
                name='allotmentStatus'
                onChange={this.handleChange}
              >
                <option className="marginTop20" value=''>Action</option>
                <option className="marginTop20" value={AllotmentStatus.ACCEPT}>Accept</option>
                <option className="marginTop20" value={AllotmentStatus.REJECT}>Reject</option>
              </Form.Control>
            </Col>
            {}
            <Col xs={12} className="marginTop10">
              {allotmentStatus === AllotmentStatus.ACCEPT ? (
                <TextInput
                  placeholder="Amount"
                  fieldType="text"
                  value={amount}
                  name='amount'
                  onChange={this.handleChange}
                />
              ) : ''}
            </Col>
          </Row>
        </Form>
      </ModalCard>
    );
  }
}

export default AllotIssue;
