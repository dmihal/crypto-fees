import { getValue as getDBValue, setValue as setDBValue } from '../db';

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
