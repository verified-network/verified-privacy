import React from 'react';
import UiTable from '../../../ui/table/Table';

export const PoolImages = {
  wstETH: 'https://raw.githubusercontent.com/balancer-labs/assets/master/assets/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0.png',
  WETH: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
};

const PoolComposition = (props) => {
  const headers = [
    {label: 'Token', val: 'token'},
    {label: 'Balance', val: 'balance'},
    {label: 'Value', val: 'value'},

  ];

  const data = [
    {
      token: 'WETH',
      balance: '20,239',
      value: '$22,466,465',
    },
    {
      token: 'wstETH',
      balance: '62,186',
      value: '$71,742,793',
    },

  ];

  return <div className='mr-3'>
    <h5 className="mb-3 mt-5">Pool composition</h5>
    <UiTable thead={headers} tbodyData={data} bordered={false} />
  </div>;
};

export default PoolComposition;
