import { getValue as getDBValue, setValue as setDBValue } from '../db';
import { query } from './graph';
import { offsetDaysFormatted } from './time';

const memoryCache: { [key: string]: Promise<number> } = {};

const getCache = (chain: string, date: string) => memoryCache[`${chain}-${date}`];
const setCache = (chain: string, date: string, promise: Promise<number>) => {
  memoryCache[`${chain}-${date}`] = promise;
};

const blockNumLoaders: { [id: string]: (date: string) => Promise<number> } = {
  async ethereum(date: string) {
    const time = Math.floor(new Date(date).getTime() / 1000);
    const req = await fetch(
      `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${time}&closest=before&apikey=${process.env.NEXT_APP_ETHERSCAN_API_KEY}`
    );
    const data = await req.json();
    if (data.status === '0') {
      throw new Error(`Etherscan: ${data.message} ${data.result}`);
    }
    return parseInt(data.result);
  },

  async polygon(date: string) {
    const req = await fetch(
      `https://api.covalenthq.com/v1/137/block_v2/${date}/${offsetDaysFormatted(date, 1)}/`
    );
    const { data, error } = await req.json();
    if (error) {
      throw new Error(`Error fetching polygon block on ${date}`);
    }
    return data.items[0].height;
  },

  async avalanche(date: string) {
    const time = Math.floor(new Date(date).getTime() / 1000);
    const res = await query(
      'dasconnor/avalanche-blocks',
      `query blocks($timestampFrom: Int!, $timestampTo: Int!) {
        blocks(
          first: 1
          orderBy: timestamp
          orderDirection: asc
          where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
        ) {
          number
          timestamp
        }
      }`,
      {
        timestampFrom: time,
        timestampTo: time + 60 * 60 * 24 * 7,
      }
    );

    return parseInt(res.blocks[0].number);
  },
};

export function getBlockNumber(date: string, chain = 'ethereum'): Promise<number> {
  const promise = getCache(chain, date);
  if (promise) {
    return promise;
  }

  const newPromise = getBlockNumberInternal(date, chain);
  setCache(chain, date, newPromise);
  return newPromise;
}

async function getBlockNumberInternal(date: string, chain: string) {
  let block = await getDBValue(chain, 'block', date);
  if (block !== null) {
    return block;
  }

  // eslint-disable-next-line no-console
  console.log(`Cache miss for block number for ${chain} on ${date}`);

  const loader = blockNumLoaders[chain];
  if (!loader) {
    throw new Error(`Can't get block number for ${chain}`);
  }

  block = await loader(date);

  await setDBValue(chain, 'block', date, block);

  return block;
}
