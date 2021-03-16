import { adapters, queryAdapter, getIDs, getMetadata } from './adapters';
import { FeeData } from './adapters/feeData';
export type { FeeData } from './adapters/feeData';
import { getValue as getDBValue, setValue as setDBValue } from './db';
import { last7Days } from './lib/time';

async function getValue(protocol: string, attribute: string, date: string) {
  const cachedValue = await getDBValue(protocol, attribute, date);
  if (cachedValue) {
    return cachedValue;
  }

  const value = await queryAdapter(protocol, attribute, date);
  await setDBValue(protocol, attribute, date, value);
  return value;
}

export async function getData(): Promise<FeeData[]> {
  const handleFailure = (e: any) => {
    console.warn(e);
    return null;
  };
  const runAdapter = (adapter: any) => adapter().catch(handleFailure);
  const [l1Data, ...appData] = await Promise.all(adapters.map(runAdapter));

  const days = last7Days();
  const v2Data = await Promise.all(
    getIDs().map(async (id: string) => {
      const feeForDay = await Promise.all(days.map((day: string) => getValue(id, 'fee', day)));
      const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

      return {
        id,
        ...getMetadata(id),
        sevenDayMA,
        oneDay: feeForDay[feeForDay.length - 1],
      };
    })
  );

  const data = [...l1Data, ...appData, ...v2Data].filter((val: any) => !!val);

  return data;
}
