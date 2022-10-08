import {
  SecuritiesRegistryContract, SecurityContract,
} from '@verified-network/verified-sdk';

import Response from './Response';
import ContractService from './ContractService';
import KycContractService from 'sources/contracts/KycContractService';

class SecurityRegistryContractService extends ContractService {
  constructor(password) {
    super(password);

    this.securityRegistryContract = new SecuritiesRegistryContract(this.getWallet());
  }

  getSecuritiesInvested() {
    return this.securityRegistryContract.getSecuritiesInvested()
        .then((response) => Response.array(response))
        .then((response) => {
          const promises = response.map((securityAddress) => {
            return this.getSecurityDetails(securityAddress);
          });

          return Promise.all(promises);
        });
  }

  getSecuritiesIssued() {
    return this.securityRegistryContract.getSecuritiesIssued()
        .then((response) => Response.array(response))
        .then((response) => {
          const promises = response.map((securityAddress) => {
            return this.getSecurityDetails(securityAddress);
          });

          return Promise.all(promises);
        });
  }

  getSecurityDetails(address) {
    return this.securityRegistryContract.getSecurityDetails(address)
        .then((response) => Response.array(response))
        .then((response) => {
          const securityContract = new SecurityContract(this.getWallet(), address);

          return securityContract.balanceOf(this.getWallet().address)
              .then((response) => Response.value(response))
              .then((balance) => {
                return {
                  address,
                  company: Response.parseBytes32Value(response[0]),
                  currency: Response.parseBytes32Value(response[1]),
                  isin: Response.parseBytes32Value(response[2]),
                  creditScore: Response.parseBytes32Value(response[3]),
                  price: Response.parseBytes16Value(response[4]),
                  issuer: response[5],
                  balance,
                };
              });
        })
        .then((security) => {
          const kycContract = new KycContractService(this.getPassword());

          return kycContract.getFullName(security.issuer)
              .then((fullName) => {
                security.issuerName = fullName;
                return security;
              });
        });
  }

  registerCorporateAction(category, action, isin) {
    return this.securityRegistryContract.registerCorporateAction(category, action, isin)
        .then((response) => Response.empty(response));
  }

  getCorporateActions(isin, category) {
    return this.securityRegistryContract.getCorporateActions(category, isin)
        .then((response) => Response.array(response))
        .then((response) => {
          return response.map((action) => {
            return {category, action};
          });
        });
  }

  getCreditScore(isin) {
    return this.securityRegistryContract.getCreditScore('', isin)
        .then((response) => Response.value(response))
        .then((response) => Response.parseBytes32Value(response));
  }

  getPrice(isin) {
    return this.securityRegistryContract.getPrice(isin)
        .then((response) => Response.value(response))
        .then((response) => Response.parseBytes16Value(response));
  }
}

export default SecurityRegistryContractService;


