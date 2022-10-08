export const POOLS_ROOT_KEY = 'pools';
export const BALANCES_ROOT_KEY = 'accountBalances';
export const CLAIMS_ROOT_KEY = 'claims';

const QUERY_KEYS = {
  Pools: {
    All: (networkId, tokens, poolIds, poolAddresses, gaugeAddresses) => [
      POOLS_ROOT_KEY,
      'all',
      {networkId, tokens, poolIds, poolAddresses, gaugeAddresses},
    ],
    User: (networkId, account, gaugeAddresses) => [POOLS_ROOT_KEY, 'user', {networkId, account, gaugeAddresses}],
    Current: (id, gaugeAddresses) => [POOLS_ROOT_KEY, 'current', {id, gaugeAddresses}],
    Snapshot: (networkId, id) => [POOLS_ROOT_KEY, 'snapshot', {networkId, id}],
    Activities: (networkId, id) => [POOLS_ROOT_KEY, 'activities', 'all', {networkId, id}],
    UserActivities: (networkId, id, account) => [POOLS_ROOT_KEY, 'activities', 'user', {networkId, account, id}],
    Swaps: (networkId, id, subgraphQuery) => [POOLS_ROOT_KEY, 'swaps', {networkId, id, subgraphQuery}],
    UserSwaps: (networkId, id, account) => [POOLS_ROOT_KEY, 'swaps', 'user', {networkId, account, id}],
  },
  TokenLists: {
    All: (networkId) => ['tokenLists', 'all', {networkId}],
  },
  Claims: {
    All: (networkId, account) => [CLAIMS_ROOT_KEY, {networkId, account}],
    Protocol: (networkId, account) => [CLAIMS_ROOT_KEY, 'protocol', {networkId, account}],
  },
  Tokens: {
    TrendingPairs: (userNetworkId) => ['trendingTradePairs', {userNetworkId}],
    PairPriceData: (
      tokenInAddress,
      tokenOutAddress,
      activeTimespan,
      userNetworkId,
      nativeAsset,
      wrappedNativeAsset,
    ) => [
      'pairPriceData',
      {
        tokenInAddress,
        tokenOutAddress,
        activeTimespan,
        userNetworkId,
        nativeAsset,
        wrappedNativeAsset,
      },
    ],
    Prices: (networkId, tokens, pricesToInject) => ['tokens', 'prices', {networkId, tokens, pricesToInject}],
    AllPrices: ['tokens', 'prices'],
    VeBAL: (networkId, account) => ['tokens', 'veBAL', {networkId, account}],
  },
  Account: {
    Balances: (networkId, account, tokens) => ['account', 'balances', {networkId, account, tokens}],
    Allowances: (networkId, account, contractAddresses, tokens) => [
      'account',
      'allowances',
      {networkId, account, contractAddresses, tokens},
    ],
    RelayerApprovals: (networkId, account, relayer) => ['account', 'relayer', {networkId, account, relayer}],
    Profile: (networkId, account, chainId) => ['account', 'profile', {networkId, account, chainId}],
  },
  Gauges: {
    All: {
      Static: () => ['gauges', 'all', 'static'],
      Onchain: (gauges, account, networkId) => ['gauges', 'all', 'onchain', {gauges, account, networkId}],
    },
    Voting: (account) => ['gauges', 'voting', {account}],
  },
  Transaction: {
    ConfirmationDate: (receipt) => ['tx', 'confirmation', 'date', {receipt}],
  },
};

export default QUERY_KEYS;
