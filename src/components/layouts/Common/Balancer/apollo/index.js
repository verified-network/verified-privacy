import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';
import {KYBER_NETWORK_CHAIN_ID} from 'sources/Config';
import {NETWORKS_INFO} from '../poolDetail/kyber/constants/networks';

export const kyberSubgraphClient = new ApolloClient({
  link: new HttpLink({
    uri: NETWORKS_INFO[KYBER_NETWORK_CHAIN_ID].subgraphUrls[0],
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const balancerSubgraphClient = new ApolloClient({
  link: new HttpLink({
    uri: NETWORKS_INFO[KYBER_NETWORK_CHAIN_ID].balancerSubgraphUrl,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const kyberGetBlockClient = () =>
  new ApolloClient({
    link: new HttpLink({
      uri: NETWORKS_INFO[KYBER_NETWORK_CHAIN_ID].subgraphBlockUrl,
    }),
    cache: new InMemoryCache(),
  });
