// Test cases for the Balancer asset manager
// (c) Kallol Borah, 2022

const assert = require("assert");
const {ethers} = require ("ethers");

const Factory = artifacts.require('IFactory');
const Cash = artifacts.require('ICash');
const Security = artifacts.require('ISecurity');
const Client = artifacts.require('Client');
const BalancerManager = artifacts.require('PrimaryIssueManager');

contract("Balancer asset manager testing", async(accounts)=> {

    const bridge = '0xe709550d3cceb0bea7b9643a9e368a2bb55503ea3107679966864874a6aa279b';
    const security = '0x1000000000000000000000000000000000000000';    
    const VXUSD = '0xeD79532E7ac056d26C86804CE9b8af3a0B825155'; //L1 
    const factoryAddress = '0x59029834a584CfC623E46839b6b1AF82087B95f0'; //L1
    var token;
    var factory;
    var securityContract;

    var r;
    var s;
    var v_decimal;
    var msghash;

    const sign = async function(msg){
        let someHash = "0x0123456789012345678901234567890123456789012345678901234567890123";
        let payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "string" ], [ someHash, msg ]);
        let payloadHash = ethers.utils.keccak256(payload);
        let signature = await new ethers.Wallet(bridge).signMessage(ethers.utils.arrayify(payloadHash));
        let sig = ethers.utils.splitSignature(signature);
        return [someHash, sig.v, sig.r, sig.s];
    }

    var getFirstEvent = (_event) => {
        return new Promise((resolve, reject) => {
          _event.once('data', resolve).once('error', reject);
          new Promise(resolve => setTimeout(resolve, 4000)); // waits for 4 secs
        });
    }

    before('issue security', async () => {
        factory = await Factory.at(factoryAddress);
        const [msg, vd, rr, ss] = await sign("L2toL1");
        await factory.issueSecurity(security, ethers.utils.formatBytes32String('company'), ethers.utils.formatBytes32String('isin'), ethers.utils.formatBytes32String('VXUSD'), accounts[2], msg, vd, rr, ss)
        .then(async()=>{            
            await getFirstEvent(factory.securitiesAdded({fromBlock:1}));
            const rcpt = await factory.getPastEvents('securitiesAdded', {fromBlock:'latest'});
            token = rcpt[0].returnValues.security; 
            console.log("Issued security "+token);
            securityContract = await Security.at(token);
            await factory.addBalance(security, ethers.utils.getAddress('0x0000000000000000000000000000000000000000'), accounts[2], '1000', msg, vd, rr, ss)
            .then(function(){
                console.log("Minted opening balance of security");
            })
        })
    });

    before('initialize L1 client', async () => {
        var client = await Client.deployed();
        const [msg, vd, rr, ss] = await sign("L2toL1");
        await client.addRole(accounts[0], accounts[3], ethers.utils.formatBytes32String('IN'), ethers.utils.formatBytes32String('AM'), ethers.utils.formatBytes32String('1234'), msg, vd, rr, ss)
        .then(async()=>{
            await client.getRole(accounts[3])
            .then(async(result)=>{
                console.log("Client role registered is "+result[0]);
                var viausdCash = await Cash.at(VXUSD);
                await viausdCash.setSigner(accounts[0])
                .then(async()=>{
                    await viausdCash.addIssuedBalance(2000, accounts[3], ethers.utils.formatBytes32String("VXUSD"), msg, vd, rr, ss)
                    .then(async()=>{
                        console.log("VXUSD Cash balance added in L1.");
                        await viausdCash.transferIssuedBalance(accounts[3], ethers.utils.formatBytes32String("ether"), 2000, 2000, msg, vd, rr, ss)
                        .then(async()=>{
                            console.log("User cash token balance after transfer of issued balance :", await web3.utils.hexToNumberString(await web3.utils.toHex(await viausdCash.balanceOf(accounts[3]))));
                        });
                    })
                })
            })
        })
    });

    it("offers liquidity", async()=>{
        var assetmanager = await BalancerManager.deployed();
        const [msg, vd, rr, ss] = await sign("L2toL1");
        await securityContract.approveToken(accounts[2], assetmanager.address, '100', msg, vd, rr, ss)
        .then(async()=>{
            await assetmanager.offer(token, ethers.utils.formatBytes32String('isin'), '50', VXUSD, '1000', '800', accounts[2])
            .then(async()=>{
                console.log("Security token offered on platform by issuer");
                await assetmanager.getOffered(VXUSD, {from: accounts[3]})
                .then(async(tokens)=>{
                    console.log("Offered token is "+tokens);
                })
                await assetmanager.getOfferMade(token, VXUSD, {from:accounts[3]})
                .then(async(offers)=>{
                    console.log("Offers made by issuer is "+offers);
                    await securityContract.approve(assetmanager.address, '900', {from:accounts[3]})
                    .then(async()=>{
                        await assetmanager.offer(VXUSD, ethers.utils.formatBytes32String('isin'), '900', token, '100', '90', accounts[3], {from:accounts[3]})
                        .then(async()=>{
                            console.log("Offer made by asset manager");
                            await assetmanager.getLiquidityProviders(token)
                            .then(function(lps){
                                console.log("Fetching asset manager that has provided liquidity "+lps);
                            })
                        })
                    })
                })
            })
        })
    });

    it("issues product and get subscribers", async()=>{
        var assetmanager = await BalancerManager.deployed();
        const [msg, vd, rr, ss] = await sign("L2toL1");
        await assetmanager.issue(token, Math.floor((new Date()).getTime() / 1000)+60000, accounts[2], msg, vd, rr, ss)
        .then(async()=>{
            console.log("Issued new product");
            await assetmanager.subscribe(ethers.utils.formatBytes32String('pid'), security, VXUSD, ethers.utils.formatBytes32String('vxusd'), '1000', accounts[3], '10', true)
            .then(async()=>{
                console.log("Subscribed to pool");
                await assetmanager.getSubscribers(ethers.utils.formatBytes32String('pid'), msg, vd, rr, ss)
                .then(async(subscriptions)=>{
                    console.log("Subscriptions are "+subscriptions);
                    await assetmanager.close(token, msg, vd, rr, ss)
                    .then(async()=>{
                        console.log("Closed issue");
                        await assetmanager.accept(ethers.utils.formatBytes32String('pid'), accounts[3], '10', VXUSD, msg, vd, rr, ss)
                        .then(async()=>{
                            console.log("Accepted investor");
                            await assetmanager.settle(ethers.utils.formatBytes32String('pid'), msg, vd, rr, ss)
                            .then(async()=>{
                                console.log("Settled issue");
                            })
                        })
                        await assetmanager.reject(ethers.utils.formatBytes32String('pid'), accounts[3], msg, vd, rr, ss)
                        .then(async()=>{
                            console.log("Rejected investor");
                        })
                    })
                })
            })
        })
    });
    
})