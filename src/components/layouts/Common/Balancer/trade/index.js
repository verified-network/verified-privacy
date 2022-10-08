import React, {useState} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import Loader from 'components/ui/Loader';
import {kyberSwap} from './kyberSwap';

const TradePoolModal = (props) => {
  const [loading, setLoading] = useState(false);
  const [tokenInAmount, setTokenInAmount] = useState('');
  const [tokenOutAmount, setTokenOutAmount] = useState('');

  const tokens = props.pool ? props.pool.tokens || [] : [];

  const onConfirmTrade = async () => {
    if (props.pool.isKyber) {
      kyberSwap(props.pool, props.password);
      return;
    }
  };

  const handleModalHide = () => {
    props.onHide();
  };

  return (
    <ModalCard
      title="Trade"
      buttonLabel="Confirm trade"
      visibility={props.show}
      modalSize="xs"
      onSubmit={onConfirmTrade}
      onHide={handleModalHide}>
      {loading ? <Loader /> : ''}
      <Form>
        <Row className="align-items-center">
          <Row className='mx-0 width-100 align-items-center'>
            <Col xs={4}>
              <div>{tokens[0] ? tokens[0]?.symbol : null}</div>
            </Col>
            <Col className='pl-0' xs={8}>
              <TextInput
                placeholder="Amount"
                fieldType="text"
                value={tokenInAmount}
                name={'amount1'}
                onChange={(e) => setTokenInAmount(e.target.value)}
              />
            </Col>
          </Row>
        </Row>
        <Row className="align-items-center">
          <Row className='mx-0 width-100 align-items-center'>
            <Col xs={4}>
              <div>{tokens[1] ? tokens[1].symbol : null}</div>
            </Col>
            <Col className='pl-0' xs={8}>
              <TextInput
                placeholder="Amount"
                fieldType="number"
                value={tokenOutAmount}
                name={'amount2'}
                onChange={(e) => setTokenOutAmount(e.target.value)}
              />
            </Col>
          </Row>
        </Row>
      </Form>
    </ModalCard>
  );
};

export default TradePoolModal;
