import { Context } from '@cryptostats/sdk';

async function getMakerFees(date: string, sdk: Context) {
  const data = await sdk.graph.query(
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
      today: await sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1)),
      yesterday: await sdk.chainData.getBlockNumber(date),
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

export default function registerSynthetix(sdk: Context) {
  sdk.register({
    id: 'maker',
    queries: {
      fees: (date: string) => getMakerFees(date, sdk),
    },
    metadata: {
      category: 'lending',
      name: 'MakerDAO',
      description: 'MakerDAO is the protocol that issues the Dai stablecoin using loans.',
      feeDescription: 'Stability fees are accrued by borrowers and are used to buy & burn MKR.',
      blockchain: 'Ethereum',
      source: 'The Graph Protocol',
      adapter: 'maker',
      protocolLaunch: '2019-11-18',
      tokenTicker: 'MKR',
      tokenCoingecko: 'maker',
    },
  });
}
