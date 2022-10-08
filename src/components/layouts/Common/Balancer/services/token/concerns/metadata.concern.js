import {getAddress} from '@ethersproject/address';
import {set} from 'lodash';

import {default as erc20Abi} from '../../../lib/abi/ERC20.json';
import {Multicaller} from '../../../lib/utils/balancer/contract';

export default class MetadataConcern {
  constructor(service) {
    this.service = service;
  }

  async get(
    addresses,
    tokenLists
  ) {
    addresses = addresses.map((address) => getAddress(address));
    const tokenListTokens = this.tokenListsTokensFrom(tokenLists);
    let metaDict = this.getMetaFromLists(addresses, tokenListTokens);

    // If token meta can't be found in TokenLists, fetch onchain
    const unknownAddresses = addresses.filter(
      (address) => !Object.keys(metaDict).includes(address)
    );
    if (unknownAddresses.length > 0) {
      const onchainMeta = await this.getMetaOnchain(unknownAddresses);
      metaDict = {...metaDict, ...onchainMeta};
    }

    return metaDict;
  }

  tokenListsTokensFrom(lists) {
    return Object.values(lists)
      .map((list) => list.tokens)
      .flat();
  }

  getMetaFromLists(
    addresses,
    tokens
  ) {
    const metaDict = {};

    addresses.forEach(async (address) => {
      const tokenMeta = tokens.find(
        (token) => getAddress(token.address) === address
      );
      if (tokenMeta) {
        metaDict[address] = {
          ...tokenMeta,
          address,
        };
      }
    });

    return metaDict;
  }

  async getMetaOnchain(addresses) {
    try {
      const network = this.service.configService.network.key;
      const multi = new Multicaller(network, this.service.provider, erc20Abi);
      const metaDict = {};

      addresses.forEach((address) => {
        set(metaDict, `${address}.address`, address);
        set(metaDict, `${address}.chainId`, parseInt(network));
        set(
          metaDict,
          `${address}.logoURI`,
          `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`
        );
        multi.call(`${address}.name`, address, 'name');
        multi.call(`${address}.symbol`, address, 'symbol');
        multi.call(`${address}.decimals`, address, 'decimals');
      });

      return await multi.execute(metaDict);
    } catch (error) {
      console.error('Failed to fetch onchain meta', addresses, error);
      return {};
    }
  }
}
