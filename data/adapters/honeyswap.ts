import { Context } from '@cryptostats/sdk';

export async function getHoneyswapData(date: string, sdk: Context): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await sdk.graph.query(
    '1hive/honeyswap-v2',
    graphQuery,
    {
      date: sdk.date.dateToTimestamp(date),
    },
    'fees'
  );

  const oneDayVolume = parseFloat(
    data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD
  );
  const oneDay = oneDayVolume * 0.003;

  return oneDay;
}

export default function registerHoneyswap(sdk: Context) {
  sdk.register({
    id: 'honeyswap',
    queries: {
      fees: (date: string) => getHoneyswapData(date, sdk),
    },
    metadata: {
      name: 'HoneySwap',
      category: 'dex',
      description: 'HoneySwap is a permissionless, decentralized exchange',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      website: 'https://honeyswap.org',
      blockchain: 'xDai',
      source: 'The Graph Protocol',
      adapter: 'honeyswap',
      tokenTicker: 'HNY',
      tokenCoingecko: 'honey',
      protocolLaunch: '2020-09-03',
      tokenLaunch: '2020-10-22',
    },
  });
}
