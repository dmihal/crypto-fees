import { cacheMarketData } from '../lib/pricedata';

const l1s = [
  {
    id: 'eth',
    name: 'Ethereum',
    description: 'Ethereum is the first blockchain for turing-complete smart contracts.',
    feeDescription: 'Transaction fees are paid by users to miners.',
    tokenTicker: 'ETH',
    tokenCoingecko: 'ethereum',
    website: 'https://ethereum.org',
    blockchain: 'Ethereum',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    description: 'Bitcoin is the first decentralized cryptocurrency.',
    feeDescription: 'Transaction fees are paid by users to miners.',
    tokenTicker: 'BTC',
    tokenCoingecko: 'bitcoin',
    website: 'https://bitcoin.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    description: 'Litecoin is cryptocurrency based on a fork of the Bitcoin Core codebase.',
    feeDescription: 'Transaction fees are paid by users to miners.',
    website: 'https://litecoin.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'LTC',
    tokenCoingecko: 'litecoin',
  },
  {
    id: 'ada',
    name: 'Cardano',
    description: 'Cardano is a PoS blockchain which will support smart contracts in the future.',
    feeDescription: 'Transaction fees are paid by users to validators.',
    website: 'https://cardano.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'ADA',
    tokenCoingecko: 'cardano',
  },
  {
    id: 'xtz',
    name: 'Tezos',
    description: 'Tezos is a PoS blockchain that supports smart contracts',
    feeDescription: 'Transaction fees are paid by users to validators (bakers).',
    website: 'https://tezos.com',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'XTZ',
    tokenCoingecko: 'tezos',
  },
  {
    id: 'bsv',
    name: 'Bitcoin SV',
    description: 'Bitcoin SV is a fork of the Bitcoin Cash blockchain',
    feeDescription: 'Transaction fees are paid by users to miners.',
    website: 'https://bitcoinsv.com',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    // tokenTicker: 'BSV',
    // tokenCoingecko: 'bitcoin-sv',
  },
  {
    id: 'bch',
    name: 'Bitcoin Cash',
    description: 'Bitcoin Cash is a fork of the Bitcoin blockchain',
    feeDescription: 'Transaction fees are paid by users to miners.',
    website: 'https://bitcoincash.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'BCH',
    tokenCoingecko: 'bitcoin-cash',
  },
  {
    id: 'xrp',
    name: 'Ripple',
    description: 'Ripple is a payment & settlment platform.',
    feeDescription: 'Transaction fees are paid by users and burned.',
    website: 'https://ripple.com',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'XRP',
    tokenCoingecko: 'ripple',
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    description: 'Dogecoin is a cryptocurrency based on the "Doge" meme.',
    feeDescription: 'Transaction fees are paid by users to miners.',
    website: 'https://dogecoin.com',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'DOGE',
    tokenCoingecko: 'dogecoin',
  },
  {
    id: 'xmr',
    name: 'Monero',
    description: 'Monero is a privacy-focused cryptocurrency.',
    feeDescription: 'Transaction fees are paid by users to miners.',
    website: 'https://getmonero.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'XMR',
    tokenCoingecko: 'monero',
  },
  {
    id: 'xlm',
    name: 'Stellar',
    description: 'Stellar is global payment network.',
    feeDescription: 'Transaction fees are paid by users into a pool.',
    website: 'https://stellar.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'XLM',
    tokenCoingecko: 'stellar',
  },
  // {
  // id: 'bnb_mainnet',
  // name: 'Binance Chain',
  // description: 'Binance Chain is a blockchain for trading and exchanging assets.',
  // feeDescription: 'Transaction fees and trading fees are paid by users to validators.',
  // website: 'https://binance.com',
  // source: 'CoinMetrics',
  // adapter: 'coinmetrics',
  // tokenTicker: 'BNB',
  // tokenCoingecko: 'binance',
  // },
];

async function getCoinMetricsData(id: string, date: string, coinGecko?: string): Promise<number> {
  const request = await fetch(
    `https://community-api.coinmetrics.io/v2/assets/${id}/metricdata?metrics=FeeTotUSD,PriceUSD,CapMrktCurUSD&start=${date}&end=${date}`
  );
  const { metricData } = await request.json();

  if (!metricData.series[0]) {
    throw new Error(`Failed to fetch CoinMetrics data for ${id} on ${date}`);
  }

  if (coinGecko) {
    const price = parseFloat(metricData.series[0].values[1]);
    const marketCap = parseFloat(metricData.series[0].values[2]);
    await cacheMarketData(coinGecko, date, price, marketCap);
  }

  return parseFloat(metricData.series[0].values[0]);
}

export default function registerCoinMetrics(register: any) {
  l1s.map(({ id, ...metadata }: any) => {
    const query = (attribute: string, date: string) => {
      if (attribute !== 'fee') {
        throw new Error(`Synthetix doesn't support ${attribute}`);
      }
      return getCoinMetricsData(id, date, metadata.tokenCoingecko);
    };

    register(id, query, {
      ...metadata,
      category: 'l1',
    });
  });
}
