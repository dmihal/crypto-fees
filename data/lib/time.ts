import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import startOfDay from 'date-fns/startOfDay';
import { date2block } from 'date2block';

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

export function getMaticBlockDaysAgo(numDaysAgo: number): number {
  const nov3FirstBlock = NOV_3_FIRST_BLOCK[CHAIN.MATIC];
  const blocksPerDay = BLOCKS_PER_DAY[CHAIN.MATIC];

  const todayBlock = nov3FirstBlock + (dayOfYear(new Date()) - NOV_3_DAY) * blocksPerDay;
  return todayBlock - blocksPerDay * numDaysAgo;
}

export function getBlockDaysAgo(numDaysAgo: number): number {
  const date = startOfDay(new Date());
  date.setUTCHours(0);

  return date2block(subDays(date, numDaysAgo));
}

export function dateToBlockNumber(dateStr: string, dayOffset = 0): number {
  const date = new Date(dateStr);
  date.setUTCHours(0);
  return date2block(addDays(date, dayOffset));
}

export function getYesterdayTimestamps() {
  const beginning = Math.floor(Date.now() / 1000 / 86400 - 1) * 86400;
  const end = Math.floor(Date.now() / 1000 / 86400) * 86400 - 1;
  return { beginning, end };
}

export function dateToTimestamp(date: string | Date) {
  const _date = (date as string).length ? new Date(date) : (date as Date);
  return Math.floor(_date.getTime() / 1000 / 86400) * 86400;
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

export function formatDate(date: Date, connector = '-') {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return [date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate())].join(
    connector
  );
}

export function getYesterdayDate() {
  const date = subDays(new Date(), 1);
  return formatDate(date);
}

export const last7Days = (date?: Date) =>
  [...new Array(7)].map((_, num: number) => formatDate(subDays(date || new Date(), 7 - num)));

export function isBefore(date?: string, comparrison?: string) {
  if (!date) {
    return true;
  }
  const _comparrison = comparrison || formatDate(new Date());
  return new Date(date) < new Date(_comparrison);
}

export function getDateRange(dateStart: string | Date, dateEnd: string | Date) {
  const _dateStart = dateStart instanceof Date ? dateStart : new Date(dateStart);
  const _dateEnd = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);

  const days = [];
  for (let date = _dateStart; date < _dateEnd; date = addDays(date, 1)) {
    days.push(formatDate(date));
  }

  return days;
}
