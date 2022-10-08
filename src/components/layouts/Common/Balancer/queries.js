import gql from 'graphql-tag';

export const GET_POOLS = gql`
  {
    pools(
      first: 100
      orderBy: "totalLiquidity"
      orderDirection: "desc"
      where: {
        totalShares_gt: 0.01
        id_not_in: [""]
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
  }
`;

export const GET_KYBER_POOL_DAYS_DATA = gql`
query getPoolDayDatas (
  $id: String
) {
  poolDayDatas (
    id: $id 
    first: 199
  ) {
    date
    id
    totalSupply
  }
}
`;

export const GET_POOL = gql`
query getPool($id: String)
{
  pool(
    id: $id
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
