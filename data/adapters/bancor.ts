import { getYesterdayDate } from '../lib/time';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('bancor did return an error');
  return res.json();
};

async function getBancorData(): Promise<number> {
  const response = await fetcher('https://api-v2.bancor.network/stats');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.data.fees_24h.usd);
}

export default function registerBancor(register: any) {
  const bancorQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Bancor doesn't support ${attribute}`);
    }
    if (date !== getYesterdayDate()) {
      // Legacy adapter, only "today" supported
      return null;
    }
    return getBancorData();
  };

  register('bancor', bancorQuery, {
    id: 'bancor',
    name: 'Bancor',
    category: 'dex',
    description: 'Bancor is a permissionless, decentralized exchange',
    feeDescription: 'Trading fees are paid to liquidity providers',
    blockchain: 'Ethereum',
    source: 'Bancor',
    adapter: 'bancor',
    website: 'https://bancor.network',
    tokenTicker: 'BNT',
    tokenCoingecko: 'bancor',
    tokenLaunch: '2017-06-12',
    protocolLaunch: '2021-05-10', // We don't have data from before this date yet
    legacy: true,
  });
}
