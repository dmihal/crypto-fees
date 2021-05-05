import { getBlockNumber } from '../lib/chain';
import { offsetDaysFormatted } from '../lib/time';
import { getHistoricalPrice } from '../lib/pricedata';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('avalanche did return an error');
  return res.json();
};

async function getBalance(block: string) {
  const res = await fetcher('https://api.avax.network/ext/bc/C/rpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: ['0x0100000000000000000000000000000000000000', block],
    }),
  });

  return parseInt(res.result, 16) / 1e18;
}

async function getCChainFees(date: string) {
  const [blockYesterday, blockToday] = await Promise.all([
    getBlockNumber(date, 'avalanche'),
    getBlockNumber(offsetDaysFormatted(date, 1), 'avalanche'),
  ]);

  const [currentBalance, previousBalance] = await Promise.all([
    getBalance('0x' + blockToday.toString(16)),
    getBalance('0x' + blockYesterday.toString(16)),
  ]);

  const diff = currentBalance - previousBalance;
  return diff;
}

async function getXChainFees(date: string) {
  const startDate = new Date(date).toISOString();
  const endDate = new Date(offsetDaysFormatted(date, 1)).toISOString();
  const dayAggregate = await fetcher(
    `https://explorerapi.avax.network/v2/txfeeAggregates?startTime=${startDate}&endTime=${endDate}`
  );

  const fees = parseFloat(dayAggregate.aggregates.txfee) / 1e9;
  return fees;
}

export async function getAvalancheData(date: string): Promise<number> {
  const [price, cFees, xFees] = await Promise.all([
    getHistoricalPrice('avalanche-2', date),
    getCChainFees(date),
    getXChainFees(date),
  ]);

  const feesUSD = price * (cFees + xFees);

  return feesUSD;
}

export default function registerAvalanche(register: any) {
  const avalancheQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Avalanche doesn't support ${attribute}`);
    }
    return getAvalancheData(date);
  };

  register('avalanche', avalancheQuery, {
    name: 'Avalanche',
    category: 'l1',
    description: 'Avalanche is a platform for inter-connected blockchains.',
    feeDescription: 'Transaction fees are burned.',
    source: 'Ava Labs',
    adapter: 'avalanche',
    website: 'https://avalabs.org',
    tokenTicker: 'AVAX',
    tokenCoingecko: 'avalanche-2',
    protocolLaunch: '2020-09-22',
    tokenLaunch: '2020-09-22',
  });
}
