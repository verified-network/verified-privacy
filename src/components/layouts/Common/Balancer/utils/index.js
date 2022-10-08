import BigNumber from 'bignumber.js';

export function shorten(str = '') {
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

function lsAddVersion(value, version) {
  return {
    data: value,
    _version: version,
  };
}

function lsGetKey(key) {
  return `verified.${key}`;
}

export function lsSet(key, value, version) {
  const data = version != null ? lsAddVersion(value, version) : value;

  return localStorage.setItem(lsGetKey(key), JSON.stringify(data));
}

export function lsGet(
  key,
  defaultValue,
  version
) {
  const rawValue = localStorage.getItem(lsGetKey(key));

  if (rawValue != null) {
    try {
      const value = JSON.parse(rawValue);
      if (version != null) {
        return value._version === version ? value.data : defaultValue;
      }
      return value;
    } catch (e) {
      return defaultValue;
    }
  }

  return defaultValue;
}

export function lsRemove(key) {
  return localStorage.removeItem(lsGetKey(key));
}

export function getCurrentTs() {
  return parseInt((new Date().getTime() / 1e3).toString());
}

export function tsToBlockNumber(currentBlockNumber, ts) {
  const diffTs = getCurrentTs() - ts;
  return currentBlockNumber - parseInt((diffTs / 13.35).toString());
}

export function bnum(val) {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0';
  return new BigNumber(number);
}

export const bnumZero = bnum(0);

export function scale(
  input,
  decimalPlaces
) {
  const unscaled = typeof input === 'string' ? new BigNumber(input) : input;
  const scalePow = new BigNumber(decimalPlaces.toString());
  const scaleMul = new BigNumber(10).pow(scalePow);
  return unscaled.times(scaleMul);
}

export function shortenLabel(str, segLength = 4) {
  const firstSegment = str.substring(0, segLength + 2);
  const lastSegment = str.substring(str.length, str.length - segLength);
  return `${firstSegment}...${lastSegment}`;
}

export async function forChange(
  reactiveVar,
  expected,
  checkCount = 0,
  checkDelay = 500,
  checkLimit = 20
) {
  if (reactiveVar === expected || checkCount >= checkLimit) return;
  await sleep(checkDelay);
  await forChange(reactiveVar, expected, checkCount++);
}

export function bnSum(amounts) {
  return amounts.reduce((a, b) => bnum(a).plus(b), bnum(0));
}

export function getAddressFromPoolId(poolId) {
  return poolId.substring(0, 42);
}
