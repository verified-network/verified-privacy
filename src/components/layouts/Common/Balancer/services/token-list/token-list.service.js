import axios from 'axios';

import {TOKEN_LIST_MAP} from '../../constants/tokenlists';
import {rpcProviderService} from '../../rpc-provider/rpc-provider.service';

import {configService} from '../config/config.service';
import {ipfsService} from '../ipfs/ipfs.service';

export default class TokenListService {
  constructor(
    config = configService,
    appNetwork = config.network.key,
    provider = rpcProviderService.jsonProvider,
    ipfs = ipfsService
  ) {
    this.config = config;
    this.appNetwork = appNetwork;
    this.provider = provider;
    this.ipfs = ipfs;
  }

  /**
   * Return all token list URIs for the app network in
   * a structured object.
   */
  get uris() {
    const {Balancer, External} = TOKEN_LIST_MAP[this.appNetwork];

    const balancerLists = [Balancer.Default, Balancer.Vetted];
    const All = [...balancerLists, ...External];
    const Approved = [Balancer.Default, ...External];

    return {
      All,
      Balancer: {
        All: balancerLists,
        ...Balancer,
      },
      Approved,
      External,
    };
  }

  async getAll(uris = this.uris.All) {
    const allFetchFns = uris.map((uri) => this.get(uri));
    const lists = await Promise.all(
      allFetchFns.map((fetchList) => fetchList.catch((e) => e))
    );
    const listsWithKey = lists.map((list, i) => [uris[i], list]);
    const validLists = listsWithKey.filter((list) => !(list[1] instanceof Error));
    if (validLists.length === 0) {
      throw new Error('Failed to load any TokenLists');
    } else if (lists[0] instanceof Error) {
      throw new Error('Failed to load default TokenList');
    }
    return Object.fromEntries(validLists);
  }

  async get(uri) {
    try {
      const [protocol, path] = uri.split('://');

      if (uri.endsWith('.eth')) {
        return await this.getByEns(uri);
      } else if (protocol === 'https') {
        const {data} = await axios.get(uri);
        return data;
      } else if (protocol === 'ipns') {
        return await this.ipfs.get(path, protocol);
      } else {
        console.error('Unhandled TokenList protocol', uri);
        throw new Error('Unhandled TokenList protocol');
      }
    } catch (error) {
      console.error('Failed to load TokenList', uri, error);
      throw error;
    }
  }

  async getByEns(ensName) {
    const resolver = await this.provider.getResolver(ensName);
    if (resolver === null) throw new Error('Could not resolve ENS');
    const [, ipfsHash] = (await resolver.getContentHash()).split('://');
    return await this.ipfs.get(ipfsHash);
  }
}

export const tokenListService = new TokenListService();
