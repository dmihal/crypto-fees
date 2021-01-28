import { FeeData } from './feeData';
import { getYesterdayTimestamps, getWeekAgoTimestamps } from './time-lib';

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
    if (option.symbol === "ETH") {
      ethFeesYesterday += parseFloat(option.settlementFee);
    } else if (option.symbol === "WBTC") {
      wbtcFeesYesterday += parseFloat(option.settlementFee);
    }
  }

  // get ETH and WBTC fees over the past 7 days
  let ethFeesWeek = 0;
  let wbtcFeesWeek = 0;

  for (const option of data.weekAgo) {
    if (option.symbol === "ETH") {
      ethFeesWeek += parseFloat(option.settlementFee);
    } else if (option.symbol === "WBTC") {
      wbtcFeesWeek += parseFloat(option.settlementFee);
    }
  }

  // get ETH and BTC prices from CoinGecko
  // TODO: try to get historical prices to better match past fees in USD
  const priceCache: { [symbol: string]: number } = { usd: 1 };

  const getPrice = async (name: string): Promise<number> => {
    if (!priceCache[name]) {
      const request = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd`
      );
      const response = await request.json();
      priceCache[name] = response[name].usd;
    }

    return priceCache[name];
  };

  const ethPrice = await getPrice("ethereum");
  const wbtcPrice = await getPrice("wrapped-bitcoin");

  // calculate total fees in USD over the past 24h hours
  const totalFeesYesterday = (ethFeesYesterday * ethPrice) + (wbtcFeesYesterday * wbtcPrice);
  const totalFeesWeek = (ethFeesWeek * ethPrice) + (wbtcFeesWeek * wbtcPrice);

  return {
    id: 'hegic',
    category: 'app',
    sevenDayMA: totalFeesWeek / 7,
    oneDay: totalFeesYesterday,
  };
}
