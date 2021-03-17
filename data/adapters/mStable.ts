import { FeeData } from './feeData';
import { getBlockDaysAgo } from '../lib/time';

const EIGHTEEN_DECIMALS = 10 ** 18;

export async function getMstableData(): Promise<FeeData> {
  const todayBlock = getBlockDaysAgo(0);
  const yesterdayBlock = getBlockDaysAgo(1);
  const weekAgoBlock = getBlockDaysAgo(7);

  const request = await fetch('https://api.thegraph.com/subgraphs/name/mstable/mstable-protocol', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        now: masset(id: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5", block: {number: ${todayBlock}}) {
          cumulativeFeesPaid {
            exact
          }
        }
        yesterday: masset(id: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5", block: {number: ${yesterdayBlock}}) {
          cumulativeFeesPaid {
            exact
          }
        }
        weekAgo: masset(id: "0xe2f2a5c287993345a840db3b0845fbc70f5935a5", block: {number: ${weekAgoBlock}}) {
          cumulativeFeesPaid {
            exact
          }
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();
  return {
    id: 'mstable',
    name: 'mStable',
    category: 'app',
    sevenDayMA:
      (parseInt(data.now.cumulativeFeesPaid.exact) -
        parseInt(data.weekAgo.cumulativeFeesPaid.exact)) /
      EIGHTEEN_DECIMALS /
      7,
    oneDay:
      (parseInt(data.now.cumulativeFeesPaid.exact) -
        parseInt(data.yesterday.cumulativeFeesPaid.exact)) /
      EIGHTEEN_DECIMALS,
    description: 'mStable is a stablecoin asset manager.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'mStable',
  };
}
