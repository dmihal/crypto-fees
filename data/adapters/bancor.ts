import { Context } from '@cryptostats/sdk';
import { getYesterdayDate } from '../lib/time';

async function getBancorData(sdk: Context): Promise<number> {
  const response = await sdk.http.get('https://api-v2.bancor.network/stats');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.data.fees_24h.usd);
}

export default function registerBancor(sdk: Context) {
  sdk.register({
    id: 'bancor',
    queries: {
      fees: (date: string) => {
        if (date !== getYesterdayDate()) {
          // Legacy adapter, only "today" supported
          return null;
        }
        return getBancorData(sdk);
      },
    },
    metadata: {
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
    },
  });
}
