import { Context } from '@cryptostats/sdk';
import { Category } from '../types';
import icon from 'icons/sushi.svg';

async function getSushiswapData(subgraph: string, date: string, sdk: Context): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    dayDatas(where: { date: $date }) {
      volumeUSD
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

  if (data.dayDatas.length === 0) {
    throw new Error(`No Sushi data found on ${date} form ${subgraph}`);
  }

  const oneDay = parseFloat(data.dayDatas[0].volumeUSD) * 0.003;

  return oneDay;
}

export default function registerSushiswap(sdk: Context) {
  const metadata = {
    category: 'dex' as Category,
    description: 'SushiSwap is a community-owned permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers and SUSHI stakers',
    source: 'The Graph Protocol',
    adapter: 'sushi',
    tokenTicker: 'SUSHI',
    tokenCoingecko: 'sushi',
    website: 'https://sushi.com',
    icon,
  };

  sdk.register({
    id: 'sushiswap',
    queries: {
      fees: (date: string) => getSushiswapData('sushiswap/exchange', date, sdk),
    },
    metadata: {
      ...metadata,
      name: 'SushiSwap',
      blockchain: 'Ethereum',
      protocolLaunch: '2020-09-09',
    },
  });

  sdk.register({
    id: 'sushiswap-polygon',
    queries: {
      fees: (date: string) => getSushiswapData('sushiswap/matic-exchange', date, sdk),
    },
    metadata: {
      ...metadata,
      name: 'SushiSwap (Polygon)',
      blockchain: 'Polygon',
      protocolLaunch: '2021-02-26',
    },
  });

  sdk.register({
    id: 'sushiswap-fantom',
    queries: {
      fees: (date: string) => getSushiswapData('sushiswap/fantom-exchange', date, sdk),
    },
    metadata: {
      ...metadata,
      name: 'SushiSwap (Fantom)',
      blockchain: 'Fantom',
      protocolLaunch: '2021-02-26',
    },
  });
}
