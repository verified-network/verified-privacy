import ContractService from './ContractService';
import {LiquidityContract} from '@verified-network/verified-sdk';
import Response from './Response';
import ProductContractService from 'sources/contracts/ProductContractService';
import {ethers} from 'ethers';
import KycContractService from 'sources/contracts/KycContractService';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

class LiquidityContractService extends ContractService {
  constructor(password) {
    super(password);

    this.liquidityContract = new LiquidityContract(this.getL1Wallet());
  }

  buyLiquidity(tokenName, tokenAmount) {
    return this.getSupportedTokens()
        .then((supportedTokens) => {
          const token = supportedTokens.find((element) => element.name === tokenName);

          if (token) {
            return token.address;
          } else {
            return Promise.reject(new Error('Token not supported.'));
          }
        })
        .then((tokenAddress) => {
          return this.approve(this.getWallet().address, tokenAmount)
              .then(() => {
                return this.liquidityContract.buy(tokenAddress, tokenAmount)
                    .then((response) => Response.empty(response));
              });
        });
  }

  buyLiquidityWithEther(etherAmount) {
    const wallet = this.getWallet();

    return wallet
        .sendTransaction({
          to: this.liquidityContract.contractAddress,
          value: ethers.utils.parseEther(etherAmount),
        })
        .then((transactionResponse) => {
          return transactionResponse;
        });
  }

  getPlatforms() {
    const productContractService = new ProductContractService(this.getPassword());
    return productContractService.getPlatforms();
  }

  registerPlatform(platformAddress, platformName) {
    return this.liquidityContract.registerPlatform(platformAddress, platformName)
        .then((response) => Response.empty(response));
  }

  addManager(platformAddress, managerAddress) {
    return this.liquidityContract.addManager(platformAddress, managerAddress)
        .then((response) => Response.empty(response));
  }

  getPlatformsPerformance() {
    return this.getPlatforms()
        .then((platforms) => {
          const promises = platforms.map((platform) => this.getPlatformPerformance(platform.address));
          return Promise.all(promises);
        });
  }

  getPlatformPerformance(platformAddress) {
    return this.liquidityContract.getPlatformPerformance(platformAddress)
        .then((response) => Response.array(response))
        .then((response) => {
          return {
            platformAddress,
            unstakedLiquidity: response[0].toString(),
            balancePlatformLiquidity: response[1].toString(),
            platformLiquidityProvided: response[2].toString(),
            platformCommissionsEarned: response[3].toString(),
          };
        });
  }

  getManagersPerformance(platformAddress) {
    return this.liquidityContract.getManagers(platformAddress)
        .then((response) => Response.array(response))
        .then((managers) => {
          const notNull = managers.filter((managerAddress) => managerAddress !== NULL_ADDRESS);

          const promises = notNull.map((managerAddress) => {
            return this.getManagerPerformance(platformAddress, managerAddress);
          });

          return Promise.all(promises)
              .then(((responses) => {
                const result = [];

                for (const response of responses) {
                  result.push(...response);
                }

                return result;
              }));
        });
  }

  getManagerPerformance(platformAddress, managerAddress) {
    return this.getSupportedTokens()
        .then((tokens) => {
          const promises = tokens.map((token) => {
            return this.liquidityContract.getManagerPerformance(platformAddress, token.address, managerAddress)
                .then((response) => Response.array(response))
                .then((response) => {
                  return {
                    managerAddress,
                    token: token.name,
                    managerLiquidityProvided: response[0].toString(),
                    managerCommissionsEarned: response[1].toString(),
                  };
                })
                .then((response) => {
                  const kycContractService = new KycContractService(this.getPassword());

                  return kycContractService.getFullName(managerAddress)
                      .then((managerName) => {
                        response.managerName = managerName;
                        return response;
                      });
                });
          });

          return Promise.all(promises);
        });
  }

  provideLiquidity(platformAddress, managerAddress, liquidityAmount, tokenName, tokenAmount) {
    return this.getSupportedTokenByName(tokenName)
        .then((token) => {
          if (!token) {
            throw new Error(`Token ${tokenName} not found.`);
          }

          return this.liquidityContract
              .provideLiquidity(
                  platformAddress, managerAddress, liquidityAmount, token.address, tokenAmount
              )
              .then((response) => Response.empty(response));
        });
  }

  removeManager(platformAddress, managerAddress) {
    return this.liquidityContract.removeManager(platformAddress, managerAddress)
        .then((response) => Response.empty(response));
  }

  createSupply(supply, cap, limit) {
    return this.liquidityContract.createSupply(supply, cap, limit)
        .then((response) => Response.empty(response));
  }

  supportToken(address, name) {
    return this.liquidityContract.supportTokens(address, name)
        .then((response) => Response.empty(response));
  }

  supportEtherToken() {
    const etherAddress = '0x0000000000000000000000000000000000000000';
    const etherName = 'ether';

    return this.checkSupportForToken(etherAddress)
        .then((response) => {
          if (response !== 'Supported') {
            return this.supportToken(etherAddress, etherName);
          }
        });
  }

  checkSupportForToken(address) {
    return this.liquidityContract.checkSupportForToken(address)
        .then((response) => Response.value(response))
        .then((response) => {
          return response ? 'Supported' : 'No supported';
        });
  }

  payoutEarnings(platformAddress, distribution) {
    return this.liquidityContract.payOut(distribution, platformAddress)
        .then((response) => Response.empty(response));
  }

  getInvestors() {
    return this.liquidityContract.getInvestors()
        .then((response) => Response.array(response))
        .then((investors) => {
          return investors.map((investor) => {
            return {
              assetInvested: investor[0],
              investorAddress: investor[1],
            };
          });
        })
        .then((investors) => {
          const promises = investors.map((investor) => {
            return this.liquidityContract.getInvestment(investor.investorAddress, investor.assetInvested)
                .then((response) => Response.value(response))
                .then((response) => {
                  return {
                    ...investor,
                    amountInvested: response,
                  };
                })
                .then((response) => {
                  const kycContract = new KycContractService(this.getPassword());

                  return kycContract.getFullName(response.investorAddress)
                      .then((investorName) => {
                        response.investorName = investorName;
                        return response;
                      });
                });
          });

          return Promise.all(promises);
        });
  }

  getSupportedTokens() {
    return this.liquidityContract.getSupportedTokens()
        .then((response) => Response.array(response))
        .then((response) => {
          return response.map((token) => {
            return {
              name: Response.parseBytes32Value(token[0]),
              address: token[1],
            };
          });
        });
  }

  getSupportedTokenByName(tokenName) {
    return this.getSupportedTokens()
        .then((supportedTokens) => {
          return supportedTokens.find((token) => token.name === tokenName);
        });
  }

  issue(investorAddress, tokenName, tokenAmount, lpToIssue) {
    return this.approve(this.getWallet().address, lpToIssue)
        .then(() => {
          return this.liquidityContract.issue(investorAddress, tokenName, tokenAmount, lpToIssue)
              .then((response) => Response.empty(response));
        });
  }

  balanceOf() {
    const userWalletAddress = this.getWallet().address;

    return this.liquidityContract.balanceOf(userWalletAddress)
        .then((response) => Response.value(response));
  }

  approve(accountAddress, amount) {
    return this.liquidityContract.callContract('approve', accountAddress, amount)
        .then((response) => Response.empty(response));
  }
}

export default LiquidityContractService;
