import { getValue as getDBValue, setValue as setDBValue } from '../db';
import { query } from './graph';

const memoryCache: { [key: string]: Promise<number> } = {};

const getCache = (chain: string, date: string) => memoryCache[`${chain}-${date}`];
const setCache = (chain: string, date: string, promise: Promise<number>) => {
  memoryCache[`${chain}-${date}`] = promise;
};

const blockSubgraphQuery = async (subgraph: string, date: string) => {
  const time = Math.floor(new Date(date).getTime() / 1000);
  const res = await query(
    subgraph,
    `query blocks($timestampFrom: Int!, $timestampTo: Int!) {
      blocks(
        first: 1
        orderBy: timestamp
        orderDirection: asc
        where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
      ) {
        number
      }
    }`,
    {
      timestampFrom: time,
      timestampTo: time + 6 * 60 * 60, // 1 hour window
    }
  );

  return parseInt(res.blocks[0].number);
};

const blockNumLoaders: { [id: string]: (date: string) => Promise<number> } = {
  async ethereum(date: string) {
    const block = await blockSubgraphQuery('blocklytics/ethereum-blocks', date);
    return block;
  },

  async polygon(date: string) {
    const block = await blockSubgraphQuery('elkfinance/matic-blocks', date);
    return block;
  },

  async avalanche(date: string) {
    const block = await blockSubgraphQuery('dasconnor/avalanche-blocks', date);
    return block;
  },

  async 'arbitrum-one'(date: string) {
    const block = await blockSubgraphQuery('dodoex/arbitrum-one-blocks', date);
    return block;
  },

  async optimism(date: string) {
    const time = Math.floor(new Date(date).getTime() / 1000);
    const res = await query(
      'dmihal/optimism-fees',
      `query blocks($timestamp: String!) {
        block: dateToBlock(id: $timestamp) {
          blockNum
        }
      }`,
      {
        timestamp: time.toString(),
      }
    );

    if (!res.block) {
      throw new Error(`Could not find Optimism block on ${date}`);
    }

    return parseInt(res.block.blockNum);
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
