import { Context } from '@cryptostats/sdk';

export async function getRenData(date: string, sdk: Context): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1));
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date);

  const data = await sdk.graph.query(
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

export default function registerRen(sdk: Context) {
  sdk.register({
    id: 'ren',
    queries: {
      fees: (date: string) => getRenData(date, sdk),
    },
    metadata: {
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
      protocolLaunch: '2020-05-27',
    },
  });
}
