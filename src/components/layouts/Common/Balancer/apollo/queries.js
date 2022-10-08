import gql from 'graphql-tag';

export const POOL_CHART = gql`
  query poolDayDatas($poolAddress: Bytes!, $skip: Int!) {
    poolDayDatas(first: 1000, skip: $skip, orderBy: date, orderDirection: asc, where: { poolAddress: $poolAddress }) {
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

export const POOL_DATA = (poolAddress, block) => {
  const queryString = `
    ${PoolFields}
    query pools {
      pools(${block ? `block: {number: ${block}}` : ''} where: { id: "${poolAddress.toLowerCase()}"} ) {
        ...PoolFields
      }
    }`;
  return gql(queryString);
};
