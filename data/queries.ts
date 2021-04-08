import { adapters, queryAdapter, getIDs, getMetadata } from './adapters';
import { FeeData, ProtocolData } from './types';
import { getValue as getDBValue, setValue as setDBValue } from './db';
import { last7Days } from './lib/time';
import { getHistoricalMarketData } from './lib/pricedata';

async function getValue(protocol: string, attribute: string, date: string) {
  const cachedValue = await getDBValue(protocol, attribute, date);
  if (cachedValue !== null) {
    return cachedValue;
  }

  const value = await queryAdapter(protocol, attribute, date);
  await setDBValue(protocol, attribute, date, value);
  return value;
}

export async function getData(): Promise<ProtocolData[]> {
  const handleFailure = (e: any) => {
    console.warn(e);
    return null;
  };
  const runAdapter = (adapter: any) => adapter().catch(handleFailure);
  const [...appData] = await Promise.all(adapters.map(runAdapter));

  const days = last7Days();
  const v2Data = await Promise.all(
    getIDs().map(
      async (id: string): Promise<ProtocolData | null> => {
        let feeForDay;
        try {
          feeForDay = await Promise.all(days.map((day: string) => getValue(id, 'fee', day)));
        } catch (e) {
          console.warn(e);
          return null;
        }
        const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

        const metadata = getMetadata(id);

        let price: null | number = null;
        let marketCap: null | number = null;
        let psRatio: null | number = null;
        if (metadata.tokenCoingecko) {
          ({ price, marketCap } = await getHistoricalMarketData(metadata.tokenCoingecko, days[6]));
          psRatio = marketCap / (sevenDayMA * 365);
        }

        return {
          id,
          ...metadata,
          sevenDayMA,
          oneDay: feeForDay[feeForDay.length - 1],

          price,
          marketCap,
          psRatio,
        };
      }
    )
  );

  const data = [...appData, ...v2Data].filter((val: any) => !!val);

  return data;
}

export async function getHistoricalData(date: string): Promise<FeeData[]> {
  const days = last7Days(new Date(date));
  const v2Data = await Promise.all(
    getIDs().map(async (id: string) => {
      let feeForDay;
      try {
        feeForDay = await Promise.all(days.map((day: string) => getValue(id, 'fee', day)));
      } catch (e) {
        console.warn(e);
        return null;
      }
      const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

      const metadata = getMetadata(id);

      let price: null | number = null;
      let marketCap: null | number = null;
      let psRatio: null | number = null;
      if (metadata.tokenCoingecko) {
        ({ price, marketCap } = await getHistoricalMarketData(metadata.tokenCoingecko, date));
        psRatio = marketCap / (sevenDayMA * 365);
      }

      return {
        id,
        ...getMetadata(id),
        sevenDayMA,
        oneDay: feeForDay[feeForDay.length - 1],

        price,
        marketCap,
        psRatio,
      };
    })
  );

  const data = v2Data.filter((val: any) => !!val);

  return data;
}

export async function getLastWeek(): Promise<any[]> {
  const days = last7Days().reverse();
  const v2Data = await Promise.all(
    getIDs().map(async (id: string) => {
      try {
        const fees = await Promise.all(
          days.map(async (day: string) => ({
            date: day,
            fee: await getValue(id, 'fee', day),
          }))
        );

        return {
          id,
          ...getMetadata(id),
          fees,
        };
      } catch (e) {
        console.warn(e);
        return null;
      }
    })
  );

  const data = v2Data.filter((val: any) => !!val);
  return data;
}
