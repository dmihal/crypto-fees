import { query } from '../lib/graph';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';

export async function getRenData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1));
  const yesterdayBlock = await getBlockNumber(date);

  const data = await query(
    'renproject/renvm',
    `
    query feesOverPeriod($today: Int!, $yesterday: Int!){
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
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'feesOverPeriod'
  );

  const assets: {
    [id: string]: { today?: number; yesterday?: number };
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

  let oneDay = 0;

  for (const id in assets) {
    if (assets[id].yesterday) {
      oneDay += assets[id].today - assets[id].yesterday;
    }
  }

  return oneDay;
}

export default function registerRen(register: any) {
  const renQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getRenData(date);
  };

  register('ren', renQuery, {
    name: 'Ren Protocol',
    category: 'xchain',
    description: 'Ren Protocol is a protocol for cross-chain asset transfers.',
    feeDescription: 'Transfer fees are paid by users to node operators (Darknodes).',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'ren',
    website: 'https://renproject.io',
    tokenTicker: 'REN',
    tokenCoingecko: 'republic-protocol',
  });
}
