import LocalSessionManager from 'sources/utils/LocalSessionManager';
import Config from 'sources/Config';
import {VerifiedWallet} from '@verified-network/verified-sdk';

class ContractService {
  static walletCache = null;
  static l1WalletCache = null;
  static mnemonics = null;

  constructor(password) {
    if (!ContractService.walletCache) {
      const mnemonic = LocalSessionManager.getWallet(password);
      this.password = password;

      ContractService.walletCache = VerifiedWallet.importWallet(mnemonic).setProvider(Config.privateProvider);

      ContractService.l1WalletCache = VerifiedWallet.importWallet(mnemonic).setProvider(Config.publicProvider);
    }

    this.wallet = ContractService.walletCache;
    this.l1Wallet = ContractService.l1WalletCache;
  }

  getWallet = () => {
    return this.wallet;
  };

  getL1Wallet = () => {
    return this.l1Wallet;
  };

  getPassword = () => {
    return this.password;
  };

  static removeWalletCache() {
    ContractService.walletCache = null;
    ContractService.l1walletCache = null;
  }
}

export default ContractService;
