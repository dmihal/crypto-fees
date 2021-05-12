import { query } from '../lib/graph';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { Category, RegisterFunction } from 'data/types';
import icon from 'icons/balancer.svg';

async function getBalancerData(date: string, subgraphName: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1));
  const yesterdayBlock = await getBlockNumber(date);

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
  const v1Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Balancer doesn't support ${attribute}`);
    }
    return getBalancerData(date, 'balancer');
  };

  const v2Query = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Balancer doesn't support ${attribute}`);
    }
    return getBalancerData(date, 'balancer-v2');
  };

  const polygonQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Balancer doesn't support ${attribute}`);
    }
    return getBalancerData(date, 'balancer-polygon-v2');
  };

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

  register('balancer', v1Query, {
    ...metadata,
    name: 'Balancer V1',
    blockchain: 'Ethereum',
    protocolLaunch: '2020-02-27',
  });

  register('balancerv2', v2Query, {
    ...metadata,
    name: 'Balancer V2',
    blockchain: 'Ethereum',
    protocolLaunch: '2021-05-11',
  });

  register('balancerv2-polygon', polygonQuery, {
    ...metadata,
    name: 'Balancer V2 (Polygon)',
    blockchain: 'Polygon',
    protocolLaunch: '2021-07-01',
  });
}
