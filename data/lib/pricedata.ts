import { getValue as getDBValue, setValue as setDBValue } from '../db';

const priceCache: { [symbol: string]: number } = { usd: 1 };
const cache: { [key: string]: { price: number; marketCap: number; fdv: number | null } } = {};

export const getCurrentPrice = async (name: string): Promise<number> => {
  if (!priceCache[name]) {
    const request = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd`
    );
    const response = await request.json();
    priceCache[name] = response[name].usd;
  }

  return priceCache[name];
};

export const getHistoricalAvgDailyPrice = async (
  name: string,
  daysAgo: number,
  currency = 'usd'
): Promise<number> => {
  let cacheName = name;
  if (daysAgo > 1 && name != 'usd') {
    cacheName += daysAgo;
  }

  if (!priceCache[cacheName]) {
    const request = await fetch(
      `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=${currency}&days=${daysAgo}&interval=daily`
    );
    const response = await request.json();
    if (response.error) {
      throw new Error(`[CoinGecko:${name}] "${response.error}"`);
    }
    const prices = response.prices;
    prices.pop(); // remove last element, which is today's price

    let cumulativePrice = 0;
    for (const price of prices) {
      cumulativePrice += price[1];
    }

    priceCache[cacheName] = cumulativePrice / daysAgo;
  }

  return priceCache[cacheName];
};

export async function queryCoingecko(name: string, date: string, currency = 'usd') {
  // eslint-disable-next-line no-console
  console.log(`Querying CoinGecko for ${name} on ${date}`);

  const reversedDate = date.split('-').reverse().join('-');
  const request = await fetch(
    `https://api.coingecko.com/api/v3/coins/${name}/history?date=${reversedDate}`
  );
  const response = await request.json();

  if (!response.market_data) {
    console.error(response);
    throw new Error(`Can't get price data for ${name}`);
  }

  const infoResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${name}`);
  const infoData = await infoResponse.json();
  const fdv = infoData.market_data.max_supply
    ? infoData.market_data.max_supply * response.market_data.current_price[currency]
    : null;

  return {
    price: response.market_data.current_price[currency],
    marketCap: response.market_data.market_cap[currency],
    fdv,
  };
}

export async function getHistoricalPrice(name: string, date: string) {
  if (name == 'usd') {
    return 1;
  }

  const marketData = await getHistoricalMarketData(name, date);
  return marketData.price;
}

export async function getHistoricalMarketData(name: string, date: string) {
  const cacheName = `${name}-${date}`;

  if (!cache[cacheName]) {
    let [price, marketCap, fdv] = await Promise.all([
      getDBValue(name, 'price', date),
      getDBValue(name, 'market-cap', date),
      getDBValue(name, 'fdv', date),
    ]);

    if (!price || !marketCap) {
      // We don't check FDV since FDV might not exist
      const storedPrice = price;
      const storedMarketCap = marketCap;
      const storedFdv = fdv;

      ({ price, marketCap, fdv } = await queryCoingecko(name, date));
      if (!storedPrice) {
        await setDBValue(name, 'price', date, price);
      }

      if (!storedMarketCap) {
        await setDBValue(name, 'market-cap', date, marketCap);
      }

      if (!storedFdv) {
        await setDBValue(name, 'fdv', date, fdv);
      }
    }

    cache[cacheName] = { price, marketCap, fdv };
  }

  return cache[cacheName];
}

export async function cacheMarketData(
  name: string,
  date: string,
  price: number,
  marketCap: number
) {
  // eslint-disable-next-line no-console
  console.log(`Optimisticly caching market data for ${name} on ${date}`);

  await Promise.all([
    setDBValue(name, 'price', date, price),
    setDBValue(name, 'market-cap', date, marketCap),
  ]);
}
