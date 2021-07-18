import { Context } from '@cryptostats/sdk';

export async function getPolymarketData(date: string, sdk: Context): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(
    sdk.date.offsetDaysFormatted(date, 1),
    'polygon'
  );
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date, 'polygon');

  const data = await sdk.graph.query(
    'tokenunion/polymarket-matic',
    `query lpFeesOverPeriod($today: Int!, $yesterday: Int!){
      today: global(id: "", block: {number: $today}){
        scaledCollateralFees
      }
      yesterday: global(id: "", block: {number: $yesterday}){
        scaledCollateralFees
      }
    }`,
    {
      today: todayBlock,
      yesterday: yesterdayBlock,
    },
    'lpFeesOverPeriod'
  );

  return (
    parseFloat(data.today.scaledCollateralFees) - parseFloat(data.yesterday.scaledCollateralFees)
  );
}

export default function registerPolymarket(sdk: Context) {
  sdk.register({
    id: 'polymarket',
    queries: {
      fees: (date: string) => getPolymarketData(date, sdk),
    },
    metadata: {
      name: 'Polymarket',
      category: 'dex',
      description: 'Polymarket is a prediction market.',
      feeDescription: 'Trading fees are paid by traders to liquidity providers',
      blockchain: 'Polygon',
      source: 'The Graph Protocol',
      adapter: 'polymarket',
      website: 'https://polymarket.com',
      protocolLaunch: '2020-09-05', // I couldn't find an exact date
    },
  });
}
