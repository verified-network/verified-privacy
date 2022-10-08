import React, {useEffect, useState} from 'react';
import {getAddress, isAddress} from '@ethersproject/address';

import useAllowancesQuery from '../composables/queries/useAllowancesQuery';
import useTokens from '../composables/useTokens';
import useTokenPricesQuery from '../queries/useTokenPricesQuery';
import useConfig from '../composables/useConfig';
import {configService} from '../services/config/config.service';
import useTokenLists from '../composables/useTokenLists';
import {TOKENS} from '../constants/tokens';
import TokenService from '../services/token/token.service';
import {pick} from 'lodash';
import {bnum} from '../lib/utils';
import useBalancesQuery from '../queries/useBalancesQuery';
import 'babel-polyfill';

const TokensDataContext = React.createContext(null);

const TokensDataProvider = (props) => {
  const {networkConfig} = useConfig();
  const {nativeAsset} = useTokens();
  const {allTokenLists, activeTokenLists, balancerTokenLists} = useTokenLists();

  const [loading, setLoading] = useState(true);
  const [injectedTokens, setInjectedTokens] = useState({
    [networkConfig.nativeAsset.address]: nativeAsset,
  });
  const [loadingInjectedTokens, setLoadingInjectedTokens] = useState(true);
  const [allowanceContracts, setAllowanceContracts] = useState([
    networkConfig.addresses.vault,
    networkConfig.addresses.wstETH,
    configService.network.addresses.veBAL,
  ]);
  const [injectedPrices, setInjectedPrices] = useState({});

  /**
   * LIFECYCLE
   */
  useEffect(() => {
    onBeforeMount();
  }, []);

  useEffect(() => {
    if (!loadingInjectedTokens) {
      // refetchPrices();
      // refetchBalances();
      // refetchAllowances();
    }
  }, [loadingInjectedTokens]);

  const onBeforeMount = async () => {
    const tokensToInject = [
      configService.network.addresses.stETH,
      configService.network.addresses.wstETH,
      configService.network.addresses.veBAL,
      TOKENS.Addresses.BAL,
      TOKENS.Addresses.wNativeAsset,
    ];

    await injectTokens(tokensToInject);
    setLoading(false);
  };

  /**
   * COMPUTED
   */

  /**
   * All tokens from all token lists.
   */
  const allTokenListTokens = {
    ...mapTokenListTokens(Object.values(allTokenLists)),
    ...injectedTokens,
  };

  /**
   * All tokens from token lists that are toggled on.
   */
  const activeTokenListTokens = mapTokenListTokens(Object.values(activeTokenLists));

  /**
   * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
   */
  const balancerTokenListTokens = mapTokenListTokens(Object.values(balancerTokenLists));

  /**
   * The main tokens map
   * A combination of activated token list tokens
   * and any injected tokens. Static and dynamic
   * meta data should be available for these tokens.
   */
  const tokens = {
    ...activeTokenListTokens,
    ...injectedTokens,
  };

  const tokenAddresses = Object.keys(tokens);

  const wrappedNativeAsset = getToken(TOKENS.Addresses.wNativeAsset);

  /** **************************************************************
     * Dynamic metadata
     *
     * The prices, balances and allowances maps provide dynamic
     * metadata for each token in the tokens state array.
     ****************************************************************/
  const {
    data: priceData,
    isSuccess: priceQuerySuccess,
    isLoading: priceQueryLoading,
    isError: priceQueryError,
    refetch: refetchPrices,
  } = useTokenPricesQuery(tokenAddresses, injectedPrices, {
    keepPreviousData: true,
    enabled: false,
  });

  const {
    data: balanceData,
    isSuccess: balanceQuerySuccess,
    isLoading: balanceQueryLoading,
    isError: balancesQueryError,
    refetch: refetchBalances,
  } = useBalancesQuery(tokens, {keepPreviousData: true, enabled: false});

  const {
    data: allowanceData,
    isSuccess: allowanceQuerySuccess,
    isLoading: allowanceQueryLoading,
    isError: allowancesQueryError,
    refetch: refetchAllowances,
    error,
  } = useAllowancesQuery(tokens, allowanceContracts);

  const prices = priceData || {};

  const balances = balanceData || {};
  const allowances = allowanceData || {};

  const dynamicDataLoaded = priceQuerySuccess && balanceQuerySuccess && allowanceQuerySuccess;

  const dynamicDataLoading = priceQueryLoading || balanceQueryLoading || allowanceQueryLoading;

  function mapTokenListTokens(tokenLists) {
    const tokensMap = {};
    const tokens = [...tokenLists].map((list) => list.tokens).flat();

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

  const injectTokens = async (addresses) => {
    addresses = addresses.map((address) => getAddress(address));

    // Remove any duplicates
    addresses = [...new Set(addresses)];

    // Only inject tokens that aren't already in tokens
    const injectable = addresses.filter((address) => !Object.keys(tokens).includes(address));
    if (injectable.length === 0) return;
    const tokenService = new TokenService();
    const newTokens = await tokenService.metadata.get(injectable, allTokenLists);

    const newInjectedTokens = {...injectedTokens, ...newTokens};
    setInjectedTokens(newInjectedTokens);
    setLoadingInjectedTokens(false);
  };

  const searchTokens = async (
    query,
    excluded = [],
    disableInjection = false
  ) => {
    if (!query) return removeExcluded(tokens, excluded);

    if (isAddress(query)) {
      const address = getAddress(query);
      const token = allTokenListTokens[address];
      if (token) {
        return {[address]: token};
      } else {
        if (!disableInjection) {
          await injectTokens([address]);
          return pick(tokens, address);
        } else {
          return {[address]: token};
        }
      }
    } else {
      const tokensArray = Object.entries(allTokenListTokens);
      const results = tokensArray.filter(
        ([, token]) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return removeExcluded(Object.fromEntries(results), excluded);
    }
  };

  const removeExcluded = (
    tokens,
    excluded
  ) => {
    return Object.keys(tokens)
      .filter((address) => !excluded.includes(address))
      .reduce((result, address) => {
        result[address] = tokens[address];
        return result;
      }, {});
  };

  function approvalRequired(
    tokenAddress,
    amount,
    contractAddress = networkConfig.addresses.vault
  ) {
    if (!amount || bnum(amount).eq(0)) return false;
    if (!contractAddress) return false;
    if (tokenAddress === nativeAsset.address) return false;

    const allowance = bnum(
      (allowances[contractAddress] || {})[getAddress(tokenAddress)]
    );
    return allowance.lt(amount);
  }

  function approvalsRequired(
    tokenAddresses,
    amounts,
    contractAddress = networkConfig.addresses.vault
  ) {
    return tokenAddresses.filter((address, index) => {
      if (!contractAddress) return false;

      return approvalRequired(address, amounts[index], contractAddress);
    });
  }

  function priceFor(address) {
    try {
      return prices[address][currency] || 0;
    } catch {
      return 0;
    }
  }

  function balanceFor(address) {
    try {
      return balances[address] || '0';
    } catch {
      return '0';
    }
  }


  function hasBalance(address) {
    return Number(balances[address]) > 0;
  }

  function getTokens(addresses) {
    return pick(tokens, addresses);
  }

  function getToken(address) {
    return tokens[address];
  }

  function injectPrices(pricesToInject) {
    setInjectedPrices({
      ...state.injectedPrices,
      ...pricesToInject,
    });
  }

  // const {
  //   data: allowanceData,
  //   isSuccess: allowanceQuerySuccess,
  //   isLoading: allowanceQueryLoading,
  //   isError: allowancesQueryError,
  //   refetch: refetchAllowances,
  // } = useAllowancesQuery(tokens, allowanceContracts);

  useEffect(() => {
    getPricesData();
  }, []);

  const getPricesData = async () => {
    // const { tokens = [] } = useTokens();
    // const tokensArray = Object.keys(tokens);
    // console.log('TokensProvider getPricesData tokens', tokensArray);
    // const data = await useTokenPricesQuery(tokensArray);
    // console.log('TokensProvider getPricesData', data);
    // setPriceData(data);
    // setLoadingPricesData(false);
  };

  const values = {
    // state
    injectedTokens,
    allowanceContracts,
    injectedPrices,
    nativeAsset,
    // computed
    tokens,
    wrappedNativeAsset,
    activeTokenListTokens,
    balancerTokenListTokens,
    prices,
    balances,
    allowances,
    dynamicDataLoaded,
    dynamicDataLoading,
    priceQueryError,
    priceQueryLoading,
    balancesQueryError,
    allowancesQueryError,
    // methods
    refetchPrices,
    refetchBalances,
    refetchAllowances,
    injectTokens,
    searchTokens,
    hasBalance,
    approvalRequired,
    approvalsRequired,
    priceFor,
    balanceFor,
    getTokens,
    getToken,
    injectPrices,
  };

  return (
    <TokensDataContext.Provider value={{...values}} {...props}>
      {props.children}
    </TokensDataContext.Provider>
  );
};

const useTokensData = () => React.useContext(TokensDataContext);

export default TokensDataContext;
export {TokensDataProvider, useTokensData};
