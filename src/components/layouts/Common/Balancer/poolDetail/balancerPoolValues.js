import React from 'react';
import {Card, Row} from 'react-bootstrap';

const BalancerPoolValues = ({pool = {}}) => {
  return (
    <Row className="mx-0 justify-content-between">
      <Card className="p-3 shadow mr-3 border-sm flex-1">
        <div className="text-black-50 mb-1 fs-7">Pool value</div>
        <div className="fw-bold fs-6">{pool.poolValue}</div>
      </Card>
      <Card className="p-3 shadow mr-3 border-sm flex-1">
        <div className="text-black-50 mb-1 fs-7">Volume (24h)</div>
        <div className="fw-bold fs-6">{pool.volume}</div>
      </Card>
      <Card className="p-3 shadow mr-3 border-sm flex-1">
        <div className="text-black-50 mb-1 fs-7">Fees (24h)</div>
        <div className="fw-bold fs-6">{pool.feesSnapshot}</div>
      </Card>
    </Row>
  );
};

export default BalancerPoolValues;
