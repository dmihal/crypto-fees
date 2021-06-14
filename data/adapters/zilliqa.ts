import differenceInDays from 'date-fns/differenceInDays';
import { formatDate } from '../lib/time';
import { getHistoricalPrice } from '../lib/pricedata';
import { RegisterFunction } from '../types';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  // if (res.status !== 200) throw new Error('zilliqa returned an error');
  return res.json();
};

let viewBlockPromise;

export async function getZilliqaData(date: string): Promise<number> {
  if (differenceInDays(new Date(), new Date(date)) > 7) {
    return null;
  }

  if (!viewBlockPromise) {
    viewBlockPromise = await fetcher(
      'https://api.viewblock.io/zilliqa/stats/charts/txFeesHistory?network=mainnet',
      {
        headers: {
          Origin: 'https://viewblock.io',
        },
      }
    );
  }
  const response = await viewBlockPromise;

  for (const day of response.values) {
    const dayDate = formatDate(new Date(day.x[0]));
    if (dayDate === date) {
      const price = await getHistoricalPrice('zilliqa', date);
      return day.y[0] * price;
    }
  }
  return null;
}

export default function registerZilliqa(register: RegisterFunction) {
  const zilliqaQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Zilliqa doesn't support ${attribute}`);
    }
    return getZilliqaData(date);
  };

  register('zilliqa', zilliqaQuery, {
    name: 'Zilliqa',
    category: 'l1',
    source: 'ViewBlock',
    adapter: 'zilliqa',
    website: 'https://zilliqa.com',
    tokenTicker: 'ZIL',
    tokenCoingecko: 'zilliqa',
    legacy: true,
    protocolLaunch: '2021-05-04', // We don't have data from before this date yet
  });
}
