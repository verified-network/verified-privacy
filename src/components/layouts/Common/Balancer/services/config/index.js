import {Network} from '@balancer-labs/sdk';
import arbitrum from './arbitrum.json';
import docker from './docker.json';
import homestead from './homestead.json';
import kovan from './kovan.json';
import polygon from './polygon.json';
import rinkeby from './rinkeby.json';
import test from './test.json';

const config = {
  [Network.MAINNET]: homestead,
  [Network.KOVAN]: kovan,
  [Network.RINKEBY]: rinkeby,
  [Network.POLYGON]: polygon,
  [Network.ARBITRUM]: arbitrum,
  12345: test,
  // @ts-ignore
  17: docker,
};

export default config;
