import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

export async function getTBTCData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!){
    now: statsRecord(id: "current", block: {number: $today}) {
      tbtcFees
      randomBeaconFees
    }
    yesterday: statsRecord(id: "current", block: {number: $yesterday}) {
      tbtcFees
      randomBeaconFees
    }
  }`;
  const data = await sdk.graph.query(
    'miracle2k/all-the-keeps',
    graphQuery,
    {
      today: await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1)),
      yesterday: await sdk.chainData.getBlockNumber(date),
    },
    'fees'
  );

  const ethPriceYesterday = await sdk.coinGecko.getHistoricalPrice('ethereum', date);
  const wbtcPriceYesterday = await sdk.coinGecko.getHistoricalPrice('bitcoin', date);

  const oneDayTBTCFees = (parseInt(data.now.tbtcFees) - parseInt(data.yesterday.tbtcFees)) / 1e18;
  const oneDayTBTCFeesInUSD = oneDayTBTCFees * wbtcPriceYesterday;

  const oneDayBeaconFees =
    (parseInt(data.now.randomBeaconFees) - parseInt(data.yesterday.randomBeaconFees)) / 1e18;
  const oneDayBeaconFeesInUSD = oneDayBeaconFees * ethPriceYesterday;

  return oneDayTBTCFeesInUSD + oneDayBeaconFeesInUSD;
}

export default function registerTBTC(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const tbtcQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return getTBTCData(date, sdk);
  };

  register('tbtc', tbtcQuery, {
    name: 'tBTC',
    category: 'xchain',
    description: 'tBTC is a protocol for cross-chain asset transfers',
    feeDescription: 'Transfer fees are paid by users to node operators.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'tbtc',
    website: 'https://tbtc.network',
    tokenTicker: 'KEEP',
    tokenCoingecko: 'keep-network',
    protocolLaunch: '2020-09-24',
  });
}
