import { FeeData } from './feeData';
import { last7Days } from './time-lib';
import { query } from './graph';

export async function getSushiswapData(): Promise<FeeData> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await query('zippoxer/sushiswap-subgraph-fork', graphQuery, {}, 'fees');

  const sevenDayTotal = data.uniswapDayDatas.reduce(
    (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
    0
  );
  const sevenDayMA = (sevenDayTotal * 0.003) / data.uniswapDayDatas.length;

  const oneDay =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003;

  return {
    id: 'sushiswap',
    name: 'SushiSwap',
    category: 'app',
    sevenDayMA,
    oneDay,
    description: 'SushiSwap is a community-owned permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'sushi',
  };
}
