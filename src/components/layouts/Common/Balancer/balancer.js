import React, {useEffect, useState} from 'react';
import PoolsTable from './PoolsTable';
import Loader from '../../../ui/Loader';
import ContractService from 'sources/contracts/ContractService';
import {Fetcher} from 'ks-sdk-classic';
import {useBalancerPoolsData} from './balancerPoolData';
import {kyberSubgraphClient} from './apollo';
import {formatPools, getBulkPoolData, usePoolData} from './poolDetail/kyber/contexts/kyberPoolData';
import Config from 'sources/Config';

const factoryAddress = '0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE';

const BalancerPage = (props) => {
  const [pools, setPools] = useState([]);
  const [kyberPoolLoading, setKyberPoolLoading] = useState(true);

  const {data = [], loading} = useBalancerPoolsData('', props.password);
  const {data: kyberPool} = usePoolData('0x306121f1344ac5f84760998484c0176d7bfb7134');
  console.log('Balancer.js Render kyberPool', kyberPool);
  useEffect(() => {
    if (!loading) {
      setPools(data);
    }
  }, [loading]);

  useEffect(() => {
    if (pools.length) {
      fetchKyberPools();
    }
  }, [pools]);

  const fetchKyberPool = async (tokens) => {
    const token1 = await Fetcher.fetchTokenData(1, tokens[0].address);
    const token2 = await Fetcher.fetchTokenData(1, tokens[1].address);
    const contractService = new ContractService(props.password, Config.mainnetProvider);
    const wallet = contractService.getWallet();
    const pools = await Fetcher.fetchPairData(token1, token2, factoryAddress, wallet);
    return {pools, tokens};
  };

  const fetchKyberPools = async () => {
    const promises = pools.map((pool) => {
      if (pool.tokenAddresses.length !== 2) return;
      return fetchKyberPool(pool.tokens);
    });

    const kyberPools = [];
    const newPools = [...pools];

    Promise.all(promises).then(async (res) => {
      res.map((p) => {
        if (p?.pools && p.pools.length) {
          p.pools.map((pair) => {
            let composition = '';
            p.tokens.map((t) => {
              composition = `${composition}${composition ? ', ' : ''}${t.symbol}`;
            });
            composition = ` ${composition} (Kyber)`;
            const newPair = {...pair, tokens: p.tokens, composition, isKyber: true};
            kyberPools.push(newPair);
          });
        }
      });
      const poolIds = [];
      kyberPools.map((pool) => {
        if (pool && pool.address) {
          poolIds.push(pool.address);
        }
      });
      const poolsData = await getBulkPoolData(kyberSubgraphClient, poolIds);
      const allPools = [...formatPools(poolsData), ...newPools];
      setPools(allPools);
    }).catch((error) => {
      console.log('Balancer kyberSdk factory Promise.all error', error);
    }).finally(() => {
      setKyberPoolLoading(false);
    });
  };

  return (
    <>
      {loading || kyberPoolLoading ? <Loader /> : null}
      <section className="d-flex flex-column align-items-start">
        <div class="">
          <h3 class="mb-3">Pool composition</h3>
        </div>
        <PoolsTable {...props} data={pools} />
      </section>
    </>
  );
};

export default BalancerPage;
