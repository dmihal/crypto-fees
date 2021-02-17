import { FeeData } from './feeData';
import { getBlockDaysAgo } from './time-lib';
import { query } from './graph';
import { getHistoricalAvgDailyPrice } from './pricedata';

export async function getTBTCData(): Promise<FeeData> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!, $weekAgo: Int!){
    now: statsRecord(id: "current", block: {number: $today}) {
      tbtcFees
      randomBeaconFees
    }
    yesterday: statsRecord(id: "current", block: {number: $yesterday}) {
      tbtcFees
      randomBeaconFees
    }
    weekAgo: statsRecord(id: "current", block: {number: $weekAgo}) {
      tbtcFees
      randomBeaconFees
    }
  }`;
  const data = await query(
    'miracle2k/all-the-keeps',
    graphQuery,
    {
      today: getBlockDaysAgo(0),
      yesterday: getBlockDaysAgo(1),
      weekAgo: getBlockDaysAgo(7),
    },
    'fees'
  );

  const ethPriceYesterday = await getHistoricalAvgDailyPrice('ethereum', 1);
  const wbtcPriceYesterday = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 1);

  const ethPriceLastWeek = await getHistoricalAvgDailyPrice('ethereum', 7);
  const wbtcPriceLastWeek = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 7);

  const oneDayTBTCFees = (parseInt(data.now.tbtcFees) - parseInt(data.yesterday.tbtcFees)) / 1e18;
  const oneDayTBTCFeesInUSD = oneDayTBTCFees * wbtcPriceYesterday;

  const oneDayBeaconFees =
    (parseInt(data.now.randomBeaconFees) - parseInt(data.yesterday.randomBeaconFees)) / 1e18;
  const oneDayBeaconFeesInUSD = oneDayBeaconFees * ethPriceYesterday;

  const oneWeekTBTCFees = (parseInt(data.now.tbtcFees) - parseInt(data.weekAgo.tbtcFees)) / 1e18;
  const oneWeekTBTCFeesInUSD = (oneWeekTBTCFees * wbtcPriceLastWeek) / 7;

  const oneWeekBeaconFees =
    (parseInt(data.now.randomBeaconFees) - parseInt(data.weekAgo.randomBeaconFees)) / 1e18;
  const oneWeekBeaconFeesInUSD = (oneWeekBeaconFees * ethPriceLastWeek) / 7;

  return {
    id: 'tbtc',
    name: 'tBTC',
    category: 'app',
    sevenDayMA: oneWeekTBTCFeesInUSD + oneWeekBeaconFeesInUSD,
    oneDay: oneDayTBTCFeesInUSD + oneDayBeaconFeesInUSD,
  };
}
