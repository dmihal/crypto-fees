import { FeeData } from './feeData';
import { getBlockDaysAgo } from '../lib/time';

export async function getBalancerData(): Promise<FeeData> {
  const todayBlock = getBlockDaysAgo(0);
  const yesterdayBlock = getBlockDaysAgo(1);
  const weekAgoBlock = getBlockDaysAgo(7);

  const request = await fetch('https://api.thegraph.com/subgraphs/name/bonustrack/balancer', {
    headers: {
      'content-type': 'application/json',
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
    method: 'POST',
  });

  const { data } = await request.json();

  return {
    id: 'balancer',
    name: 'Balancer',
    category: 'app',
    sevenDayMA: (parseFloat(data.now.totalSwapFee) - parseFloat(data.weekAgo.totalSwapFee)) / 7,
    oneDay: parseFloat(data.now.totalSwapFee) - parseFloat(data.yesterday.totalSwapFee),
    description: 'Balancer is a decentralized exchange & asset pool balancer.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'balancer',
  };
}
