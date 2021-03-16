import { FeeData } from './feeData';
import { getBlockDaysAgo } from '../lib/time';
import { getHistoricalAvgDailyPrice } from '../lib/pricedata';

interface Pool {
  name: string;
  address: string;
  price: string;
}

const pools: Pool[] = [
  {
    name: 'compound',
    address: '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56',
    price: 'usd',
  },
  {
    name: 'busd',
    address: '0x79a8c46dea5ada233abaffd40f3a0a2b1e5a4f27',
    price: 'usd',
  },
  {
    name: 'y',
    address: '0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51',
    price: 'usd',
  },
  {
    name: 'susd',
    address: '0xa5407eae9ba41422680e2e00537571bcc53efbfd',
    price: 'usd',
  },
  {
    name: 'sbtc',
    address: '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714',
    price: 'bitcoin',
  },
  {
    name: 'renbtc',
    address: '0x93054188d876f558f4a66b2ef1d97d16edf0895b',
    price: 'bitcoin',
  },
];

export async function getCurveData(): Promise<FeeData> {
  const todayBlock = getBlockDaysAgo(0);
  const yesterdayBlock = getBlockDaysAgo(1);
  const weekAgoBlock = getBlockDaysAgo(7);

  const request = await fetch('https://api.thegraph.com/subgraphs/name/blocklytics/curve', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        ${pools
          .map(
            (pool: Pool) => `
          ${pool.name}_current: exchange(id: "${pool.address}", block: {number: ${todayBlock}}) {
            totalUnderlyingVolumeDecimal
          }
          ${pool.name}_yesterday: exchange(id: "${pool.address}", block: {number: ${yesterdayBlock}}) {
            totalUnderlyingVolumeDecimal
          }
          ${pool.name}_week_ago: exchange(id: "${pool.address}", block: {number: ${weekAgoBlock}}) {
            totalUnderlyingVolumeDecimal
          }
        `
          )
          .join('')}
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = await request.json();

  let oneDay = 0;
  let sevenDayMA = 0;
  for (const pool of pools) {
    const priceYesterday = await getHistoricalAvgDailyPrice(pool.price, 1);
    const priceLastWeek = await getHistoricalAvgDailyPrice(pool.price, 7);
    const current = parseFloat(data[`${pool.name}_current`].totalUnderlyingVolumeDecimal);
    const yesterday = parseFloat(data[`${pool.name}_yesterday`].totalUnderlyingVolumeDecimal);
    const weekAgo = parseFloat(data[`${pool.name}_week_ago`].totalUnderlyingVolumeDecimal);
    oneDay += (current - yesterday) * 0.0004 * priceYesterday;
    sevenDayMA += ((current - weekAgo) * 0.0004 * priceLastWeek) / 7;
  }

  return { id: 'curve', category: 'app', sevenDayMA, oneDay };
}
