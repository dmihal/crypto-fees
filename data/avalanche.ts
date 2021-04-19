import { FeeData } from './feeData';
import { query } from './graph';
import { getHistoricalAvgDailyPrice } from './pricedata';

const fetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status !== 200) throw new Error('avalanche did return an error');
  return res.json();
};

async function getBlockFromTimestamp(timestamp: number) {
  const res = await query(
    'dasconnor/avalanche-blocks',
    `query blocks($timestampFrom: Int!, $timestampTo: Int!) {
			blocks(
				first: 1
				orderBy: timestamp
				orderDirection: asc
				where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
			) {
				number
				timestamp
			}
		}`,
    {
      timestampFrom: timestamp,
      timestampTo: timestamp + 60 * 60 * 24 * 7,
    }
  );

  return parseInt(res.blocks[0].number);
}

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

function getPastDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function getCChainFees() {
  const [dayBlock, weekBlock] = await Promise.all([
    getBlockFromTimestamp(Math.floor(getPastDate(1).getTime() / 1000)),
    getBlockFromTimestamp(Math.floor(getPastDate(7).getTime() / 1000)),
  ]);

  const [currentBalance, dayBalance, weekBalance] = await Promise.all([
    getBalance('latest'),
    getBalance('0x' + dayBlock.toString(16)),
    getBalance('0x' + weekBlock.toString(16)),
  ]);

  return {
    sevenDayMA: (currentBalance - weekBalance) / 7,
    oneDay: currentBalance - dayBalance,
  };
}

async function getXChainFees() {
  const [dayAggregate, weekAggregate] = await Promise.all([
    fetcher(
      `https://explorerapi.avax.network/v2/txfeeAggregates?startTime=${getPastDate(
        1
      ).toISOString()}&endTime=${getPastDate(0).toISOString()}`
    ),
    fetcher(
      `https://explorerapi.avax.network/v2/txfeeAggregates?startTime=${getPastDate(
        7
      ).toISOString()}&endTime=${getPastDate(0).toISOString()}`
    ),
  ]);

  return {
    sevenDayMA: parseFloat(weekAggregate.aggregates.txfee) / 1e9 / 7,
    oneDay: parseFloat(dayAggregate.aggregates.txfee) / 1e9,
  };
}

export async function getAvalancheData(): Promise<FeeData> {
  const [priceYesterday, priceLastWeek, cFees, xFees] = await Promise.all([
    getHistoricalAvgDailyPrice('avalanche-2', 1),
    getHistoricalAvgDailyPrice('avalanche-2', 7),
    getCChainFees(),
    getXChainFees(),
  ]);

  return {
    id: 'avalanche',
    category: 'l1',
    sevenDayMA: priceLastWeek * (cFees.sevenDayMA + xFees.sevenDayMA),
    oneDay: priceYesterday * (cFees.oneDay + xFees.oneDay),
  };
}
