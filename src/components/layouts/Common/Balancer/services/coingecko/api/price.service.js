import {fromUnixTime, getUnixTime, startOfHour} from 'date-fns';
import {groupBy, invert, last} from 'lodash';

import {twentyFourHoursInSecs} from '../../../composables/useTime';
import {SUPPORTED_FIAT} from '../../../constants/currency';
import {TOKENS} from '../../../constants/tokens';
import {retryPromiseWithDelay} from '../../../lib/utils/promise';
import {configService as _configService} from '../../config/config.service';

import {CoingeckoClient} from '../coingecko.client';
import {
  CoingeckoService,
  getNativeAssetId,
  getPlatformId,
} from '../coingecko.service';

export class PriceService {
  constructor(service = CoingeckoService, configService = _configService) {
    this.configService = configService;
    this.client = new CoingeckoClient();
    this.fiatParam = SUPPORTED_FIAT.join(',');
    this.appNetwork = this.configService.network.key;
    this.platformId = getPlatformId(this.appNetwork);
    this.nativeAssetId = getNativeAssetId(this.appNetwork);
    this.nativeAssetAddress = this.configService.network.nativeAsset.address;
    this.appAddresses = this.configService.network.addresses;
  }

  async getTokensHistorical(
    addresses,
    days,
    addressesPerRequest = 1,
    aggregateBy = 'day'
  ) {
    try {
      if (addresses.length / addressesPerRequest > 10) {
        throw new Error('To many requests for rate limit.');
      }

      const now = Math.floor(Date.now() / 1000);
      const end =
        aggregateBy === 'hour' ? now : now - (now % twentyFourHoursInSecs);
      const start = end - days * twentyFourHoursInSecs;

      addresses = addresses.map((address) => this.addressMapIn(address));
      const requests = [];

      addresses.forEach((address) => {
        const endpoint = `/coins/${
          this.platformId
        }/contract/${address.toLowerCase()}/market_chart/range?vs_currency=${
          this.fiatParam
        }&from=${start}&to=${end}`;
        const request = retryPromiseWithDelay(
          this.client.get(endpoint),
          2, // retryCount
          2000 // delayTime
        );
        requests.push(request);
      });

      const paginatedResults = await Promise.all(requests);
      const results = this.parseHistoricalPrices(
        paginatedResults,
        addresses,
        start,
        aggregateBy
      );
      return results;
    } catch (error) {
      console.error('Unable to fetch token prices', addresses, error);
      throw error;
    }
  }

  parsePaginatedTokens(paginatedResults) {
    const results = paginatedResults.reduce(
      (result, page) => ({...result, ...page}),
      {}
    );
    const entries = Object.entries(results);
    const parsedEntries = entries
      .filter((result) => Object.keys(result[1]).length > 0)
      .map((result) => [this.addressMapOut(result[0]), result[1]]);
    return Object.fromEntries(parsedEntries);
  }

  parseHistoricalPrices(
    results,
    addresses,
    start,
    aggregateBy = 'day'
  ) {
    const assetPrices = Object.fromEntries(
      addresses.map((address, index) => {
        address = this.addressMapOut(address);
        const result = results[index].prices;
        const prices = {};
        let dayTimestamp = start;
        if (aggregateBy === 'hour') {
          const pricesByHour = groupBy(result, (r) =>
            getUnixTime(startOfHour(fromUnixTime(r[0] / 1000)))
          );
          for (const key of Object.keys(pricesByHour)) {
            const price = (last(pricesByHour[key]) || [])[1] || 0;
            prices[Number(key) * 1000] = price;
          }
        } else if (aggregateBy === 'day') {
          for (const key in result) {
            const value = result[key];
            const [timestamp, price] = value;
            if (timestamp > dayTimestamp * 1000) {
              prices[dayTimestamp * 1000] = price;
              dayTimestamp += twentyFourHoursInSecs;
            }
          }
        }
        return [address, prices];
      })
    );

    const prices = {};
    for (const asset in assetPrices) {
      const assetPrice = assetPrices[asset];
      for (const timestamp in assetPrice) {
        const price = assetPrice[timestamp];
        if (!(timestamp in prices)) {
          prices[timestamp] = [];
        }
        prices[timestamp].push(price);
      }
    }
    return prices;
  }

  addressMapIn(address) {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return addressMap[address.toLowerCase()] || address;
  }

  addressMapOut(address) {
    const addressMap = TOKENS?.PriceChainMap;
    if (!addressMap) return address;
    return invert(addressMap)[address.toLowerCase()] || address;
  }
}
