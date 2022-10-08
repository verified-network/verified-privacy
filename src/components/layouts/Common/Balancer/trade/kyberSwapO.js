import {ChainId, Percent, Token, TokenAmount} from '@kyberswap/ks-sdk-core';
import JSBI from 'jsbi';
import {Pair, Route, Router, Trade} from 'ks-sdk-classic';


const tokenAddress1 = '0xc778417E063141139Fce010982780140Aa0cD5Ab'; // WETH
const tokenAddress2 = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F'; // DAI

const factoryAddress = '0x0639542a5cd99bd5f4e85f58cb1f61d8fbe32de9';

export const kyberSwap = async () => {
  const token0 = new Token(ChainId.MAINNET, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 't0');
  const token1 = new Token(ChainId.MAINNET, '0x07865c6E87B9F70255377e024ace6630C1Eaa37F', 18, 't1');
  const ampBps = JSBI.BigInt(10000);

  const pair_0_1 = new Pair(
    '0x0000000000000000000000000000000000000005',
    TokenAmount.fromRawAmount(token0, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token1, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token0, JSBI.BigInt(1000)),
    TokenAmount.fromRawAmount(token1, JSBI.BigInt(1000)),
    JSBI.BigInt(3e15),
    ampBps
  );

  const route = new Route([pair_0_1], token0, token1);
  const amount = TokenAmount.fromRawAmount(token0, JSBI.BigInt(100));

  console.log('KyberSwap function', {route, pair_0_1, amount});

  const result = Router.swapCallParameters(
    Trade.exactIn(route, amount),
    {ttl: 50, recipient: '0xFe59f26Ea8DB34f2ddB82594007fa8B2098180a2', allowedSlippage: new Percent('1', '100')}
  );

  console.log('KyberSwap function result', {result});
};
