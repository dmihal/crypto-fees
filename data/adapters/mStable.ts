import { CryptoStatsSDK } from '@cryptostats/sdk';
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

export async function getMstableData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1));
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date);

  const data: FeesData = await sdk.graph.query(
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

  const bitcoinPrice = await sdk.coinGecko.getHistoricalPrice('bitcoin', date);

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

export default function registerMstable(register: RegisterFunction, sdk: CryptoStatsSDK) {
  function mStableQuery(attribute: string, date: string) {
    if (attribute !== 'fee') {
      throw new Error(`mStable doesn't support ${attribute}`);
    }

    return getMstableData(date, sdk);
  }

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
