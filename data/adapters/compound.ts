import { dateToTimestamp } from '../lib/time';

const assets = [
  '0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e',
  '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643',
  '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5',
  '0x158079ee67fce2f58472a96584a73c7ab9ac95c1',
  '0x39aa39c021dfbae8fac545936693ac917d5e7563',
  '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
  '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4',
  '0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407',
  '0xf5dce57282a584d2746faf1593d3121fcac444dc',
  '0x35a18000230da775cac24873d00ff85bccded550',
  '0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4',
  '0xccf4429db6322d5c611ee964527d42e5d685dd6a',
];

const sum = (a: number, b: number) => a + b;

export async function getCompoundData(date: string): Promise<number> {
  const startTimestamp = dateToTimestamp(date);
  const endTimestamp = startTimestamp + 86400;

  const interestByAsset = await Promise.all(
    assets.map(async (asset: string) => {
      const url = `https://api.compound.finance/api/v2/market_history/graph?asset=${asset}&min_block_timestamp=${startTimestamp}&max_block_timestamp=${endTimestamp}&num_buckets=1`;
      const req = await fetch(url);
      const json = await req.json();

      const dailyInterest = json.total_borrows_history.map(
        (borrow: any, i: number) =>
          (borrow.total.value * json.prices_usd[i].price.value * json.borrow_rates[i].rate) / 365
      );

      return dailyInterest[0];
    })
  );

  const oneDay = interestByAsset.filter((num: number) => num).reduce(sum, 0);

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
