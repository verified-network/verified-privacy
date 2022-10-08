import {Fetcher} from 'dmm-sdk';
import ContractService from 'sources/contracts/ContractService';
import JSBI from 'jsbi';
import {Pair, Route, Router, Trade} from 'ks-sdk-classic';
import {Percent, Token, TokenAmount} from '@kyberswap/ks-sdk-core';
import {NETWORKS_INFO} from '../poolDetail/kyber/constants/networks';
import {KYBER_NETWORK_CHAIN_ID} from 'sources/Config';

// const tokenAddress1 = '0xc778417E063141139Fce010982780140Aa0cD5Ab'; // WETH
// const tokenAddress2 = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'; // DAI

const factoryAddress = NETWORKS_INFO[KYBER_NETWORK_CHAIN_ID].factoryAddress;

export const kyberSwap = async (poolData, password) => {
  const tokens = poolData.tokens;
  const tokenAddress1 = tokens[0].address;
  const tokenAddress2 = tokens[1].address;

  const contractService = new ContractService(password);
  const wallet = contractService.getWallet();

  const token1 = new Token(4, tokenAddress1, 18, 't0');
  const token2 = new Token(4, tokenAddress2, 18, 't1');
  const ampBps = JSBI.BigInt(10000);

  const pool = await fetchKyberPool(tokens);

  const pair_0_1 = new Pair(
    pool[0].address,
    TokenAmount.fromRawAmount(token1, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token2, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token1, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token2, JSBI.BigInt(1000)),
    JSBI.BigInt(3e15),
    ampBps,
  );

  // const token1 = await Fetcher.fetchTokenData(1, tokenAddress1, wallet);
  // const token2 = await Fetcher.fetchTokenData(1, tokenAddress2, wallet);

  const tokenAmount = new TokenAmount(token1, JSBI.BigInt(100e18));
  console.log('JSBI.BigInt(100)', JSBI.BigInt(100), tokenAmount);
  // return;

  console.log('KyberSwap pool', {pair_0_1, pool, tokenAddress1, tokenAddress2, TokenAmount});
  // return;

  const route = new Route([pair_0_1], token1, token2);

  console.log('KyberSwap route', {route});

  const trade = Trade.exactIn(route, TokenAmount.fromRawAmount(token1, JSBI.BigInt(100)));

  console.log('KyberSwap trade', {trade});

  const resultRouter = Router.swapCallParameters(trade, {
    ttl: 50,
    recipient: '0xFe59f26Ea8DB34f2ddB82594007fa8B2098180a2',
    allowedSlippage: new Percent('1', '100'),
  });

  console.log('KyberSwap result', resultRouter);
};

const fetchKyberPool = async (tokens) => {
  const tokenAddress1 = tokens[0].address;
  const tokenAddress2 = tokens[1].address;
  const contractService = new ContractService('Krishan@123#');
  const wallet = contractService.getWallet();

  console.log('kyberSwap fetchKyberPool wallet', wallet);
  const token1 = await Fetcher.fetchTokenData(1, tokenAddress1, wallet);
  const token2 = await Fetcher.fetchTokenData(1, tokenAddress2, wallet);
  console.log('fetchKyberPool token1', {token1, token2});
  const pools = await Fetcher.fetchPairData(token1, token2, factoryAddress, wallet);
  console.log('fetchKyberPool pools', pools);
  return pools;
};
