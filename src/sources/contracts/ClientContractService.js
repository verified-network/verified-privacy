import {ClientContract, KYCContract} from '@verified-network/verified-sdk';
import ContractService from 'sources/contracts/ContractService';
import KycContractService from 'sources/contracts/KycContractService';
import Response from 'sources/contracts/Response';
import Ipfs from 'sources/utils/Ipfs';

const ISSUER_ROLES = ['DP', 'AM', 'KYCAML', 'Custodian', 'Admin'];

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const ADMIN_ROLE = 'Admin';

class ClientContractService extends ContractService {
  constructor(password) {
    super(password);

    this.clientContract = new ClientContract(this.getWallet());
    this.userAddress = this.getWallet().address;
  }

  isUserIssuer() {
    return this.clientContract.getRole(this.userAddress)
        .then((response) => Response.array(response))
        .then((response) => Response.parseBytes32Value(response[0]))
        .then((role) => {
          return ISSUER_ROLES.includes(role);
        });
  }

  getRole(userAddress = null) {
    if (!userAddress) {
      userAddress = this.userAddress;
    }

    return this.clientContract.getRole(userAddress)
        .then((response) => Response.array(response))
        .then((response) => Response.parseBytes32Value(response[0]));
  }

  addRole(userAddress, role, countryCode, dpid) {
    return this.clientContract.addRole(userAddress, countryCode, role, dpid)
        .then((response) => Response.empty(response));
  }

  isUserAdmin() {
    return this.clientContract.getRole(this.userAddress)
        .then((response) => Response.array(response))
        .then((response) => Response.parseBytes32Value(response[0]))
        .then((role) => {
          return role === ADMIN_ROLE;
        });
  }

  getAllClients() {
    return this.clientContract.getClients(this.userAddress)
        .then((response) => Response.array(response))
        .then((response) => response.filter((clientAddress) => clientAddress !== NULL_ADDRESS));
  }

  getManager(user) {
    user ??= this.getWallet().address;

    return this.clientContract.getManager(user)
        .then((response) => Response.value(response));
  }

  setManager(userAddress, managerAddress) {
    return this.clientContract.setManager(userAddress, managerAddress)
        .then((response) => Response.empty(response));
  }

  isManagedByCurrentUser(user) {
    return this.getManager(user)
        .then((manager) => {
          return manager === this.getWallet().address;
        });
  }

  /**
   *
   * Get KYCs of all clients of current user
   * @param {Boolean} allClients If true, returns all users, otherwise users without accepted KYC
   * @return {Promise<Array<Object>>} Array of KYCs
   */
  getClientsKyc() {
    const kycContractService = new KycContractService(this.getPassword());

    return this.getAllClients()
        .then((clients) => {
          const kycPromises = clients.map((client) => {
            const statusPromise = kycContractService.getStatus(client);
            const kycPromise = kycContractService.getKyc(client);
            const rolePromise = this.getRole(client);

            return Promise.all([statusPromise, kycPromise, rolePromise])
                .then((response) => {
                  const status = response[0];
                  const kyc = response[1];
                  const role = response[2];

                  return {
                    clientAddress: client,
                    kyc: {
                      status: status,
                      kyc: this._ipfsUrl(kyc.kyc),
                      photoId: this._ipfsUrl(kyc.photoId),
                      videoId: this._ipfsUrl(kyc.videoId),
                      addressProof: this._ipfsUrl(kyc.addressProof),
                      country: kyc.country,
                      firstName: kyc.firstName,
                      lastName: kyc.lastName,
                      email: kyc.email,
                    },
                    role,
                  };
                });
          });

          return Promise.all(kycPromises);
        });
  }

  getPaymentId() {
    return this.clientContract.getCustody(this.getWallet().address)
        .then((response) => Response.value(response))
        .then((response) => Response.parseBytes32Value(response));
  }

  setPaymentId(id) {
    return this.clientContract.setCustody(this.getWallet().address, id)
        .then((response) => {
          return Response.empty(response);
        });
  }

  /**
   * Get dpId for a user that have a DP role
   *
   * @return {String} dpid
   **/
  getDpid() {
    return this.clientContract.getRole(this.getWallet().address)
        .then((response) => Response.array(response))
        .then((response) => Response.parseBytes32Value(response[1]));
  }

  setFCMToken(fcmToken) {
    return this.clientContract.setAccess(fcmToken).then((response) => {
      return Response.array(response);
    });
  }

  _getManagers(role, country) {
    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

    return this.clientContract.getManagers(role, country)
        .then((response) => {
          const manager = response.response.result[0];

          if (manager !== NULL_ADDRESS) {
            return manager;
          } else {
            return null;
          }
        });
  }

  _getUserCountry() {
    const kycContract = new KYCContract(this.getWallet());
    const userAddress = this.getWallet().address;

    return kycContract.getCountry(userAddress)
        .then((response) => Response.value(response))
        .then((response) => Response.parseBytes32Value(response));
  }

  _ipfsUrl(filePath) {
    if (filePath) {
      return Ipfs.fileUrl(filePath);
    } else {
      return null;
    }
  }
}

export default ClientContractService;
