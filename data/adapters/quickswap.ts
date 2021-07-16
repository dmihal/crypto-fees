import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

export async function getQuickswapData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await sdk.graph.query(
    'sameepsi/quickswap06',
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

export default function registerUniswap(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Quickswap doesn't support ${attribute}`);
    }
    return getQuickswapData(date, sdk);
  };

  register('quickswap', query, {
    name: 'Quickswap',
    category: 'dex',
    description: 'Quickswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://quickswap.exchange',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'quickswap',
    tokenTicker: 'QUICK',
    tokenCoingecko: 'quick',
    protocolLaunch: '2020-11-03',
    tokenLaunch: '2021-02-15',
  });
}
