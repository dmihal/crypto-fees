import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

async function getSubstrateData(
  id: string,
  date: string,
  divisor: number,
  sdk: CryptoStatsSDK
): Promise<number> {
  const [fees, prices] = await Promise.all([
    sdk.http.post(`https://${id}.subscan.io/api/scan/daily`, {
      start: date,
      end: date,
      format: 'day',
      category: 'Fee',
    }),
    sdk.http.post(`https://${id}.subscan.io/api/scan/price/history`, {
      start: date,
      end: date,
    }),
  ]);

  if (fees.data.list.length === 0 || prices.data.list.length === 0) {
    throw new Error(`No substrate data found for ${id} on ${date}`);
  }

  return (fees.data.list[0].balance_amount_total * prices.data.list[0].price) / divisor;
}

export default function registerPolkadot(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const polkadotQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Polkadot doesn't support ${attribute}`);
    }
    return getSubstrateData('polkadot', date, 10 ** 10, sdk);
  };

  const kusamaQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Kusama doesn't support ${attribute}`);
    }
    return getSubstrateData('kusama', date, 10 ** 12, sdk);
  };

  register('polkadot', polkadotQuery, {
    name: 'Polkadot',
    category: 'l1',
    description: 'Polkadot is a protocol for securing and connecting blockchains.',
    feeDescription: 'Transaction fees are paid from users to validators.',
    blockchain: 'Polkadot',
    source: 'Subscan',
    adapter: 'polkadot',
    website: 'https://polkadot.network',
    tokenTicker: 'DOT',
    tokenCoingecko: 'polkadot',
    protocolLaunch: '2020-07-25',
    tokenLaunch: '2020-08-19',
  });

  register('kusama', kusamaQuery, {
    name: 'Kusama',
    category: 'l1',
    description: 'Kusama is the "canary chain for early-stage Polkadot development.',
    feeDescription: 'Transaction fees are paid from users to validators.',
    blockchain: 'Kusama',
    source: 'Subscan',
    adapter: 'polkadot',
    website: 'https://kusama.network',
    tokenTicker: 'KSM',
    tokenCoingecko: 'kusama',
    protocolLaunch: '2020-07-25',
    tokenLaunch: '2020-09-20',
  });
}
