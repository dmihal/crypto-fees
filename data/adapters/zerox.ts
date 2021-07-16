import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

async function get0xData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const data = await sdk.http.get(
    'https://api.0xtracker.com/metrics/network?period=all&granularity=day'
  );

  const dateFullStr = `${date}T00:00:00.000Z`;

  for (const day of data) {
    if (day.date === dateFullStr) {
      return day.protocolFees.USD;
    }
  }

  throw new Error(`No 0x data found on ${date}`);
}

export default function register0x(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const zeroxQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return get0xData(date, sdk);
  };

  register('zerox', zeroxQuery, {
    name: '0x',
    category: 'dex',
    description: '0x is a decentralized exchange protocol.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: '0x API',
    adapter: 'zerox',
    tokenTicker: 'ZRX',
    tokenCoingecko: '0x',
    protocolLaunch: '2017-08-15',
  });
}
