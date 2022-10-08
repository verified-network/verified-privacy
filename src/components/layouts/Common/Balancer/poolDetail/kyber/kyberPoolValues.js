import React, {useEffect, useState} from 'react';
import {Card, Row} from 'react-bootstrap';
import {formattedNum, formattedPercent} from './utils';

const KyberPoolValues = ({pool = {}}) => {
  const {
    oneDayVolumeUSD,
    oneDayVolumeUntracked,
    oneDayFeeUSD,
    oneDayFeeUntracked,
    reserveUSD,
    liquidityChangeUSD,
    volumeChangeUSD,
    volumeChangeUntracked,
  } = pool;

  const [usingUtVolume, setUsingUtVolume] = useState(false);

  useEffect(() => {
    setUsingUtVolume(oneDayVolumeUSD === 0 ? true : false);
  }, [oneDayVolumeUSD]);

  // liquidity
  const liquidity = reserveUSD ? formattedNum(reserveUSD, true) : '-';
  const liquidityChange = formattedPercent(liquidityChangeUSD);

  const volume =
    oneDayVolumeUSD || oneDayVolumeUSD === 0 ?
      formattedNum(
        oneDayVolumeUSD === 0 ? oneDayVolumeUntracked : oneDayVolumeUSD,
        true
      ) :
      oneDayVolumeUSD === 0 ?
        '$0' :
        '-';

  const volumeChange = formattedPercent(
    !usingUtVolume ? volumeChangeUSD : volumeChangeUntracked
  );

  const fees =
    oneDayFeeUSD || oneDayFeeUSD === 0 ?
      usingUtVolume ?
        formattedNum(oneDayFeeUntracked, true) :
        formattedNum(oneDayFeeUSD, true) :
      '-';

  return (
    <Row className="mx-0 justify-content-between">
      <Card className="p-3 shadow mr-3 border-sm flex-1 d-flex justify-content-between">
        <div>
          <div className="text-black-50 mb-1 fs-7">Liquidity</div>
          <div className="fw-bold fs-6">{liquidity}</div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <div className="fw-bold fs-6">{liquidityChange}</div>
        </div>
      </Card>
      <Card className="p-3 shadow mr-3 border-sm flex-1 d-flex justify-content-between">
        <div>
          <div className="text-black-50 mb-1 fs-7">
            Volume (24h) {usingUtVolume && '(Untracked)'}
          </div>
          <div className="fw-bold fs-6">{volume}</div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <div className="fw-bold fs-6">{volumeChange}</div>
        </div>
      </Card>
      <Card className="p-3 shadow mr-3 border-sm flex-1 d-flex justify-content-between">
        <div>
          <div className="text-black-50 mb-1 fs-7">Fees (24h)</div>
          <div className="fw-bold fs-6">{fees}</div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <div className="fw-bold fs-6">{volumeChange}</div>
        </div>
      </Card>
    </Row>
  );
};

export default KyberPoolValues;
