import { Context } from '@cryptostats/sdk';

const blacklistAddresses = [
  '0x7d7e813082ef6c143277c71786e5be626ec77b20',
  '0xe5ffe183ae47f1a0e4194618d34c5b05b98953a8',
  '0xf9c1fa7d41bf44ade1dd08d37cc68f67ae75bf92',
  '0x23fe4ee3bd9bfd1152993a7954298bb4d426698f',
  '0x382a9a8927f97f7489af3f0c202b23ed1eb772b5',
];

const uniV3Adapter = (subgraph: string, sdk: Context) => async (date: string): Promise<number> => {
  const graphQuery = `query fees($date: Int!) {
    uniswapDayDatas(where: {date: $date}) {
      feesUSD
    }
  }`;

  const data = await sdk.graph.query(
    subgraph,
    graphQuery,
    {
      date: sdk.date.dateToTimestamp(date),
    },
    'fees'
  );

  // Temporary, for while Optimism doesn't have 7 days of data
  if (data.uniswapDayDatas.length == 0) {
    return 0;
  }

  return parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].feesUSD);
};

const getUniswapV2Adapter = (sdk: Context) => async (date: string): Promise<number> => {
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

  const data = await sdk.graph.query(
    'uniswap/uniswap-v2',
    graphQuery,
    {
      date: sdk.date.dateToTimestamp(date),
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
};

const getUniswapV1Adapter = (sdk: Context) => async (date: string): Promise<number> => {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date: ${sdk.date.dateToTimestamp(date)}}) {
      date
      dailyVolumeInUSD
    }
  }`;

  const data = await sdk.graph.query('graphprotocol/uniswap', graphQuery, {}, 'fees');

  const oneDay =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeInUSD) * 0.003;

  return oneDay;
};

export default function registerUniswap(sdk: Context) {
  const uniswapIconLoader = sdk.ipfs.getDataURILoader(
    'QmPXoiG66a9gCDX1NX51crWV7UAijoFd5wycHrfRKM6Y1n',
    'image/svg+xml'
  );
  const uniswapV1IconLoader = sdk.ipfs.getDataURILoader(
    'QmQZhDfjDjT1Tv9xfaWYcRkywD4GCavkhge7Yi4A74rJ4b',
    'image/png'
  );

  sdk.register({
    id: 'uniswap-v1',
    queries: {
      fees: getUniswapV1Adapter(sdk),
    },
    metadata: {
      icon: uniswapV1IconLoader,
      name: 'Uniswap V1',
      category: 'dex',
      description: 'Uniswap is a permissionless, decentralized exchange',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      website: 'https://uniswap.com',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'uniswap',
      protocolLaunch: '2020-11-02',
    },
  });

  sdk.register({
    id: 'uniswap-v2',
    queries: {
      fees: getUniswapV2Adapter(sdk),
    },
    metadata: {
      icon: uniswapIconLoader,
      name: 'Uniswap V2',
      category: 'dex',
      description: 'Uniswap is a permissionless, decentralized exchange',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      website: 'https://uniswap.org',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'uniswap',
      tokenTicker: 'UNI',
      tokenCoingecko: 'uniswap',
      protocolLaunch: '2020-05-04',
      tokenLaunch: '2020-09-14',
    },
  });

  sdk.register({
    id: 'uniswap-v3',
    queries: {
      fees: uniV3Adapter('ianlapham/uniswap-v3-prod', sdk),
    },
    metadata: {
      icon: uniswapIconLoader,
      name: 'Uniswap V3',
      category: 'dex',
      description: 'Uniswap is a permissionless, decentralized exchange',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      website: 'https://uniswap.org',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'uniswap',
      tokenTicker: 'UNI',
      tokenCoingecko: 'uniswap',
      protocolLaunch: '2021-05-05',
      tokenLaunch: '2020-09-14',
    },
  });

  sdk.register({
    id: 'uniswap-optimism',
    queries: {
      fees: uniV3Adapter('ianlapham/uniswap-optimism', sdk),
    },
    metadata: {
      icon: uniswapIconLoader,
      name: 'Uniswap V3 (Optimism)',
      category: 'dex',
      description: 'Uniswap is a permissionless, decentralized exchange',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      website: 'https://uniswap.org',
      blockchain: 'Optimism',
      source: 'The Graph Protocol',
      adapter: 'uniswap',
      tokenTicker: 'UNI',
      tokenCoingecko: 'uniswap',
      protocolLaunch: '2021-07-09',
      tokenLaunch: '2020-09-14',
    },
  });
}
