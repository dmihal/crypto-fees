import addDays from 'date-fns/addDays';
import { queryAdapter, getIDs, getMetadata, ensureListLoaded } from './adapters';
import { ProtocolData } from './types';
import { getValue as getDBValue, setValue as setDBValue } from './db';
import { last7Days, isBefore, getDateRange } from './lib/time';
import { getHistoricalMarketData } from './lib/pricedata';

const SANITY_CHECK = 1000000000; // Values over this will be automatically hidden

async function getValue(protocol: string, attribute: string, date: string) {
  const cachedValue = await getDBValue(protocol, attribute, date);
  if (cachedValue !== null && cachedValue < SANITY_CHECK) {
    return cachedValue;
  }
  // eslint-disable-next-line no-console
  console.log(`Missed cache for ${protocol} ${attribute} on ${date}`);

  const value = await queryAdapter(protocol, attribute, date);

  if (value > SANITY_CHECK) {
    console.warn(`Query for ${protocol} on ${date} returned ${value}, exceeded sanity check`);
    return null;
  }

  if (value) {
    await setDBValue(protocol, attribute, date, value);
  }
  return value;
}

export async function getMarketData(id: string, sevenDayMA: number, date: string) {
  await ensureListLoaded();
  const metadata = getMetadata(id);

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

  return { price, marketCap, psRatio };
}

export async function getData(): Promise<ProtocolData[]> {
  await ensureListLoaded();
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
          feeForDay = await Promise.all(
            days.map((day: string) => {
              if (metadata.protocolLaunch && isBefore(day, metadata.protocolLaunch)) {
                return 0;
              }
              return getValue(id, 'fee', day);
            })
          );
        } catch (e) {
          console.warn(e);
          return null;
        }
        const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;
        if (!sevenDayMA || !feeForDay[feeForDay.length - 1]) {
          console.warn(`Missing data for ${id}`);
          return null;
        }

        const { price, marketCap, psRatio } = await getMarketData(id, sevenDayMA, days[6]);

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

  const data = v2Data.filter((val: any) => !!val);

  return data;
}

export async function getHistoricalData(date: string): Promise<ProtocolData[]> {
  await ensureListLoaded();
  const days = last7Days(addDays(new Date(date), 1)); // Add 1 day, so that the "last 7 days" includes date
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
  await ensureListLoaded();
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

export async function getDateData(protocol: string, date: string) {
  await ensureListLoaded();
  const { protocolLaunch } = getMetadata(protocol);
  if (protocolLaunch && isBefore(date, protocolLaunch)) {
    return { date, fee: null };
  }

  return {
    date,
    fee: await getValue(protocol, 'fee', date).catch((e: any) => {
      console.error(e);
      return null;
    }),
  };
}

export async function getDateRangeData(
  protocol: string,
  dateStart: string | Date,
  dateEnd: string | Date
): Promise<any[]> {
  const days = getDateRange(dateStart, dateEnd);

  const fees = await Promise.all(days.map((day: string) => getDateData(protocol, day)));

  return fees;
}
