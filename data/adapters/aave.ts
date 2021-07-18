import { Context } from '@cryptostats/sdk';
import { getYesterdayDate } from '../lib/time';

async function getAaveData(sdk: Context): Promise<number> {
  const response = await sdk.http.get('https://aave-api-v2.aave.com/data/fees-utc');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.lastDayUTCFees);
}

export default function registerAave(sdk: Context) {
  sdk.register({
    id: 'aave',
    queries: {
      fees: (date: string) => {
        if (date !== getYesterdayDate()) {
          // Legacy adapter, only "today" supported
          return null;
        }
        return getAaveData(sdk);
      },
    },
    metadata: {
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
    },
  });
}
