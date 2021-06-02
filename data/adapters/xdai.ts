import icon from 'icons/xdai.svg';

async function getxDaiData(date: string): Promise<number> {
  const req = await fetch(
    `https://blockscout.com/xdai/mainnet/api?module=stats&action=totalfees&date=${date}`
  );
  const json = await req.json();

  return json.result && json.result / 1e18;
}

export default function registerXDai(register: any) {
  const xdaiQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`xDai doesn't support ${attribute}`);
    }
    return getxDaiData(date);
  };

  register('xdai', xdaiQuery, {
    id: 'xdai',
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
    legacy: true,
    protocolLaunch: '2021-04-29', // We don't have data from before this date yet
  });
}
