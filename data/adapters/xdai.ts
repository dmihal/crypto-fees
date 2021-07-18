import { Context } from '@cryptostats/sdk';
import icon from 'icons/xdai.svg';

export default function registerXDai(sdk: Context) {
  const xdaiQuery = async (date: string) => {
    const json = await sdk.http.get(
      `https://blockscout.com/xdai/mainnet/api?module=stats&action=totalfees&date=${date}`
    );
    return json.result ? json.result / 1e18 : null;
  };

  sdk.register({
    id: 'xdai',
    queries: {
      fees: xdaiQuery,
    },
    metadata: {
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
    },
  });
}
