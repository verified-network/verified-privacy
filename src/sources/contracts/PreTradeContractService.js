import {PreTradeContract} from '@verified-network/verified-sdk';
import Response from './Response';
import ContractService from './ContractService';
import KycContractService from './KycContractService';
import ClientContractService from 'sources/contracts/ClientContractService';

const NULL_REFERENCE = '0x0000000000000000000000000000000000000000000000000000000000000000';

class PreTradeContractService extends ContractService {
  constructor(password) {
    super(password);

    this.preTradeContract = new PreTradeContract(this.getWallet());
  }

  registerDematAccount(currency, kycFile) {
    let setKycPromise;

    if (kycFile) {
      const kycContractService = new KycContractService(this.getPassword());
      setKycPromise = kycContractService.setKycFile(kycFile);
    } else {
      setKycPromise = Promise.resolve();
    }

    return setKycPromise.then(() => {
      return this.preTradeContract
          .registerDematAccount(currency)
          .then((response) => Response.empty(response));
    });
  }

  getRegistrationRequests() {
    const kycContractService = new KycContractService(this.getPassword());
    const clientContractService = new ClientContractService(this.getPassword());

    return kycContractService.getCountry()
        .then((country) => {
          return this.preTradeContract.getRegistrationRequests(country);
        })
        .then((response) => Response.array(response))
        .then((refs) => {
          const promises = refs
              .filter((element) => {
                return element !== NULL_REFERENCE;
              })
              .map((ref) => {
                return this.preTradeContract
                    .getRegistrationRequest(ref)
                    .then((response) => Response.array(response))
                    .then(((registrationRequest) => {
                      const userAddress = registrationRequest[0];

                      return kycContractService.getKycFile(userAddress)
                          .then((kycFile) => {
                            const object = {
                              ref,
                              userAddress,
                              countryCode: Response.parseBytes32Value(registrationRequest[1]),
                              dematAccountNo: Response.parseBytes32Value(registrationRequest[2]),
                              DPID: Response.parseBytes32Value(registrationRequest[3]),
                              registrationDocuments: kycFile,
                              registrationDate: registrationRequest[4],
                            };

                            const isConfirmed = !!object.DPID && !!object.dematAccountNo;

                            object.status = isConfirmed ? 'Confirmed' : 'Pending';

                            return object;
                          })
                          .then(((response) => {
                            return kycContractService.getFullName(response.userAddress)
                                .then((userName) => {
                                  response.userName = userName;
                                  return response;
                                });
                          }));
                    }));
              });

          return Promise.all(promises)
              .then((responses) => {
                return responses.filter((response) => Boolean(response));
              });
        });
  }

  setRegistrationStatus(ref, dpid, dematAccountNo) {
    return this.preTradeContract
        .setRegistrationStatus(ref, dpid, dematAccountNo)
        .then((response) => Response.empty(response));
  }

  registerSecurity({
    currencyCode,
    securityType,
    isin,
    company,
    instrumentType,
    noOfCertificates,
    faceValue,
    lockInReason,
    lockInReleaseDate,
    registrationDocumentsFile,
  }) {
    lockInReason = lockInReason ?? '';
    lockInReleaseDate = lockInReleaseDate ? ((new Date(lockInReleaseDate)).getTime()).toString() : '0';

    return this.preTradeContract
        .registerSecurities(currencyCode, securityType, isin, company,
            instrumentType, noOfCertificates, faceValue, lockInReason, lockInReleaseDate
        )
        .then((response) => Response.empty(response));
  }

  getSecuritiesRequests() {
    const kycContractService = new KycContractService(this.getPassword());

    return kycContractService.getCountry()
        .then((country) => {
          return this.preTradeContract.getConfirmationRequests(country);
        })
        .then((response) => Response.array(response))
        .then((refs) => {
          const promises = refs
              .filter((element) => {
                return element !== NULL_REFERENCE;
              })
              .map((ref) => {
                return this.preTradeContract
                    .getConfirmationRequest(ref)
                    .then((response) => Response.array(response))
                    .then(((securityRequest) => {
                      const lockInReleaseDateAsTimestamp = parseInt(securityRequest[9]);

                      const lockInReleaseDate = lockInReleaseDateAsTimestamp != 0 ?
                                                (new Date(lockInReleaseDateAsTimestamp)).toLocaleString() : '';

                      return {
                        ref,
                        requestBy: securityRequest[0],
                        currencyCode: Response.parseBytes32Value(securityRequest[1]),
                        securityType: Response.parseBytes32Value(securityRequest[2]),
                        isin: Response.parseBytes32Value(securityRequest[3]),
                        company: Response.parseBytes32Value(securityRequest[4]),
                        instrumentType: Response.parseBytes32Value(securityRequest[5]),
                        lockInReason: Response.parseBytes32Value(securityRequest[6]),
                        approvalStatus: Response.parseBytes32Value(securityRequest[7]),
                        noOfCertificates: securityRequest[8],
                        lockInReleaseDate,
                        registrationRequestDate: securityRequest[10],
                        faceValue: securityRequest[11],
                      };
                    }))
                    .then((response) => {
                      const kycContractService = new KycContractService(this.getPassword());

                      return kycContractService.getFullName(response.requestBy)
                          .then((requestByName) => {
                            response.requestByName = requestByName;
                            return response;
                          });
                    });
              });

          return Promise.all(promises);
        });
  }

  confirmSecurity(userAddress, ref) {
    return this.preTradeContract.confirmSecurities(userAddress, ref, 'Confirmed')
        .then((response) => Response.empty(response));
  }

  declineSecurity(userAddress, ref) {
    return this.preTradeContract.confirmSecurities(userAddress, ref, 'Rejected')
        .then((response) => Response.empty(response));
  }

  getDpId(userAddress) {
    userAddress = userAddress ?? this.getWallet().address;

    return this.preTradeContract.getDP(userAddress)
        .then((response) => Response.value(response))
        .then((response) => Response.parseBytes32Value(response));
  }
}

export default PreTradeContractService;
