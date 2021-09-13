import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';
import { RegisterFunction, Category } from '../types';
import icon from 'icons/uniswap.svg';
import iconV1 from 'icons/uniswap-v1.png';

const blacklistAddresses = [
  '0x7d7e813082ef6c143277c71786e5be626ec77b20',
  '0xe5ffe183ae47f1a0e4194618d34c5b05b98953a8',
  '0xf9c1fa7d41bf44ade1dd08d37cc68f67ae75bf92',
  '0x23fe4ee3bd9bfd1152993a7954298bb4d426698f',
  '0x382a9a8927f97f7489af3f0c202b23ed1eb772b5',
];

const uniV3Adapter = (subgraph: string) => async (date: string): Promise<number> => {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      feesUSD
    }
  }`;

  const data = await query(
    subgraph,
    graphQuery,
    {
      date: dateToTimestamp(date),
    },
    'fees'
  );

  if (data.dayDatas.length === 0) {
    throw new Error(`No Uniswap data found on ${date} from ${subgraph}`);
  }

  return parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].feesUSD);
};

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

export default function registerUniswap(register: RegisterFunction) {
  const query = (adapter: (date: string) => Promise<number>) => (
    attribute: string,
    date: string
  ) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return adapter(date);
  };

  const metadata = {
    icon,
    name: 'Uniswap',
    bundle: 'uniswap',
    category: 'dex' as Category,
    description: 'Uniswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://uniswap.org',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'uniswap',
    tokenTicker: 'UNI',
    tokenCoingecko: 'uniswap',
    tokenLaunch: '2020-09-14',
    protocolLaunch: '2020-11-02',
  };

  register('uniswap-v1', query(getUniswapV1Data), {
    ...metadata,
    icon: iconV1,
    subtitle: 'Version 1',
    protocolLaunch: '2020-11-02',
  });

  register('uniswap-v2', query(getUniswapV2Data), {
    ...metadata,
    subtitle: 'Version 2',
    protocolLaunch: '2020-05-04',
  });

  register('uniswap-v3', query(uniV3Adapter('ianlapham/uniswap-v3-prod')), {
    ...metadata,
    subtitle: 'Version 3',
    protocolLaunch: '2021-05-05',
  });

  register('uniswap-optimism', query(uniV3Adapter('ianlapham/uniswap-optimism-dev')), {
    ...metadata,
    subtitle: 'Optimism',
    blockchain: 'Optimism',
    protocolLaunch: '2021-07-09',
  });

  register('uniswap-arbitrum', query(uniV3Adapter('dmihal/uniswap-arbitrum-one')), {
    ...metadata,
    subtitle: 'Arbitrum',
    blockchain: 'Arbitrum One',
    protocolLaunch: '2021-08-31',
  });

  register.bundle('uniswap', metadata);
}
