import {BondsContract, StocksContract, ProductContract, BalancerPrimaryIssueManager, VerifiedSecurity} from '@verified-network/verified-sdk';

import Response from './Response';
import ContractService from './ContractService';
import KycContractService from './KycContractService';
import Ipfs from 'sources/utils/Ipfs';
import Config from 'sources/Config';
import SecurityRegistryContractService from 'sources/contracts/SecurityRegistryContractService';
import CorporateActionsSpecification from 'sources/CorporateActionsSpecification.json';

const NULL_REF = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const ProductCategory = {
  SHARES: 'Shares',
  BONDS: 'Bonds',
};

const IssueStatus = {
  NONE: '',
  ISSUED: 'Issued',
  ALLOTTED: 'Allotted',
  OFFERED: 'Offered',
  STARTED: 'Started',
  CLOSED: 'Closed',
};

const AllotmentStatus = {
  ACCEPT: 'Accept',
  REJECT: 'Reject',
};

class ProductContractService extends ContractService {
  constructor(password) {
    super(password);

    this.productContract = new ProductContract(this.getWallet());
  }

  createProduct(
    productCategory, issuerName, issuerAddress, issuerCountry, issuerSignatoryEmail,
    arrangerName, arrangerAddress, arrangerCountry, arrangerSignatoryEmail,
    registrationDocuments
  ) {
    return this._storeRegistrationDocumentsInIpfs(registrationDocuments)
      .then((registrationDocumentsPath) => {
        return this.productContract.recordProduct(
          productCategory, issuerName, issuerAddress, issuerCountry, issuerSignatoryEmail, arrangerName,
          arrangerAddress, arrangerCountry, arrangerSignatoryEmail, registrationDocumentsPath
        );
      })
      .then((response) => Response.empty(response));
  }

  getProducts() {
    return this.productContract.getProductsForClient()
      .then((response) => Response.array(response))
      .then((productRefs) => productRefs.filter((ref) => ref !== NULL_REF))
      .then((productRefs) => {
        const promises = productRefs.map((productRef) => {
          return this.getProduct(productRef);
        });

        return Promise.all(promises);
      });
  }

  getProductsByCountry(country = null) {
    let getCountry = null;

    if (country) {
      getCountry = Promise.resolve(country);
    } else {
      const kycContractService = new KycContractService(this.getPassword());
      getCountry = kycContractService.getCountry();
    }

    return getCountry.then((country) => {
      return this.productContract.getProductsForCountry(country)
        .then((response) => Response.array(response))
        .then((productRefs) => productRefs.filter((ref) => ref !== NULL_REF))
        .then((productRefs) => {
          const promises = productRefs.map((productRef) => {
            return this.getProduct(productRef);
          });

          return Promise.all(promises);
        });
    });
  }

  getAllProducts() {
    const promise1 = this.getProducts();
    const promise2 = this.getProductsByCountry();

    return Promise.all([promise1, promise2])
      .then((response) => {
        return [...response[0], ...response[1]];
      });
  }

  getProduct(productRef) {
    return this.productContract.getProduct(productRef)
      .then((response) => Response.array(response))
      .then((product) => {
        return {
          ref: productRef,
          productCategory: Response.parseBytes32Value(product[0]),
          issuerName: Response.parseBytes32Value(product[1]),
          issuerAddress: Response.parseBytes32Value(product[2]),
          issuerCountry: Response.parseBytes32Value(product[3]),
          issuerSignatoryEmail: Response.parseBytes32Value(product[4]),
          arrangerName: Response.parseBytes32Value(product[5]),
          arrangerAddress: Response.parseBytes32Value(product[6]),
          arrangerCountry: Response.parseBytes32Value(product[7]),
          arrangerSignatoryEmail: Response.parseBytes32Value(product[8]),
          issue: product[9] !== NULL_ADDRESS ? product[9] : '-',
          issuer: product[10],
          status: product[11] === true ? 'Confirmed' : 'Pending',
          issuerRegistrationCertificate: Ipfs.fileUrl(product[12]),
          arrangerRegistrationCertificate: Ipfs.fileUrl(product[13]),
          registrationDocuments: Ipfs.fileUrl(product[14]),
        };
      });
  }

  confirmProduct(productRef) {
    return this.productContract.confirmProduct(productRef)
      .then((response) => Response.empty(response));
  }

  getIssuesForClient() {
    return this.getProducts().then((products) => {
      const findProductByIssueAddress = (issueAddress) => {
        return products.find((product) => product.issue === issueAddress);
      };

      return this.productContract.getIssuesForClient()
        .then((response) => Response.array(response))
        .then((issueAddresses) => issueAddresses.filter((ref) => ref !== NULL_ADDRESS))
        .then((issueAddresses) => {
          const promises = issueAddresses.map((issueAddress) => {
            const productCategory = findProductByIssueAddress(issueAddress).productCategory;

            if (productCategory === ProductCategory.BONDS) {
              return this.getBond(issueAddress);
            } else if (productCategory === ProductCategory.SHARES) {
              return this.getShare(issueAddress);
            }
          });

          return Promise.all(promises);
        });
    });
  }

  getIssuesForCountry() {
    const userAddress = this.getWallet().address;
    const kycContractService = new KycContractService(this.getPassword());

    return kycContractService.getCountry(userAddress)
      .then((country) => {
        return this.getProductsByCountry(country).then((products) => {
          const findProductByIssueAddress = (issueAddress) => {
            return products.find((product) => product.issue === issueAddress);
          };

          return this.productContract.getIssuesForCountry(country)
            .then((response) => Response.array(response))
            .then((issueAddresses) => issueAddresses.filter((ref) => ref !== NULL_ADDRESS))
            .then((issueAddresses) => {
              const promises = issueAddresses.map((issueAddress) => {
                const productCategory = findProductByIssueAddress(issueAddress).productCategory;

                if (productCategory === ProductCategory.BONDS) {
                  return this.getBond(issueAddress);
                } else if (productCategory === ProductCategory.SHARES) {
                  return this.getShare(issueAddress);
                }
              });

              return Promise.all(promises);
            });
        });
      });
  }

  getIssueContract(issueAddress) {
    return this.getAllProducts().then((products) => {
      const findProductByIssueAddress = (issueAddress) => {
        return products.find((product) => product.issue === issueAddress);
      };

      const productCategory = findProductByIssueAddress(issueAddress).productCategory;

      if (productCategory === ProductCategory.BONDS) {
        return new BondsContract(this.getWallet(), issueAddress);
      } else if (productCategory === ProductCategory.SHARES) {
        return new StocksContract(this.getWallet(), issueAddress);
      }
    });
  }

  getShare(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getShare()
        .then((response) => Response.array(response))
        .then((response) => {
          if (response[0].length === 0) {
            return {
              productCategory: ProductCategory.SHARES,
              address: issueAddress,
            };
          }

          return {
            productCategory: ProductCategory.SHARES,
            address: issueAddress,
            issueSize: response[0][0][0].toString(),
            faceValue: response[0][0][1].toString(),
            offerPrice: response[0][0][2].toString(),
            minAskPrice: response[0][0][3].toString(),
            minSubscription: response[0][0][4].toString(),
            currency: Response.parseBytes32Value(response[0][0][5]),
            security: response[0][0][6],
            offerType: Response.parseBytes32Value(response[1][0]),
            isin: Response.parseBytes32Value(response[1][1]),
            status: Response.parseBytes32Value(response[1][2]),
            // status: IssueStatus.ALLOTTED, // Fixme: Just for testing (change for line above)
            offeringDocuments: Ipfs.fileUrl(response[1][3]),
          };
        })
        .then((issue) => {
          if (issue.status) {
            const securityRegistry = new SecurityRegistryContractService(this.getPassword());

            return securityRegistry.getCreditScore(issue.isin).then((creditScore) => {
              issue.creditScore = creditScore;
              return issue;
            });
          }

          return issue;
        })
        .then((issue) => {
          if (issue.status) {
            const securityRegistry = new SecurityRegistryContractService(this.getPassword());

            return securityRegistry.getPrice(issue.isin).then((price) => {
              issue.price = price;
              return issue;
            });
          }

          return issue;
        });
    });
  }

  getBond(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getBond()
        .then((response) => Response.array(response))
        .then((response) => {
          if (response[0].length === 0) {
            return {
              productCategory: ProductCategory.BONDS,
              address: issueAddress,
            };
          }

          return {
            productCategory: ProductCategory.BONDS,
            address: issueAddress,
            issueSize: response[0][0][0].toString(),
            coupon: response[0][0][1].toString(),
            offerPrice: response[0][0][2].toString(),
            minAskPrice: response[0][0][3].toString(),
            minSubscription: response[0][0][4].toString(),
            currency: Response.parseBytes32Value(response[0][0][5]),
            security: response[0][0][6],
            offerType: Response.parseBytes32Value(response[1][0]),
            couponPaymentCycle: response[1][1].toString(),
            tenure: response[1][2].toString(),
            isin: Response.parseBytes32Value(response[1][3]),
            status: Response.parseBytes32Value(response[1][4]),
            // status: IssueStatus.ALLOTTED, // Fixme: Just for testing (change for line above)
            offeringDocuments: Ipfs.fileUrl(response[1][5]),
          };
        })
        .then((issue) => {
          if (issue.status) {
            const securityRegistry = new SecurityRegistryContractService(this.getPassword());

            return securityRegistry.getCreditScore(issue.isin).then((creditScore) => {
              issue.creditScore = creditScore;
              return issue;
            });
          }

          return issue;
        })
        .then((issue) => {
          if (issue.status) {
            const securityRegistry = new SecurityRegistryContractService(this.getPassword());

            return securityRegistry.getPrice(issue.isin).then((price) => {
              issue.price = price;
              return issue;
            });
          }

          return issue;
        });
    });
  }

  issueBond(issueAddress, issueSize, offerPrice, minAskPrice, minSubscription, couponPaymentCycle, tenure, currency,
    offerType, isin, offeringDocuments) {
    const bondsContract = new BondsContract(this.getWallet(), issueAddress);

    return this._storeRegistrationDocumentsInIpfs(offeringDocuments)
      .then((offeringDocumentsPath) => {
        return bondsContract
          .issueBond(issueSize, offerPrice, minAskPrice, minSubscription, couponPaymentCycle, tenure, currency,
            offerType, isin, offeringDocumentsPath);
      })
      .then((response) => Response.empty(response));
  }

  issueShare(issueAddress, issueSize, offerPrice, minAskPrice, minSubscription, currency, offerType, isin,
    offeringDocuments) {
    const stockContract = new StocksContract(this.getWallet(), issueAddress);

    return this._storeRegistrationDocumentsInIpfs(offeringDocuments)
      .then((offeringDocumentsPath) => {
        return stockContract
          .issueShare(issueSize, offerPrice, minAskPrice, minSubscription, currency, offerType, isin,
            offeringDocumentsPath);
      })
      .then((response) => Response.empty(response));
  }

  getBeneficiaries(issueAddress) {
    const userAddress = this.getWallet().address;

    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getBeneficiaries(userAddress)
        .then((response) => Response.array(response))
        .then((beneficiaries) => {
          const kycContract = new KycContractService(this.getPassword());

          const promises = beneficiaries.map((beneficiary) => {
            return kycContract.getFullName(beneficiary)
              .then((beneficiaryName) => {
                return issueContract.getPaymentStatusFor(beneficiary)
                  .then((response) => Response.array(response))
                  .then((response) => {
                    return {
                      beneficiaryAddress: beneficiary,
                      beneficiaryName: beneficiaryName,
                      currency: Response.parseBytes32Value(response[0]),
                      amount: response[1].toString(),
                      payoutDate: response[2],
                      payer: response[3],
                    };
                  });
              });
          });

          return Promise.all(promises);
        });
    });
  }

  getSubscribers(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getSubscribers()
        .then((response) => Response.array(response))
        .then((subscribers) => {
          return subscribers.map((response) => {
            return {
              currency: Response.parseBytes32Value(response[0]),
              amount: response[1].toString(),
              price: response[2].toString(),
              poolid: Response.parseBytes32Value(response[3]),
              allotmentStatus: response[4],
              platform: response[5],
              investorAddress: response[6],
              assetAddress: response[7],
            };
          });
        })
        .then((subscribers) => {
          const kycContract = new KycContractService(this.getPassword());

          const promises = subscribers.map((subscriber) => {
            return kycContract.getFullName(subscriber.investorAddress)
              .then((investorName) => {
                return {
                  investorName,
                  ...subscriber,
                };
              });
          });

          return Promise.all(promises);
        });
    });
  }

  getPaymentStatusFor(issueAddress, investorAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getPaymentStatusFor(investorAddress)
        .then((response) => Response.array(response))
        .then((response) => {
          return {
            currency: Response.parseBytes32Value(response[0]),
            amount: response[1].toString(),
            payoutDate: new Date(parseInt(response[2])),
            payer: response[3],
          };
        });
    });
  }

  getCorporateActions(isin) {
    const securityRegistryContract = new SecurityRegistryContractService(this.getPassword());

    const promises = CorporateActionsSpecification.map((element) => {
      const category = element.category;

      return securityRegistryContract.getCorporateActions(isin, category);
    });

    return Promise.all(promises)
      .then((response) => {
        const all = [];

        for (const current of response) {
          all.push(...current);
        }

        return all;
      });
  }

  payout(issueAddress, beneficiary, currency, amount) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.payOut(beneficiary, currency, amount)
        .then((response) => Response.empty(response));
    });
  }

  askOffers(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.askOffers()
        .then((response) => Response.empty(response));
    });
  }

  settle(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.settle()
        .then((response) => Response.empty(response));
    });
  }

  startIssue(issueAddress, cutOffTime) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.startIssue(cutOffTime)
        .then((response) => Response.empty(response));
    });
  }

  allotIssue(issueAddress, allotmentStatus, platform, pool, investor, amount, asset) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.allotIssue(allotmentStatus, platform, pool, investor, amount, asset)
        .then((response) => Response.empty(response));
    });
  }

  getPaymentStatus(issueAddress, byTime) {
    const userAddress = this.getWallet().address;

    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.isAllPaidFor(byTime)
        .then((response) => Response.array(response))
        .then((response) => {
          return response.includes(userAddress) ? 'Paid' : 'Pending';
        });
    });
  }

  getInterestRateInBips(issueAddress, currencyAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getinterestRateInBips(currencyAddress)
        .then((response) => Response.value(response))
        .then((response) => response.toString());
    });
  }

  getCouponFrequencyInMonths(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getcouponFrequencyInMonths()
        .then((response) => Response.value(response))
        .then((response) => response.toString());
    });
  }

  getFirstCouponDate(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getfirstCouponDate()
        .then((response) => Response.array(response))
        .then((response) => {
          const day = response[0].toString();
          const month = response[1].toString();
          const year = response[2].toString();

          return `${day}-${month}-${year}`;
        });
    });
  }

  computeNextCouponDate(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.computeNextCouponDate()
        .then((response) => Response.array(response))
        .then((response) => {
          const day = response[0].toString();
          const month = response[1].toString();
          const year = response[2].toString();

          return `${day}-${month}-${year}`;
        });
    });
  }

  computeNextInstallment(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.computeNextInstallment()
        .then((response) => Response.value(response))
        .then((response) => response.toString());
    });
  }

  getDateOfIssue(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getDateOfIssue()
        .then((response) => Response.array(response))
        .then((response) => {
          const day = response[0].toString();
          const month = response[1].toString();
          const year = response[2].toString();

          return `${day}-${month}-${year}`;
        });
    });
  }

  getMaturityDate(issueAddress) {
    return this.getIssueContract(issueAddress).then((issueContract) => {
      return issueContract.getmaturityDate()
        .then((response) => Response.array(response))
        .then((response) => {
          const day = response[0].toString();
          const month = response[1].toString();
          const year = response[2].toString();

          return `${day}-${month}-${year}`;
        });
    });
  }

  getBondDetails(issueAddress) {
    const couponFrequencyInMonths = this.getCouponFrequencyInMonths(issueAddress);
    const firstCouponDate = this.getFirstCouponDate(issueAddress);
    const nextCouponDate = this.computeNextCouponDate(issueAddress);
    const nextInstallment = this.computeNextInstallment(issueAddress);
    const dateOfIssue = this.getDateOfIssue(issueAddress);
    const maturityDate = this.getMaturityDate(issueAddress);

    return Promise
      .all([
        couponFrequencyInMonths, firstCouponDate, nextCouponDate, nextInstallment, dateOfIssue, maturityDate,
      ])
      .then((responses) => {
        return {
          couponFrequencyInMonths: responses[0],
          firstCouponDate: responses[1],
          nextCouponDate: responses[2],
          nextInstallment: responses[3],
          dateOfIssue: responses[4],
          maturityDate: responses[5],
        };
      });
  }

  getPlatforms() {
    return this.productContract.getPlatforms()
      .then((response) => Response.array(response))
      .then((response) => {
        return response.map((element) => {
          return {
            name: element,
            address: element,
          };
        });
      });
  }

  getIssueAddress(issueRef) {
    return this.productContract.getIssue(issueRef)
      .then((response) => Response.value(response));
  }

  getAllotedStake(platformAddress) {
    const assetManagerContract = new BalancerPrimaryIssueManager(this.getL1Wallet(), platformAddress);

    return assetManagerContract.getAllotedStake()
      .then((response) => {
        return Response.value(response);
      });
  }

  getOffered(platformAddress, offeredAddress) {
    const assetManagerContract = new BalancerPrimaryIssueManager(this.getL1Wallet(), platformAddress);

    return assetManagerContract.getOffered(offeredAddress)
      .then((response) => Response.array(response))
      .then((response) => {
        return response.map(((element) => {
          return {
            owner: element[0],
            owned: element[1],
            amountOffered: element[2].toString(),
            amountDesired: element[3].toString(),
            minimum: element[4].toString(),
            isin: Response.parseBytes32Value(element[5]),
          };
        }));
      });
  }

  productDetails(ownedAddress) {
    return this.productContract.getProductReference(ownedAddress)
      .then((response) => Response.value(response))
      .then((response) => Response.parseBytes32Value(response))
      .then((productRef) => {
        return this.getProduct(productRef);
      });
  }

  getOfferMade(platformAddress, offeredAddress, ownedAddress) {
    const assetManagerContract = new BalancerPrimaryIssueManager(this.getWallet(), platformAddress);
    return assetManagerContract.getOfferMade(offeredAddress, ownedAddress)
      .then((response) => {
        return Response.array(response);
      })
      .then((response) => {
        return {
          owner: response[0],
          owned: response[1],
          amountOffered: response[2].toString(),
          amountDesired: response[3].toString(),
          minimum: response[4].toString(),
          isin: Response.parseBytes32Value(response[5]),
        };
      });
  }

  makeOffer(platformAddress, owned, isin, offered, tomatch, desired, min, issuer) {
    const assetManagerContract = new BalancerPrimaryIssueManager(this.getWallet(), platformAddress);
    return this.approve(assetManagerContract.contractAddress, offered, tomatch)
      .then(() => {
        return assetManagerContract.offer(owned, isin, offered, tomatch, desired, min, issuer)
          .then((response) => {
            return Response.empty(response);
          });
      });
  }

  approve(accountAddress, amount, security) {
    const securityContract = new VerifiedSecurity(this.getWallet(), security);
    return securityContract.callContract('approve', accountAddress, amount)
      .then((response) => Response.empty(response));
  }

  getLiquidityProviders(platformAddress, ownedAddress) {
    const assetManagerContract = new BalancerPrimaryIssueManager(this.getWallet(), platformAddress);

    return assetManagerContract.getLiquidityProviders(ownedAddress)
      .then((response) => Response.array(response))
      .then((response) => {
        return {
          owner: response[0],
          tokenOffered: response[1],
          underwritten: response[2].toString(),
          subscribed: response[3].toString(),
          earned: response[4].toString(),
        };
      });
  }

  _storeRegistrationDocumentsInIpfs(registrationDocuments) {
    const ipfsStore = this._createIpfsStore();

    return ipfsStore.add(registrationDocuments)
      .then((registrationDocumentsPath) => {
        return registrationDocumentsPath;
      });
  }

  _createIpfsStore() {
    const ipfsConfig = Config.ipfs;
    return new Ipfs(ipfsConfig.host, ipfsConfig.port, ipfsConfig.id, ipfsConfig.secret);
  }
}

export {IssueStatus, ProductCategory, AllotmentStatus};
export default ProductContractService;

