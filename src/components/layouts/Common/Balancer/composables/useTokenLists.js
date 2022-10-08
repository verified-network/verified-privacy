import {
  activeTokenLists,
  allTokenLists,
  approvedTokenLists,
  balancerTokenLists,
  defaultTokenList,
  vettedTokenList,
} from '../providers/token-lists.provider';

export default function useTokenLists() {
  return {
    allTokenLists,
    activeTokenLists,
    defaultTokenList,
    vettedTokenList,
    balancerTokenLists,
    approvedTokenLists,
  };
}
