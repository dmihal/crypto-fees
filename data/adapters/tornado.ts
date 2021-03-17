import { dateToBlockNumber } from '../lib/time';
import { query } from '../lib/graph';

export async function getTornadoData(date: string): Promise<number> {
  const graphQuery = `query fees($today: Int!, $yesterday: Int!){
    now: tornado(id: "1", block: {number: $today}) {
      totalFeesUSD
    }
    yesterday: tornado(id: "1", block: {number: $yesterday}) {
      totalFeesUSD
    }
  }`;
  const data = await query(
    'dmihal/tornado-cash',
    graphQuery,
    {
      today: dateToBlockNumber(date, 1),
      yesterday: dateToBlockNumber(date),
    },
    'fees'
  );

  return parseFloat(data.now.totalFeesUSD) - parseFloat(data.yesterday.totalFeesUSD);
}

export default function registerSushiswap(register: any) {
  const tornadoQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Tornado Cash doesn't support ${attribute}`);
    }
    return getTornadoData(date);
  };

  register('tornado', tornadoQuery, {
    name: 'Tornado Cash',
    category: 'app',
    description: 'Tornado Cash is a privacy tool for trustless asset mixing.',
    feeDescription: 'Relay fees are paid by withdrawers to relayers.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'tornado',
  });
}
