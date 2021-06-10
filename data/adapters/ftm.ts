import { getHistoricalPrice } from '../lib/pricedata';

async function getFeeDataFromFTMscan(): Promise<any[]> {
  const response = await fetch('https://ftmscan.com/chart/transactionfee?output=csv');
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

export async function getFTMData(date: string): Promise<number> {
  if (!feeDataPromise) {
    feeDataPromise = getFeeDataFromFTMscan();
  }
  const feeData = await feeDataPromise;

  const [year, month, day] = date.split('-');
  const dateInCSVFormat = `${parseInt(month)}/${parseInt(day)}/${year}`;

  // Yay binary search!
  let ftmFees = 0;
  let low = 0;
  let high = feeData.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (dateInCSVFormat == feeData[mid][0]) {
      ftmFees = feeData[mid][2] / 1e18;
      break;
    } else if (new Date(date) < new Date(feeData[mid][0])) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  if (low > high) {
    throw new Error(`Couldn't find FTM data on ${date}`);
  }

  const ftmPrice = await getHistoricalPrice('fantom', date);

  return ftmFees * ftmPrice;
}

function ftmQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`FTM doesn't support ${attribute}`);
  }

  return getFTMData(date);
}

export default function registerFTM(register: any) {
  register('ftm', ftmQuery, {
    category: 'l1',
    name: 'Fantom',
    shortName: 'FTM',
    description: 'Fantom is aBFT EVM-compatible chain',
    feeDescription: 'Transaction fees are paid to validators',
    blockchain: 'FTM',
    source: 'FTMscan',
    adapter: 'ftm',
    website: 'https://fantom.foundation',
    tokenTicker: 'FTM',
    tokenCoingecko: 'fantom',
  });
}
