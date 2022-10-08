import React, {useState} from 'react';
import {Row, Col, Form} from 'react-bootstrap';
import ModalCard from 'components/ui/card/ModalCard';
import TextInput from 'components/ui/textinput/TextInput';
import Loader from 'components/ui/Loader';
import notifier from 'components/ui/notifier';
import {MESSAGES} from 'sources/messages';
import PoolExchange from '../services/pool/exchange/exchange.service';
import useTokens from '../composables/useTokens';

const InvestBalancerPools = (props) => {
  const [amounts, setAmounts] = useState(props.pool.tokenAddresses.map((t) => ''));
  const [loading, setLoading] = useState(false);
  const [tokenAddresses, setTokenAddresses] = useState(props.pool.tokenAddresses);

  const {pool = {}} = props;
  const {tokens = []} = pool;

  const submit = async () => {
    const poolExchange = new PoolExchange(props.password, pool);
    setLoading(true);
    try {
      const tx = await poolExchange.join(
        amounts,
        tokenAddresses,
        // '0.001655428466364206', // FIX ME
        // formatUnits(bptOut.value, props.pool.onchain.decimals), // FIX ME
      );

      notifier.success('Success', MESSAGES.SUCCESS.TRANSACTION_PROCESSED);
      setLoading(false);
      handleModalHide();
      handleTransaction(tx);
      return tx;
    } catch (error) {
      notifier.error('Error', error);
      setLoading(false);
      return Promise.reject(error);
    }
  };

  const handleTransaction = async (tx) => {

  };

  const tokenOptions = (index) => {
    const {wrappedNativeAsset, nativeAsset, getToken} = useTokens();
    const tokens =
      pool.tokenAddresses[index] === wrappedNativeAsset.address ?
        [wrappedNativeAsset.address, nativeAsset.address] :
        [];

    return tokens.map((t) => getToken(t));
  };

  const resetInputs = () => {
  };

  const handleChangeToken = (e, i) => {
    const newTokenAddresses = [...tokenAddresses];
    newTokenAddresses[i] = e.target.value;
    setTokenAddresses(newTokenAddresses);
    console.log('Handle Change Token', e.target.value, i);
  };

  const handleChange = (e, index) => {
    const newAmounts = [...amounts];
    newAmounts[index] = e.target.value;
    setAmounts(newAmounts);
  };

  const handleModalHide = () => {
    resetInputs();
    props.onHide();
  };

  return (
    <ModalCard title="Invest in pool" visibility={props.show} modalSize="xs" onSubmit={submit} onHide={handleModalHide}>
      {loading ? <Loader /> : ''}
      <Form>
        <Row className="align-items-center">
          {tokens.map((token, i) => {
            const options = tokenOptions(i);
            console.log('Invest tokens options', options);
            return (
              <Col className="mb-3 text-left" xs={12}>
                {options.length ? (
                  <Col className='pl-0' xs="4">
                    <Form.Control
                      as="select"
                      className="textForm custom-select dropdown"
                      name="currencyToDebit"
                      onChange={(e) => handleChangeToken(e, i)}>
                      {options.map((option) => (
                        <option value={option.address}>
                          {option.symbol}
                        </option>
                      ))}

                    </Form.Control>
                  </Col>
                ) : (
                  <Form.Label className="">{token.symbol}</Form.Label>
                )}
                <TextInput
                  placeholder="0.0"
                  fieldType="number"
                  value={amounts[i]}
                  name={'amount'}
                  onChange={(e) => handleChange(e, i)}
                />
              </Col>
            );
          })}
        </Row>
      </Form>
    </ModalCard>
  );
};

export default InvestBalancerPools;
