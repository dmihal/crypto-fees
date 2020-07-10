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

export async function getUniswapData(): Promise<FeeData> {
  const days = [...new Array(7)].map((_, num) => Math.floor(Date.now() / 1000 / 86400 - num) * 86400);

  const request = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        uniswapDayDatas(where:{date_in: ${JSON.stringify(days)}}) {
          date
          dailyVolumeUSD
        }
      }`,
      variables: null
    }),
    "method": "POST",
  });
  const { data } = await request.json();

  const sevenDayMA = data.uniswapDayDatas.reduce((total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD), 0) * 0.003 / data.uniswapDayDatas.length;

  return {
    id: 'uniswap-v2',
    // name
    category: 'app',
    sevenDayMA,
    oneDay: parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003,
  };
}
