import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';

export async function getHoneyswapData(date: string): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await query(
    '1hive/honeyswap-v2',
    graphQuery,
    {
      date: dateToTimestamp(date),
    },
    'fees'
  );

  const oneDayVolume = parseFloat(
    data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD
  );
  const oneDay = oneDayVolume * 0.003;

  return oneDay;
}

export default function registerHoneyswap(register: any) {
  const query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Quickswap doesn't support ${attribute}`);
    }
    return getHoneyswapData(date);
  };

  register('honeyswap', query, {
    name: 'HoneySwap',
    category: 'dex',
    description: 'HoneySwap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://honeyswap.org',
    blockchain: 'xDai',
    source: 'The Graph Protocol',
    adapter: 'honeyswap',
    protocolLaunch: '2020-09-03',
  });
}
