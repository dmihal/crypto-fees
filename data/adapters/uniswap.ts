import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';

export async function getUniswapV2Data(date: string): Promise<number> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date: ${dateToTimestamp(date)}}) {
      date
      dailyVolumeUSD
    }
  }`;

  const data = await query('uniswap/uniswap-v2', graphQuery, {}, 'fees');

  const oneDay =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003;

  return oneDay;
}

export async function getUniswapV1Data(date: string): Promise<number> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date: ${dateToTimestamp(date)}}) {
      date
      dailyVolumeInUSD
    }
  }`;

  const data = await query('graphprotocol/uniswap', graphQuery, {}, 'fees');

  const oneDay =
    parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeInUSD) * 0.003;

  return oneDay;
}

export default function registerUniswap(register: any) {
  const v1Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getUniswapV1Data(date);
  };
  const v2Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getUniswapV2Data(date);
  };

  register('uniswap-v1', v1Query, {
    name: 'Uniswap V1',
    category: 'app',
    description: 'Uniswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://uniswap.com',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'uniswap',
  });

  register('uniswap-v2', v2Query, {
    name: 'Uniswap V2',
    category: 'app',
    description: 'Uniswap is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    website: 'https://uniswap.com',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'uniswap',
  });
}
