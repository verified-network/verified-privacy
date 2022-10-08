import React from 'react';
import {isStablePhantom} from './composables/usePool';
import {format} from 'date-fns';
import {zip} from 'lodash';
import BalLineChart from './BalLineChart';


const PoolChart = (props) => {
  const hodlColor = 'black';

  const chartColors = [
    'green',
    hodlColor,
  ];

  const supportsPoolLiquidity = isStablePhantom(props.pool.poolType);

  const getHistory = () => {
    if (!props.historicalPrices) return [];

    const pricesTimestamps = Object.keys(props.historicalPrices);
    const snapshotsTimestamps = Object.keys(props.snapshots);

    if (snapshotsTimestamps.length === 0) {
      return [];
    }

    // Prices are required when not using pool liquidity
    if (!supportsPoolLiquidity && pricesTimestamps.length === 0) {
      return [];
    }

    return snapshotsTimestamps
      .map((snapshotTimestamp) => {
        const timestamp = parseInt(snapshotTimestamp);

        const snapshot = props.snapshots[timestamp];
        const prices = props.historicalPrices[timestamp] ?? [];
        const amounts = snapshot.amounts ?? [];
        const totalShares = parseFloat(snapshot.totalShares) ?? 0;
        const liquidity = parseFloat(snapshot.liquidity) ?? 0;

        return {
          timestamp,
          prices,
          amounts,
          totalShares,
          liquidity,
        };
      })
      .filter(({totalShares, prices, amounts, liquidity}) => {
        if (!supportsPoolLiquidity && prices.length === 0) {
          return false;
        } else if (supportsPoolLiquidity && liquidity === 0) {
          return false;
        }
        return totalShares > 0 && amounts.length > 0;
      }).reverse();
  };

  const history = getHistory();

  const timestamps = history.map((state) => format(state.timestamp, 'yyyy/MM/dd'));

  const getHodlValues = () => {
    if (history.length === 0) {
      return [];
    }

    const firstState = history[0];
    const firstValue = getPoolValue(firstState.amounts, firstState.prices);

    return history.map((state) => {
      if (state.timestamp < firstState.timestamp) {
        return 0;
      }

      const currentValue = getPoolValue(firstState.amounts, state.prices);

      return currentValue / firstValue - 1;
    });
  };

  const hodlValues = getHodlValues();

  const getBptValues = () => {
    if (history.length === 0) {
      return [];
    }

    const firstState = history[0];
    const firstValue = supportsPoolLiquidity ?
      firstState.liquidity :
      getPoolValue(firstState.amounts, firstState.prices);
    const firstShares = firstState.totalShares;
    const firstValuePerBpt = firstValue / firstShares;

    return history.map((state) => {
      if (state.timestamp < firstState.timestamp) {
        return 0;
      }

      const currentValue = supportsPoolLiquidity ?
        state.liquidity :
        getPoolValue(state.amounts, state.prices);
      const currentShares = state.totalShares;
      const currentValuePerBpt = currentValue / currentShares;

      return currentValuePerBpt / firstValuePerBpt - 1;
    });
  };

  const bptValues = getBptValues();

  const getSeriesData = () => {
  // TODO: currently HODL series is disabled when using pool liquidity
    const supportsHODLSeries = !supportsPoolLiquidity;

    const chartSeries = [
      {
        name: 'Pool Returns',
        values: zip(timestamps, bptValues),
      },
    ];

    if (supportsHODLSeries) {
      chartSeries.push({
        name: 'HODL',
        values: zip(timestamps, hodlValues),
      });
    }

    return chartSeries;
  };

  const series = getSeriesData();

  function getPoolValue(amounts, prices) {
    return amounts
      .map((amount, index) => {
        const price = prices[index];

        return price * parseFloat(amount);
      })
      .reduce((total, value) => total + value, 0);
  }

  const rawData = Array(100).fill().map(() => {
    return Math.random() * 1000;
  });

  return (
    <>
      <BalLineChart
        data={series}
        isPeriodSelectionEnabled={false}
        axisLabelFormatter={{
          yAxis: {
            style: 'percent',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            fixedFormat: true,
          },
        }}
        color={chartColors}
        height="96"
        showLegend={true}
        legendState={{HODL: false}}
        showTooltip={true}
      />
    </>
  );
};

export default PoolChart;
