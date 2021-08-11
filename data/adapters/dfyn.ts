import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';
import { RegisterFunction } from '../types';
import icon from 'icons/dfyn.svg';

export async function getDfynData(date: string): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      dailyVolumeUSD
    }
  }`;

  const data = await query(
    'ss-sonic/dfyn-v5',
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

export default function registerUniswap(register: RegisterFunction) {
  const query = async (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Dfyn doesn't support ${attribute}`);
    }
    return getDfynData(date);
  };

  register('dfyn', query, {
    icon,
    name: 'Dfyn',
    category: 'dex',
    description: 'A multi-chain AMM decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://dfyn.network',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'dfyn',
    tokenTicker: 'DFYN',
    tokenCoingecko: 'dfyn-network',
    protocolLaunch: '2020-10-07',
    tokenLaunch: '2021-05-10',
  });
}
