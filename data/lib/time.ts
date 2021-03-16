import subDays from 'date-fns/subDays';

const NOV_3_DAY = 308;

export enum CHAIN {
  MAINNET,
  MATIC,
}

const NOV_3_FIRST_BLOCK = {
  [CHAIN.MAINNET]: 11180802,
  [CHAIN.MATIC]: 6546231,
};

const BLOCKS_PER_DAY = {
  [CHAIN.MAINNET]: 6348,
  [CHAIN.MATIC]: 41891,
};

function dayOfYear(now: Date): number {
  const start = new Date(now.getUTCFullYear(), 0, 0);
  // @ts-ignore
  const diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);

  const dayWithYearOffset = day + (now.getUTCFullYear() - 2020) * 365;

  return dayWithYearOffset;
}

export function getBlockDaysAgo(numDaysAgo: number, chain: CHAIN = CHAIN.MAINNET): number {
  const nov3FirstBlock = NOV_3_FIRST_BLOCK[chain];
  const blocksPerDay = BLOCKS_PER_DAY[chain];

  const todayBlock = nov3FirstBlock + (dayOfYear(new Date()) - NOV_3_DAY) * blocksPerDay;
  return todayBlock - blocksPerDay * numDaysAgo;
}

export function dateToBlockNumber(
  date: string,
  dayOffset = 0,
  chain: CHAIN = CHAIN.MAINNET
): number {
  const nov3FirstBlock = NOV_3_FIRST_BLOCK[chain];
  const blocksPerDay = BLOCKS_PER_DAY[chain];

  const day = dayOfYear(new Date(date)) + dayOffset;
  const blockNum = nov3FirstBlock + (day - NOV_3_DAY) * blocksPerDay;
  return blockNum;
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

function formatDate(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function getYesterdayDate() {
  const date = subDays(new Date(), 1);
  return formatDate(date);
}

export const last7Days = () =>
  [...new Array(7)].map((_, num: number) => formatDate(subDays(new Date(), 7 - num)));
