import { FeeData } from './feeData';

export async function get0xData(): Promise<FeeData> {

  const request = await fetch("https://api.0xtracker.com/metrics/network?period=week&granularity=day");

  const data = await request.json();

  return {
    id: 'zerox',
    category: 'app',
    sevenDayMA: data.reduce((i: number, day: any) => i + day.protocolFees.USD, 0) / 7,
    oneDay: data[6].protocolFees.USD,
  };
}
