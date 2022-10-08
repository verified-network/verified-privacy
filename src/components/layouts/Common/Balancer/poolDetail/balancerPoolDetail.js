import React, {useEffect, useState} from 'react';
import {Card, Col, Container, Row, Image} from 'react-bootstrap';
import BalancerPoolInfo from './balancerPoolInfo';
import {usePoolSnapshotsQuery} from '../queries/usePoolSnapshotsQuery';
import {POOLS, POOL_TYPE_LABELS} from '../constants/pools';
import InvestPool from '../invest';
import Loader from 'components/ui/Loader';
import BalancerPoolChart from './balancerPoolChart';
import TradePool from '../trade';
import {useBalancerData} from '../balancerPoolData';
import BalancerPoolValues from './balancerPoolValues';

const BalancerPoolDetail = (props) => {
  const [pool, setPool] = useState({});
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showTradeDialog, setShowTradeDialog] = useState(false);

  const {data, loading} = useBalancerData(
    props.match.params.pool_id
  );

  useEffect(() => {
    if (loading) return;
    if (data) {
      setPoolData();
    }
  }, [loading]);

  const setPoolData = async () => {
    setPool(data);
  };

  useEffect(() => {
    if (loading) return;
    if (pool.tokenAddresses) {
      getPrices();
    }
  }, [pool]);

  const getPrices = async () => {
    const data = await usePoolSnapshotsQuery(pool);
    setHistoricalPrices(data.prices);
    setSnapshots(data.snapshots);
  };

  const getPoolTypeLabel = () => {
    if (!pool.factory) return '';
    const key = POOL_TYPE_LABELS[POOLS.Factories[pool.factory]];

    return key || 'Unknown pool type';
  };

  const trade = () => {

  };

  const poolTypeLabel = getPoolTypeLabel();

  const tokens = pool.tokens || [];

  return (
    <>
      <Container className="d-flex flex-column align-items-start px-0 py-4">
        <Container className="mb-4 px-0">
          <Row className="d-flex align-items-center p-0">
            <h4 className="mr-3">{poolTypeLabel}</h4>
            {tokens.map((token) => (
              <div className="bg-light py-1 px-2 rounded mr-1">
                <Image src={token.logoURI} style={{width: '20px', height: '20px', borderRadius: '20px'}} />
                <span className="ml-1">{token.symbol}</span>
              </div>
            ))}
          </Row>
          <Row>
            <span className="text-black-50">Fixed swap fees: </span>
            <b>0.04%</b>
          </Row>
        </Container>
        <Row className="d-flex width-100 mb-4">
          <Col style={{flex: '6'}} className="px-0">
            <Card
              style={{height: '400px'}}
              className="mr-3 shadow d-flex justify-content-center align-items-center border-sm mb-3">
              <BalancerPoolChart pool={pool} historicalPrices={historicalPrices} snapshots={snapshots} {...props}/>
            </Card>
            <BalancerPoolValues pool={data} />
          </Col>
          <Col style={{flex: '3'}} className="px-0">
            <div className="ml-1 shadow border-sm rounded">
              <BalancerPoolInfo onTrade={() => setShowTradeDialog(true)} onWithdraw={trade} onInvest={() => setShowInvestModal(true)} pool={pool}/>
            </div>
          </Col>
        </Row>
      </Container>
      {pool.address ? <InvestPool password={props.password} pool={pool} show={showInvestModal} onHide={() => setShowInvestModal(false)}/> : null}
      {loading ? <Loader /> : null}
      <TradePool {...props} show={showTradeDialog} onHide={() => setShowTradeDialog(false)} pool={pool} />
    </>
  );
};

export default BalancerPoolDetail;
