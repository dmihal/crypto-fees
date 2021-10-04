import { dateToTimestamp } from 'data/lib/time';
import { Category, RegisterFunction } from 'data/types';
import icon from 'icons/aave.svg';

const rootURI = 'https://info.aaw.fi';

// Simple caching wrapper around thegraph
// https://github.com/sakulstra/info.aave/blob/main/app/fees/queries/getFees.ts#L91
const fetcher = async (date: string, poolId: string) => {
  const res = await fetch(`${rootURI}/api/fees/queries/getFees`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      params: { timestamp: dateToTimestamp(date), poolId, forceRefresh: true },
    }),
  });
  if (res.status !== 200) throw new Error('aave did return an error');
  const json = await res.json();
  if (!json.result || json.error) throw new Error('aave api did return no result');
  return json.result;
};

async function getAaveV1ProtoData(date: string): Promise<number> {
  const response = await fetcher(date, '0x24a42fd28c976a61df5d00d0599c34c4f90748c8');

  if (response.error) {
    throw new Error(response.error);
  }
  return parseFloat(response?.last24hFees);
}

async function getAaveV2ProtoData(date: string): Promise<number> {
  const response = await fetcher(date, '0xb53c1a33016b2dc2ff3653530bff1848a515c8c5');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.last24hFees);
}

async function getAaveV2AmmData(date: string): Promise<number> {
  const response = await fetcher(date, '0xacc030ef66f9dfeae9cbb0cd1b25654b82cfa8d5');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.last24hFees);
}

async function getAavePolygonData(date: string): Promise<number> {
  const response = await fetcher(date, '0xd05e3e715d945b59290df0ae8ef85c1bdb684744');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.last24hFees);
}

async function getAaveAvalancheData(date: string): Promise<number> {
  const response = await fetcher(date, '0xb6a86025f0fe1862b372cb0ca18ce3ede02a318f');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.last24hFees);
}

export default function registerAave(register: RegisterFunction) {
  const query = (adapter: (date: string) => Promise<number>) => (
    attribute: string,
    date: string
  ) => {
    if (attribute !== 'fee') {
      throw new Error(`Aave doesn't support ${attribute}`);
    }
    return adapter(date);
  };

  const aaveMetadata = {
    icon,
    bundle: 'aave',
    name: 'Aave',
    category: 'lending' as Category,
    description:
      'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
    feeDescription:
      'Fees are accrued from the dynamics of providing liquidity and borrowing, going to liquidity suppliers and the Aave DAO treasury.',
    blockchain: 'Ethereum',
    source: 'The Graph Protocol',
    adapter: 'aave',
    website: 'https://aave.com',
    tokenTicker: 'AAVE',
    tokenCoingecko: 'aave',
    tokenLaunch: '2020-09-14', // TODO: add real token launch data
    protocolLaunch: '2020-01-08',
  };

  register('aave-v1', query(getAaveV1ProtoData), {
    ...aaveMetadata,
    subtitle: 'Version 1',
    protocolLaunch: '2020-01-08',
  });
  register('aave-v2', query(getAaveV2ProtoData), {
    ...aaveMetadata,
    subtitle: 'Version 2',
    protocolLaunch: '2020-12-03',
  });
  register('aave-v2-amm', query(getAaveV2AmmData), {
    ...aaveMetadata,
    subtitle: 'Version 2 - AMM',
    protocolLaunch: '2021-03-08',
  });
  register('aave-v2-polygon-proto', query(getAavePolygonData), {
    ...aaveMetadata,
    subtitle: 'Version 2 - Polygon',
    protocolLaunch: '2021-03-31',
    blockchain: 'Polygon',
  });
  register('aave-v2-avalanche-proto', query(getAaveAvalancheData), {
    ...aaveMetadata,
    subtitle: 'Version 2 - Avalanche',
    protocolLaunch: '2021-10-04',
    blockchain: 'Avalanche',
  });

  register.bundle('aave', aaveMetadata);
}
