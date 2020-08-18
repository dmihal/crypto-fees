const AUG_17_FIRST_BLOCK = 10674231;
const AUG_17_DAY = 230;
const BLOCKS_PER_DAY = 6348;

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  // @ts-ignore
  const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}


export function getBlockDaysAgo(numDaysAgo: number): number {
  const todayBlock = AUG_17_FIRST_BLOCK + ((dayOfYear() - AUG_17_DAY) * BLOCKS_PER_DAY);
  return todayBlock - (BLOCKS_PER_DAY * numDaysAgo);
}
