import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';

export async function getPolymarketData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1), 'polygon');
  const yesterdayBlock = await getBlockNumber(date, 'polygon');

  const data = await query(
    'polymarket/matic-markets-4',
    `query lpFeesOverPeriod($today: Int!, $yesterday: Int!){
      today: global(id: "", block: {number: $today}){
        scaledCollateralFees
      }
      yesterday: global(id: "", block: {number: $yesterday}){
        scaledCollateralFees
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'lpFeesOverPeriod'
  );

  return (
    parseFloat(data.today.scaledCollateralFees) - parseFloat(data.yesterday.scaledCollateralFees)
  );
}

function polymarketQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`mStable doesn't support ${attribute}`);
  }

  return getPolymarketData(date);
}

export default function registerPolymarket(register: any) {
  register('polymarket', polymarketQuery, {
    name: 'Polymarket',
    category: 'dex',
    description: 'Polymarket is a prediction market.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'polymarket',
    website: 'https://polymarket.com',
    protocolLaunch: '2020-09-05', // I couldn't find an exact date
  });
}
