import { FeeData } from './feeData';

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

const AUG_17_FIRST_BLOCK = 10674231;
const AUG_17_DAY = 230;
const BLOCKS_PER_DAY = 6348;

export async function getBalancerData(): Promise<FeeData> {
  const todayBlock = AUG_17_FIRST_BLOCK + ((dayOfYear() - AUG_17_DAY) * BLOCKS_PER_DAY);
  const yesterdayBlock = todayBlock - BLOCKS_PER_DAY;
  const weekAgoBlock = todayBlock - (BLOCKS_PER_DAY * 7);

  const request = await fetch("https://api.thegraph.com/subgraphs/name/bonustrack/balancer", {
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        now: balancer(id: "1", block: {number: ${todayBlock}}) {
          totalSwapFee
        }
        yesterday: balancer(id: "1", block: {number: ${yesterdayBlock}}) {
          totalSwapFee
        }
        weekAgo: balancer(id: "1", block: {number: ${weekAgoBlock}}) {
          totalSwapFee
        }
      }`,
      variables: null,
    }),
    method: "POST",
  });

  const { data } = await request.json();

  return {
    id: 'balancer',
    category: 'app',
    sevenDayMA: (parseFloat(data.now.totalSwapFee) - parseFloat(data.weekAgo.totalSwapFee)) / 7,
    oneDay: parseFloat(data.now.totalSwapFee) - parseFloat(data.yesterday.totalSwapFee),
  };
}
