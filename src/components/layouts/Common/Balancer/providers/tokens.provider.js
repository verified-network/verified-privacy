import {getAddress} from '@ethersproject/address';
import {pick} from 'lodash';

import useConfig from '../composables/useConfig';
import useTokenLists from '../composables/useTokenLists';
import {TOKENS} from '../constants/tokens';
import {configService} from '../services/config/config.service';

const {networkConfig} = useConfig();
const {allTokenLists, activeTokenLists, balancerTokenLists} = useTokenLists();

export const nativeAsset = {
  ...networkConfig.nativeAsset,
  chainId: networkConfig.chainId,
};

export const allowanceContracts = [
  networkConfig.addresses.vault,
  networkConfig.addresses.wstETH,
  configService.network.addresses.veBAL,
];

const injectedTokens = {
  [networkConfig.nativeAsset.address]: nativeAsset,
};

/**
 * All tokens from all token lists.
 */
export const allTokenListTokens = {
  ...mapTokenListTokens(Object.values(allTokenLists)),
  ...injectedTokens,
};

/**
 * All tokens from token lists that are toggled on.
 */
export const activeTokenListTokens = mapTokenListTokens(Object.values(activeTokenLists));

/**
 * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
 */
export const balancerTokenListTokens = mapTokenListTokens(Object.values(balancerTokenLists));

/**
 * The main tokens map
 * A combination of activated token list tokens
 * and any injected tokens. Static and dynamic
 * meta data should be available for these tokens.
 */
export const tokens = {
  ...activeTokenListTokens,
  ...injectedTokens,
};

export const tokenAddresses = Object.keys(tokens);

export function mapTokenListTokens(tokenLists) {
  const tokensMap = {};
  const tokens = [...tokenLists].map((list) => list.tokens).flat();
  const tokensNew = tokens.filter((item) => item.chainId === networkConfig.chainId);
  // console.log('Tokens.provider mapTokenListTokens', {activeTokenLists, tokenLists, tokens, tokensNew});
  tokens.forEach((token) => {
    const address = getAddress(token.address);
    // Don't include if already included
    if (Object.keys(tokensMap).includes(address)) return;
    // Don't include if not on app network
    if (token.chainId !== networkConfig.chainId) return;

    tokensMap[address] = {
      ...token,
      address,
    };
  });

  return tokensMap;
}

export function getToken(address) {
  return allTokenListTokens[address];
}

export function getTokens(addresses) {
  return pick(tokens, addresses);
}

export const wrappedNativeAsset = getToken(TOKENS.Addresses.wNativeAsset);

// console.log('Verified tokens.provider', {tokens, allTokenLists, injectedTokens, activeTokenLists});
