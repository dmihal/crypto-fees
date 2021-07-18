import './adapters';
import { ProtocolData } from './types';
import { last7Days } from './lib/time';
import sdk from './sdk';

// const SANITY_CHECK = 1000000000; // Values over this will be automatically hidden

const feesList = sdk.getList('fees');

export async function getMarketData(id: string, sevenDayMA: number, date: string) {
  const metadata = await feesList.getAdapter(id).getMetadata();

  let price: null | number = null;
  let marketCap: null | number = null;
  let psRatio: null | number = null;
  if (metadata.tokenCoingecko && sdk.date.isBefore(metadata.tokenLaunch, date)) {
    try {
      ({ price, marketCap } = await sdk.coinGecko.getHistoricalMarketData(
        metadata.tokenCoingecko,
        date
      ));
      psRatio = marketCap / (sevenDayMA * 365);
    } catch (e) {
      console.error(e);
    }
  }

  return { price, marketCap, psRatio };
}

export async function getData(): Promise<ProtocolData[]> {
  const days = last7Days();
  const v2Data = await Promise.all(
    feesList.getIDs().map(
      async (id: string): Promise<ProtocolData | null> => {
        const adapter = feesList.getAdapter(id);
        const metadata = await adapter.getMetadata();

        if (!sdk.date.isBefore(metadata.protocolLaunch)) {
          return null;
        }

        let feeForDay;
        try {
          feeForDay = await Promise.all(
            days.map((day: string) => adapter.executeQuery('fees', day))
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
  const days = last7Days(new Date(date));
  const v2Data = await Promise.all(
    feesList.getIDs().map(async (id: string) => {
      const adapter = feesList.getAdapter(id);
      const metadata = await adapter.getMetadata();

      if (!sdk.date.isBefore(metadata.protocolLaunch, date)) {
        return null;
      }

      let feeForDay;
      try {
        feeForDay = await Promise.all(days.map((day: string) => adapter.executeQuery('fees', day)));
      } catch (e) {
        console.warn(e);
        return null;
      }
      const sevenDayMA = feeForDay.reduce((a: number, b: number) => a + b, 0) / 7;

      let price: null | number = null;
      let marketCap: null | number = null;
      let psRatio: null | number = null;
      if (metadata.tokenCoingecko && sdk.date.isBefore(metadata.tokenLaunch, date)) {
        try {
          ({ price, marketCap } = await sdk.coinGecko.getHistoricalMarketData(
            metadata.tokenCoingecko,
            date
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
    })
  );

  const data = v2Data.filter((val: any) => !!val);

  return data;
}

export async function getLastWeek(): Promise<any[]> {
  const days = last7Days().reverse();
  const v2Data = await Promise.all(
    feesList.getIDs().map(async (id: string) => {
      const adapter = feesList.getAdapter(id);
      const metadata = await adapter.getMetadata();

      try {
        const fees = await Promise.all(
          days.map(async (day: string) => ({
            date: day,
            fee: await adapter.executeQuery('fees', day),
          }))
        );

        return {
          id,
          ...metadata,
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
  const adapter = feesList.getAdapter(protocol);
  const { protocolLaunch } = await adapter.getMetadata();
  if (protocolLaunch && sdk.date.isBefore(date, protocolLaunch)) {
    return { date, fee: null };
  }

  return {
    date,
    fee: await adapter.executeQuery('fees', date).catch((e: any) => {
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
  const days = sdk.date.getDateRange(dateStart, dateEnd);

  const fees = await Promise.all(days.map((day: string) => getDateData(protocol, day)));

  return fees;
}
