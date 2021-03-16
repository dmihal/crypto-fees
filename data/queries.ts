import { adapters, queryAdapter } from './adapters';
import { FeeData } from './adapters/feeData';
export type { FeeData } from './adapters/feeData';
import { getValue as getDBValue, setValue as setDBValue } from './db';

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

  const data = [...l1Data, ...appData].filter((val: any) => !!val);

  console.log(await getValue('synthetix', 'fee', '2021-03-15'));

  return data;
}
