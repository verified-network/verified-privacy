import axios from 'axios';

import {configService as _configService} from '../config/config.service';

export default class IpfsService {
  gateway;

  constructor(configService = _configService) {
    this.configService = configService;
    this.gateway = this.configService.env.IPFS_NODE;
  }

  async get(hash, protocol = 'ipfs') {
    const {data} = await axios.get(
      `https://${this.gateway}/${protocol}/${hash}`
    );
    return data;
  }
}

export const ipfsService = new IpfsService();
