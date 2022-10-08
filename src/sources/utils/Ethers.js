import {VerifiedWallet} from '@verified-network/verified-sdk';

function isValidMnemonic(mnemonic) {
  try {
    VerifiedWallet.importWallet(mnemonic);
    return true;
  } catch (e) {
    return false;
  }
}

function generateMnemonics() {
  return VerifiedWallet.generateMnemonic();
}

export default {isValidMnemonic, generateMnemonics};
