import { FeeData } from './feeData';
import subDays from 'date-fns/subDays';
import format from 'date-fns/format';

const startOfTodayUTC = () => new Date((new Date()).setUTCHours(0, 0, 0, 0));

export async function getPolkadotData(): Promise<FeeData> {
  const today = startOfTodayUTC();
  const yesterday = subDays(today, 1);
  const weekAgo = subDays(today, 7);

  const request = await fetch('https://polkadot.subscan.io/api/scan/daily',{
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      start: format(weekAgo, 'yyyy-MM-dd'),
      end: format(yesterday, 'yyyy-MM-dd'),
      format: "day",
      category: "Fee"
    }),
  });

  const { data } = await request.json();

  const weekTotal = data.list.reduce((total: number, day: any) => total + parseInt(day.balance_amount_total), 0);


  return {
    id: 'polkadot',
    name: 'Polkadot',
    category: 'l1',
    sevenDayMA: weekTotal / 10000000 / 7,
    oneDay: parseFloat(data.list[6].balance_amount_total) / 10000000,
  };
}
