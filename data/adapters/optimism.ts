import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { getHistoricalPrice } from '../lib/pricedata';
import { RegisterFunction } from '../types';
import icon from 'icons/optimism.svg';

export async function getOptimismData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1), 'optimism');
  const yesterdayBlock = await getBlockNumber(date, 'optimism');

  const data = await query(
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

  const ethPrice = await getHistoricalPrice('ethereum', date);
  const feesInETH = parseFloat(data.today.totalFees) - parseFloat(data.yesterday.totalFees);

  return feesInETH * ethPrice;
}

function optimismQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Polygon doesn't support ${attribute}`);
  }

  return getOptimismData(date);
}

export default function registerOptimism(register: RegisterFunction) {
  register('optimism', optimismQuery, {
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
  });
}
