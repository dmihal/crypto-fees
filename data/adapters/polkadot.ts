import { FeeData } from './feeData';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';

const startOfTodayUTC = () => new Date(new Date().setUTCHours(0, 0, 0, 0));

export function getPolkadotData(): Promise<FeeData> {
  return getSubstrateData('polkadot', 'Polkadot', 10 ** 10);
}

export function getKusamaData(): Promise<FeeData> {
  return getSubstrateData('kusama', 'Kusama', 10 ** 12);
}

async function fetchJSON(url: string, data: any) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await request.json();
  return json;
}

async function getSubstrateData(id: string, name: string, divisor: number): Promise<FeeData> {
  const today = startOfTodayUTC();
  const yesterday = subDays(today, 1);
  const weekAgo = subDays(today, 7);

  const [fees, prices] = await Promise.all([
    fetchJSON(`https://${id}.subscan.io/api/scan/daily`, {
      start: format(weekAgo, 'yyyy-MM-dd'),
      end: format(yesterday, 'yyyy-MM-dd'),
      format: 'day',
      category: 'Fee',
    }),
    fetchJSON(`https://${id}.subscan.io/api/scan/price/history`, {
      start: format(weekAgo, 'yyyy-MM-dd'),
      end: format(today, 'yyyy-MM-dd'),
    }),
  ]);

  const weekTotal = fees.data.list.reduce(
    (total: number, day: any, i: number) =>
      total + day.balance_amount_total * prices.data.list[i].price,
    0
  );

  return {
    id,
    name,
    category: 'l1',
    sevenDayMA: weekTotal / divisor / 7,
    oneDay: (fees.data.list[6].balance_amount_total * prices.data.list[6].price) / divisor,
  };
}
