import {SUPPORTED_FIAT} from '../../constants/currency';

import {PriceService} from './api/price.service';
import {coingeckoClient} from './coingecko.client';

export const getNativeAssetId = (chainId) => {
  const mapping = {
    '1': 'ethereum',
    '42': 'ethereum',
    '137': 'matic-network',
    '42161': 'ethereum',
  };

  return mapping[chainId] || 'ethereum';
};

export const getPlatformId = (chainId) => {
  const mapping = {
    '1': 'ethereum',
    '42': 'ethereum',
    '137': 'polygon-pos',
    '42161': 'arbitrum-one',
  };

  return mapping[chainId] || 'ethereum';
};

export class CoingeckoService {
  supportedFiat;
  prices;

  constructor(
    client = coingeckoClient,
    priceServiceClass = PriceService
  ) {
    this.client = client;
    this.supportedFiat = SUPPORTED_FIAT.join(',');
    this.prices = new priceServiceClass(this);
  }
}

export const coingeckoService = new CoingeckoService();
