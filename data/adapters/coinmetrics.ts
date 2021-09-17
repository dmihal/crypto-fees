import { cacheMarketData } from '../lib/pricedata';
import ethIcon from 'icons/eth.svg';
import btcIcon from 'icons/btc.svg';
import ltcIcon from 'icons/ltc.svg';
import adaIcon from 'icons/ada.svg';
import xtzIcon from 'icons/xtz.svg';
import bsvIcon from 'icons/bsv.svg';
import bchIcon from 'icons/bch.svg';
import xrpIcon from 'icons/xrp.svg';
import dogeIcon from 'icons/doge.svg';
import xmrIcon from 'icons/xmr.svg';
import xlmIcon from 'icons/xlm.svg';

const l1s = [
  {
    id: 'eth',
    icon: ethIcon,
    name: 'Ethereum',
    description: 'Ethereum is the first blockchain for turing-complete smart contracts.',
    feeDescription: 'Transaction fees are partially burnt and partially paid to miners.',
    tokenTicker: 'ETH',
    tokenCoingecko: 'ethereum',
    website: 'https://ethereum.org',
    blockchain: 'Ethereum',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    events: [
      {
        date: '2021-08-05',
        description: 'London hard fork, including EIP-1559',
      },
    ],
  },
  {
    id: 'btc',
    icon: btcIcon,
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
    icon: ltcIcon,
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
    icon: adaIcon,
    name: 'Cardano',
    description: 'Cardano is a PoS blockchain which will support smart contracts in the future.',
    feeDescription: 'Transaction fees are paid by users to validators.',
    website: 'https://cardano.org',
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
    tokenTicker: 'ADA',
    tokenCoingecko: 'cardano',
    events: [
      {
        date: '2021-09-12',
        description: 'Alonzo upgrade introduces smart contracts',
      },
    ],
  },
  {
    id: 'xtz',
    icon: xtzIcon,
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
    icon: bsvIcon,
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
    icon: bchIcon,
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
    icon: xrpIcon,
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
    icon: dogeIcon,
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
    icon: xmrIcon,
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
    icon: xlmIcon,
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
