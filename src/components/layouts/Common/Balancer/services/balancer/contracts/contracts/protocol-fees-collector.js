import {formatUnits} from '@ethersproject/units';
import {Contract} from 'ethers';

import ProtocolFeesCollectorAbi from '../../../../lib/abi/ProtocolFeesCollector.json';

export default class ProtocolFeesCollector {
  address;
  instance;

  constructor(vault) {}

  async getAddress() {
    return (await this.vault.instance.getProtocolFeesCollector());
  }

  async getInstance() {
    this.address = await this.getAddress();
    return new Contract(
      this.address,
      ProtocolFeesCollectorAbi,
      this.vault.service.provider
    );
  }

  async getSwapFeePercentage() {
    try {
      this.instance = await this.getInstance();
      const scaledPercentage = await this.instance.getSwapFeePercentage();
      return Number(formatUnits(scaledPercentage, 18));
    } catch (error) {
      console.error('Failed to fetch protocol fee', error);
      return 0;
    }
  }
}
