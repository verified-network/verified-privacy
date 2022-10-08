import {PostTradeContract} from '@verified-network/verified-sdk';

import Response from './Response';
import ContractService from './ContractService';
import ClientContractService from 'sources/contracts/ClientContractService';
import KycContractService from 'sources/contracts/KycContractService';

const NULL_REF = '0x0000000000000000000000000000000000000000000000000000000000000000';

const SettlementStatus = {
  ACCEPTED: 'Confirm',
  REJECTED: 'Reject',
  PENDING: 'Pending',
};

class PostTradeContractService extends ContractService {
  constructor(password) {
    super(password);

    this.postTradeContract = new PostTradeContract(this.getWallet());
  }

  getSettlementRequests() {
    const clientContract = new ClientContractService(this.getPassword());

    return clientContract.getDpid()
        .then((dpId) => {
          return this.postTradeContract.getSettlementRequests(dpId)
              .then((response) => Response.array(response))
              .then((response) => response.filter((element) => element !== NULL_REF))
              .then((refs) => {
                const promises = refs.map((ref) => {
                  return this._getSettlementRequest(ref);
                });

                return Promise.all(promises);
              });
        });
  }

  acceptSettlement(ref) {
    return this._setSettlementStatus(ref, SettlementStatus.ACCEPTED);
  }

  rejectSettlement(ref) {
    return this._setSettlementStatus(ref, SettlementStatus.REJECTED);
  }

  _getSettlementRequest(ref) {
    return this.postTradeContract.getSettlementRequest(ref)
        .then((response) => Response.array(response))
        .then((response) => {
          return {
            ref,
            transferor: response[0],
            transferee: response[1],
            security: response[2],
            securityName: Response.parseBytes32Value(response[3]),
            status: Response.parseBytes32Value(response[4]),
            transferorDPID: Response.parseBytes32Value(response[5]),
            transfereeDPID: Response.parseBytes32Value(response[6]),
            isin: Response.parseBytes32Value(response[7]),
            company: Response.parseBytes32Value(response[8]),
            currency: Response.parseBytes32Value(response[9]),
            price: response[10],
            consideration: response[11],
            unitsToTransfer: response[12],
            executionDate: response[13],
          };
        })
        .then((response) => {
          const kycContractService = new KycContractService(this.getPassword());

          const transferorName = kycContractService.getFullName(response.transferor);
          const transfereeName = kycContractService.getFullName(response.transferee);

          return Promise.all([transferorName, transfereeName])
              .then(([transferorName, transfereeName]) => {
                response.transferorName = transferorName;
                response.transfereeName = transfereeName;

                return response;
              });
        });
  }

  _setSettlementStatus(ref, status) {
    return this.postTradeContract.setSettlementStatus(ref, status)
        .then((response) => Response.empty(response));
  }
}

export {SettlementStatus};
export default PostTradeContractService;

