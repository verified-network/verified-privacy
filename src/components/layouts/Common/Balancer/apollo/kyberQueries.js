import gql from 'graphql-tag';

export const KYBER_POOL_CHART = gql`
  query poolDayDatas($poolAddress: Bytes!, $skip: Int!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { poolAddress: $poolAddress }
    ) {
      id
      date
      dailyVolumeToken0
      dailyVolumeToken1
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

const PoolFields = `
fragment PoolFields on Pool {
  id
  txCount
  token0 {
    id
    symbol
    name
    totalLiquidity
    derivedETH
  }
  token1 {
    id
    symbol
    name
    totalLiquidity
    derivedETH
  }
  amp
  reserve0
  reserve1
  vReserve0
  vReserve1
  reserveUSD
  totalSupply
  trackedReserveETH
  reserveETH
  volumeUSD
  feeUSD
  untrackedVolumeUSD
  untrackedFeeUSD
  token0Price
  token1Price
  token0PriceMin
  token0PriceMax
  token1PriceMin
  token1PriceMax
  createdAtTimestamp
}
`;

export const KYBER_POOLS_DATA = gql`
  {
    pools(first: 5) {
      id
      reserveUSD
      token0 {
        id
        symbol
        name
        totalSupply
      }
      token1 {
        id
        symbol
        name
        totalSupply
      }
    }
  }
`;

export const POOLS_HISTORICAL_BULK = (block, pools) => {
  let poolsString = '[';
  pools.map((pool) => {
    return (poolsString += `"${pool.toLowerCase()}"`);
  });
  poolsString += ']';
  const queryString = `
  query pools {
    pools(first: 200, where: {id_in: ${poolsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      feeUSD
      untrackedVolumeUSD
      untrackedFeeUSD
    }
  }
  `;
  return gql(queryString);
};

export const POOLS_BULK = gql`
  ${PoolFields}
  query pools($allPools: [Bytes]!) {
    pools(
      where: { id_in: $allPools }
      orderBy: reserveETH
      orderDirection: desc
    ) {
      ...PoolFields
    }
  }
`;

export const POOL_DATA = (poolAddress, block) => {
  const queryString = `
    ${PoolFields}
    query pools {
      pools(${
        block ? `block: {number: ${block}}` : ''
      } where: { id: "${poolAddress.toLowerCase()}"} ) {
        ...PoolFields
      }
    }`;
  return gql(queryString);
};

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`;
  });
  queryString += '}';
  return gql(queryString);
};
