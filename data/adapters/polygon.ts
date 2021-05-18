import { getBlockNumber } from '../lib/chain';
import { offsetDaysFormatted } from '../lib/time';
import { getCurrentPrice } from '../lib/pricedata';
import { query } from '../lib/graph';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('aave did return an error');
  return res.json();
};

export async function getPolygonData(date: string): Promise<number> {
  const price = await getCurrentPrice('matic-network');

  const avgGasPrice = await fetcher('https://gasstation-mainnet.matic.network/');
  //   {
  //     "safeLow": 1,
  //     "standard": 1,
  //     "fast": 5,
  //     "fastest": 7.5,
  //     "blockTime": 2,
  //     "blockNumber": 14637041
  // }

  const [blockYesterday, blockToday] = await Promise.all([
    getBlockNumber(date, 'polygon'),
    getBlockNumber(offsetDaysFormatted(date, 1), 'polygon'),
  ]);

  const graphQuery = `
    query getGasInfo($blockFrom: BigInt!, $blockTo: BigInt!){

        blocks( where: { number_gt: $blockFrom, number_lt: $blockTo }) {
          gasUsed
        }
    }
    `;

  const data = await query(
    'sameepsi/maticblocks',
    graphQuery,
    {
      blockFrom: blockYesterday,
      blockTo: blockToday,
    },
    'fees'
  );

  let countGas = 0;

  // 4k interations, < l sec
  data['blocks'].forEach((element) => {
    countGas += element.gasUsed / 10 ** 9;
    // dividing by 10 ** 9 in-place to avoid infinity & using gasPrice in gwei to nullify
  });

  return countGas * price * (avgGasPrice.fast || 5);
}

export default function registerPolygon(register: any) {
  const query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Polygon doesn't support ${attribute}`);
    }
    return getPolygonData(date);
  };

  register('polygon', query, {
    id: 'polygon',
    name: 'Polygon',
    category: 'other',
    description:
      'Polygon is a protocol and a framework for building and connecting Ethereum-compatible blockchain networks',
    feeDescription: 'Trading fees are paid on each transaction to block miner',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'polygon',
    website: 'https://polygon.technology/',
    tokenTicker: 'MATIC',
    tokenCoingecko: 'matic-network',
    tokenLaunch: '2017-09-09',
  });
}
