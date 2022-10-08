import {useQuery} from 'react-query';

import QUERY_KEYS from '../constants/queryKeys';
import TokenService from '../services/token/token.service';
import useNetwork from '../composables/useNetwork';

export default function useBalancesQuery(
  tokens = {},
  options = {}
) {
  /**
   * COMPOSABLES
   */
  const {networkId} = useNetwork();

  /**
   * COMPUTED
   */
  const tokenAddresses = Object.keys(tokens);

  /**
   * QUERY INPUTS
   */

  const getQueryKey = () => {
    const tokenService = new TokenService();
    const wallet = tokenService.getWallet();
    return QUERY_KEYS.Account.Balances(networkId, wallet.address, tokenAddresses);
  };

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.length, 'balances');
    const tokenService = new TokenService();
    const wallet = tokenService.getWallet();
    return await tokenService.balances.get(wallet.address, tokens);
  };

  const queryOptions = {
    enabled: true,
    ...options,
  };

  return useQuery(getQueryKey(), queryFn, queryOptions);
}
