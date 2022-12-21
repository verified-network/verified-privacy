import {KYCContract} from '@verified-network/verified-sdk';
import ContractService from 'sources/contracts/ContractService';
import emailApi from 'sources/api/Email';
import Ipfs from 'sources/utils/Ipfs';
import Config from 'sources/Config';
import Response from 'sources/contracts/Response';

const KycStatus = {
  NOT_SUBMITTED: '0',
  PENDING_FOR_APPROVAL: '1',
  REJECTED: '2',
  ACCEPTED: '3',
};

class KycContractService extends ContractService {
  constructor(password) {
    super(password);
    this.kycContract = new KYCContract(this.getWallet());
  }

  getStatus(userAddress = null) {
    if (!userAddress) {
      userAddress = this.getWallet().address;
    }

    return this.kycContract.getStatus(userAddress)
      .then((response) => {
        return Response.value(response);
      });
  }

  setStatus(userAddress, status) {
    return this.kycContract.setStatus(userAddress, status)
      .then((response) => Response.empty(response))
      .then(() => {
        if (status === KycStatus.ACCEPTED) {
          return emailApi.sendAcceptedKycEmail(userAddress);
        } else if (status === KycStatus.REJECTED) {
          return emailApi.sendDeclinedKycEmail(userAddress);
        } else {
          return Promise.resolve();
        }
      });
  }

  /**
   * All files will be of type File (https://developer.mozilla.org/en-US/docs/Web/API/File)
   * @param {String} country Country ISO code
   * @param {File} kycFile
   * @param {File} photoIdFile
   * @param {File} videoIdFile
   * @param {File} addressProofFile
   * @return {Promise<void>}
   */
  setKyc(country, kycFile, photoIdFile, videoIdFile, addressProofFile) {
    return this._storeFilesInIpfs(kycFile, photoIdFile, videoIdFile, addressProofFile)
      .then((paths) => {
        const kycPath = paths['kycPath'];
        const photoIdPath = paths['photoIdPath'];
        const videoIdPath = paths['videoIdPath'];
        const addressProofPath = paths['addressProofPath'];

        return this._setKycHelper(country, kycPath, photoIdPath, videoIdPath, addressProofPath);
      });
  }

  setKycFile(kycFile) {
    return this.storeKycFileInIpfs(kycFile)
      .then((kycFilePath) => {
        return this.kycContract.setFile(this.getWallet().address, kycFilePath)
          .then((response) => Response.empty(response));
      });
  }

  getKycFile(userAddress = null) {
    if (!userAddress) {
      userAddress = this.getWallet().address;
    }

    return this.kycContract.getFile(userAddress)
      .then((response) => Response.value(response))
      .then((kycFile) => Ipfs.fileUrl(kycFile));
  }

  getKyc(userAddress = null) {
    if (!userAddress) {
      userAddress = this.getWallet().address;
    }

    const promises = [
      Response.valuePromise(this.kycContract.getCountry(userAddress)),
      Response.valuePromise(this.kycContract.getFile(userAddress)),
      Response.valuePromise(this.kycContract.getPhotoID(userAddress)),
      Response.valuePromise(this.kycContract.getVideoID(userAddress)),
      Response.valuePromise(this.kycContract.getAddress(userAddress)),
      Response.arrayPromise(this.kycContract.getName(userAddress)),
      Response.valuePromise(this.kycContract.getEmail(userAddress)),
    ];

    return Promise.all(promises)
      .then((responses) => {
        const country = Response.parseBytes32Value(responses[0]);
        const kyc = responses[1];
        const photoId = responses[2];
        const videoId = responses[3];
        const addressProof = responses[4];
        const firstName = Response.parseBytes32Value(responses[5][0]);
        const lastName = Response.parseBytes32Value(responses[5][1]);
        const email = Response.parseBytes32Value(responses[6]);

        return {country, kyc, photoId, videoId, addressProof, firstName, lastName, email};
      });
  }

  getCountry(userAddress = null) {
    userAddress ??= this.getWallet().address;

    return this.kycContract.getCountry(userAddress)
      .then((response) => Response.value(response))
      .then((response) => Response.parseBytes32Value(response));
  }

  getFullName(userAddress = null) {
    userAddress ??= this.getWallet().address;

    return this.kycContract.getName(userAddress)
      .then((response) => Response.array(response))
      .then((response) => {
        const firstName = Response.parseBytes32Value(response[0]);
        const lastName = Response.parseBytes32Value(response[1]);

        return firstName + ' ' + lastName;
      });
  }

  getEmail(userAddress = null) {
    userAddress ??= this.getWallet().address;

    return this.kycContract.getEmail(userAddress)
      .then((response) => Response.value(response))
      .then((response) => Response.parseBytes32Value(response));
  }

  _setKycHelper(country, kycFile, photoIdFile, videoIdFile, addressProofFile) {
    const userAddress = this.getWallet().address;

    return Response.emptyPromise(this.kycContract.setCountry(userAddress, country))
      .then(() => Response.emptyPromise(this.kycContract.setFile(userAddress, kycFile)))
      .then(() => Response.emptyPromise(this.kycContract.setPhotoID(userAddress, photoIdFile)))
      .then(() => Response.emptyPromise(this.kycContract.setVideoID(userAddress, videoIdFile)))
      .then(() => Response.emptyPromise(this.kycContract.setAddress(userAddress, addressProofFile)));
  }

  storeKycFileInIpfs(kycFile) {
    const ipfsStore = this._createIpfsStore();

    return ipfsStore.add(kycFile)
      .then((kycPath) => {
        return kycPath;
      });
  }

  _storeFilesInIpfs(kycFile, photoIdFile, videoIdFile, addressProofFile) {
    const ipfsStore = this._createIpfsStore();

    return ipfsStore.add(kycFile)
      .then((kycPath) => {
        return {kycPath};
      })
      .then((paths) => {
        return ipfsStore.add(photoIdFile)
          .then((photoIdPath) => {
            return {...paths, photoIdPath};
          });
      }).then((paths) => {
        return ipfsStore.add(videoIdFile)
          .then((videoIdPath) => {
            return {...paths, videoIdPath};
          });
      })
      .then((paths) => {
        return ipfsStore.add(addressProofFile)
          .then((addressProofPath) => {
            return {...paths, addressProofPath};
          });
      });
  }

  _createIpfsStore() {
    const ipfsConfig = Config.ipfs;
    return new Ipfs(ipfsConfig.host, ipfsConfig.port, ipfsConfig.id, ipfsConfig.secret);
  }
}

function printKycStatus(status) {
  switch (status) {
  case KycStatus.NOT_SUBMITTED:
    return 'Not submitted';
  case KycStatus.PENDING_FOR_APPROVAL:
    return 'Pending';
  case KycStatus.REJECTED:
    return 'Rejected';
  case KycStatus.ACCEPTED:
    return 'Accepted';
  default:
    return 'Unknown';
  }
}

export {KycStatus, printKycStatus};
export default KycContractService;
