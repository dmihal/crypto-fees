import { dateToBlockNumber } from '../lib/time';
import { query } from '../lib/graph';

const EIGHTEEN_DECIMALS = 10 ** 18;

async function getSynthetixFees(date: string) {
  const data = await query(
    'synthetixio-team/synthetix-exchanges',
    `{
      now: total(id: "mainnet", block: {number: ${dateToBlockNumber(date, 1)}}) {
        totalFeesGeneratedInUSD
      }
      yesterday: total(id: "mainnet", block: {number: ${dateToBlockNumber(date)}}) {
        totalFeesGeneratedInUSD
      }
    }`
  );
  const fees =
    (parseInt(data.now.totalFeesGeneratedInUSD) -
      parseInt(data.yesterday.totalFeesGeneratedInUSD)) /
    EIGHTEEN_DECIMALS;
  return fees;
}

function synthetixQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Synthetix doesn't support ${attribute}`);
  }

  return getSynthetixFees(date);
}

export default function registerSynthetix(register: any) {
  register('synthetix', synthetixQuery, {
    category: 'app',
    name: 'Synthetix',
  });
}
