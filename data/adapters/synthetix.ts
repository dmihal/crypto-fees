import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';

const EIGHTEEN_DECIMALS = 10 ** 18;

async function getSynthetixFees(date: string) {
  const data = await query(
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
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );
  const fees =
    (parseInt(data.now.totalFeesGeneratedInUSD) -
      parseInt(data.yesterday.totalFeesGeneratedInUSD)) /
    EIGHTEEN_DECIMALS;
  return fees;
}

function synthetixQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Synthetix doesn't support ${attribute}`);
  }

  return getSynthetixFees(date);
}

export default function registerSynthetix(register: any) {
  register('synthetix', synthetixQuery, {
    category: 'dex',
    name: 'Synthetix',
    description: 'The Synthetix Exchange is a decentralized exchange for trading synthetic assets',
    feeDescription: 'Trading fees are paid by users to SNX stakers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'synthetix',
    tokenTicker: 'SNX',
    tokenCoingecko: 'havven',
  });
}
