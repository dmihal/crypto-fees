import { FeeData } from './feeData';

export async function get0xData(): Promise<FeeData> {
  const request = await fetch(
    'https://api.0xtracker.com/metrics/network?period=month&granularity=day'
  );

  const data = await request.json();

  return {
    id: 'zerox',
    category: 'app',
    sevenDayMA: data.slice(-8, -1).reduce((i: number, day: any) => i + day.protocolFees.USD, 0) / 7,
    oneDay: data[data.length - 2].protocolFees.USD,
  };
}
