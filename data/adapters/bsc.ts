import { getHistoricalPrice } from '../lib/pricedata';

async function getFeeDataFromEtherscan(): Promise<any[]> {
  const response = await fetch('https://bscscan.com/chart/transactionfee?output=csv');
  const csv = await response.text();

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

export async function getBSCData(date: string): Promise<number> {
  if (!feeDataPromise) {
    feeDataPromise = getFeeDataFromEtherscan();
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

  const bnbPrice = await getHistoricalPrice('binancecoin', date);

  return bnbFees * bnbPrice;
}

function bscQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`BSC doesn't support ${attribute}`);
  }

  return getBSCData(date);
}

export default function registerBSC(register: any) {
  register('bsc', bscQuery, {
    category: 'l1',
    name: 'BSC',
    description: 'Binance Smart Chain is an inexpensive, EVM-compatable chain',
    feeDescription: 'Transaction fees are paid to validators',
    blockchain: 'BSC',
    source: 'Etherscan',
    adapter: 'bsc',
    tokenTicker: 'BNB',
    tokenCoingecko: 'binancecoin',
  });
}
