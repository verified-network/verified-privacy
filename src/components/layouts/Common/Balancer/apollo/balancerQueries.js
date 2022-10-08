import gql from 'graphql-tag';

const PoolFields = `
fragment PoolFields on Pool {
  id
  address
  poolType
  swapFee
  tokensList
  totalLiquidity
  totalSwapVolume
  totalSwapFee
  totalShares
  owner
  factory
  amp
  createTime
  swapEnabled
  tokens {
    address
    balance
    weight
    priceRate
    symbol
  }
}
`;

export const GET_BALANCER_POOLS = (poolType) => {
  const queryString = `
    ${PoolFields}
    query pools {
      pools(
        first: 100
      orderBy: "totalLiquidity"
      orderDirection: "desc"
      where: {
      }
      block: { number: 15038743 }
      ) {
        ...PoolFields
      }
    }`;
  return gql(queryString);
};

export const GET_BALANCER_SECONDARY_POOLS = () => {
  const queryString = `
    ${PoolFields}
    query pools {
      pools(
        first: 100
      orderBy: "totalLiquidity"
      orderDirection: "desc"
      where: {
        poolType: "SecondaryIssuePool"
      }
      block: { number: 15038743 }
      ) {
        ...PoolFields
      }
    }`;
  return gql(queryString);
};

export const GET_BALANCER_POOLSs = (poolType) => {
  const queryString = `query getPools($poolType: String) {
    pools(
      first: 100
      orderBy: "totalLiquidity"
      orderDirection: "desc"
      where: {
        totalShares_gt: 0.01
        id_not_in: [""]
        ${poolType ? `poolType: ${poolType}` : ''}
      }
      block: { number: 15038743 }
    ) {
      id
      address
      poolType
      swapFee
      tokensList
      totalLiquidity
      totalSwapVolume
      totalSwapFee
      totalShares
      owner
      factory
      amp
      createTime
      swapEnabled
      tokens {
        address
        balance
        weight
        priceRate
        symbol
      }
    }
  }`;
  return gql(queryString);
};

// export const GET_BALANCER_POOLS = gql`
// query getPools (
//   $poolType: String
// ) {
//     pools(
//       first: 100
//       orderBy: "totalLiquidity"
//       orderDirection: "desc"
//       where: {
//         totalShares_gt: 0.01
//         id_not_in: [""]
//         poolType: $poolType
//       }
//       block: { number: 15038743 }
//     )
//   }
// `;

export const GET_KYBER_POOL_DAYS_DATA = gql`
  query getPoolDayDatas($id: String) {
    poolDayDatas(id: $id, first: 199) {
      date
      id
      totalSupply
    }
  }
`;

export const GET_BALANCER_POOL = gql`
  query getPool($id: String) {
    pool(id: $id) {
      id
      address
      poolType
      swapFee
      tokensList
      totalLiquidity
      totalSwapVolume
      totalSwapFee
      totalShares
      owner
      factory
      amp
      createTime
      swapEnabled
      tokens {
        address
        balance
        weight
        priceRate
        symbol
      }
    }
  }
`;
