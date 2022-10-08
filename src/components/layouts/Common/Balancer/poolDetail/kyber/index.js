import React, {useState} from 'react';
import PoolChart from './kyberPoolChart';
import {Card, Col, Container, Row, Image} from 'react-bootstrap';
import KyberPoolInfo from './kyberPoolInfo';
import TradePool from '../../trade';
import {usePoolData} from './contexts/kyberPoolData';
import KyberPoolValues from './kyberPoolValues';
import Loader from 'components/ui/Loader';

function PoolPage(props) {
  const [showTradeDialog, setShowTradeDialog] = useState(false);

  const backgroundColor = '#31CB9E';

  const {data, loading} = usePoolData(props.match.params.pool_id);
  const poolData = data[0] || {};

  const tokens = poolData.tokens || [];

  const poolTypeLabel = tokens.length > 1 ? `${tokens[0]?.name} - ${tokens[1]?.name}` : '';

  return (
    <>
      <Container className="d-flex flex-column align-items-start px-0 py-4">
        <Container className="mb-2 px-0">
          <Row className="d-flex align-items-center p-0">
            <h4 className="mr-3">{poolTypeLabel}</h4>
            {tokens.map((token) => (
              <div className="bg-light py-1 px-2 rounded mr-1">
                <Image src={token?.logoURI} style={{width: '20px', height: '20px', borderRadius: '20px'}} />
                <span className="ml-1">{token?.symbol}</span>
              </div>
            ))}
          </Row>
          <Row>
            <span className="text-black-50 mt-2"><b>Pool Liquidity</b></span>
          </Row>
        </Container>
        <Row className="d-flex width-100 mb-4">
          <Col style={{flex: '6'}} className="px-0">
            <Card
              className="mr-3 shadow d-flex justify-content-center align-items-center border-sm mb-3 p-4">
              <div style={{width: '100%', height: 300}}>
                <PoolChart address={props.match.params.pool_id} color={backgroundColor} />
              </div>
            </Card>
            <KyberPoolValues pool={poolData} />
          </Col>
          <Col style={{flex: '3'}} className="px-0">
            <div className="ml-1 shadow border-sm rounded">
              <KyberPoolInfo onTrade={() => setShowTradeDialog(true)} pool={poolData}/>
            </div>
          </Col>
        </Row>
      </Container>
      {loading ? <Loader /> : null}
      <TradePool {...props} show={showTradeDialog} onHide={() => setShowTradeDialog(false)} pool={poolData} />
    </>
  );
}

export default PoolPage;
