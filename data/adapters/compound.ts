import { dateToTimestamp } from '../lib/time';

const sum = (a: number, b: number) => a + b;

export async function getCompoundData(date: string): Promise<number> {
  const startTimestamp = dateToTimestamp(date);
  const endTimestamp = startTimestamp + 86400;

  const assetReq = await fetch('https://api.compound.finance/api/v2/ctoken');
  const assetJson = await assetReq.json();

  const interestByAsset = await Promise.all(
    assetJson.cToken.map(async (asset: any) => {
      const url = `https://api.compound.finance/api/v2/market_history/graph?asset=${asset.token_address}&min_block_timestamp=${startTimestamp}&max_block_timestamp=${endTimestamp}&num_buckets=1`;
      const req = await fetch(url);
      const json = await req.json();

      if (json.total_borrows_history.length === 0) {
        return 0;
      }

      const dailyInterest =
        (json.total_borrows_history[0].total.value *
          json.prices_usd[0].price.value *
          json.borrow_rates[0].rate) /
        365;

      return dailyInterest || 0;
    })
  );

  const oneDay = interestByAsset.reduce(sum, 0);

  return oneDay;
}

export default function registerCompound(register: any) {
  const compoundQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return getCompoundData(date);
  };

  register('compound', compoundQuery, {
    name: 'Compound',
    category: 'lending',
    description: 'Compound is an open borrowing & lending protocol.',
    feeDescription: 'Interest fees are paid from borrowers to lenders.',
    blockchain: 'Ethereum',
    source: 'Compound API',
    adapter: 'compound',
    website: 'https://compound.finance',
    tokenTicker: 'COMP',
    tokenCoingecko: 'compound-governance-token',
    tokenLaunch: '2020-06-22',
  });
}
