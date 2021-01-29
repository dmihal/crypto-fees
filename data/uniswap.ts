import { FeeData } from './feeData';
import { last7Days } from './time-lib';
import { query } from './graph';

export async function getUniswapV2Data(): Promise<FeeData> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
      date
      dailyVolumeUSD
    }
  }`

  const data = await query('uniswap/uniswap-v2', graphQuery, {}, 'fees');

  const sevenDayTotal = data.uniswapDayDatas.reduce(
    (total: number, { dailyVolumeUSD }: any) => total + parseFloat(dailyVolumeUSD),
    0
  );
  const sevenDayMA = (sevenDayTotal * 0.003) / data.uniswapDayDatas.length;

  const oneDay = parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeUSD) * 0.003

  return {
    id: 'uniswap-v2',
    name: 'Uniswap V2',
    category: 'app',
    sevenDayMA,
    oneDay,
  };
}

export async function getUniswapV1Data(): Promise<FeeData> {
  const graphQuery = `query fees {
    uniswapDayDatas(where:{date_in: ${JSON.stringify(last7Days())}}) {
      date
      dailyVolumeInUSD
    }
  }`

  const data = await query('graphprotocol/uniswap', graphQuery, {}, 'fees');

  const sevenDayTotal = data.uniswapDayDatas.reduce(
    (total: number, { dailyVolumeInUSD }: any) => total + parseFloat(dailyVolumeInUSD),
    0
  );
  const sevenDayMA = (sevenDayTotal * 0.003) / data.uniswapDayDatas.length;

  const oneDay = parseFloat(data.uniswapDayDatas[data.uniswapDayDatas.length - 1].dailyVolumeInUSD) * 0.003

  return {
    id: 'uniswap-v1',
    name: 'Uniswap V1',
    category: 'app',
    sevenDayMA,
    oneDay,
  };
}