import { FeeData } from './feeData';

export async function getAaveData(): Promise<FeeData> {
  return {
    id: 'aave',
    category: 'app',
    sevenDayMA: 0,
    oneDay: 0,
  };
}
