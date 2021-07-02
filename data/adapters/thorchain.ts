import icon from 'icons/thorchain.svg';
import { formatDate } from '../lib/time';
import { RegisterFunction, Category } from '../types';

async function getFeeDataFromNode(): Promise<any> {
  const response = await fetch('https://midgard.thorchain.info/v2/history/earnings?interval=day');
  const json = await response.json();

  return json;
}

let feeDataPromise: null | Promise<any> = null;

export async function getThorChainData(date: string): Promise<number> {
  if (!feeDataPromise) {
    feeDataPromise = getFeeDataFromNode();
  }
  const { intervals: feeData } = await feeDataPromise;

  // Yay binary search!
  let runeFees = 0;
  let runePrice = 0;
  let low = 0;
  let high = feeData.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const dateAtMid = new Date(feeData[mid].startTime * 1000);

    if (date == formatDate(dateAtMid)) {
      runeFees = feeData[mid].liquidityFees / 1e8;
      runePrice = feeData[mid].runePriceUSD;
      break;
    } else if (new Date(date) < dateAtMid) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  if (low > high) {
    throw new Error(`Couldn't find ThorChain data on ${date}`);
  }

  const fees = runeFees * runePrice;

  return isNaN(fees) ? 0 : fees;
}

function thorQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`ThorChain doesn't support ${attribute}`);
  }

  return getThorChainData(date);
}

export default function registerBSC(register: RegisterFunction) {
  register('thorchain', thorQuery, {
    icon,
    category: 'dex' as Category,
    name: 'ThorChain',
    description: 'THORChain is a decentralised liquidity protocol',
    feeDescription: 'Trading fees are paid to liquidity providers',
    blockchain: 'Cosmos',
    source: 'thorchain.info',
    adapter: 'thorchain',
    website: 'https://thorchain.com',
    tokenTicker: 'RUNE',
    tokenCoingecko: 'thorchain',
    protocolLaunch: '2021-04-10',
  });
}
