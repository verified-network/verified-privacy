/**
 This file is temporal, this code should be in /src/config, but I can not make that files work.
 */

import {ChainId} from '@kyberswap/ks-sdk-core';
import {Provider} from '@verified-network/verified-sdk';

export const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || '82b05784-f90c-442f-8f20-d24cd6f09e5a';
export const WEBSITE_URL = process.env.REACT_APP_WEBSITE_URL || 'https://www.verified.network';
const strapiBaseUrl = process.env.REACT_APP_STRAPI_BASE_URL || 'https://cms.verified.network';
const loginDomainUrlBase = 'https://verified.azurewebsites.net';
const currenciesDomainUrl = 'https://via-oracle.azurewebsites.net';

const common = {
  loginDomainUrl: loginDomainUrlBase,
  authenticatedUserUrl: strapiBaseUrl + '/api/users/me',
  logoutUrl: strapiBaseUrl + '/.auth/logout',
  fiatCurrenciesUrl: currenciesDomainUrl + '/currencies/fiat',
};

const NETWORKS = {
  PRIVATE: 'goerli',
  PUBLIC: 'goerli',
  MAINNET: 'mainnet',
};

export const KYBER_NETWORK_CHAIN_ID = ChainId.MAINNET;

const API_KEY_PRIVATE = 'de690419921a4008b54557185153f07e';
const API_KEY_PUBLIC = 'de690419921a4008b54557185153f07e';

// eslint-disable-next-line no-unused-vars
const dev = {
  ...common,
  loginRedirectionUrl: `${location.protocol}//${location.hostname}:${location.port}`,
  // provider: Provider.alchemyProvider('ropsten', 'nWinponDmrq-aZ0m9CmUVEQfqi9Z9XgA'),
  privateProvider: Provider.infuraProvider(NETWORKS.PRIVATE, API_KEY_PRIVATE),
  publicProvider: Provider.infuraProvider(NETWORKS.PUBLIC, API_KEY_PUBLIC),
  mainnetProvider: Provider.infuraProvider(NETWORKS.MAINNET, API_KEY_PUBLIC),
  ipfs: {
    host: 'ipfs.infura.io',
    port: 5001,
    id: '1xtQeLMGk01DFlZtM54TyZfH5F4',
    secret: 'cf4b91f44177738adfae156d1dc8bc36',
  },
  managerApiUrl: 'https://verified.azurewebsites.net/api/authmanager',
  listCountryApi: 'https://verified.azurewebsites.net/api/country',
  paymentGatewayUrl: 'https://verified.azurewebsites.net/api/paymentgateway',
  // paymentGatewayUrl: 'http://localhost:7071/api/paymentgateway',
  graphApiUrl: 'https://api.thegraph.com/subgraphs/name/verified-network/wallet',
  emailApiUrl: 'https://verified.azurewebsites.net/api/emailsender',
};

// eslint-disable-next-line no-unused-vars
const prod = {
  ...common,
  loginRedirectionUrl: 'https://wallet.verified.network',
};

export default dev;
