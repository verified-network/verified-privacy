import {getAddress} from '@ethersproject/address';
import {BigNumber} from '@ethersproject/bignumber';
import {formatUnits} from '@ethersproject/units';

import {default as erc20Abi} from '../../../lib/abi/ERC20.json';
import {multicall} from '../../../lib/utils/balancer/contract';


export default class AllowancesConcern {
  nativeAssetAddress;

  constructor(service) {
    this.service = service;
    this.nativeAssetAddress = this.service.configService.network.nativeAsset.address;
  }

  async get(
    account,
    contractAddresses,
    tokens
  ) {
    try {
      // Filter out eth (or native asset) since it's not relevant for allowances.
      const tokenAddresses = Object.keys(tokens).filter(
        (address) => address !== this.nativeAssetAddress
      );

      const allContractAllowances = await Promise.all(
        contractAddresses.map((contractAddress) =>
          this.getForContract(account, contractAddress, tokenAddresses, tokens)
        )
      );

      const result = Object.fromEntries(
        contractAddresses.map((contract, i) => [
          getAddress(contract),
          allContractAllowances[i],
        ])
      );
      return result;
    } catch (error) {
      console.error('Failed to fetch allowances for:', account, error);
      return {};
    }
  }

  async getForContract(
    account,
    contractAddress,
    tokenAddresses,
    tokens
  ) {
    const network = this.service.configService.network.key;
    const provider = this.service.provider;
    const allowances = (
      await multicall(
        network,
        provider,
        erc20Abi,
        tokenAddresses.map((token) => [
          token,
          'allowance',
          [account, contractAddress],
        ])
      )
    ).map((balance) => BigNumber.from(balance ?? '0')); // If we fail to read a token's allowance, treat it as zero;

    return Object.fromEntries(
      tokenAddresses.map((token, i) => [
        getAddress(token),
        formatUnits(allowances[i], tokens[token].decimals),
      ])
    );
  }
}
