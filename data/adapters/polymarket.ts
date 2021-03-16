import { FeeData } from './feeData';
import { getBlockDaysAgo, CHAIN } from '../lib/time';

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
          today: getBlockDaysAgo(0, CHAIN.MATIC),
          yesterday: getBlockDaysAgo(1, CHAIN.MATIC),
          weekAgo: getBlockDaysAgo(7, CHAIN.MATIC),
        },
        operationName: 'lpFeesOverPeriod',
      }),
      method: 'POST',
    }
  );

  const { data } = await request.json();

  return {
    id: 'polymarket',
    category: 'app',
    oneDay:
      parseFloat(data.today.scaledCollateralFees) - parseFloat(data.yesterday.scaledCollateralFees),
    sevenDayMA:
      (parseFloat(data.today.scaledCollateralFees) -
        parseFloat(data.weekAgo.scaledCollateralFees)) /
      7,
  };
}
