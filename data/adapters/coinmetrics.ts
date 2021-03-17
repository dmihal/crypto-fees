const l1s = [
  {
    id: 'eth',
    name: 'Ethereum',
    description: 'Ethereum is the first blockchain for turing-complete smart contracts.',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    description: 'Bitcoin is the first decentralized cryptocurrency.',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    description: 'Litecoin is cryptocurrency based on a fork of the Bitcoin Core codebase.',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  // {
  //   id: 'ada',
  //   name: 'Cardano',
  //   description: 'Cardano is a PoS blockchain which will support smart contracts in the future.',
  //   feeDescription: 'Transaction fees are paid by users to validators.',
  // },
  {
    id: 'xtz',
    name: 'Tezos',
    description: 'Tezos is a PoS blockchain that supports smart contracts',
    feeDescription: 'Transaction fees are paid by users to validators (bakers).',
  },
  {
    id: 'bsv',
    name: 'Bitcoin SV',
    description: 'Bitcoin SV is a fork of the Bitcoin Cash blockchain',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'bch',
    name: 'Bitcoin Cash',
    description: 'Bitcoin Cash is a fork of the Bitcoin blockchain',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'xrp',
    name: 'Ripple',
    description: 'Ripple is a payment & settlment platform.',
    feeDescription: 'Transaction fees are paid by users and burned.',
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    description: 'Dogecoin is a cryptocurrency based on the "Doge" meme.',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'xmr',
    name: 'Monero',
    description: 'Monero is a privacy-focused cryptocurrency.',
    feeDescription: 'Transaction fees are paid by users to miners.',
  },
  {
    id: 'xlm',
    name: 'Stellar',
    description: 'Stellar is global payment network.',
    feeDescription: 'Transaction fees are paid by users into a pool.',
  },
  {
    id: 'bnb_mainnet',
    name: 'Binance Chain',
    description: 'Binance Chain is a blockchain for trading and exchanging assets.',
    feeDescription: 'Transaction fees and trading fees are paid by users to validators.',
  },
];

async function getCoinMetricsData(id: string, date: string): Promise<number> {
  const request = await fetch(
    `https://community-api.coinmetrics.io/v2/assets/${id}/metricdata?metrics=FeeTotUSD&start=${date}&end=${date}`
  );
  const { metricData } = await request.json();

  return parseFloat(metricData.series[0].values[0]);
}

export default function registerCoinMetrics(register: any) {
  l1s.map(({ id, ...metadata }: any) => {
    const query = (attribute: string, date: string) => {
      if (attribute !== 'fee') {
        throw new Error(`Synthetix doesn't support ${attribute}`);
      }
      return getCoinMetricsData(id, date);
    };

    register(id, query, metadata);
  });
}
