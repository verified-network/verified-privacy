import BigNumber from 'bignumber.js';
import {FiatCurrency} from './constants/currency';

export const FNumFormats = {
  percent: {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  token: {
    maximumFractionDigits: 4,
  },
  fiat: {
    style: 'currency',
  },
};

export function numF(number, options, currency) {
  if (typeof number === 'string') {
    if (number === 'NaN') number = 0;
    number = Number(number || 0);
  }

  const formatterOptions = {...options};
  let postfixSymbol = '';

  if (options.abbreviate) {
    const lookup = [
      {value: 1, symbol: ''},
      {value: 1e3, symbol: 'k'},
      {value: 1e6, symbol: 'm'},
      {value: 1e9, symbol: 'b'},
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    const item = lookup
      .slice()
      .reverse()
      .find(function(item) {
        return number >= item.value;
      });
    postfixSymbol = item ? item.symbol : '';
    const fractionDigits = 2;
    number = item ? new BigNumber((number / item.value).toFixed(fractionDigits).replace(rx, '$1')).toNumber() : number;
  }

  if (number >= 1e4 && !options.fixedFormat && !options.dontAdjustLarge) {
    formatterOptions.minimumFractionDigits = 0;
    formatterOptions.maximumFractionDigits = 0;
  }

  if (options.style === 'percent') {
    if (
      number < 0 &&
      formatterOptions.maximumFractionDigits &&
      formatterOptions.maximumFractionDigits >= 2 &&
      (formatterOptions.minimumFractionDigits || 0) < formatterOptions.maximumFractionDigits - 2
    ) {
      // For consistency with numeral which rounds based on digits before percentages are multiplied by 100
      formatterOptions.maximumFractionDigits = formatterOptions.maximumFractionDigits - 2;
    }
    formatterOptions.useGrouping = false;

    if (number > 0 && number < 0.0001) {
      return '< 0.01%';
    }
  }

  if (options.style === 'currency') {
    formatterOptions.currency = currency;
  }

  if (!options.fixedFormat && !options.style && number > 0 && number < 0.0001) {
    return '< 0.0001';
  }

  if (!options.fixedFormat && number < 1e-6) {
    number = 0;
  }

  const formatter = new Intl.NumberFormat('en-US', formatterOptions);
  let formattedNumber = formatter.format(number);

  // If the number is -0, remove the negative
  if (formattedNumber[0] === '-' && !formattedNumber.match(/[1-9]/)) {
    formattedNumber = formattedNumber.slice(1);
  }

  return formattedNumber + postfixSymbol;
}

export function fNum2(number, options) {
  const _currency = FiatCurrency.usd;
  return numF(number, options, _currency);
}
