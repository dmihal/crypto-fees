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
        }
        yesterday: fixedProductMarketMakers(block: {number: $yesterday}){
          feeVolume
          scaledFeeVolume
        }
        weekAgo: fixedProductMarketMakers(block: {number: $weekAgo}){
          feeVolume
          scaledFeeVolume
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
    if (markets[id].yesterday) {
      sevenDayMA += markets[id].today - markets[id].weekAgo;
    }
  }
  return { id: 'polymarket', category: 'app', sevenDayMA, oneDay };
}
