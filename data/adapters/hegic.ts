import { FeeData } from './feeData';
import { getYesterdayTimestamps, getWeekAgoTimestamps } from '../lib/time';
import { getHistoricalAvgDailyPrice } from '../lib/pricedata';

export async function getHegicData(): Promise<FeeData> {
  const yesterdayTimestamp = getYesterdayTimestamps();
  const sevenDaysTimestamp = getWeekAgoTimestamps();

  const request = await fetch('https://api.thegraph.com/subgraphs/name/ppunky/hegic-v888', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        yesterday: 
          options(
            first: 1000, 
            where: {
              timestamp_gte: ${yesterdayTimestamp.beginning},
              timestamp_lte: ${yesterdayTimestamp.end}
            }
          ) 
          {
            settlementFee
            symbol
          }
        weekAgo: 
          options(
            first: 1000, 
            where: {
              timestamp_gte: ${sevenDaysTimestamp.beginning},
              timestamp_lte: ${sevenDaysTimestamp.end}
            }
          ) {
            settlementFee
            symbol
          }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  // get ETH and WBTC fees over the past 24h hours
  let ethFeesYesterday = 0;
  let wbtcFeesYesterday = 0;

  for (const option of data.yesterday) {
    if (option.symbol === 'ETH') {
      ethFeesYesterday += parseFloat(option.settlementFee);
    } else if (option.symbol === 'WBTC') {
      wbtcFeesYesterday += parseFloat(option.settlementFee);
    }
  }

  // get ETH and WBTC fees over the past 7 days
  let ethFeesWeek = 0;
  let wbtcFeesWeek = 0;

  for (const option of data.weekAgo) {
    if (option.symbol === 'ETH') {
      ethFeesWeek += parseFloat(option.settlementFee);
    } else if (option.symbol === 'WBTC') {
      wbtcFeesWeek += parseFloat(option.settlementFee);
    }
  }

  const ethPriceYesterday = await getHistoricalAvgDailyPrice('ethereum', 1);
  const wbtcPriceYesterday = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 1);

  const ethPriceLastWeek = await getHistoricalAvgDailyPrice('ethereum', 7);
  const wbtcPriceLastWeek = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 7);

  // calculate total fees in USD over the past 24h hours
  const totalFeesYesterday =
    ethFeesYesterday * ethPriceYesterday + wbtcFeesYesterday * wbtcPriceYesterday;
  const totalFeesWeek = ethFeesWeek * ethPriceLastWeek + wbtcFeesWeek * wbtcPriceLastWeek;

  return {
    id: 'hegic',
    category: 'app',
    sevenDayMA: totalFeesWeek / 7,
    oneDay: totalFeesYesterday,
  };
}
