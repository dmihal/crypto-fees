import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { getHistoricalPrice } from '../lib/pricedata';
import { query } from '../lib/graph';
import { RegisterFunction } from '../types';

interface MassetData {
  token: {
    symbol: string;
  };
  cumulativeFeesPaid: {
    simple: string;
  };
}

interface FeesData {
  now: MassetData[];
  yesterday: MassetData[];
}

export async function getMstableData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1));
  const yesterdayBlock = await getBlockNumber(date);

  const data: FeesData = await query(
    'mstable/mstable-protocol',
    `
    query fees($today: Int!, $yesterday: Int!){
      now: massets(block: {number: $today}) {
        token {
          symbol
        }
        cumulativeFeesPaid {
          simple
        }
      }
      yesterday: massets(block: {number: $yesterday}) {
        token {
          symbol
        }
        cumulativeFeesPaid {
          simple
        }
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'fees'
  );

  const bitcoinPrice = await getHistoricalPrice('bitcoin', date);

  const collectFees = (btcPrice: number) => (
    accumulator: number,
    { token: { symbol }, cumulativeFeesPaid: { simple } }: MassetData
  ) => {
    const fees = parseFloat(simple);
    const price = symbol === 'mBTC' ? btcPrice : 1;
    return accumulator + fees * price;
  };

  const now = data.now.reduce(collectFees(bitcoinPrice), 0);
  const yesterday = data.yesterday.reduce(collectFees(bitcoinPrice), 0);

  const oneDay = now - yesterday;

  return oneDay;
}

function mStableQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`mStable doesn't support ${attribute}`);
  }

  return getMstableData(date);
}

export default function registerMstable(register: RegisterFunction) {
  register('mstable', mStableQuery, {
    name: 'mStable',
    category: 'dex',
    description: 'mStable is a stablecoin asset manager.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'mStable',
    tokenTicker: 'MTA',
    tokenCoingecko: 'meta',
    protocolLaunch: '2020-05-29',
  });
}
