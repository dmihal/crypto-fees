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
  {
    id: 'ada',
    name: 'Cardano',
    description: 'Cardano is a PoS blockchain which will support smart contracts in the future.',
    feeDescription: 'Transaction fees are paid by users to validators.',
  },
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
  }
]

export function getL1FeeData(): Promise<FeeData[]> {
  return Promise.all(l1s.map(async (protocol: any) => ({
    ...protocol,
    ...(await getFeeData(protocol.id)),
  })));
}

async function getFeeData(id: string): Promise<FeeData> {
  const startDate = new Date(Date.now() - 86400 * 1000 * 7);
  const startDateString = `${startDate.getFullYear()}-${(startDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;
  const request = await fetch(
    `https://community-api.coinmetrics.io/v2/assets/${id}/metricdata?metrics=FeeTotUSD&start=${startDateString}`
  );
  const { metricData } = await request.json();
  const sevenDayMA =
    metricData.series.reduce(
      (total: number, value: any) => total + parseFloat(value.values[0]),
      0
    ) / metricData.series.length;

  return {
    category: 'l1',
    sevenDayMA,
    oneDay: parseFloat(metricData.series[metricData.series.length - 1].values[0]),
    source: 'CoinMetrics',
    adapter: 'coinmetrics',
  };
}
