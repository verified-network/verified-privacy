const {ethers} = require('ethers');

const SUCCESS = 0;

function value(response) {
  if (response.status === SUCCESS) {
    return Promise.resolve(response.response.result[0]);
  } else {
    return Promise.reject(response.reason);
  }
}

function array(response) {
  if (response.status === SUCCESS) {
    return Promise.resolve(response.response.result);
  } else {
    return Promise.reject(response.reason);
  }
}

function empty(response) {
  if (response.status === SUCCESS) {
    return Promise.resolve();
  } else {
    return Promise.reject(response.reason);
  }
}

function emptyPromise(promise) {
  return promise.then((response) => {
    return empty(response);
  });
}

function valuePromise(promise) {
  return promise.then((response) => {
    return value(response);
  });
}

function arrayPromise(promise) {
  return promise.then((response) => {
    return array(response);
  });
}

function parseBytes32Value(text) {
  return ethers.utils.parseBytes32String(text);
}

function parseBytes16Value(text) {
  let finalText = text;

  if (text.length === 34) {
    finalText = `${text}00000000000000000000000000000000`;
  }

  return ethers.utils.parseBytes32String(finalText);
}

function parseBytes32Array(array) {
  return array.map((element) => {
    return parseBytes32Value(element);
  });
}

export default {
  value,
  array,
  empty,
  emptyPromise,
  valuePromise,
  arrayPromise,
  parseBytes32Value,
  parseBytes16Value,
  parseBytes32Array,
};
