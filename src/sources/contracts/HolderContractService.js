import ContractService from './ContractService';
import AccountContractService from './AccountContractService';
import {HolderContract} from '@verified-network/verified-sdk';
import Response from './Response';
import KycContractService from 'sources/contracts/KycContractService';

class HolderContractService extends ContractService {
  constructor(password) {
    super(password);
  }

  fetchTransactions(fromDate, toDate) {
    const accountContractService = new AccountContractService(this.getWallet());

    return accountContractService._getOrCreateHolder(this.getWallet().address, 'default')
      .then((holderAddress) => {
        const holderContract = new HolderContract(this.getWallet(), holderAddress);

        return holderContract.fetchTransactions(fromDate, toDate)
          .then((response) => Response.empty(response));
      });
  }

  getTransactions(toDate, currency) {
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

    const accountContractService = new AccountContractService(this.getWallet());

    return accountContractService._getOrCreateHolder(this.getWallet().address, 'default')
      .then((holderAddress) => {
        const holderContract = new HolderContract(this.getWallet(), holderAddress);

        return holderContract.getTransactions(toDate, currency)
          .then((response) => Response.value(response))
          .then((length) => ({
            holderContract,
            length,
          }));
      })
      .then(({holderContract, length}) => {
        if (length === '0') {
          return [];
        }

        const entries = holderContract.getEntry('1', length.toString(), toDate, currency)
          .then((response) => Response.array(response));

        return entries;
      })
      .then((responses) => {
        const entries = responses
          .filter((response) => response[0] !== NULL_ADDRESS)
          .map((response) => {
            return {
              type: Response.parseBytes32Value(response[0]),
              date: new Date(parseInt(response[1].toString()) * 1000).toLocaleString(),
              description: Response.parseBytes32Value(response[2]),
              voucher: Response.parseBytes32Value(response[3]),
              amount: response[4].toString(),
              party: response[5],
            };
          });
        console.log('HolderContractService entries', entries);
        const kycContractService = new KycContractService(this.getPassword());

        const promises = entries.map((entry) => {
          return kycContractService.getFullName(entry.party)
            .then((partyName) => {
              entry.partyName = partyName;
              return entry;
            });
        });

        return Promise.all(promises);
      });
  }
}

export default HolderContractService;
