import { FeeData } from './feeData';
import { getBlockDaysAgo } from './time-lib';
import { getHistoricalAvgDailyPrice } from './pricedata';

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
  weekAgo: MassetData[];
}

export async function getMstableData(): Promise<FeeData> {
  const todayBlock = getBlockDaysAgo(0);
  const yesterdayBlock = getBlockDaysAgo(1);
  const weekAgoBlock = getBlockDaysAgo(7);

  const request = await fetch('https://api.thegraph.com/subgraphs/name/mstable/mstable-protocol', {
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `{
        now: massets(block: {number: ${todayBlock}}) {
          token {
            symbol
          }
          cumulativeFeesPaid {
            simple
          }
        }
        yesterday: massets(block: {number: ${yesterdayBlock}}) {
          token {
            symbol
          }
          cumulativeFeesPaid {
            simple
          }
        }
        weekAgo: massets(block: {number: ${weekAgoBlock}}) {
          token {
            symbol
          }
          cumulativeFeesPaid {
            simple
          }
        }
      }`,
      variables: null,
    }),
    method: 'POST',
  });

  const { data } = (await request.json()) as {
    data: FeesData;
  };

  const wbtcPriceYesterday = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 1);
  const wbtcPriceLastWeek = await getHistoricalAvgDailyPrice('wrapped-bitcoin', 7);

  const collectFees = (btcPrice: number) => (
    accumulator: number,
    { token: { symbol }, cumulativeFeesPaid: { simple } }: MassetData
  ) => {
    const fees = parseFloat(simple);
    const price = symbol === 'mBTC' ? btcPrice : 1;
    return accumulator + fees * price;
  };

  const now = data.now.reduce(collectFees(wbtcPriceYesterday), 0);
  const yesterday = data.yesterday.reduce(collectFees(wbtcPriceYesterday), 0);
  const weekAgo = data.weekAgo.reduce(collectFees(wbtcPriceLastWeek), 0);

  const sevenDayMA = (now - weekAgo) / 7;
  const oneDay = now - yesterday;

  return {
    id: 'mstable',
    category: 'app',
    sevenDayMA,
    oneDay,
  };
}
