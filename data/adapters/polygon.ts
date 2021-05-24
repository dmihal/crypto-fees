import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { getHistoricalPrice } from '../lib/pricedata';

export async function getPolygonData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1), 'polygon');
  const yesterdayBlock = await getBlockNumber(date, 'polygon');

  const data = await query(
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

  const maticPrice = await getHistoricalPrice('matic-network', date);
  const feesInMatic = parseFloat(data.today.totalFees) - parseFloat(data.yesterday.totalFees);

  return feesInMatic * maticPrice;
}

function polygonQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Polygon doesn't support ${attribute}`);
  }

  return getPolygonData(date);
}

export default function registerPolygon(register: any) {
  register('polygon', polygonQuery, {
    name: 'Polygon',
    category: 'l1',
    description: 'Polymarket is a protocol for Ethereum-compatible blockchain networks.',
    feeDescription: 'Transaction fees are paid by users to validators.',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'polygon',
    website: 'https://polygon.technology',
    tokenTicker: 'MATIC',
    tokenCoingecko: 'matic-network',
    tokenLaunch: '2017-09-09',
  });
}
