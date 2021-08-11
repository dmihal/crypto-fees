import { Category, RegisterFunction } from 'data/types';
import icon from 'icons/aave.svg';

const fetcher = async (date: string, version: string) => {
  const res = await fetch('https://aave-api-v2.aave.com/data/daily-fees', {
    method: 'GET',
    body: JSON.stringify({ date, version }),
  });
  if (res.status !== 200) throw new Error('aave did return an error');
  return res.json();
};

async function getAaveV1Data(date: string): Promise<number> {
  const response = await fetcher(date, 'v1');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.lastDayUTCFees);
}

async function getAaveV2Data(date: string): Promise<number> {
  const response = await fetcher(date, 'v2');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.lastDayUTCFees);
}

async function getAavePolygonData(date: string): Promise<number> {
  const response = await fetcher(date, 'polygon');

  if (response.error) {
    throw new Error(response.error);
  }

  return parseFloat(response?.lastDayUTCFees);
}

export default function registerAave(register: RegisterFunction) {
  const query = (adapter: (date: string) => Promise<number>) => (
    attribute: string,
    date: string
  ) => {
    if (attribute !== 'fee') {
      throw new Error(`Uniswap doesn't support ${attribute}`);
    }
    return adapter(date);
  };

  const aaveMetadata = {
    icon,
    bundle: 'aave',
    name: 'Aave',
    category: 'lending' as Category,
    description: 'Aave is an open borrowing & lending protocol.',
    feeDescription: 'Interest fees are paid from borrowers to lenders.',
    blockchain: 'Ethereum',
    source: 'Aave',
    adapter: 'aave',
    website: 'https://aave.com',
    tokenTicker: 'AAVE',
    tokenCoingecko: 'aave',
    tokenLaunch: '2020-09-14', // TODO: add real token launch data
    protocolLaunch: '2020-01-08',
  };

  register('aave-v1', query(getAaveV1Data), {
    ...aaveMetadata,
    subtitle: 'Aave V1',
    protocolLaunch: '2020-01-08',
  });
  register('aave-v2', query(getAaveV2Data), {
    ...aaveMetadata,
    subtitle: 'Aave V2',
    protocolLaunch: '2020-12-03',
  });
  register('aave-polygon', query(getAavePolygonData), {
    ...aaveMetadata,
    subtitle: 'Aave V2 Polygon',
    protocolLaunch: '2021-03-31',
    blockchain: 'Polygon',
  });

  register.bundle('aave', aaveMetadata);
}
