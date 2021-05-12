import { query } from '../lib/graph';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';

async function getBalancerData(date: string): Promise<number> {
  const todayBlock = await getBlockNumber(offsetDaysFormatted(date, 1));
  const yesterdayBlock = await getBlockNumber(date);

  const data = await query(
    'bonustrack/balancer',
    `{
      now: balancer(id: "1", block: {number: ${todayBlock}}) {
        totalSwapFee
      }
      yesterday: balancer(id: "1", block: {number: ${yesterdayBlock}}) {
        totalSwapFee
      }
    }`
  );

  return parseFloat(data.now.totalSwapFee) - parseFloat(data.yesterday.totalSwapFee);
}

export default function registerBalancer(register: any) {
  const balancerQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Balancer doesn't support ${attribute}`);
    }
    return getBalancerData(date);
  };

  register('balancer', balancerQuery, {
    name: 'Balancer',
    category: 'dex',
    description: 'Balancer is a decentralized exchange & asset pool balancer.',
    feeDescription: 'Trading fees are paid by traders to liquidity providers',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'balancer',
    website: 'https://balancer.finance',
    protocolLaunch: '2020-02-27',
    tokenLaunch: '2020-06-20',
    tokenTicker: 'BAL',
    tokenCoingecko: 'balancer',
  });
}
