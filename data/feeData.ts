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
  const last7DaysArray = last7Days();
  const lastDay = last7DaysArray[6];
  const linkAddress = '0x514910771af9ca656af840dff83e8264ecf986ca';
  const request = await fetch('https://api.thegraph.com/subgraphs/name/yflink/linkswap-v1', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        notlink: 
          pairDayDatas(where:{date_in: ${JSON.stringify(
            last7Days()
          )}, token0_not_contains: "${linkAddress}", token1_not_contains: "${linkAddress}" }) {
          date
          dailyVolumeUSD
        }
        all: 
         pairDayDatas(where:{date_in: ${JSON.stringify(last7Days())} }) {
          date
          dailyVolumeUSD
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  let sevenDayMANotLinkTotal = 0;
  let oneDayNotLinkTotal = 0;
  data['notlink'].forEach(function (element) {
    sevenDayMANotLinkTotal += parseFloat(element.dailyVolumeUSD);
    if (element.date === lastDay) {
      oneDayNotLinkTotal += parseFloat(element.dailyVolumeUSD);
    }
  });
  sevenDayMANotLinkTotal = sevenDayMANotLinkTotal / 7;

  let sevenDayMAAllTotal = 0;
  let oneDayNotAllTotal = 0;
  data['all'].forEach(function (element) {
    sevenDayMAAllTotal += parseFloat(element.dailyVolumeUSD);
    if (element.date === lastDay) {
      oneDayNotAllTotal += parseFloat(element.dailyVolumeUSD);
    }
  });
  sevenDayMAAllTotal = sevenDayMAAllTotal / 7;

  const sevenDayMANotLink = sevenDayMANotLinkTotal * 0.003;
  const sevenDayMALink = (sevenDayMAAllTotal - sevenDayMANotLinkTotal) * 0.0025;

  const sevenDayMA = sevenDayMANotLink + sevenDayMALink;

  const oneDay = (oneDayNotAllTotal - oneDayNotLinkTotal) * 0.0025 + oneDayNotLinkTotal * 0.003;

  return {
    id: 'linkswap',
    category: 'app',
    sevenDayMA,
    oneDay,
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

const blacklistAddresses = [
  '0x7d7e813082ef6c143277c71786e5be626ec77b20',
  '0xe5ffe183ae47f1a0e4194618d34c5b05b98953a8',
  '0xf9c1fa7d41bf44ade1dd08d37cc68f67ae75bf92',
  '0x23fe4ee3bd9bfd1152993a7954298bb4d426698f',
  '0x382a9a8927f97f7489af3f0c202b23ed1eb772b5',
];

export async function getUniswapV2Data(): Promise<FeeData> {
  const request = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `query feeData($dates: [Int!]!, $blacklistAddresses: [Bytes!]!, $blacklistLength: Int!){
        uniswapDayDatas(where:{date_in: $dates}) {
          date
          dailyVolumeUSD
        }
        blacklist: pairDayDatas(
          where: {pairAddress_in: $blacklistAddresses},
          orderBy: date,
          orderDirection: desc
          first: $blacklistLength
        ) {
          date
          dailyVolumeUSD
        }
      }`,
      variables: {
        dates: last7Days(),
        blacklistAddresses,
        blacklistLength: 7 * blacklistAddresses.length,
      },
    }),
    method: 'POST',
  });
  const { data } = await request.json();

  const blacklistVolume: any = {};
  for (const item of data.blacklist) {
    blacklistVolume[item.date] =
      (blacklistVolume[item.date] || 0) + parseFloat(item.dailyVolumeUSD);
  }

  const sevenDayTotalVolume = data.uniswapDayDatas.reduce(
    (total: number, { dailyVolumeUSD, date }: any) =>
      total + parseFloat(dailyVolumeUSD) - (blacklistVolume[date] || 0),
    0
  );
  const sevenDayMA = (sevenDayTotalVolume * 0.003) / data.uniswapDayDatas.length;

  const oneDayVolume =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) -
    (blacklistVolume[data.uniswapDayDatas[data.uniswapDayDatas.length - 1].date] || 0);
  const oneDay = oneDayVolume * 0.003;

  return {
    id: 'uniswap-v2',
    category: 'app',
    sevenDayMA,
    oneDay,
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
