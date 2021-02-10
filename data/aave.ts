import { FeeData } from './feeData';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json();
};

export async function getAaveData(): Promise<FeeData> {
  const response = await fetcher('https://aave-api-v2.aave.com/data/fees-utc');
  return {
    id: 'aave',
    category: 'app',
    sevenDayMA: parseFloat(response.last7DaysUTCAvg),
    oneDay: parseFloat(response.lastDayUTCFees),
  };
}
