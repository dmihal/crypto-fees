const priceCache: { [symbol: string]: number } = { usd: 1 };

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
  daysAgo: number
): Promise<number> => {
  let cacheName = name;
  if (daysAgo > 1 && name != 'usd') {
    cacheName += daysAgo;
  }

  if (!priceCache[cacheName]) {
    const request = await fetch(
      `https://api.coingecko.com/api/v3/coins/${name}/market_chart?vs_currency=usd&days=${daysAgo}&interval=daily`
    );
    const response = await request.json();
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
