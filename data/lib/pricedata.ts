const priceCache: { [symbol: string]: number } = { usd: 1 };
const cache: { [key: string]: { price: number; marketCap: number } } = {};

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

async function queryCoingecko(name: string, date: string) {
  const reversedDate = date.split('-').reverse().join('-');
  const request = await fetch(
    `https://api.coingecko.com/api/v3/coins/${name}/history?date=${reversedDate}`
  );
  const response = await request.json();

  if (!response.market_data) {
    throw new Error(`Can't get price data for ${name}`);
  }

  return {
    price: response.market_data.current_price.usd,
    marketCap: response.market_data.market_cap.usd,
  };
}

export async function getHistoricalPrice(name: string, date: string) {
  if (name == 'usd') {
    return 1;
  }

  const cacheName = `${name}-${date}`;

  if (!cache[cacheName]) {
    cache[cacheName] = await queryCoingecko(name, date);
  }

  return cache[cacheName].price;
}

export async function getHistoricalMarketData(name: string, date: string) {
  const cacheName = `${name}-${date}`;

  if (!cache[cacheName]) {
    cache[cacheName] = await queryCoingecko(name, date);
  }

  return cache[cacheName];
}
