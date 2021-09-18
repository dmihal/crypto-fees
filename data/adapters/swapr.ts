import { dateToTimestamp } from '../lib/time';
import { query } from '../lib/graph';
import { RegisterFunction, Category } from '../types';
import icon from 'icons/swapr.svg';

async function getSwaprData(subgraph: string, date: string): Promise<number> {
  const graphQuery = `query fees($date: Int!) {
    swaprDayDatas(where: { date: $date }) {
      dailyVolumeUSD
    }
  }`;

  const data = await query(
    subgraph,
    graphQuery,
    {
      date: dateToTimestamp(date),
    },
    'fees'
  );

  if (data.swaprDayDatas.length === 0) {
    // throw new Error(`No Sushi data found on ${date} form ${subgraph}`);
    return 0; // Temp, to allow arbitrum to show up
  }

  const oneDay = parseFloat(data.swaprDayDatas[0].dailyVolumeUSD) * 0.003;

  return oneDay;
}

export default function registerSwapr(register: RegisterFunction) {
  const createQueryFn = (subgraph: string) => (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Swapr doesn't support ${attribute}`);
    }
    return getSwaprData(subgraph, date);
  };

  const metadata = {
    category: 'dex' as Category,
    name: 'Swapr',
    bundle: 'swapr',
    blockchain: 'Ethereum',
    description: 'Swapr is an automated market maker powered by the DXDAO',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    source: 'The Graph Protocol',
    adapter: 'swpar',
    tokenTicker: 'SWPR',
    website: 'https://swapr.eth.link',
    icon,
    protocolLaunch: '2020-12-10',
  };

  register('swapr-ethereum', createQueryFn('luzzif/swapr-mainnet-alpha'), {
    ...metadata,
    subtitle: 'Ethereum',
    protocolLaunch: '2020-12-10',
  });

  register('swapr-xdai', createQueryFn('luzzif/swapr-xdai'), {
    ...metadata,
    subtitle: 'xDai',
    blockchain: 'xDai',
    protocolLaunch: '2021-03-10',
  });

  register('swapr-arbitrum', createQueryFn('luzzif/swapr-arbitrum-one-v2'), {
    ...metadata,
    subtitle: 'Arbitrum',
    blockchain: 'Arbitrum One',
    protocolLaunch: '2021-08-30',
  });

  register.bundle('swapr', metadata);
}
