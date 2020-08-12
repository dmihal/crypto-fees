import { FeeData } from './feeData';

export async function getBalancerData(): Promise<FeeData> {
  const _1daysAgo = Math.floor(Date.now() / 1000);
  const _2daysAgo = Math.floor(Date.now() / 1000) - 86400;

  const request = await fetch("https://api.thegraph.com/subgraphs/name/balancer-labs/balancer", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        pools (first: 1000, skip: 0, where:{ publicSwap: true },orderBy: liquidity, orderDirection: desc) {
          id
          swapFee
          oneDay: swaps (first: 1,orderBy: timestamp, orderDirection: desc, where: {timestamp_lt: ${_1daysAgo}}) {
            poolTotalSwapVolume
          }
          twoDays: swaps (first: 1,orderBy: timestamp, orderDirection: desc, where: {timestamp_lt: ${_2daysAgo}}) {
            poolTotalSwapVolume
          }
        }
      }`,
      variables: null
    }),
    "method": "POST",
  });
  const { data } = await request.json();

  const oneDay = data.pools
    .filter((pool: any) => pool.twoDays.length > 0 && pool.oneDay.length)
    .map((pool: any) => ({
      previousVolume: parseFloat(pool.twoDays[0].poolTotalSwapVolume),
      currentVolume: parseFloat(pool.oneDay[0].poolTotalSwapVolume),
      fee: parseFloat(pool.swapFee),
    }))
    .map((pool: any) => (pool.currentVolume - pool.previousVolume) * pool.fee)
    .reduce((a: number, b: number) => a + b, 0);

  // const sevenDayMA = data.uniswapDayDatas.reduce((total: number, { dailyVolumeInUSD }: any) => total + parseFloat(dailyVolumeInUSD), 0) * 0.003 / data.uniswapDayDatas.length;

  return {
    id: 'balancer',
    category: 'app',
    sevenDayMA: 0,
    oneDay,
  };
}
