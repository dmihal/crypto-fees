import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { getHistoricalPrice } from '../lib/pricedata';

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

export async function getCurveData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1));
  const yesterdayBlock = await getBlockNumber(date);

  const data = await query(
    'blocklytics/curve',
    `{
    ${pools
      .map(
        (pool: Pool) => `
      ${pool.name}_current: exchange(id: "${pool.address}", block: {number: ${todayBlock}}) {
        totalUnderlyingVolumeDecimal
      }
      ${pool.name}_yesterday: exchange(id: "${pool.address}", block: {number: ${yesterdayBlock}}) {
        totalUnderlyingVolumeDecimal
      }`
      )
      .join('')}
  }`
  );

  const bitcoinPrice = await getHistoricalPrice('bitcoin', date);

  let oneDay = 0;
  for (const pool of pools) {
    const current = parseFloat(data[`${pool.name}_current`]?.totalUnderlyingVolumeDecimal || '0');
    const yesterday = parseFloat(
      data[`${pool.name}_yesterday`]?.totalUnderlyingVolumeDecimal || '0'
    );

    const price = pool.price === 'bitcoin' ? bitcoinPrice : 1;
    oneDay += (current - yesterday) * 0.0004 * price;
  }

  return oneDay;
}

export default function registerCurve(register: any) {
  const curveQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Curve doesn't support ${attribute}`);
    }
    return getCurveData(date);
  };

  register('curve', curveQuery, {
    name: 'Curve',
    category: 'dex',
    description: 'Curve is a decentralized exchange for stable-value assets.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'curve',
    website: 'https://www.curve.fi/',
    tokenTicker: 'CRV',
    tokenCoingecko: 'curve-dao-token',
    protocolLaunch: '2020-02-25',
    tokenLaunch: '2020-08-12',
  });
}
