const priceCache: { [symbol: string]: number } = { usd: 1 };
const yesterdayPriceCache: { [symbol: string]: number } = { usd: 1 };

export const getPrice = async (name: string): Promise<number> => {
  if (!priceCache[name]) {
    const request = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${name}&vs_currencies=usd`
    );
    const response = await request.json();
    priceCache[name] = response[name].usd;
  }

  return priceCache[name];
};

export const getHistoricalPrice = async (name: string, daysAgo: number): Promise<number> => {
  if (!yesterdayPriceCache[name]) {
    let selectedDay = new Date();
    selectedDay.setUTCDate(selectedDay.getUTCDate() - daysAgo);

    let dayString = ('0' + selectedDay.getDate()).slice(-2) + '-'
    + ('0' + (selectedDay.getMonth()+1)).slice(-2) + '-'
    + selectedDay.getFullYear();

    const request = await fetch(
      `https://api.coingecko.com/api/v3/coins/${name}/history?date=${dayString}&localization=false`
    );
    const response = await request.json();
    priceCache[name] = response["market_data"]["current_price"].usd;
  }

  return priceCache[name];
};
