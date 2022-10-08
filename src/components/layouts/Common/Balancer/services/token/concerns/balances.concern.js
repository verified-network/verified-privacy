import {getAddress} from '@ethersproject/address';
import {BigNumber} from '@ethersproject/bignumber';
import {formatUnits} from '@ethersproject/units';
import {chunk} from 'lodash';

import {default as erc20Abi} from '../../../lib/abi/ERC20.json';
import {multicall} from '../../../lib/utils/balancer/contract';

export default class BalancesConcern {
  network;
  provider;
  nativeAssetAddress;
  nativeAssetDecimals;

  constructor(service) {
    this.service = service;
    this.network = this.service.configService.network.key;
    this.provider = this.service.provider;
    this.nativeAssetAddress = this.service.configService.network.nativeAsset.address;
    this.nativeAssetDecimals = this.service.configService.network.nativeAsset.decimals;
  }

  async get(account, tokens) {
    const paginatedAddresses = chunk(Object.keys(tokens), 1000);
    const multicalls = [];

    paginatedAddresses.forEach((addresses) => {
      const request = this.fetchBalances(account, addresses, tokens);
      multicalls.push(request);
    });
    const paginatedBalances = await Promise.all(multicalls);
    const validPages = paginatedBalances.filter(
      (page) => !(page instanceof Error)
    );

    return validPages.reduce((result, current) =>
      Object.assign(result, current)
    );
  }

  async fetchBalances(
    account,
    addresses,
    tokens
  ) {
    try {
      const balanceMap = {};

      // If native asset included in addresses, filter out for
      // multicall, but fetch indpendently and inject.
      if (addresses.includes(this.nativeAssetAddress)) {
        addresses = addresses.filter(
          (address) => address !== this.nativeAssetAddress
        );
        balanceMap[this.nativeAssetAddress] = await this.fetchNativeBalance();
      }

      const balances = (
        await multicall(
          this.network,
          this.provider,
          erc20Abi,
          addresses.map((address) => [address, 'balanceOf', [account]])
        )
      ).map((result) => BigNumber.from(result ?? '0')); // If we fail to read a token's balance, treat it as zero

      return {
        ...this.associateBalances(balances, addresses, tokens),
        ...balanceMap,
      };
    } catch (error) {
      console.error('Failed to fetch balances for:', addresses);
      throw error;
    }
  }

  async fetchNativeBalance() {
    const balance = await this.provider.getBalance();
    return formatUnits(balance.toString(), this.nativeAssetDecimals);
  }

  associateBalances(
    balances,
    addresses,
    tokens
  ) {
    return Object.fromEntries(
      addresses.map((address, i) => [
        getAddress(address),
        formatUnits(balances[i], tokens[address].decimals),
      ])
    );
  }
}
