import { FeeData } from './feeData';
import { getBlockDaysAgo } from '../lib/time';

export async function getRenData(): Promise<FeeData> {
  const request = await fetch('https://api.thegraph.com/subgraphs/name/renproject/renvm', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `query feesOverPeriod($today: Int!, $yesterday: Int!, $weekAgo: Int!){
        today: renVM(id:1, block: {number: $today}) {
          fees {
            symbol
            amount
            amountInEth
            amountInUsd
          }
        }
        yesterday: renVM(id:1, block: {number: $yesterday}){
          fees {
            symbol
            amount
            amountInEth
            amountInUsd
          }
        }
        weekAgo: renVM(id:1, block: { number: $weekAgo }) {
          fees {
            symbol
            amount
            amountInEth
            amountInUsd
          }
        }
      }`,
      variables: {
        today: getBlockDaysAgo(0),
        yesterday: getBlockDaysAgo(1),
        weekAgo: getBlockDaysAgo(7),
      },
      operationName: 'feesOverPeriod',
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  const assets: {
    [id: string]: { today?: number; yesterday?: number; weekAgo?: number };
  } = {};
  for (const asset of data.today.fees) {
    assets[asset.symbol] = { today: parseFloat(asset.amountInUsd) };
  }
  for (const asset of data.yesterday.fees) {
    assets[asset.symbol] = {
      ...assets[asset.symbol],
      yesterday: parseFloat(asset.amountInUsd),
    };
  }
  for (const asset of data.weekAgo.fees) {
    assets[asset.symbol] = {
      ...assets[asset.symbol],
      weekAgo: parseFloat(asset.amountInUsd),
    };
  }

  let oneDay = 0;
  let sevenDayMA = 0;

  for (const id in assets) {
    if (assets[id].yesterday) {
      oneDay += assets[id].today - assets[id].yesterday;
    }
    if (assets[id].weekAgo) {
      sevenDayMA += assets[id].today - assets[id].weekAgo;
    }
  }
  sevenDayMA /= 7;

  return {
    id: 'ren',
    name: 'Ren Protocol',
    category: 'app',
    sevenDayMA,
    oneDay,
    description: 'Ren Protocol is a protocol for cross-chain asset transfers.',
    feeDescription: 'Transfer fees are paid by users to node operators (Darknodes).',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'ren',
  };
}
