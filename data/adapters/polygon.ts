import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

export async function getPolygonData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(
    sdk.date.offsetDaysFormatted(date, 1),
    'polygon'
  );
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date, 'polygon');

  const data = await sdk.graph.query(
    'dmihal/polygon-fees',
    `query txFees($today: Int!, $yesterday: Int!){
      today: fee(id: "1", block: {number: $today}) {
        totalFees
      }
      yesterday: fee(id: "1", block: {number: $yesterday}) {
        totalFees
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'txFees'
  );

  const maticPrice = await sdk.coinGecko.getHistoricalPrice('matic-network', date);
  const feesInMatic = parseFloat(data.today.totalFees) - parseFloat(data.yesterday.totalFees);

  return feesInMatic * maticPrice;
}

export default function registerPolygon(register: RegisterFunction, sdk: CryptoStatsSDK) {
  function polygonQuery(attribute: string, date: string) {
    if (attribute !== 'fee') {
      throw new Error(`Polygon doesn't support ${attribute}`);
    }

    return getPolygonData(date, sdk);
  }

  register('polygon', polygonQuery, {
    name: 'Polygon',
    category: 'l1',
    description: 'Polygon is a protocol for Ethereum-compatible blockchain networks.',
    feeDescription: 'Transaction fees are paid by users to validators.',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'polygon',
    website: 'https://polygon.technology',
    tokenTicker: 'MATIC',
    tokenCoingecko: 'matic-network',
    protocolLaunch: '2020-05-30',
    tokenLaunch: '2017-09-09',
  });
}
