import {
  activeTokenListTokens,
  allTokenListTokens,
  balancerTokenListTokens,
  getToken,
  getTokens,
  mapTokenListTokens,
  tokenAddresses,
  tokens,
  wrappedNativeAsset,
  nativeAsset,
  allowanceContracts,
} from '../providers/tokens.provider';

export default function useTokens() {
  return {
    getToken,
    getTokens,
    allTokenListTokens,
    activeTokenListTokens,
    balancerTokenListTokens,
    tokens,
    tokenAddresses,
    wrappedNativeAsset,
    mapTokenListTokens,
    nativeAsset,
    allowanceContracts,
  };
}
