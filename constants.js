const DAILY_ADJUSTED = 'TIME_SERIES_DAILY_ADJUSTED';
const MONTHLY_ADJUSTED = 'TIME_SERIES_MONTHLY_ADJUSTED';
const SEARCH = 'SYMBOL_SEARCH';

const timePeriod = type =>{
  switch (type) {
    case 'daily':
      return DAILY_ADJUSTED;
    case 'monthly':
      return MONTHLY_ADJUSTED;
    case 'search':
      return SEARCH;
    default:
      break;
  }
}

module.exports = timePeriod;