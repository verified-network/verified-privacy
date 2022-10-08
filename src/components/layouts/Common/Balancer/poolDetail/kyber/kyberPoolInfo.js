import React from 'react';
import {Col, Row, Image} from 'react-bootstrap';
import UiButton from 'components/ui/button/Button';
import {formattedNum} from './utils';

const KyberPoolInfo = (props) => {
  const {pool} = props;

  const tokens = pool.tokens || [];

  return (
    <>
      <div className="border-bottom d-flex justify-content-between width-100 p-3">
        <h5 className="fw-normal">My pool balance</h5>
        <h5 className="fw-normal">$0.00</h5>
      </div>
      <div className="border-bottom">
        {tokens.map((token) => (
          <Row className="p-3 mx-0 align-items-center">
            <Image src={token?.logoURI} style={{width: '35px', height: '35px', borderRadius: '30px'}} />
            <Row className="ml-1 flex-1 mx-0">
              <Col className="flex-1">
                <div>{token?.symbol}</div>
                <div className="text-black-50 fs-7">
                  {token?.name}
                </div>
              </Col>
              <div>
                <div className="text-right">{token.value ? formattedNum(token.value) : ''}</div>
                {/* <div className="text-black-50 fs-7">
                $0.00
                </div> */}
              </div>
            </Row>
          </Row>
        ))}
      </div>
      <Col className="p-3 bg-light mx-0 align-items-center">
        <div className="text-black-50 mb-2" style={{fontSize: 12}}>
          Based on pool tokens in your wallet
        </div>
        <Row className="ml-1 flex-1 mx-0 pl-0 justify-content-between">
          <div>
            <b>You can invest</b>
          </div>
          <div>
            <b>$0.00</b>
          </div>
        </Row>
        <Row className="ml-1 flex-1 mx-0 pl-0 justify-content-between">
          <UiButton onClick={props.onTrade} buttonVariant="primary" buttonClass="SignUpButton flex-1 ml-0" buttonText="Trade" type="submit" />
          {/* <UiButton buttonVariant="primary" buttonClass="SignUpButton flex-1 mr-0" buttonText="Withdraw" disabled /> */}
        </Row>
      </Col>
    </>
  );
};

export default KyberPoolInfo;
