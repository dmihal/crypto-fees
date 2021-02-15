import { FeeData } from './feeData';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json();
};

export async function getAaveData(): Promise<FeeData> {
  const response = await fetcher('https://aave-api-v2.aave.com/data/fees-utc');

  const { last7DaysUTCAvg, lastDayUTCFees } = response;
  if (!last7DaysUTCAvg || !lastDayUTCFees || isNaN(lastDayUTCFees) || isNaN(last7DaysUTCAvg)) {
    throw new Error('Error in the Aave fees response. Please contact with the Aave team!');
  }
  return {
    id: 'aave',
    category: 'app',
    sevenDayMA: parseFloat(last7DaysUTCAvg.toString()),
    oneDay: parseFloat(lastDayUTCFees.toString()),
  };
}
