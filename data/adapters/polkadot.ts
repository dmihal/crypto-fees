async function fetchJSON(url: string, data: any) {
  const request = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  const json = await request.json();
  return json;
}

async function getSubstrateData(id: string, date: string, divisor: number): Promise<number> {
  const [fees, prices] = await Promise.all([
    fetchJSON(`https://${id}.subscan.io/api/scan/daily`, {
      start: date,
      end: date,
      format: 'day',
      category: 'Fee',
    }),
    fetchJSON(`https://${id}.subscan.io/api/scan/price/history`, {
      start: date,
      end: date,
    }),
  ]);

  return (fees.data.list[0].balance_amount_total * prices.data.list[0].price) / divisor;
}

export default function registerPolkadot(register: any) {
  const polkadotQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Polkadot doesn't support ${attribute}`);
    }
    return getSubstrateData('polkadot', date, 10 ** 10);
  };

  const kusamaQuery = (attribute: string, date: string) => {
    if (attribute !== 'fee') {
      throw new Error(`Kusama doesn't support ${attribute}`);
    }
    return getSubstrateData('kusama', date, 10 ** 12);
  };

  register('polkadot', polkadotQuery, {
    name: 'Polkadot',
    category: 'l1',
    description: 'Polkadot is a protocol for securing and connecting blockchains.',
    feeDescription: 'Transaction fees are paid from users to validators.',
    blockchain: 'Polkadot',
    source: 'Subscan',
    adapter: 'polkadot',
    website: 'https://polkadot.network',
    tokenTicker: 'DOT',
    tokenCoingecko: 'polkadot',
  });

  register('kusama', kusamaQuery, {
    name: 'Kusama',
    category: 'l1',
    description: 'Kusama is the "canary chain for early-stage Polkadot development.',
    feeDescription: 'Transaction fees are paid from users to validators.',
    blockchain: 'Kusama',
    source: 'Subscan',
    adapter: 'polkadot',
    website: 'https://kusama.network',
    tokenTicker: 'KSM',
    tokenCoingecko: 'kusama',
  });
}
