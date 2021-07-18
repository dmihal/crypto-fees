import { Context } from '@cryptostats/sdk';
import { Category } from '../types';
import icon from 'icons/balancer.svg';

async function getBalancerData(
  date: string,
  subgraphName: string,
  sdk: Context,
  chain = 'ethereum'
): Promise<number> {
  const todayBlock = await sdk.chainData.getBlockNumber(
    sdk.date.offsetDaysFormatted(date, 1),
    chain
  );
  const yesterdayBlock = await sdk.chainData.getBlockNumber(date, chain);

  const data = await sdk.graph.query(
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

export default function registerBalancer(sdk: Context) {
  const metadata = {
    category: 'dex' as Category,
    description: 'Balancer is a decentralized exchange & asset pool balancer.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    source: 'The Graph Protocol',
    adapter: 'balancer',
    website: 'https://balancer.fi',
    tokenLaunch: '2020-06-20',
    tokenTicker: 'BAL',
    tokenCoingecko: 'balancer',
    icon,
  };

  sdk.register({
    id: 'balancer',
    queries: {
      fees: (date: string) => getBalancerData(date, 'balancer', sdk),
    },
    metadata: {
      ...metadata,
      name: 'Balancer V1',
      blockchain: 'Ethereum',
      protocolLaunch: '2020-02-27',
    },
  });

  sdk.register({
    id: 'balancerv2',
    queries: {
      fees: (date: string) => getBalancerData(date, 'balancer-v2', sdk),
    },
    metadata: {
      ...metadata,
      name: 'Balancer V2',
      blockchain: 'Ethereum',
      protocolLaunch: '2021-05-11',
    },
  });

  sdk.register({
    id: 'balancerv2-polygon',
    queries: {
      fees: (date: string) => getBalancerData(date, 'balancer-polygon-v2', sdk, 'polygon'),
    },
    metadata: {
      ...metadata,
      name: 'Balancer V2 (Polygon)',
      blockchain: 'Polygon',
      protocolLaunch: '2021-07-01',
    },
  });
}
