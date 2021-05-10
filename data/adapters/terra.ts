import { queryCoingecko } from '../lib/pricedata';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('terra did return an error');
  return res.json();
};

const ONE_DAY = 86400000;

function binarySearch(days: any[], search: number) {
  let low = 0;
  let high = days.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (days[mid].datetime === search) {
      return days[mid].blockReward;
    } else if (search < days[mid].datetime) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  throw new Error(`Unable to find terra day ${search}`);
}

async function getTerraData(date: string): Promise<number> {
  const response = await fetcher('https://fcd.terra.dev/v1/dashboard/block_rewards');
  const { price: krw } = await queryCoingecko('usd-coin', date, 'krw');

  const targetDay = new Date(date).setUTCHours(15, 0, 0, 0) - ONE_DAY;
  const blockReward = binarySearch(response.periodic, targetDay);

  const oneDay = blockReward / 1e6 / krw;

  return oneDay;
}

export default function registerTerra(register: any) {
  const terraQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Terra doesn't support ${attribute}`);
    }
    return getTerraData(date);
  };

  register('terra', terraQuery, {
    name: 'Terra',
    category: 'l1',
    description: 'Terra is a blockchain built on fiat-pegged stablecoins.',
    feeDescription: 'Terra stakers earn rewards from gas fees, "taxes" and seigniorage rewards.',
    blockchain: 'Terra',
    source: 'Terra',
    adapter: 'terra',
    website: 'https://www.terra.money',
    tokenTicker: 'LUNA',
    tokenCoingecko: 'terra-luna',
    tokenLaunch: '2019-05-08',
    protocolLaunch: '2019-05-06',
  });
}
