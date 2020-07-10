import 'isomorphic-fetch';

type Category = 'l1' | 'app' | 'l2';

export interface FeeData {
  id: string;
  // name: string;
  category: Category;
  sevenDayMA: number;
  oneDay: number;
}

export async function getFeeData(id: string): Promise<FeeData> {
  const request = await fetch(`https://community-api.coinmetrics.io/v2/assets/${id}/metricdata?metrics=FeeTotUSD&start=2020-07-01`);
  const { metricData } = await request.json();

  const sevenDayMA = metricData.series.reduce((total: number, value: any) => total + parseFloat(value.values[0]), 0) / metricData.series.length;

  return {
    id,
    // name
    category: 'l1',
    sevenDayMA,
    oneDay: parseFloat(metricData.series[metricData.series.length - 1].values[0]),
  };
}
