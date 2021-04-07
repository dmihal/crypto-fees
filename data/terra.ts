import { FeeData } from './feeData';
import { getHistoricalAvgDailyPrice } from './pricedata';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('aave did return an error');
  return res.json();
};

export async function getTerraData(): Promise<FeeData> {
  const response = await fetcher('https://fcd.terra.dev/v1/dashboard/block_rewards');

  const krwYesterday = await getHistoricalAvgDailyPrice('usd-coin', 1, 'krw');
  const krwLastWeek = await getHistoricalAvgDailyPrice('usd-coin', 7, 'krw');

  const oneDay = response.periodic[response.periodic.length - 1].blockReward / 1e6 / krwYesterday;
  const week = response.periodic
    .slice(-7)
    .reduce((acc: number, day: any) => parseFloat(day.blockReward) + acc, 0);
  const sevenDayMA = week / 7 / 1e6 / krwLastWeek;

  return {
    id: 'terra',
    name: 'Terra',
    category: 'l1',
    sevenDayMA,
    oneDay,
  };
}
