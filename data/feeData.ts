import 'isomorphic-fetch';

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

export async function getLinkswapData(): Promise<FeeData> {
  const linkAddress = "0x514910771af9ca656af840dff83e8264ecf986ca";
  const ethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const request = await fetch('https://api.thegraph.com/subgraphs/name/yflink/linkswap-v1', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        eth:
          pairDayDatas(
            where: {
              date_in: ${JSON.stringify(last7Days())}
              token0_not: ${linkAddress}
              token1_not: ${linkAddress}
            }
          )
          {
            dailyVolumeUSD
          }
        link:
          pairDayDatas(
            where: {
              date_in: ${JSON.stringify(last7Days())}
              token0_not: ${ethAddress}
              token1_not: ${ethAddress}
            }
          )
          {
            dailyVolumeUSD
          }
        linketh:
          pairDayDatas(
            where: {
              date_in: ${JSON.stringify(last7Days())}
              token0: ${linkAddress}
              token1: ${ethAddress}
            }
          )
          {
            dailyVolumeUSD
          }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  const sevenDayMAETH =
    (data.eth.reduce(
      (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
      0
    ) *
      0.003) /
    data.eth.length;

    const sevenDayMALINK =
    (data.link.reduce(
      (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
      0
    ) *
      0.0025) /
    data.link.length;

    const sevenDayMALINKETH =
    (data.linketh.reduce(
      (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
      0
    ) *
      0.0025) /
    data.linketh.length;

    const sevenDayMA = sevenDayMAETH + sevenDayMALINK + sevenDayMALINKETH;

  return {
    id: 'LINKSWAP',
    category: 'app',
    sevenDayMA,
    oneDay:
      (parseFloat(data.eth[data.eth.length - 1].dailyVolumeUSD) * 0.003) + 
      (parseFloat(data.link[data.link.length - 1].dailyVolumeUSD) * 0.0025) +
      (parseFloat(data.linketh[data.linketh.length - 1].dailyVolumeUSD) * 0.0025),
  };
}

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
