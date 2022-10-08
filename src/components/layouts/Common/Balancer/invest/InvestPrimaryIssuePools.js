import React, {useState} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import BalancerPrimaryIssueManagerService from 'sources/contracts/BalancerPrimaryIssueManagerService';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';

const InvestPrimaryIssuePools = (props) => {
  const [loading, setLoading] = useState(false);
  const [tokenAddresses, setTokenAddresses] = useState(props.pool.tokenAddresses);
  const [offered, setOffered] = useState('');
  const [desired, setDesired] = useState('');
  const [min, setMin] = useState('');

  const {pool = {}} = props;

  const handleSubmit = async () => {
    try {
      const securityRegistryContract = new SecurityRegistryContractService(props.password);

      const securityDetails = await securityRegistryContract.getSecurityDetails(pool.security);

      const primaryIssueContract = new BalancerPrimaryIssueManagerService(props.password, pool.balancerManager);

      setLoading(true);
      primaryIssueContract
        .offer(pool.currency, securityDetails.isin, offered, pool.security, desired, min)
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

  console.log('Invest Render', tokenAddresses, props);

  const handleModalHide = () => {
    props.onHide();
  };

  return (
    <ModalCard
      title="Invest in primary issue pool"
      buttonLabel="Invest"
      visibility={props.show}
      modalSize="xs"
      onSubmit={handleSubmit}
      onHide={handleModalHide}>
      {loading ? <Loader /> : ''}
      <Form>
        <Row className="align-items-center">
          <Col xs={12}>
            <TextInput
              placeholder="currency"
              fieldType="text"
              value={props.currency}
              name={'currency'}
              disabled
              // onChange={(e) => setOffered(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Offered"
              fieldType="number"
              value={offered}
              name={'offered'}
              onChange={(e) => setOffered(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Tomatch"
              fieldType="text"
              value={props.security}
              name={'tomatch'}
              disabled
              // onChange={(e) => setTomatch(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Desired"
              fieldType="number"
              value={desired}
              name={'desired'}
              onChange={(e) => setDesired(e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <TextInput
              placeholder="Min"
              fieldType="number"
              value={min}
              name={'min'}
              onChange={(e) => setMin(e.target.value)}
            />
          </Col>
        </Row>
      </Form>
    </ModalCard>
  );
};

export default InvestPrimaryIssuePools;
