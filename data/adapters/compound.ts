import { FeeData } from './feeData';

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
];

const sum = (a: number, b: number) => a + b;
const arraySum = (current: number[], total: number[]) => [
  current[0] + total[0],
  current[1] + total[1],
];

export async function getCompoundData(): Promise<FeeData> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const endTimestamp = today.getTime() / 1000;

  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startTimestamp = weekAgo.getTime() / 1000;
  const interestByAsset = await Promise.all(
    assets.map(async (asset: string) => {
      const url = `https://api.compound.finance/api/v2/market_history/graph?asset=${asset}&min_block_timestamp=${startTimestamp}&max_block_timestamp=${endTimestamp}&num_buckets=7`;
      const req = await fetch(url);
      const json = await req.json();

      const dailyInterest = json.total_borrows_history.map(
        (borrow: any, i: number) =>
          (borrow.total.value * json.prices_usd[i].price.value * json.borrow_rates[i].rate) / 365
      );

      const sevenDayMA = dailyInterest.reduce(sum, 0) / 7;
      const oneDay = dailyInterest[6];

      return [oneDay, sevenDayMA];
    })
  );

  const [oneDay, sevenDayMA] = interestByAsset
    .filter(([a, b]: number[]) => a && b)
    .reduce(arraySum, [0, 0]);

  return {
    id: 'compound',
    name: 'Compound',
    category: 'app',
    sevenDayMA,
    oneDay,
    description: 'Compound is an open borrowing & lending protocol.',
    feeDescription: 'Interest fees are paid from borrowers to lenders.',
    blockchain: 'Ethereum',
    source: 'Compound API',
    adapter: 'compound',
  };
}
