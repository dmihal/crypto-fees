import { query } from '../lib/graph';
import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import icon from 'icons/yearn.svg';

async function getYearnData(date: string): Promise<number> {
  const data = await query(
    'jstashh/yearn-crypto-fees',
    `query fees($today: Int!, $yesterday: Int!){
      today: yearn(id: "1", block: {number: $today}) {
        totalFeesUsdc
      }
      yesterday: yearn(id: "1", block: {number: $yesterday}) {
        totalFeesUsdc
      }
    }`,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );

  return (parseFloat(data.today.totalFeesUsdc) - parseFloat(data.yesterday.totalFeesUsdc)) / 1e6;
}

export default function registerYearn(register: any) {
  const yearnQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Yearn doesn't support ${attribute}`);
    }
    return getYearnData(date);
  };

  register('yearn', yearnQuery, {
    name: 'Yearn',
    category: 'other',
    description: 'Yearn is a yield aggregation protocol.',
    feeDescription: 'Managment and performance fees are paid to the protocol treasury.',
    icon: icon,
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'balancer',
    website: 'https://yearn.finance',
    protocolLaunch: '2021-01-12',
    tokenTicker: 'YFI',
    tokenCoingecko: 'yearn-finance',
  });
}
