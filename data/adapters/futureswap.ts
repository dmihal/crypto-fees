import { FeeData } from '../types';
import { getYesterdayTimestamps, getWeekAgoTimestamps } from '../lib/time';

const CLOSE_TRADE_FEE = 0.001; // fee for close trades is fixed to 0.1%
type OpenTrade = {
  openFee: string;
  timestamp: number;
};
type CloseTrade = {
  assetMarketPrice: string;
  assetRedemptionAmount: string;
  timestamp: number;
};

const getTradeFees = (
  openTrades: OpenTrade[],
  closeTrades: CloseTrade[],
  startTimestamp: number
) => {
  const openTradeFees = openTrades
    .filter((trade) => Number(trade.timestamp) >= startTimestamp)
    .reduce((pre, cur) => pre + Number(cur.openFee) / 1e18, 0);

  const closeTradeFees = closeTrades
    .filter((trade) => Number(trade.timestamp) >= startTimestamp)
    .reduce(
      (pre, cur) =>
        pre +
        (Number(cur.assetMarketPrice) / 1e18) *
          (Number(cur.assetRedemptionAmount) / 1e18) *
          CLOSE_TRADE_FEE,

      0
    );
  return openTradeFees + closeTradeFees;
};

export async function getFutureswapData(): Promise<FeeData> {
  const yesterdayTimestamp = getYesterdayTimestamps();
  const sevenDaysTimestamp = getWeekAgoTimestamps();

  const request = await fetch('https://api.thegraph.com/subgraphs/name/futureswap/futureswap-v2', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `query {
        openedTrades(first: 1000, orderBy: timestamp, orderDirection: desc, where: {
          timestamp_gte: ${sevenDaysTimestamp.beginning}, timestamp_lte: ${sevenDaysTimestamp.end}
        }) {
          timestamp
          openFee
        }
        closedTrades(first: 1000, orderBy: timestamp, orderDirection: desc, where: {
          timestamp_gte: ${sevenDaysTimestamp.beginning}, timestamp_lte: ${sevenDaysTimestamp.end}
        }) {
          timestamp
          assetRedemptionAmount
          assetMarketPrice
          }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const {
    data: { closedTrades, openedTrades },
  } = await request.json();

  const tradeFeesDay = getTradeFees(openedTrades, closedTrades, yesterdayTimestamp.beginning);
  const tradeFeesWeek = getTradeFees(openedTrades, closedTrades, sevenDaysTimestamp.beginning);

  return {
    id: 'futureswap',
    name: 'Futureswap',
    category: 'dex',
    sevenDayMA: tradeFeesWeek / 7,
    oneDay: tradeFeesDay,
  };
}
