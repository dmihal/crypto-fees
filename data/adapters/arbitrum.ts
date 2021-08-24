import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { getHistoricalPrice } from '../lib/pricedata';
import { RegisterFunction } from '../types';
import icon from 'icons/arbitrum.svg';

export async function getArbitrumData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1), 'arbitrum-one');
  const yesterdayBlock = await getBlockNumber(date, 'arbitrum-one');

  const data = await query(
    'dmihal/arbitrum-fees-preindex',
    `query txFees($today: Int!, $yesterday: Int!){
      today: fee(id: "1", block: {number: $today}) {
        totalFeesETH
      }
      yesterday: fee(id: "1", block: {number: $yesterday}) {
        totalFeesETH
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'txFees'
  );

  const ethPrice = await getHistoricalPrice('ethereum', date);
  const feesInETH = parseFloat(data.today.totalFeesETH) - parseFloat(data.yesterday.totalFeesETH);

  return feesInETH * ethPrice;
}

export default function registerOptimism(register: RegisterFunction) {
  function arbitrumQuery(attribute: string, date: string) {
    if (attribute !== 'fee') {
      throw new Error(`Arbitrum doesn't support ${attribute}`);
    }

    return getArbitrumData(date);
  }

  register('arbitrum-one', arbitrumQuery, {
    icon,
    name: 'Arbitrum One',
    category: 'l2',
    description: 'Arbitrum One is an optimistic-rollup scaling solution built on Ethereum.',
    feeDescription: 'Transaction fees are paid to sequencers.',
    blockchain: 'Arbitrum One',
    source: 'The Graph Protocol',
    adapter: 'arbitrum',
    website: 'https://arbitrum.io',
    protocolLaunch: '2021-05-29',
  });
}
