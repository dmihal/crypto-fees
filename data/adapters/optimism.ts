import { Context } from '@cryptostats/sdk';
import icon from 'icons/optimism.svg';

export async function getOptimismData(date: string, sdk: Context): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(
    sdk.date.offsetDaysFormatted(date, 1),
    'optimism'
  );
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date, 'optimism');

  const data = await sdk.graph.query(
    'dmihal/optimism-fees',
    `query txFees($today: Int!, $yesterday: Int!){
      today: fee(id: "1", block: {number: $today}) {
        totalFees
      }
      yesterday: fee(id: "1", block: {number: $yesterday}) {
        totalFees
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'txFees'
  );

  const ethPrice = await sdk.coinGecko.getHistoricalPrice('ethereum', date);
  const feesInETH = parseFloat(data.today.totalFees) - parseFloat(data.yesterday.totalFees);

  return feesInETH * ethPrice;
}

export default function registerOptimism(sdk: Context) {
  sdk.register({
    id: 'optimism',
    queries: {
      fees: (date: string) => getOptimismData(date, sdk),
    },
    metadata: {
      icon,
      name: 'Optimism',
      category: 'l2',
      description: 'Optimism is an optimistic-rollup scaling solution built on Ethereum.',
      feeDescription: 'Transaction fees are paid to sequencers.',
      blockchain: 'Optimism',
      source: 'The Graph Protocol',
      adapter: 'optimism',
      website: 'https://optimism.io',
      protocolLaunch: '2021-06-24',
    },
  });
}
