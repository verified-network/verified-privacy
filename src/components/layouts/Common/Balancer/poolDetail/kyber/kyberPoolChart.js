import React, {useState, useRef, useEffect} from 'react';
import {getTimeframe, toNiceDateTime} from './utils';
import {timeframeOptions} from './constants';
import {usePoolChartData} from './contexts/kyberPoolData';
import Loader from 'components/ui/Loader';
import BalLineChart from '../../BalLineChart';

const PoolChart = ({address}) => {
  const [timeWindow] = useState(timeframeOptions.MONTH);

  const ref = useRef();
  const isClient = typeof window === 'object';
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth);
  const [height, setHeight] = useState(ref?.current?.container?.clientHeight);

  useEffect(() => {
    if (!isClient) {
      return false;
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width);
      setHeight(ref?.current?.container?.clientHeight ?? height);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height, isClient, width]); // Empty array ensures that effect is only run on mount and unmount

  let {data: chartData, loading} = usePoolChartData(address);

  const utcStartTime = getTimeframe(timeWindow);
  chartData = chartData?.filter((entry) => entry.date >= utcStartTime);

  const getChartData = () => {
    const values = [];
    chartData.map((item) => {
      const date = toNiceDateTime(item.date);
      values.push([date, Number(item.reserveUSD)]);
    });
    const chartSeries = [
      {
        name: 'Pool Liquidity',
        values,
      },
    ];
    return chartSeries;
  };

  return (
    <>
      <BalLineChart
        data={getChartData()}
        isPeriodSelectionEnabled={false}
        axisLabelFormatter={{
          yAxis: {
            style: 'currency',
            abbreviate: true,
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            fixedFormat: true,
          },
        }}
        color={['green']}
        height="96"
        showLegend={true}
        legendState={{HODL: false}}
        showTooltip={true}
      />{' '}
      {loading ? <Loader /> : null}
    </>
  );
};

export default PoolChart;
