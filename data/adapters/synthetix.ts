import { Context } from '@cryptostats/sdk';

const EIGHTEEN_DECIMALS = 10 ** 18;

async function getSynthetixFees(date: string, sdk: Context) {
  const data = await sdk.graph.query(
    'synthetixio-team/synthetix-exchanges',
    `query fees($today: Int!, $yesterday: Int!){
      now: total(id: "mainnet", block: {number: $today}) {
        totalFeesGeneratedInUSD
      }
      yesterday: total(id: "mainnet", block: {number: $yesterday}) {
        totalFeesGeneratedInUSD
      }
    }`,
    {
      today: await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1)),
      yesterday: await sdk.chainData.getBlockNumber(date),
    },
    'fees'
  );
  const fees =
    (parseInt(data.now.totalFeesGeneratedInUSD) -
      parseInt(data.yesterday.totalFeesGeneratedInUSD)) /
    EIGHTEEN_DECIMALS;
  return fees;
}

export default function registerSynthetix(sdk: Context) {
  sdk.register({
    id: 'synthetix',
    queries: {
      fees: (date: string) => getSynthetixFees(date, sdk),
    },
    metadata: {
      category: 'dex',
      name: 'Synthetix',
      description:
        'The Synthetix Exchange is a decentralized exchange for trading synthetic assets',
      feeDescription: 'Trading fees are paid by users to SNX stakers',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'synthetix',
      protocolLaunch: '2018-12-07',
      tokenTicker: 'SNX',
      tokenCoingecko: 'havven',
    },
  });
}
