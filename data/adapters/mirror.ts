import { RegisterFunction, Category } from '../types';
import icon from 'icons/mirror.svg';

type MirrorStats = { syncTime: string; date: string; fee: number };

async function getStatsFromSmartStake(network: string): Promise<MirrorStats[]> {
  const response = await fetch(
    `https://mprod.smartstakeapi.com/listData?type=statSummary&mode=D&statType=${network}&frequency=All&key=lAudQxDFIphYodei1lzi&token=1624451603&app=MIRROR`
  );
  const data = await response.json();

  return data.statHistory;
}

const statsPromise: { [network: string]: Promise<MirrorStats[]> } = {};

export async function getMirrordata(date: string, network: string): Promise<number> {
  if (!statsPromise[network]) {
    statsPromise[network] = getStatsFromSmartStake(network);
  }
  const stats = await statsPromise[network];

  // Yay binary search!
  let low = 0;
  let high = stats.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (date == stats[mid].date) {
      return stats[mid].fee;
    } else if (new Date(date) < new Date(stats[mid].date)) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  throw new Error(`Couldn't find Mirror data on ${date}`);
}

function ethQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Mirror doesn't support ${attribute}`);
  }

  return getMirrordata(date, 'ETH');
}
function terraQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Mirror doesn't support ${attribute}`);
  }

  return getMirrordata(date, 'TERRA');
}

export default function registerBSC(register: RegisterFunction) {
  const metadata = {
    category: 'dex' as Category,
    description: 'Mirror Protocol is a decentralized exchange for trading synthetic assets',
    feeDescription: 'Trading fees are paid to liquidity providers',
    source: 'SmartStake',
    adapter: 'mirror',
    tokenTicker: 'MIR',
    tokenCoingecko: 'mirror-protocol',
    protocolLaunch: '2021-02-22',
    website: 'https://mirror.finance',
    icon,
  };

  register('mirror-eth', ethQuery, {
    ...metadata,
    name: 'Mirror Protocol (Ethereum)',
    shortName: 'Mirror (Ethereum)',
    blockchain: 'Ethereum',
  });

  register('mirror-terra', terraQuery, {
    ...metadata,
    name: 'Mirror Protocol (Terra)',
    shortName: 'Mirror (Terra)',
    blockchain: 'Terra',
  });
}
