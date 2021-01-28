import { FeeData } from './feeData';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json();
};

export async function getAaveData(): Promise<FeeData> {
  const response = await fetcher('http://localhost:3000/data/fees');
  return {
    id: 'aave',
    category: 'app',
    sevenDayMA: parseFloat(response.last7DaysAvg),
    oneDay: parseFloat(response.last24hFees),
  };
}
