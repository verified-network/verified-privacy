import LS_KEYS from '../constants/local-storage.keys';
import {lsGet, lsSet} from '../lib/utils';

export const EthereumTxType = {
  LEGACY: 'Legacy',
  EIP1559: 'EIP1559',
};

const lsEthereumTxType = lsGet(
  LS_KEYS.App.EthereumTxType,
  EthereumTxType.EIP1559
);

// STATE
export let ethereumTxType = lsEthereumTxType;

// MUTATIONS
function setEthereumTxType(txType) {
  ethereumTxType = txType;
  lsSet(LS_KEYS.App.EthereumTxType, txType);
}

// INIT
// setEthereumTxType(ethereumTxType);

export default function useEthereumTxType() {
  return {
    ethereumTxType,
    setEthereumTxType,
  };
}
