import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';
import icon from 'icons/xdai.svg';

export default function registerXDai(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const xdaiQuery = async (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`xDai doesn't support ${attribute}`);
    }
    const json = await sdk.http.get(
      `https://blockscout.com/xdai/mainnet/api?module=stats&action=totalfees&date=${date}`
    );
    return json.result ? json.result / 1e18 : null;
  };

  register('xdai', xdaiQuery, {
    name: 'xDai',
    category: 'l1',
    description: 'xDai is an Ethereum sidechain that uses Dai as the base asset.',
    feeDescription: 'Transaction fees are paid by users to validators.',
    icon: icon,
    blockchain: 'xDai',
    source: 'Blockscout',
    adapter: 'xdai',
    website: 'https://xdaichain.com',
    tokenTicker: 'STAKE',
    tokenCoingecko: 'xdai-stake',
    protocolLaunch: '2020-06-03',
  });
}
