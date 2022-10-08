import {keyBy} from 'lodash';
import {useEffect, useState} from 'react';
import {fNum2} from './useNumbers';
import {isStableLike, orderedPoolTokens} from './composables/usePool';
import {GET_BALANCER_POOL, GET_BALANCER_POOLS, GET_BALANCER_SECONDARY_POOLS} from './apollo/balancerQueries';
import {balancerSubgraphClient} from './apollo';
import PoolService from './pool.service';
import {balancerSubgraphService} from './services/balancer/subgraph/balancer-subgraph.service';
import {PoolType} from './types';
import Web3Service from './services/web3/web3.service';
import ContractService from 'sources/contracts/ContractService';
import {twentyFourHoursInSecs} from './composables/useTime';

const getBalancerPoolData = async (client, poolAddress) => {
  let data = [];

  try {
    const result = await client.query({
      query: GET_BALANCER_POOL,
      fetchPolicy: 'cache-first',
      variables: {
        id: poolAddress,
      },
    });
    data = result;
  } catch (e) {
    console.log('getBalancerPoolData catch', {e});
    console.log(e);
  }

  return data;
};

export function useBalancerData(poolAddress) {
  const [state, setState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoolData() {
      const result = await getBalancerPoolData(
        balancerSubgraphClient,
        poolAddress
      );
      const data = result.data || {};
      const pool = {...data.pool} || {};

      const pools = [pool];
      const historicalPools = await fetchHistoricalPools(pools);
      const decoratedPools = decorateWithVolumes(historicalPools, pools);
      const formattedPool = formatPoolData(decoratedPools) || [];

      setState(formattedPool[0] || {});
      setLoading(false);
    }
    fetchPoolData();
  }, [poolAddress]);

  return {data: state, loading};
}

const getBalancerPoolsData = async (client, poolType) => {
  let data = [];

  try {
    const result = await client.query({
      query:
      poolType === PoolType.SecondaryIssue ?
        GET_BALANCER_SECONDARY_POOLS() :
        GET_BALANCER_POOLS(),
      fetchPolicy: 'cache-first',
    });
    data = result;
  } catch (e) {
    console.log('PoolData getPoolData catch', e);
    console.log(e);
  }

  return data;
};

export const formatPoolData = (data = []) => {
  const newData = [];
  data.map((pool) => {
    const tokens = orderedPoolTokens(pool.poolType, pool.address, pool.tokens);

    let composition = '';
    tokens.map((t) => {
      composition = `${composition}${composition ? ', ' : ''}${t.symbol}${
        t.weight ? `(${t.weight * 100}%)` : ''
      }`;
    });

    const poolValue = fNum2(pool.totalLiquidity, {
      style: 'currency',
      maximumFractionDigits: 0,
    });
    const volume = fNum2(Math.abs(pool.volumeSnapshot), {
      style: 'currency',
      maximumFractionDigits: 0,
    });
    const feesSnapshot = fNum2(pool.feesSnapshot, {
      style: 'currency',
      maximumFractionDigits: 0,
    });
    newData.push({
      ...pool,
      isStablePool: isStableLike(pool.poolType),
      tokens,
      composition,
      poolValue,
      volume,
      feesSnapshot,
    });
  });
  return newData;
};

const decorateWithVolumes = (historicalPools, pools) => {
  if (!historicalPools || !historicalPools.length) return pools;
  const pastPoolMap = keyBy(historicalPools, 'id');
  return pools.map((pool) => {
    const poolService = new PoolService(pool);
    poolService.setFeesSnapshot(pastPoolMap[pool.id]);
    poolService.setVolumeSnapshot(pastPoolMap[pool.id]);
    return poolService.pool;
  });
};

const getTimeTravelBlock = async (period, password) => {
  const contractService = new ContractService(password);
  const wallet = contractService.getWallet();
  const web3Service = new Web3Service(password);

  const currentBlock = await wallet.provider.getBlockNumber();
  const blocksInDay = Math.round(twentyFourHoursInSecs / web3Service.blockTime);

  switch (period) {
  case '24h':
    return currentBlock - blocksInDay;
  default:
    return currentBlock - blocksInDay;
  }
};

const fetchHistoricalPools = async (pools, password) => {
  const blockNumber = await getTimeTravelBlock('24h', password);
  const block = {number: blockNumber};

  const isInPoolIds = {id_in: pools.map((pool) => pool.id)};
  const pastPoolQuery = await balancerSubgraphService.pools.query({
    where: isInPoolIds,
    block,
  });

  let pastPools = null;
  try {
    const data = await balancerSubgraphService.client.get(pastPoolQuery);
    pastPools = data.pools;
  } catch {
    return pools;
  }

  return pastPools;
};

export function useBalancerPoolsData(poolType, password) {
  const [state, setState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoolsData() {
      const result = await getBalancerPoolsData(balancerSubgraphClient, poolType);
      const data = result.data || {};
      const pools = data.pools || [];
      const historicalPools = await fetchHistoricalPools(pools, password);
      const decoratedPools = decorateWithVolumes(historicalPools, pools);

      setState(formatPoolData(decoratedPools));
      setLoading(false);
    }
    fetchPoolsData();
  }, []);

  return {data: state, loading};
}
