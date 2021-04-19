const MAR_12_DAY = 71;

export enum CHAIN {
  MAINNET,
  MATIC,
}

const MAR_12_FIRST_BLOCK = {
  [CHAIN.MAINNET]: 12020354,
  [CHAIN.MATIC]: 11901823,
};

const BLOCKS_PER_DAY = {
  [CHAIN.MAINNET]: 6348,
  [CHAIN.MATIC]: 41891,
};

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getUTCFullYear(), 0, 0);
  // @ts-ignore
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);

  const dayWithYearOffset = day + (now.getUTCFullYear() - 2021) * 365;

  return dayWithYearOffset;
}

export function getBlockDaysAgo(numDaysAgo: number, chain: CHAIN = CHAIN.MAINNET): number {
  const mar12FirstBlock = MAR_12_FIRST_BLOCK[chain];
  const blocksPerDay = BLOCKS_PER_DAY[chain];

  const todayBlock = mar12FirstBlock + (dayOfYear() - MAR_12_DAY) * blocksPerDay;
  return todayBlock - blocksPerDay * numDaysAgo;
}

export function getYesterdayTimestamps() {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0);
  const beginning = Math.round(yesterday.getTime() / 1000);

  yesterday.setUTCHours(23, 59, 59);
  const end = Math.round(yesterday.getTime() / 1000);

  return { beginning, end };
}

export function getWeekAgoTimestamps() {
  const weekAgo = new Date();
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  weekAgo.setUTCHours(0, 0, 0);
  const beginning = Math.round(weekAgo.getTime() / 1000);

  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(23, 59, 59);
  const end = Math.round(yesterday.getTime() / 1000);

  return { beginning, end };
}
