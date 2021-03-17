import { FeeData } from './feeData';
import { getMaticBlockDaysAgo } from '../lib/time';

export async function getPolymarketData(): Promise<FeeData> {
  const request = await fetch(
    'https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket',
    {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `query lpFeesOverPeriod($today: Int!, $yesterday: Int!, $weekAgo: Int!){
        today: global(id: "", block: {number: $today}){
          scaledCollateralFees
        }
        yesterday: global(id: "", block: {number: $yesterday}){
          scaledCollateralFees
        }
        weekAgo: global(id: "", block: {number: $weekAgo}){
          scaledCollateralFees
        }
      }`,
        variables: {
          today: getMaticBlockDaysAgo(0),
          yesterday: getMaticBlockDaysAgo(1),
          weekAgo: getMaticBlockDaysAgo(7),
        },
        operationName: 'lpFeesOverPeriod',
      }),
      method: 'POST',
    }
  );

  const { data } = await request.json();

  return {
    id: 'polymarket',
    name: 'Polymarket',
    category: 'dex',
    oneDay:
      parseFloat(data.today.scaledCollateralFees) - parseFloat(data.yesterday.scaledCollateralFees),
    sevenDayMA:
      (parseFloat(data.today.scaledCollateralFees) -
        parseFloat(data.weekAgo.scaledCollateralFees)) /
      7,
    description: 'Polymarket is a prediction market.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Matic',
    source: 'The Graph Protocol',
    adapter: 'polymarket',
  };
}
