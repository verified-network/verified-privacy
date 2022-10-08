import {useQuery} from 'react-query';

import QUERY_KEYS from '../constants/queryKeys';
import {sleep} from '../lib/utils';
import {coingeckoService} from '../services/coingecko/coingecko.service';

import useNetwork from '../composables/useNetwork';

/**
 * CONSTANTS
 */
const PER_PAGE = 1000;

export default function useTokenPricesQuery(addresses = [], pricesToInject = {}, options = {}) {
  const {networkId} = useNetwork();
  const queryKey = QUERY_KEYS.Tokens.Prices(networkId, addresses, pricesToInject);

  function injectCustomTokens(prices, pricesToInject) {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address];
    }
    return prices;
  }

  const queryFn = async () => {
    // Sequential pagination required to avoid coingecko rate limits.
    let prices = {};
    const pageCount = Math.ceil(addresses.length / PER_PAGE);
    const pages = Array.from(Array(pageCount).keys());

    for (const page of pages) {
      if (page !== 0) await sleep(1000);
      const pageAddresses = addresses.slice(PER_PAGE * page, PER_PAGE * (page + 1));
      console.log('Fetching', pageAddresses.length, 'prices', {pageAddresses, addresses});
      prices = {
        ...prices,
        ...(await coingeckoService.prices.getTokens(pageAddresses)),
      };
    }

    console.log('Injecting price data', prices);
    prices = injectCustomTokens(prices, pricesToInject);
    console.log('Injecting price data prices', prices);
    return prices;
  };

  const queryOptions = {
    enabled: true,
    ...options,
  };

  return useQuery(queryKey, queryFn, queryOptions);
}
