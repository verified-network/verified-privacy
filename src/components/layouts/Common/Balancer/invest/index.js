import React from 'react';
import {PoolType} from '../types';
import InvestBalancerPools from './InvestBalancerPools';
import InvestPrimaryIssuePools from './InvestPrimaryIssuePools';
import InvestSecondaryIssuePools from './InvestSecondaryIssuePools';

const InvestPool = (props) => {
  const {pool = {}} = props;

  if (pool.poolType === PoolType.PrimaryIssue) {
    return <InvestPrimaryIssuePools {...props} />;
  } else if (pool.poolType === PoolType.SecondaryIssue) {
    return <InvestSecondaryIssuePools {...props} />;
  } else {
    return <InvestBalancerPools {...props} />;
  }
};
export default InvestPool;
