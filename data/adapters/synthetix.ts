import { RegisterFunction, Category } from '../types';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';
import icon from 'icons/synthetix.svg';

async function getSynthetixFees(date: string, subgraph: string, chain: string) {
  const data = await query(
    subgraph,
    `query fees($today: Int!, $yesterday: Int!){
      now: total(id: "mainnet", block: {number: $today}) {
        totalFeesGeneratedInUSD
      }
      yesterday: total(id: "mainnet", block: {number: $yesterday}) {
        totalFeesGeneratedInUSD
      }
    }`,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1), chain),
      yesterday: await getBlockNumber(date, chain),
    },
    'fees'
  );
  const fees =
    parseFloat(data.now.totalFeesGeneratedInUSD) -
    parseFloat(data.yesterday.totalFeesGeneratedInUSD);

  return fees;
}

export default function registerSynthetix(register: RegisterFunction) {
  const getQuery = (subgraph: string, chain: string) => (attribute: string, date: string) => {
    return getSynthetixFees(date, subgraph, chain);
  };

  const metadata = {
    icon,
    bundle: 'synthetix',
    category: 'dex' as Category,
    name: 'Synthetix',
    description: 'The Synthetix Exchange is a decentralized exchange for trading synthetic assets',
    feeDescription: 'Trading fees are paid by users to SNX stakers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'synthetix',
    tokenTicker: 'SNX',
    tokenCoingecko: 'havven',
    protocolLaunch: '2018-06-08',
  };

  register('synthetix-mainnet', getQuery('synthetixio-team/synthetix-exchanges', 'ethereum'), {
    ...metadata,
    subtitle: 'Ethereum',
  });

  // register('synthetix-optimism', getQuery('synthetixio-team/optimism-exchanges', 'optimism'), {
  //   ...metadata,
  //   subtitle: 'Optimism',
  //   blockchain: 'Optimism',
  //   protocolLaunch: '2021-07-30',
  // });

  register.bundle('synthetix', metadata);
}
