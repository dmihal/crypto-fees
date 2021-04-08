import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';

const blacklistAddresses = [
  '0x7d7e813082ef6c143277c71786e5be626ec77b20',
  '0xe5ffe183ae47f1a0e4194618d34c5b05b98953a8',
  '0xf9c1fa7d41bf44ade1dd08d37cc68f67ae75bf92',
  '0x23fe4ee3bd9bfd1152993a7954298bb4d426698f',
  '0x382a9a8927f97f7489af3f0c202b23ed1eb772b5',
];

export async function getUniswapV2Data(date: string): Promise<number> {
  const graphQuery = `query fees($date: Int!, $blacklistAddresses: [Bytes!]!) {
    uniswapDayDatas(where: {date: $date}) {
      date
      dailyVolumeUSD
    }
    blacklist: pairDayDatas(where: { pairAddress_in: $blacklistAddresses, date: $date }) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await query(
    'uniswap/uniswap-v2',
    graphQuery,
    {
      date: dateToTimestamp(date),
      blacklistAddresses,
    },
    'fees'
  );

  const blacklistVolume = data.blacklist.reduce(
    (total: number, day: any) => total + parseFloat(day.dailyVolumeUSD),
    0
  );

  const oneDayVolume =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) -
    blacklistVolume;

  const oneDay = oneDayVolume * 0.003;

  return oneDay;
}

export async function getUniswapV1Data(date: string): Promise<number> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date: ${dateToTimestamp(date)}}) {
      date
      dailyVolumeInUSD
    }
  }`;

  const data = await query('graphprotocol/uniswap', graphQuery, {}, 'fees');

  const oneDay =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeInUSD) * 0.003;

  return oneDay;
}

export default function registerUniswap(register: any) {
  const v1Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getUniswapV1Data(date);
  };
  const v2Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getUniswapV2Data(date);
  };

  register('uniswap-v1', v1Query, {
    name: 'Uniswap V1',
    category: 'dex',
    description: 'Uniswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://uniswap.com',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'uniswap',
  });

  register('uniswap-v2', v2Query, {
    name: 'Uniswap V2',
    category: 'dex',
    description: 'Uniswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://uniswap.com',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'uniswap',
    tokenTicker: 'UNI',
    tokenCoingecko: 'uniswap',
  });
}
