import { Context } from '@cryptostats/sdk';

const sum = (a: number, b: number) => a + b;

export async function getCompoundData(date: string, sdk: Context): Promise<number> {
  const startTimestamp = sdk.date.dateToTimestamp(date);
  const endTimestamp = startTimestamp + 86400;

  const assetJson = await sdk.http.get('https://api.compound.finance/api/v2/ctoken');

  const interestByAsset: number[] = await Promise.all(
    assetJson.cToken.map(
      async (asset: any): Promise<number> => {
        const url = `https://api.compound.finance/api/v2/market_history/graph?asset=${asset.token_address}&min_block_timestamp=${startTimestamp}&max_block_timestamp=${endTimestamp}&num_buckets=1`;
        const json = await sdk.http.get(url);

        if (json.total_borrows_history.length === 0) {
          return 0;
        }

        const dailyInterest =
          (json.total_borrows_history[0].total.value *
            json.prices_usd[0].price.value *
            json.borrow_rates[0].rate) /
          365;

        return dailyInterest || 0;
      }
    )
  );

  const oneDay = interestByAsset.reduce(sum, 0);

  return oneDay;
}

export default function registerCompound(sdk: Context) {
  sdk.register({
    id: 'compound',
    queries: {
      fees: (date: string) => getCompoundData(date, sdk),
    },
    metadata: {
      name: 'Compound',
      category: 'lending',
      description: 'Compound is an open borrowing & lending protocol.',
      feeDescription: 'Interest fees are paid from borrowers to lenders.',
      blockchain: 'Ethereum',
      source: 'Compound API',
      adapter: 'compound',
      website: 'https://compound.finance',
      protocolLaunch: '2019-05-23',
      tokenTicker: 'COMP',
      tokenCoingecko: 'compound-governance-token',
      tokenLaunch: '2020-06-22',
    },
  });
}
