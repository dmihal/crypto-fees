import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

export async function getPolymarketData(date: string, sdk: CryptoStatsSDK): Promise<number> {
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

export default function registerPolymarket(register: RegisterFunction, sdk: CryptoStatsSDK) {
  function polymarketQuery(attribute: string, date: string) {
    if (attribute !== 'fee') {
      throw new Error(`mStable doesn't support ${attribute}`);
    }

    return getPolymarketData(date, sdk);
  }

  register('polymarket', polymarketQuery, {
    name: 'Polymarket',
    category: 'dex',
    description: 'Polymarket is a prediction market.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Polygon',
    source: 'The Graph Protocol',
    adapter: 'polymarket',
    website: 'https://polymarket.com',
    protocolLaunch: '2020-09-05', // I couldn't find an exact date
  });
}
