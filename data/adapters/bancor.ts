import { FeeData } from './feeData';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json();
};

export async function getBancorData(): Promise<FeeData> {
  const response = await fetcher('https://api-v2.bancor.network/stats');
  return {
    id: 'bancor',
    name: 'Bancor',
    category: 'dex',
    oneDay: parseFloat(response.data.fees_24h.usd),
    sevenDayMA: parseFloat(response.data.fees_7d.usd) / 7,
  };
}
