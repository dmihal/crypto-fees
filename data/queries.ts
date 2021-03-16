import { adapters } from './adapters';
import { FeeData } from './adapters/feeData';
export type { FeeData } from './adapters/feeData';

export async function getData(): Promise<FeeData[]> {
  const handleFailure = (e: any) => {
    console.warn(e);
    return null;
  };
  const runAdapter = (adapter: any) => adapter().catch(handleFailure);
  const [l1Data, ...appData] = await Promise.all(adapters.map(runAdapter));

  const data = [...l1Data, ...appData].filter((val: any) => !!val);
  return data;
}
