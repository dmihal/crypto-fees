import { FeeData} from './feeData';
import { getBlockDaysAgo, CHAIN } from './time-lib';

export async function getPolymarketData(): Promise<FeeData> {
  const request = await fetch('https://subgraph-matic.poly.market/subgraphs/name/TokenUnion/polymarket', {
    headers: {
      "content-type": "application/json",
    },
    "body": JSON.stringify({
      query: `query lpFeesOverPeriod($today: Int!, $yesterday: Int!, $weekAgo: Int!){
        today: fixedProductMarketMakers(block: {number: $today}){
          feeVolume
          scaledFeeVolume
          id
        }
        yesterday: fixedProductMarketMakers(block: {number: $yesterday}){
          feeVolume
          scaledFeeVolume
          id
        }
        weekAgo: fixedProductMarketMakers(block: {number: $weekAgo}){
          feeVolume
          scaledFeeVolume
          id
        }
      }`,
      variables: {
        today: getBlockDaysAgo(0, CHAIN.MATIC),
        yesterday: getBlockDaysAgo(1, CHAIN.MATIC),
        weekAgo: getBlockDaysAgo(7, CHAIN.MATIC),
      },
      operationName: "lpFeesOverPeriod"
    }),
    method: "POST",
  });

  const { data } = await request.json();

  const markets: { [id: string]: { today?: number; yesterday?: number; weekAgo?: number } } = {};
  for (const market of data.today) {
    markets[market.id] = { today: parseFloat(market.scaledFeeVolume) };
  }
  for (const market of data.yesterday) {
    markets[market.id] = { ...markets[market.id], yesterday: parseFloat(market.scaledFeeVolume) };
  }
  for (const market of data.weekAgo) {
    markets[market.id] = { ...markets[market.id], weekAgo: parseFloat(market.scaledFeeVolume) };
  }

  let oneDay = 0;
  let sevenDayMA = 0;

  for (const id in markets) {
    if (markets[id].yesterday) {
      oneDay += markets[id].today - markets[id].yesterday;
    }
    if (markets[id].weekAgo) {
      sevenDayMA += markets[id].today - markets[id].weekAgo;
    }
  }
  sevenDayMA /= 7;

  return { id: 'polymarket', category: 'app', sevenDayMA, oneDay };
}
