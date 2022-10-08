import {pick} from 'lodash';
import {tokenListService} from '../services/token-list/token-list.service';

const {uris} = tokenListService;

export const activeTokenLists = pick(allTokenLists, activeListKeys);

const activeListKeys = [uris.Balancer.Default];

let allTokenLists = {};
try {
  allTokenLists = require('../data/tokenlists.json');
  // console.log('token-lists.provider', {activeTokenLists, activeListKeys, allTokenLists});
} catch (error) {
  console.error('Failed to fetch tokenlists', error);
  throw error;
}

export {
  allTokenLists,
};

export const defaultTokenList = allTokenLists[uris.Balancer.Default];

export const vettedTokenList = allTokenLists[uris.Balancer.Vetted];

export const balancerTokenLists = pick(allTokenLists, uris.Balancer.All);

export const approvedTokenLists = pick(allTokenLists, uris.Approved);

