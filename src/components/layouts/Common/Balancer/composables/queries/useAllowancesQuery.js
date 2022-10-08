import {useQuery} from 'react-query';

import QUERY_KEYS from '../../constants/queryKeys';
import TokenService from '../../services/token/token.service';

import useNetwork from '../useNetwork';

export default function useAllowancesQuery(
  tokens = {},
  contractAddresses = [],
  options = {}
) {
  const tokenService = new TokenService();
  const account = tokenService.wallet.address;
  const {networkId} = useNetwork();

  const enabled = !!tokenService.wallet;
  const tokenAddresses = Object.keys(tokens);

  const queryKey = QUERY_KEYS.Account.Allowances(
    networkId,
    account,
    contractAddresses,
    tokenAddresses
  );

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.length, 'allowances', {account, contractAddresses, tokens});
    const allowances = await tokenService.allowances.get(
      account,
      contractAddresses,
      tokens
    );

    return allowances;
  };

  const queryOptions = {
    enabled,
    ...options,
  };

  return useQuery(queryKey, queryFn, queryOptions);
}
