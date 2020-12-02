import { FeeData } from './feeData';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';

const startOfTodayUTC = () => new Date(new Date().setUTCHours(0, 0, 0, 0));

export function getPolkadotData(): Promise<FeeData> {
  return getSubstrateData(
    'https://polkadot.subscan.io/api/scan/daily',
    'polkadot',
    'Polkadot',
    10000000
  );
}

export function getKusamaData(): Promise<FeeData> {
  return getSubstrateData(
    'https://kusama.subscan.io/api/scan/daily',
    'kusama',
    'Kusama',
    1000000000
  );
}

async function getSubstrateData(
  url: string,
  id: string,
  name: string,
  divisor: number
): Promise<FeeData> {
  const today = startOfTodayUTC();
  const yesterday = subDays(today, 1);
  const weekAgo = subDays(today, 7);

  const request = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      start: format(weekAgo, 'yyyy-MM-dd'),
      end: format(yesterday, 'yyyy-MM-dd'),
      format: 'day',
      category: 'Fee',
    }),
  });

  const { data } = await request.json();

  const weekTotal = data.list.reduce(
    (total: number, day: any) => total + parseInt(day.balance_amount_total),
    0
  );

  return {
    id,
    name,
    category: 'l1',
    sevenDayMA: weekTotal / divisor / 7,
    oneDay: parseFloat(data.list[6].balance_amount_total) / divisor,
  };
}
