type Category = 'l1' | 'app' | 'l2';

export interface FeeData {
  id: string;
  name?: string;
  category: Category;
  sevenDayMA: number;
  oneDay: number;
}

export async function getFeeData(id: string): Promise<FeeData> {
  const startDate = new Date(Date.now() - 86400 * 1000 * 7);
  const startDateString = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
  const request = await fetch(
    `https://community-api.coinmetrics.io/v2/assets/${id}/metricdata?metrics=FeeTotUSD&start=${startDateString}`
  );
  const { metricData } = await request.json();
  const sevenDayMA =
    metricData.series.reduce(
      (total: number, value: any) => total + parseFloat(value.values[0]),
      0
    ) / metricData.series.length;

  return {
    id,
    // name
    category: 'l1',
    sevenDayMA,
    oneDay: parseFloat(metricData.series[metricData.series.length - 1].values[0]),
  };
}

const last7Days = () =>
  [...new Array(7)].map((_, num) => Math.floor(Date.now() / 1000 / 86400 - num - 1) * 86400);

export async function getSushiswapData(): Promise<FeeData> {
  const request = await fetch(
    'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork',
    {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
        uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
          date
          dailyVolumeUSD
        }
      }`,
        variables: null,
      }),
      method: 'POST',
    }
  );
  const { data } = await request.json();

  const sevenDayMA =
    (data.uniswapDayDatas.reduce(
      (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
      0
    ) *
      0.003) /
    data.uniswapDayDatas.length;

  return {
    id: 'sushiswap',
    category: 'app',
    sevenDayMA,
    oneDay:
      parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003,
  };
}

export async function getUniswapV2Data(): Promise<FeeData> {
  const request = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
          date
          dailyVolumeUSD
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });
  const { data } = await request.json();

  const sevenDayMA =
    (data.uniswapDayDatas.reduce(
      (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
      0
    ) *
      0.003) /
    data.uniswapDayDatas.length;

  return {
    id: 'uniswap-v2',
    category: 'app',
    sevenDayMA,
    oneDay:
      parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003,
  };
}

export async function getUniswapV1Data(): Promise<FeeData> {
  const request = await fetch('https://api.thegraph.com/subgraphs/name/graphprotocol/uniswap', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
          date
          dailyVolumeInUSD
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });
  const { data } = await request.json();

  const sevenDayMA =
    (data.uniswapDayDatas.reduce(
      (total: number, { dailyVolumeInUSD }: any) => total + parseFloat(dailyVolumeInUSD),
      0
    ) *
      0.003) /
    data.uniswapDayDatas.length;

  return {
    id: 'uniswap-v1',
    category: 'app',
    sevenDayMA,
    oneDay:
      parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeInUSD) * 0.003,
  };
}
