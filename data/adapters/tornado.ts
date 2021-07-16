import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

export async function getTornadoData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!){
    now: tornado(id: "1", block: {number: $today}) {
      totalFeesUSD
    }
    yesterday: tornado(id: "1", block: {number: $yesterday}) {
      totalFeesUSD
    }
  }`;
  const data = await sdk.graph.query(
    'dmihal/tornado-cash',
    graphQuery,
    {
      today: await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1)),
      yesterday: await sdk.chainData.getBlockNumber(date),
    },
    'fees'
  );

  return parseFloat(data.now.totalFeesUSD) - parseFloat(data.yesterday.totalFeesUSD);
}

export default function registerSushiswap(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const tornadoQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return getTornadoData(date, sdk);
  };

  register('tornado', tornadoQuery, {
    name: 'Tornado Cash',
    category: 'other',
    description: 'Tornado Cash is a privacy tool for trustless asset mixing.',
    feeDescription: 'Relay fees are paid by withdrawers to relayers.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'tornado',
    protocolLaunch: '2019-12-16',
    tokenTicker: 'TORN',
    tokenCoingecko: 'tornado-cash',
    tokenLaunch: '2021-02-09',
  });
}
