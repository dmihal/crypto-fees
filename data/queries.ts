import { adapters, queryAdapter, getIDs, getMetadata } from './adapters';
import { FeeData, ProtocolData } from './types';
import { getValue as getDBValue, setValue as setDBValue } from './db';
import { last7Days, isBefore, getDateRange } from './lib/time';
import { getHistoricalMarketData } from './lib/pricedata';

async function getValue(protocol: string, attribute: string, date: string) {
  const cachedValue = await getDBValue(protocol, attribute, date);
  if (cachedValue !== null) {
    return cachedValue;
  }
  // eslint-disable-next-line no-console
  console.log(`Missed cache for ${protocol} ${attribute} on ${date}`);

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
        const metadata = getMetadata(id);

        if (!isBefore(metadata.protocolLaunch)) {
          return null;
        }

        let feeForDay;
        try {
          feeForDay = await Promise.all(days.map((day: string) => getValue(id, 'fee', day)));
        } catch (e) {
          console.warn(e);
          return null;
        }
        const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

        let price: null | number = null;
        let marketCap: null | number = null;
        let psRatio: null | number = null;
        if (metadata.tokenCoingecko && isBefore(metadata.tokenLaunch)) {
          try {
            ({ price, marketCap } = await getHistoricalMarketData(
              metadata.tokenCoingecko,
              days[6]
            ));
            psRatio = marketCap / (sevenDayMA * 365);
          } catch (e) {
            console.error(e);
          }
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
      const metadata = getMetadata(id);

      if (!isBefore(metadata.protocolLaunch, date)) {
        return null;
      }

      let feeForDay;
      try {
        feeForDay = await Promise.all(days.map((day: string) => getValue(id, 'fee', day)));
      } catch (e) {
        console.warn(e);
        return null;
      }
      const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

      let price: null | number = null;
      let marketCap: null | number = null;
      let psRatio: null | number = null;
      if (metadata.tokenCoingecko && isBefore(metadata.tokenLaunch, date)) {
        try {
          ({ price, marketCap } = await getHistoricalMarketData(metadata.tokenCoingecko, date));
          psRatio = marketCap / (sevenDayMA * 365);
        } catch (e) {
          console.error(e);
        }
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

export async function getDateRangeData(
  protocol: string,
  dateStart: string | Date,
  dateEnd: string | Date
): Promise<any[]> {
  const days = getDateRange(dateStart, dateEnd);

  const fees = await Promise.all(
    days.map(async (day: string) => ({
      date: day,
      fee: await getValue(protocol, 'fee', day).catch((e: any) => {
        console.error(e);
        return 0;
      }),
    }))
  );

  return fees;
}
