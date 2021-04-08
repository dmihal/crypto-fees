import { FeeData } from './feeData';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('aave did return an error');
  return res.json();
};

export async function getAaveData(): Promise<FeeData> {
  const response = await fetcher('https://aave-api-v2.aave.com/data/fees-utc');

  if (response.error) {
    throw new Error(response.error);
  }

  return {
    id: 'aave',
    name: 'Aave',
    category: 'lending',
    sevenDayMA: parseFloat(response?.last7DaysUTCAvg),
    oneDay: parseFloat(response?.lastDayUTCFees),
    description: 'Aave is an open borrowing & lending protocol.',
    feeDescription: 'Interest fees are paid from borrowers to lenders.',
    blockchain: 'Ethereum',
    source: 'Aave',
    adapter: 'aave',
  };
}
