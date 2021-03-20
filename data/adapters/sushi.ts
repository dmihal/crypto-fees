import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';

export async function getSushiswapData(date: string): Promise<number> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date: ${dateToTimestamp(date)}}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await query('zippoxer/sushiswap-subgraph-fork', graphQuery, {}, 'fees');

  const oneDay = parseFloat(data.uniswapDayDatas[0].dailyVolumeUSD) * 0.003;

  return oneDay;
}

export default function registerSushiswap(register: any) {
  const sushiQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getSushiswapData(date);
  };

  register('sushiswap', sushiQuery, {
    name: 'SushiSwap',
    category: 'dex',
    description: 'SushiSwap is a community-owned permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'sushi',
    tokenTicker: 'SUSHI',
    tokenCoingecko: 'sushi',
  });
}
