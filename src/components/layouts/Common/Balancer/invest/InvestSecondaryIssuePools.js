import React, {useState} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import BalancerSecondaryIssueManagerService from 'sources/contracts/BalancerSecondaryIssueManagerService';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';

const InvestSecondaryIssuePools = (props) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const {pool = {}} = props;

  const handleSubmit = async () => {
    try {
      const securityRegistryContract = new SecurityRegistryContractService(props.password);

      const securityDetails = await securityRegistryContract.getSecurityDetails(pool.security);

      const secondaryIssueContract = new BalancerSecondaryIssueManagerService(props.password, pool.balancerManager);

      setLoading(true);
      console.log('InvestPrimaryIssuePools Render', pool);
      secondaryIssueContract
        .issueSecondary(pool.security, pool.currency, amount, securityDetails.isin)
        .then(() => {
          notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
          handleModalHide();
        })
        .catch((e) => {
          notifier.error('Error', e.toString());
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (e) {
      notifier.error('Error', e.toString());
    }
  };


  const handleModalHide = () => {
    props.onHide();
  };

  return (
    <ModalCard title="Invest in secondary issue pool" buttonLabel="Invest" visibility={props.show} modalSize="xs" onSubmit={handleSubmit} onHide={handleModalHide}>
      {loading ? <Loader /> : ''}
      <Form>
        <Row className="align-items-center">
          <Col xs={12}>
            <TextInput
              placeholder="Currency"
              fieldType="text"
              value={pool.currency}
              name={'currency'}
              disabled
              // onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Security"
              fieldType="text"
              value={pool.security}
              name={'security'}
              disabled
              // onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Amount"
              fieldType="number"
              value={amount}
              name={'amount'}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Col>
        </Row>
      </Form>
    </ModalCard>
  );
};

export default InvestSecondaryIssuePools;
