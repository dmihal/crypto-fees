import { query } from '../lib/graph';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { Category, RegisterFunction } from 'data/types';
import icon from 'icons/balancer.svg';

async function getBalancerData(
  date: string,
  subgraphName: string,
  chain = 'ethereum'
): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1), chain);
  const yesterdayBlock = await getBlockNumber(date, chain);

  const data = await query(
    `balancer-labs/${subgraphName}`,
    `{
      now: balancers(first: 1, block: {number: ${todayBlock}}) {
        totalSwapFee
      }
      yesterday: balancers(first: 1, block: {number: ${yesterdayBlock}}) {
        totalSwapFee
      }
    }`
  );

  return parseFloat(data.now[0].totalSwapFee) - parseFloat(data.yesterday[0].totalSwapFee);
}

export default function registerBalancer(register: RegisterFunction) {
  const createQueryFn = (subgraph: string, chain?: string) => (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Balancer doesn't support ${attribute}`);
    }
    return getBalancerData(subgraph, date, chain);
  };

  const metadata = {
    category: 'dex' as Category,
    name: 'Balancer',
    bundle: 'balancer',
    description: 'Balancer is a decentralized exchange & asset pool balancer.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    source: 'The Graph Protocol',
    adapter: 'balancer',
    website: 'https://balancer.fi',
    blockchain: 'Ethereum',
    tokenLaunch: '2020-06-20',
    tokenTicker: 'BAL',
    tokenCoingecko: 'balancer',
    icon,
    protocolLaunch: '2020-02-27',
  };

  register('balancer-v1', createQueryFn('balancer'), {
    ...metadata,
    subtitle: 'Version 1',
    protocolLaunch: '2020-02-27',
  });

  register('balancerv2', createQueryFn('balancer-v2'), {
    ...metadata,
    subtitle: 'Version 2',
    protocolLaunch: '2021-05-11',
  });

  register('balancerv2-polygon', createQueryFn('balancer-polygon-v2', "polygon"), {
    ...metadata,
    subtitle: 'Polygon',
    blockchain: 'Polygon',
    protocolLaunch: '2021-07-01',
  });

  register('balancerv2-arbitrum', createQueryFn('balancer-arbitrum-v2', "arbitrum-one"), {
    ...metadata,
    subtitle: 'Arbitrum',
    blockchain: 'Arbitrum',
    protocolLaunch: '2021-08-31',
  });

  register.bundle('balancer', metadata);
}
