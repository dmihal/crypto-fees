import { FeeData } from './feeData';
import { getBlockDaysAgo } from './time-lib';

const EIGHTEEN_DECIMALS = 10 ** 18;

export async function getSynthetixData(): Promise<FeeData> {
  const todayBlock = getBlockDaysAgo(0);
  const yesterdayBlock = getBlockDaysAgo(1);
  const weekAgoBlock = getBlockDaysAgo(7);

  const request = await fetch(
    'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanges',
    {
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
        now: total(id: "mainnet", block: {number: ${todayBlock}}) {
          totalFeesGeneratedInUSD
        }
        yesterday: total(id: "mainnet", block: {number: ${yesterdayBlock}}) {
          totalFeesGeneratedInUSD
        }
        weekAgo: total(id: "mainnet", block: {number: ${weekAgoBlock}}) {
          totalFeesGeneratedInUSD
        }
      }`,
        variables: null,
      }),
      method: 'POST',
    }
  );

  const { data } = await request.json();

  return {
    id: 'synthetix',
    name: 'Synthetix',
    category: 'app',
    sevenDayMA:
      (parseInt(data.now.totalFeesGeneratedInUSD) -
        parseInt(data.weekAgo.totalFeesGeneratedInUSD)) /
      EIGHTEEN_DECIMALS /
      7,
    oneDay:
      (parseInt(data.now.totalFeesGeneratedInUSD) -
        parseInt(data.yesterday.totalFeesGeneratedInUSD)) /
      EIGHTEEN_DECIMALS,
    description: 'The Synthetix Exchange is a decentralized exchange for trading synthetic assets',
    feeDescription: 'Trading fees are paid by users to SNX stakers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'synthetix',
  };
}
