import {BigNumber} from 'bignumber.js';
import dayjs from 'dayjs';
import {ethers} from 'ethers';
import utc from 'dayjs/plugin/utc';
import {timeframeOptions} from './constants';
import Numeral from 'numeral';
import React from 'react';
import {kyberGetBlockClient} from '../../apollo';
import {GET_BLOCKS} from '../../apollo/kyberQueries';

// format libraries
BigNumber.set({EXPONENTIAL_AT: 50});
dayjs.extend(utc);

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc();
  // based on window, get starttime
  let utcStartTime;
  switch (timeWindow) {
  case timeframeOptions.ONE_DAY:
    utcStartTime = utcEndTime.subtract(1, 'day').endOf('day').unix() - 1;
    break;
  case timeframeOptions.THERE_DAYS:
    utcStartTime = utcEndTime.subtract(3, 'day').endOf('day').unix() - 1;
    break;
  case timeframeOptions.WEEK:
    utcStartTime = utcEndTime.subtract(1, 'week').endOf('day').unix() - 1;
    break;
  case timeframeOptions.MONTH:
    utcStartTime = utcEndTime.subtract(1, 'month').endOf('day').unix() - 1;
    break;
  case timeframeOptions.ALL_TIME:
    utcStartTime = utcEndTime.subtract(1, 'year').endOf('day').unix() - 1;
    break;
  default:
    utcStartTime = utcEndTime.subtract(1, 'year').startOf('year').unix() - 1;
    break;
  }
  return utcStartTime;
}

export const toNiceDate = (date) => {
  const x = dayjs.utc(dayjs.unix(date)).format('MMM DD');
  return x;
};

export const toNiceDateYear = (date) => dayjs.utc(dayjs.unix(date)).format('MMMM DD h:mm A, YYYY');

export const isAddress = (value) => {
  try {
    return ethers.utils.getAddress(value.toLowerCase());
  } catch {
    return false;
  }
};

// using a currency library here in case we want to add more in future
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 3,
});

export const toNiceDateTime = (date) => {
  const x = dayjs.utc(dayjs.unix(date)).format('YYYY/MM/DD');
  return x;
};

export async function splitQuery(
  query,
  localClient,
  vars,
  list,
  skipCount = 100
) {
  let fetchedData = {};

  const promises = [];

  for (let i = 0; i < list.length; i += skipCount) {
    const sliced = list.slice(i, i + skipCount);
    promises.push(
      localClient.query({
        query: query(...vars, sliced),
        fetchPolicy: 'cache-first',
      })
    );
  }

  const res = await Promise.all(promises);

  res.forEach((result) => {
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
  });

  return fetchedData;
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 * @param {Int} networkInfo
 * @param {Int} skipCount
 */
export async function getBlocksFromTimestamps(
  timestamps,
  networkInfo,
  skipCount = 500
) {
  if (timestamps?.length === 0) {
    return [];
  }

  timestamps = timestamps.map((t) =>
    parseInt(t) < parseInt(networkInfo.defaultStartTime) ?
      parseInt(networkInfo.defaultStartTime) :
      t
  );

  const fetchedData = await splitQuery(
    GET_BLOCKS,
    kyberGetBlockClient(),
    [],
    timestamps,
    skipCount
  );

  const blocks = [];
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        });
      }
    }
  }
  while (blocks.length < timestamps.length) {
    blocks.push(blocks[blocks.length - 1]);
  }
  return blocks;
}

export const toK = (num) => {
  return Numeral(num).format('0.[00]a');
};

export const formattedNum = (number, usd = false, acceptNegatives = false) => {
  if (isNaN(number) || number === '' || number === undefined) {
    return usd ? '$0' : 0;
  }
  const num = parseFloat(number);

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0), true);
  }

  if (num === 0) {
    if (usd) {
      return '$0';
    }
    return 0;
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001';
  }

  if (num > 1000) {
    return usd ?
      '$' + Number(parseFloat(num).toFixed(0)).toLocaleString('en-US') :
      '' + Number(parseFloat(num).toFixed(0)).toLocaleString('en-US');
  }

  if (usd) {
    if (num < 0.1) {
      return '$' + Number(parseFloat(num).toFixed(4));
    } else {
      const usdString = priceFormatter.format(num);
      return '$' + usdString.slice(1, usdString.length);
    }
  }

  return Number(parseFloat(num).toFixed(5));
};

export function getTimestampsForChanges() {
  const utcCurrentTime = dayjs();
  const t1 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix();
  const t2 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix();
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix();
  return [t1, t2, tWeek];
}

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 * @return {*}
 */
export const get2DayPercentChange = (
  valueNow,
  value24HoursAgo,
  value48HoursAgo
) => {
  // get volume info for both 24 hour periods
  const currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  const previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (parseFloat(currentChange - previousChange) / parseFloat(previousChange)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @return {*}
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

export function formattedPercent(percent, useBrackets = false) {
  percent = parseFloat(percent);
  if (!percent || percent === 0) {
    return <div className="">0%</div>;
  }

  if (percent < 0.0001 && percent > 0) {
    return <div className="text-success">{'< 0.0001%'}</div>;
  }

  if (percent < 0 && percent > -0.0001) {
    return <div className="text-danger">{'< 0.0001%'}</div>;
  }

  const fixedPercent = percent.toFixed(2);
  if (fixedPercent === '0.00') {
    return '0%';
  }
  if (fixedPercent > 0) {
    if (fixedPercent > 100) {
      return (
        <div className="text-success">
          +{percent?.toFixed(0).toLocaleString('en-US')}%
        </div>
      );
    } else {
      return <div className="text-success">{`+${fixedPercent}%`}</div>;
    }
  } else {
    return <div className="text-danger">{`${fixedPercent}%`}</div>;
  }
}
