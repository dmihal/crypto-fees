import { Context } from '@cryptostats/sdk';
import icon from 'icons/fantom.svg';

async function getFeeDataFromFTMscan(sdk: Context): Promise<any[]> {
  const csv = await sdk.http.get('https://ftmscan.com/chart/transactionfee?output=csv', {
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

export async function getFTMData(date: string, sdk: Context): Promise<number> {
  if (!feeDataPromise) {
    feeDataPromise = getFeeDataFromFTMscan(sdk);
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

  const ftmPrice = await sdk.coinGecko.getHistoricalPrice('fantom', date);

  return ftmFees * ftmPrice;
}

export default function registerFTM(sdk: Context) {
  sdk.register({
    id: 'fantom',
    queries: {
      fees: (date: string) => getFTMData(date, sdk),
    },
    metadata: {
      category: 'l1',
      name: 'Fantom',
      description: 'Fantom is an aBFT EVM-compatible chain',
      feeDescription: 'Transaction fees are paid to validators',
      blockchain: 'Fantom',
      source: 'FTMscan',
      adapter: 'fantom',
      website: 'https://fantom.foundation',
      tokenTicker: 'FTM',
      tokenCoingecko: 'fantom',
      protocolLaunch: '2020-08-29',
      icon,
    },
  });
}
