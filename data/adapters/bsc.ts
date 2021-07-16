import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

async function getFeeDataFromEtherscan(sdk: CryptoStatsSDK): Promise<any[]> {
  const csv = await sdk.http.get('https://bscscan.com/chart/transactionfee?output=csv', {
    plainText: true,
  });

  const parsed = csv
    .trim()
    .split('\n')
    .map((row: string) =>
      row
        .trim()
        .split(',')
        .map((cell: string) => JSON.parse(cell))
    );

  return parsed;
}

let feeDataPromise: null | Promise<any[]> = null;

export async function getBSCData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  if (!feeDataPromise) {
    feeDataPromise = getFeeDataFromEtherscan(sdk);
  }
  const feeData = await feeDataPromise;

  const [year, month, day] = date.split('-');
  const dateInCSVFormat = `${parseInt(month)}/${parseInt(day)}/${year}`;

  // Yay binary search!
  let bnbFees = 0;
  let low = 0;
  let high = feeData.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (dateInCSVFormat == feeData[mid][0]) {
      bnbFees = feeData[mid][2] / 1e18;
      break;
    } else if (new Date(date) < new Date(feeData[mid][0])) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  if (low > high) {
    throw new Error(`Couldn't find BSC data on ${date}`);
  }

  const bnbPrice = await sdk.coinGecko.getHistoricalPrice('binancecoin', date);

  return bnbFees * bnbPrice;
}

export default function registerBSC(register: RegisterFunction, sdk: CryptoStatsSDK) {
  function bscQuery(attribute: string, date: string) {
    if (attribute !== 'fee') {
      throw new Error(`BSC doesn't support ${attribute}`);
    }

    return getBSCData(date, sdk);
  }

  register('bsc', bscQuery, {
    category: 'l1',
    name: 'Binance Smart Chain',
    shortName: 'BSC',
    description: 'Binance Smart Chain is an inexpensive, EVM-compatible chain',
    feeDescription: 'Transaction fees are paid to validators',
    blockchain: 'BSC',
    source: 'Etherscan',
    adapter: 'bsc',
    website: 'https://binance.org',
    tokenTicker: 'BNB',
    tokenCoingecko: 'binancecoin',
    protocolLaunch: '2020-09-11',
  });
}
