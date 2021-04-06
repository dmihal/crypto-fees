import { FeeData } from '../types';
import { getHistoricalAvgDailyPrice } from '../lib/pricedata';

export async function getBSCData(): Promise<FeeData> {
  const response = await fetch('https://bscscan.com/chart/transactionfee?output=csv');
  const csv = await response.text();

  const parsed = csv
    .trim()
    .split('\n')
    .map((row: string) => row.trim().split(',').map((cell: string) => JSON.parse(cell)));

  const priceYesterday = await getHistoricalAvgDailyPrice('binancecoin', 1);
  const priceLastWeek = await getHistoricalAvgDailyPrice('binancecoin', 7);
  const totalBNBWeek = parsed
    .slice(-7)
    .reduce((acc: number, val: any) => acc + parseInt(val[2]), 0);

  return {
    id: 'bsc',
    name: 'Binance Smart Chain',
    category: 'l1',
    sevenDayMA: (totalBNBWeek / 1e18 / 7) * priceLastWeek,
    oneDay: (parsed[parsed.length - 1][2] / 1e18) * priceYesterday,
  };
}
