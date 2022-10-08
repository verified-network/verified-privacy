import {useEffect, useState} from 'react';
import {
  KYBER_POOL_CHART,
  KYBER_POOLS_DATA,
  POOLS_BULK,
  POOLS_HISTORICAL_BULK,
  POOL_DATA,
} from '../../../apollo/kyberQueries';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  formattedNum,
  get2DayPercentChange,
  getBlocksFromTimestamps,
  getPercentChange,
  getTimestampsForChanges,
} from '../utils';
import {NETWORKS_INFO} from '../constants/networks';
import {KYBER_NETWORK_CHAIN_ID} from 'sources/Config';
import {kyberSubgraphClient} from '../../../apollo';

dayjs.extend(utc);

const getPoolChartData = async (client, poolAddress) => {
  let data = [];
  const utcEndTime = dayjs.utc();
  const utcStartTime = utcEndTime.subtract(1, 'year').startOf('minute');
  const startTime = utcStartTime.unix() - 1;

  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      const result = await client.query({
        query: KYBER_POOL_CHART,
        variables: {
          poolAddress: poolAddress?.toLowerCase() || '',
          skip,
        },
        fetchPolicy: 'cache-first',
      });
      skip += 1000;
      data = data.concat(result.data.poolDayDatas);
      if (result.data.poolDayDatas.length < 1000) {
        allFound = true;
      }
    }

    const dayIndexSet = new Set();
    const dayIndexArray = [];
    const oneDay = 24 * 60 * 60;
    const newData = [];
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      const newDayData = {...dayData};
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      newDayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
      newDayData.reserveUSD = parseFloat(dayData.reserveUSD);
      newData.push(newDayData);
    });
    data = newData;
    if (data[0]) {
      // fill in empty days
      let timestamp = data[0].date ? data[0].date : startTime;
      let latestLiquidityUSD = data[0]?.reserveUSD;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        const currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dayString: nextDay,
            dailyVolumeUSD: 0,
            reserveUSD: latestLiquidityUSD,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index]?.reserveUSD;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }

  return data;
};

export function usePoolChartData(poolAddress) {
  const [state, setState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkForChartData() {
      const data = await getPoolChartData(kyberSubgraphClient, poolAddress);
      setState(data);
      setLoading(false);
    }
    checkForChartData();
  }, [poolAddress]);

  return {data: state, loading};
}

const getPoolsData = async (client) => {
  let data = [];

  try {
    const result = await client.query({
      query: KYBER_POOLS_DATA,
      fetchPolicy: 'cache-first',
    });
    data = result;
  } catch (e) {
    console.log('PoolData getPoolData catch', e);
    console.log(e);
  }

  return data;
};

export function usePoolsData() {
  const [state, setState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoolsData() {
      const result = await getPoolsData(kyberSubgraphClient);
      const resultData = result.data || {};
      const pools = resultData.pools || [];

      const poolsId = pools.map((pool) => pool.id);

      const data = await getBulkPoolData(kyberSubgraphClient, poolsId);
      console.log('KyberPoolData usePoolsData', data);
      setState(formatPools(data));

      setLoading(false);
    }
    fetchPoolsData();
  }, []);

  return {data: state, loading};
}

export async function getBulkPoolData(client, poolList) {
  const networkInfo = NETWORKS_INFO[KYBER_NETWORK_CHAIN_ID];
  const [t1, t2] = getTimestampsForChanges();
  let b1; let b2;
  console.log('KyberPoolData getBulkPoolData top', {t1, t2, networkInfo});
  try {
    [{number: b1}, {number: b2}] = await getBlocksFromTimestamps(
      [t1, t2],
      networkInfo
    );
  } catch (e) {
    console.error('Cant get block data from ' + networkInfo.subgraphBlockUrl);
    return;
  }

  try {
    const current = await client.query({
      query: POOLS_BULK,
      variables: {
        allPools: poolList.map((pool) => pool.toLocaleLowerCase()),
      },
      fetchPolicy: 'network-only',
    });
    console.log('KyberPoolData getBulkPoolData current', {current});

    const [oneDayResult, twoDayResult] = await Promise.all(
      [b1, b2].map(async (block) => {
        const result = client.query({
          query: POOLS_HISTORICAL_BULK(block, poolList),
          fetchPolicy: 'network-only',
        });
        return result;
      })
    );

    const oneDayData = oneDayResult?.data?.pools.reduce((obj, cur, i) => {
      return {...obj, [cur.id]: cur};
    }, {});

    const twoDayData = twoDayResult?.data?.pools.reduce((obj, cur, i) => {
      return {...obj, [cur.id]: cur};
    }, {});

    const poolData = await Promise.all(
      current &&
        current.data.pools.map(async (pool) => {
          let data = pool;
          let oneDayHistory = oneDayData?.[pool.id];
          if (!oneDayHistory) {
            const newData = await client.query({
              query: POOL_DATA(pool.id, b1),
              fetchPolicy: 'network-only',
            });
            oneDayHistory = newData.data.pools[0];
          }
          let twoDayHistory = twoDayData?.[pool.id];
          if (!twoDayHistory) {
            const newData = await client.query({
              query: POOL_DATA(pool.id, b2),
              fetchPolicy: 'network-only',
            });
            twoDayHistory = newData.data.pools[0];
          }
          data = parseData(data, oneDayHistory, twoDayHistory, b1, networkInfo);
          return data;
        })
    );

    return poolData;
  } catch (e) {
    console.log(e);
  }
}

function parseData(
  d,
  oneDayData,
  twoDayData,
  // oneWeekData,
  oneDayBlock,
  networkInfo
) {
  // get volume changes
  const data = {...d};
  const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
    data?.volumeUSD,
    oneDayData?.volumeUSD ? oneDayData.volumeUSD : 0,
    twoDayData?.volumeUSD ? twoDayData.volumeUSD : 0
  );

  const [oneDayFeeUSD] = get2DayPercentChange(
    data?.feeUSD,
    oneDayData?.feeUSD ? oneDayData.feeUSD : 0,
    twoDayData?.feeUSD ? twoDayData.feeUSD : 0
  );
  const [oneDayVolumeUntracked, volumeChangeUntracked] = get2DayPercentChange(
    data?.untrackedVolumeUSD,
    oneDayData?.untrackedVolumeUSD ?
      parseFloat(oneDayData?.untrackedVolumeUSD) :
      0,
    twoDayData?.untrackedVolumeUSD ? twoDayData?.untrackedVolumeUSD : 0
  );
  const [oneDayFeeUntracked] = get2DayPercentChange(
    data?.untrackedFeeUSD,
    oneDayData?.untrackedFeeUSD ? parseFloat(oneDayData?.untrackedFeeUSD) : 0,
    twoDayData?.untrackedFeeUSD ? twoDayData?.untrackedFeeUSD : 0
  );

  // set volume properties
  data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD);
  data.oneDayFeeUSD = oneDayFeeUSD;
  data.oneDayFeeUntracked = oneDayFeeUntracked;
  data.volumeChangeUSD = volumeChangeUSD;
  data.oneDayVolumeUntracked = oneDayVolumeUntracked;
  data.volumeChangeUntracked = volumeChangeUntracked;

  // set liquiditry properties
  data.liquidityChangeUSD = getPercentChange(
    data.reserveUSD,
    oneDayData?.reserveUSD
  );

  // format if pool hasnt existed for a day or a week
  if (!oneDayData && data && data.createdAtBlockNumber > oneDayBlock) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }
  if (!oneDayData && data) {
    data.oneDayVolumeUSD = parseFloat(data.volumeUSD);
  }

  const newToken0 = data?.token0?.id ? {...data.token0} : {};
  const newToken1 = data?.token1?.id ? {...data.token1} : {};
  if (
    data?.token0?.id?.toLowerCase() === networkInfo.wethAddress.toLowerCase()
  ) {
    newToken0.name = networkInfo.nativeTokenWrappedName;
    newToken0.symbol = networkInfo.nativeTokenSymbol;
  }
  if (
    data?.token1?.id?.toLowerCase() === networkInfo.wethAddress.toLowerCase()
  ) {
    newToken1.name = networkInfo.nativeTokenWrappedName;
    newToken1.symbol = networkInfo.nativeTokenSymbol;
  }

  data.token0 = newToken0;
  data.token1 = newToken1;

  return data;
}

export const formatPools = (pools = []) => {
  const newData = [];

  pools.map((item) => {
    const newItem = {...item};
    const composition = `${item.token0.symbol}, ${item.token1.symbol}`;
    newItem.composition = composition;
    newItem.isKyber = true;
    const token0 = {...item.token0} || {};
    const token1 = {...item.token1} || {};
    token0.value = item.reserve0;
    token1.value = item.reserve1;
    newItem.tokens = [token0, token1];
    const liquidity = item.reserveUSD ?
      formattedNum(item.reserveUSD, true) :
      '-';

    const volume =
      item.oneDayVolumeUSD || item.oneDayVolumeUSD === 0 ?
        formattedNum(
          item.oneDayVolumeUSD === 0 ?
            item.oneDayVolumeUntracked :
            item.oneDayVolumeUSD,
          true
        ) :
        item.oneDayVolumeUSD === 0 ?
          '$0' :
          '-';
    newItem.poolValue = liquidity;
    newItem.volume = volume;
    newData.push(newItem);
  });
  return newData;
};

export function usePoolData(poolAddress) {
  const [state, setState] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
  }, [poolAddress]);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const data = await getBulkPoolData(kyberSubgraphClient, [poolAddress]);
        console.log('KyberPoolData usePoolData', data);
        setState(formatPools(data));
        setLoading(false);
      } catch (e) {
        setLoading(false);
        if (cancelled) return;
        setError(true);
      }
    }

    fetchData();
    return () => (cancelled = true);
  }, [poolAddress]);

  return {error, data: state, loading};
}
