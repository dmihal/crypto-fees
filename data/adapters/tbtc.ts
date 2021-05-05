import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import { getHistoricalPrice } from '../lib/pricedata';

export async function getTBTCData(date: string): Promise<number> {
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
  const data = await query(
    'miracle2k/all-the-keeps',
    graphQuery,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );

  const ethPriceYesterday = await getHistoricalPrice('ethereum', date);
  const wbtcPriceYesterday = await getHistoricalPrice('bitcoin', date);

  const oneDayTBTCFees = (parseInt(data.now.tbtcFees) - parseInt(data.yesterday.tbtcFees)) / 1e18;
  const oneDayTBTCFeesInUSD = oneDayTBTCFees * wbtcPriceYesterday;

  const oneDayBeaconFees =
    (parseInt(data.now.randomBeaconFees) - parseInt(data.yesterday.randomBeaconFees)) / 1e18;
  const oneDayBeaconFeesInUSD = oneDayBeaconFees * ethPriceYesterday;

  return oneDayTBTCFeesInUSD + oneDayBeaconFeesInUSD;
}

export default function registerTBTC(register: any) {
  const tbtcQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return getTBTCData(date);
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
