import differenceInDays from 'date-fns/differenceInDays';
import { Context } from '@cryptostats/sdk';

let viewBlockPromise;

export async function getZilliqaData(date: string, sdk: Context): Promise<number> {
  if (differenceInDays(new Date(), new Date(date)) > 7) {
    return null;
  }

  if (!viewBlockPromise) {
    viewBlockPromise = sdk.http.get(
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
    const dayDate = sdk.date.formatDate(new Date(day.x[0]));
    if (dayDate === date) {
      const price = await sdk.coinGecko.getHistoricalPrice('zilliqa', date);
      return day.y[0] * price;
    }
  }
  return null;
}

export default function registerZilliqa(sdk: Context) {
  sdk.register({
    id: 'zilliqa',
    queries: {
      fees: (date: string) => getZilliqaData(date, sdk),
    },
    metadata: {
      name: 'Zilliqa',
      category: 'l1',
      source: 'ViewBlock',
      adapter: 'zilliqa',
      website: 'https://zilliqa.com',
      tokenTicker: 'ZIL',
      tokenCoingecko: 'zilliqa',
      legacy: true,
      protocolLaunch: '2021-05-04', // We don't have data from before this date yet
    },
  });
}
