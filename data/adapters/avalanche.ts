import { CryptoStatsSDK } from '@cryptostats/sdk';
import { RegisterFunction } from '../types';

async function getBalance(block: string, sdk: CryptoStatsSDK) {
  const res = await sdk.http.post('https://api.avax.network/ext/bc/C/rpc', {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: ['0x0100000000000000000000000000000000000000', block],
  });

  return parseInt(res.result, 16) / 1e18;
}

async function getChainFees(chain: string, date: string, sdk: CryptoStatsSDK) {
  const chainIDs = {
    P: '11111111111111111111111111111111LpoYY',
    C: '2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5',
    X: '2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM',
  };

  const startDate = new Date(date).toISOString();
  const endDate = new Date(sdk.date.offsetDaysFormatted(date, 1)).toISOString();
  const dayAggregate = await sdk.http.get(
    `https://explorerapi.avax.network/v2/txfeeAggregates?startTime=${startDate}&endTime=${endDate}&chainID=${chainIDs[chain]}`
  );

  return parseFloat(dayAggregate.aggregates.txfee) / 1e9;
}

async function getCChainFees(date: string, sdk: CryptoStatsSDK) {
  const [blockYesterday, blockToday] = await Promise.all([
    sdk.chainData.getBlockNumber(date, 'avalanche'),
    sdk.chainData.getBlockNumber(sdk.date.offsetDaysFormatted(date, 1), 'avalanche'),
  ]);

  const [currentBalance, previousBalance] = await Promise.all([
    getBalance('0x' + blockToday.toString(16), sdk),
    getBalance('0x' + blockYesterday.toString(16), sdk),
  ]);

  const txFees = currentBalance - previousBalance;
  const atomicFees = await getChainFees('C', date, sdk);

  return txFees + atomicFees;
}

function getXChainFees(date: string, sdk: CryptoStatsSDK) {
  return getChainFees('X', date, sdk);
}

function getPChainFees(date: string, sdk: CryptoStatsSDK) {
  return getChainFees('P', date, sdk);
}

export async function getAvalancheData(date: string, sdk: CryptoStatsSDK): Promise<number> {
  const [price, cFees, xFees, pFees] = await Promise.all([
    sdk.coinGecko.getHistoricalPrice('avalanche-2', date),
    getCChainFees(date, sdk),
    getXChainFees(date, sdk),
    getPChainFees(date, sdk),
  ]);

  const feesUSD = price * (cFees + xFees + pFees);

  return feesUSD;
}

export default function registerAvalanche(register: RegisterFunction, sdk: CryptoStatsSDK) {
  const avalancheQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Avalanche doesn't support ${attribute}`);
    }
    return getAvalancheData(date, sdk);
  };

  register('avalanche', avalancheQuery, {
    name: 'Avalanche',
    category: 'l1',
    description: 'Avalanche is a platform for inter-connected blockchains.',
    feeDescription: 'Transaction fees are burned.',
    source: 'Ava Labs',
    adapter: 'avalanche',
    website: 'https://avalabs.org',
    tokenTicker: 'AVAX',
    tokenCoingecko: 'avalanche-2',
    protocolLaunch: '2020-09-22',
    tokenLaunch: '2020-09-22',
  });
}
