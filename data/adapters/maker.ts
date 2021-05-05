import { offsetDaysFormatted } from '../lib/time';
import { getBlockNumber } from '../lib/chain';
import { query } from '../lib/graph';

async function getMakerFees(date: string) {
  const data = await query(
    'protofire/maker-protocol',
    `query fees($today: Int!, $yesterday: Int!){
      today: collateralTypes(block: {number: $today}) {
        id
        totalDebt
        stabilityFee
      }
      yesterday: collateralTypes(block: {number: $yesterday}) {
        id
        totalDebt
        stabilityFee
      }
    }`,
    {
      today: await getBlockNumber(offsetDaysFormatted(date, 1)),
      yesterday: await getBlockNumber(date),
    },
    'fees'
  );
  const yesterdayDebts: any = {};

  for (const collateral of data.yesterday) {
    yesterdayDebts[collateral.id] = parseFloat(collateral.totalDebt);
  }
  let totalFees = 0;
  for (const collateral of data.today) {
    if (yesterdayDebts[collateral.id]) {
      const feesInDay = Math.pow(collateral.stabilityFee, 24 * 60 * 60) - 1;
      const avgDebt = (yesterdayDebts[collateral.id] + parseFloat(collateral.totalDebt)) * 0.5;
      totalFees += avgDebt * feesInDay;
    }
  }

  return totalFees;
}

function makerQuery(attribute: string, date: string) {
  if (attribute !== 'fee') {
    throw new Error(`Maker doesn't support ${attribute}`);
  }

  return getMakerFees(date);
}

export default function registerSynthetix(register: any) {
  register('maker', makerQuery, {
    category: 'lending',
    name: 'MakerDAO',
    description: 'MakerDAO is the protocol that issues the Dai stablecoin using loans.',
    feeDescription: 'Stability fees are accrued by borrowers and are used to buy & burn MKR.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'maker',
    tokenTicker: 'MKR',
    tokenCoingecko: 'maker',
  });
}
