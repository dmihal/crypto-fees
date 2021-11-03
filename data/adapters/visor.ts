import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';
import { RegisterFunction } from '../types';
import icon from 'icons/visor.svg';

export async function getVisorData(date: string): Promise<number> {
  const graphQuery = `query fees($date: Int!){
    uniswapV3HypervisorDayDatas(where: { date: $date }){
      protocolFeesCollectedUSD
    }
  }`;

  const data = await query(
    'visorfinance/visor',
    graphQuery,
    {
      date: dateToTimestamp(date),
    },
    'fees'
  );

  return data.uniswapV3HypervisorDayDatas.reduce((sum, item) => {
    sum += Math.round(parseFloat(item.protocolFeesCollectedUSD));
    return sum;
  }, 0);
}

export default function registerVisor(register: RegisterFunction) {
  const query = async (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Visor doesn't support ${attribute}`);
    }
    return getVisorData(date);
  };

  register('visor', query, {
    icon,
    name: 'Visor Finance',
    category: 'other',
    description:
      'Visor is DeFi protocol for Active Liquidity Management. Building on 🦄 Uniswap v3.',
    feeDescription: '10% of all fees earned from liquidity positions are paid to VISR stakers.',
    website: 'https://www.visor.finance',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'visor',
    tokenTicker: 'VISR',
    tokenCoingecko: 'visor',
    protocolLaunch: '2020-03-15',
    tokenLaunch: '2021-03-15',
  });
}
