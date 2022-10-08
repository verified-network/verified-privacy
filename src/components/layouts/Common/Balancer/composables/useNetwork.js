import {Network} from '@balancer-labs/sdk';

import config from '../services/config';

const DEFAULT_NETWORK_ID = Network.MAINNET;

export const networkId = DEFAULT_NETWORK_ID;

export const isPolygon = networkId === Network.POLYGON;

export function networkFor(key) {
  switch (key.toString()) {
  case '1':
    return Network.MAINNET;
  case '42':
    return Network.KOVAN;
  case '137':
    return Network.POLYGON;
  case '42161':
    return Network.ARBITRUM;
  default:
    throw new Error('Network not supported');
  }
}

export function networkNameFor(network) {
  return config[network].network;
}

export function subdomainFor(network) {
  switch (network) {
  case Network.MAINNET:
    return 'app';
  case Network.KOVAN:
    return 'kovan';
  case Network.POLYGON:
    return 'polygon';
  case Network.ARBITRUM:
    return 'arbitrum';
  default:
    throw new Error('Network not supported');
  }
}

export function urlFor(network) {
  const subdomain = subdomainFor(network);
  const host = 'balancer.fi';
  return `https://${subdomain}.${host}/#`;
}

export default function useNetwork() {
  return {
    // setNetworkId,
    networkId,
  };
}
