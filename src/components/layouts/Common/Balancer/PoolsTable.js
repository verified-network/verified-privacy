import React, {useState} from 'react';
import UiTable from '../../../ui/table/Table';
import Tabledropdown from 'components/ui/tableDropdown/TableDropdown';
import TradePool from './trade';

const INVEST_ACTION = 'Invest';
const TRADE_ACTION = 'Trade';

const PoolsTable = (props) => {
  const [showTradeDialog, setShowTradeDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleActions = (row) => {
    const action = row.indexLabel;
    console.log('handleActions row', row);
    if (action === INVEST_ACTION) {
      const type = row.isKyber ? 'kyber' : 'balancer';
      props.history.push(`/investor/pool/${type}/${row.id || row.address}`);
    } else if (action === TRADE_ACTION) {
      setSelectedRow(row);
      setShowTradeDialog(true);
    }
  };

  const onInvest = (row) => {
    const type = row.isKyber ? 'kyber' : 'balancer';
    props.history.push(`/investor/pool/${type}/${row.id || row.address}`);
  };

  const headers = [
    {label: 'Composition', val: 'composition'},
    {label: 'Pool value', val: 'poolValue'},
    {label: 'Volume (24h)', val: 'volume'},
    // { label: 'APR', val: 'apr' },
    // {label: 'Actions', val: 'action'},
  ];

  const dataRows = [...props.data];

  const options = {
    onClick: (event, row) => {
      onInvest(row);
    },
  };

  return (
    <>
      <div className="pools-table width-100">
        <UiTable thead={headers} tbodyData={dataRows} hover bordered={false} rowEvents={options} />
      </div>
      <TradePool {...props} show={showTradeDialog} onHide={() => setShowTradeDialog(false)} pool={selectedRow} />
    </>
  );
};

export default PoolsTable;
