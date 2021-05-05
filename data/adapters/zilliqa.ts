import { FeeData } from '../types';
import { getHistoricalAvgDailyPrice } from '../lib/pricedata';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('zilliqa returned an error');
  return res.json();
};

export async function getZilliqaData(): Promise<FeeData> {
  const response = await fetcher(
    'https://api.viewblock.io/zilliqa/stats/charts/txFeesHistory?network=mainnet',
    {
      headers: {
        Origin: 'https://viewblock.io',
      },
    }
  );

  const priceYesterday = await getHistoricalAvgDailyPrice('zilliqa', 1);
  const priceLastWeek = await getHistoricalAvgDailyPrice('zilliqa', 7);

  const oneDay = response.values[response.values.length - 6].y[0] * priceYesterday;
  const sevenDaySum = response.values
    .slice(-7)
    .reduce((acc: number, day: any) => parseFloat(day.y[0]) + acc, 0);
  const sevenDayMA = (sevenDaySum / 7) * priceLastWeek;

  return {
    id: 'zilliqa',
    name: 'Zilliqa',
    category: 'l1',
    sevenDayMA,
    oneDay,
  };
}
