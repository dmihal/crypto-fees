import { getYesterdayDate } from '../lib/time';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('aave did return an error');
  return res.json();
};

async function getAaveData(): Promise<number> {
  const response = await fetcher('https://aave-api-v2.aave.com/data/fees-utc');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.lastDayUTCFees);
}

export default function registerAave(register: any) {
  const aaveQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Aave doesn't support ${attribute}`);
    }
    if (date !== getYesterdayDate()) {
      // Legacy adapter, only "today" supported
      return null;
    }
    return getAaveData();
  };

  register('aave', aaveQuery, {
    id: 'aave',
    name: 'Aave',
    category: 'lending',
    description: 'Aave is an open borrowing & lending protocol.',
    feeDescription: 'Interest fees are paid from borrowers to lenders.',
    blockchain: 'Ethereum',
    source: 'Aave',
    adapter: 'aave',
    website: 'https://aave.com',
    tokenTicker: 'AAVE',
    tokenCoingecko: 'aave',
    legacy: true,
    protocolLaunch: '2021-05-04', // We don't have data from before this date yet
  });
}
