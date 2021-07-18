import { Context } from '@cryptostats/sdk';

async function getHegicData(date: string, sdk: Context): Promise<number> {
  const start = sdk.date.dateToTimestamp(date);
  const end = start + 86400;

  const data = await sdk.graph.query(
    'ppunky/hegic-v888',
    `{
    yesterday: 
      options(
        first: 1000, 
        where: {
          timestamp_gte: ${start},
          timestamp_lte: ${end}
        }
      ) 
      {
        settlementFee
        symbol
      }
  }`
  );

  // get ETH and WBTC fees over the past 24h hours
  let ethFeesYesterday = 0;
  let wbtcFeesYesterday = 0;

  for (const option of data.yesterday) {
    if (option.symbol === 'ETH') {
      ethFeesYesterday += parseFloat(option.settlementFee);
    } else if (option.symbol === 'WBTC') {
      wbtcFeesYesterday += parseFloat(option.settlementFee);
    }
  }

  const ethPriceYesterday = await sdk.coinGecko.getHistoricalPrice('ethereum', date);
  const wbtcPriceYesterday = await sdk.coinGecko.getHistoricalPrice('bitcoin', date);

  // calculate total fees in USD over the past 24h hours
  const totalFeesYesterday =
    ethFeesYesterday * ethPriceYesterday + wbtcFeesYesterday * wbtcPriceYesterday;

  return totalFeesYesterday;
}

export default function registerHegic(sdk: Context) {
  sdk.register({
    id: 'hegic',
    queries: {
      fees: (date: string) => getHegicData(date, sdk),
    },
    metadata: {
      name: 'Hegic',
      category: 'other',
      description: 'Hegic is a decentralized options trading platform',
      // feeDescription: 'Trading fees are paid by traders to liquidity providers',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'hegic',
      website: 'https://www.hegic.co',
      protocolLaunch: '2020-10-11',
    },
  });
}
