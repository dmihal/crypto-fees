import React, { useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
import fs from 'fs';
import readline from 'readline';
import { ProtocolData } from 'data/types';
import { filterCategories, filterChains, bundleItems } from 'data/utils';
import FilterCard, { Filters, allCategories, allChains } from 'components/FilterCard';
import YearList from 'components/year/YearList';
import SocialTags from 'components/SocialTags';
import Toolbar from 'components/Toolbar';
import { ensureListLoaded, getBundle, getMetadata } from 'data/adapters';
import Chart, { FeeItem } from 'components/Chart';
import sdk from 'data/sdk';

interface HomeProps {
  data: ProtocolData[];
  bundles: { [id: string]: any };
  charts: any;
}

const toggle = (_val: boolean) => !_val;

export const Home: NextPage<HomeProps> = ({ data, bundles, charts }) => {
  const [filterCardOpen, setFilterCardOpen] = useState(false);
  const [bundling, setBundling] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  let _data = [...data];
  let numFilters = 0;
  const tags = [];
  if (filters.categories) {
    numFilters += 1;
    let tag;
    ({ data: _data, tag } = filterCategories(_data, filters.categories, allCategories));
    tags.push(tag);
  }
  if (filters.chains) {
    numFilters += 1;
    let tag;
    ({ data: _data, tag } = filterChains(_data, filters.chains, allChains));
    tags.push(tag);
  }

  if (bundling) {
    _data = bundleItems(_data, bundles);
  }

  return (
    <main>
      <SocialTags />

      <h1 className="title">Crypto Fees</h1>

      <p className="description">What did people pay to use in 2021?</p>

      <div className="toolbar-container">
        <Toolbar
          onFilterToggle={() => setFilterCardOpen(toggle)}
          numFilters={numFilters}
          bundle={bundling}
          onBundleChange={setBundling}
          tags={tags}
          onTagRemoved={(tagId: string) => setFilters({ ...filters, [tagId]: undefined })}
        />
      </div>

      <FilterCard
        open={filterCardOpen}
        filters={filters}
        onFilterChange={(_filters: Filters) => setFilters(_filters)}
      />

      <YearList data={_data} />

      <p>
        2021 has been an explosive year for cryptocurrencies and blockchain technologies. As assets
        began {}
        crossing all-time-highs, new users began rushing in to try out DeFi, NFTs, and more.
      </p>
      <p>
        As we prepare for another crazy year in crypto, let&apos;s take a look back at some
        interesting trends that {}
        we can see in the 2021 fee data.
      </p>

      <h2>Ethereum fees take off</h2>
      <p>Test</p>

      <Chart data={charts.eth} primary="eth" protocols={{ eth: 'Ethereum' }} />

      <h2>Native-asset yield farming</h2>
      <p>
        In 2020, the period now known as &quot;DeFi Summer&quot; saw explosive growth in DeFi
        applications. {}
        Key to this growth was &quot;yield farming&quot;, also known as &quot;liquidity
        mining&quot;, where DeFi protocols {}
        would use token issuance to incentivize liquidity and other capital lockups.
      </p>
      <p>
        While yield farming remains an important primitive of the DeFi ecosystem, 2021 saw these
        farms {}
        augmented with native assets. Polygon, Avalanche and Fantom all allocated substantial
        amounts {}
        of their token supply towards rewards for providing liquidity on decentralized exchanges,
        lending {}
        markets, and more.
      </p>

      <Chart
        data={charts['avalanche-c-chain'].slice(150, 250)}
        primary="avalanche-c-chain"
        protocols={{ 'avalanche-c-chain': 'Avalanche' }}
        events={[
          {
            date: '2021-08-18',
            description: '"Avalanche Rush" liquidity mining program announced',
          },
        ]}
      />
      <div>Avalanche</div>

      <Chart
        data={charts.fantom.slice(180, 300)}
        primary="fantom"
        protocols={{ fantom: 'Fantom' }}
        events={[
          {
            date: '2021-08-30',
            description: '370m FTM incentive program announced',
          },
        ]}
      />
      <div>Fantom</div>

      <h2>Low individual fees, high total fees</h2>
      <p>Test</p>

      <Chart
        data={charts.bsc.slice(0, 140)}
        primary="bsc"
        protocols={{ bsc: 'Binance Smart Chain' }}
      />

      <style jsx>{`
        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .title {
          margin: 0 0 16px;
          line-height: 1.15;
          font-size: 4rem;
          font-weight: 700;
        }

        .title,
        .description {
          text-align: center;
          max-width: 800px;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
          margin: 4px 0 20px;
        }

        .toolbar-container {
          max-width: 600px;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </main>
  );
};

/*
 * Looking for the data source?
 *
 * This site pulls data from the CryptoStats protocol
 * Visit https://cryptostats.community/discover/fees to see the code for these adapters
 */
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  await ensureListLoaded();

  const fileStream = fs.createReadStream('./data/cryptofees_yearly.csv');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const yearTotals: { [name: string]: ProtocolData } = {};
  const bundles: { [id: string]: any } = {};

  const charts: any = {
    bsc: [],
    eth: [],
    'avalanche-c-chain': [],
    'uniswap-v3': [],
    'uniswap-v2': [],
    fantom: [],
  };

  for await (const line of rl) {
    const [, date, fee, id] = line.split(',');
    if (fee.length > 0 && id !== 'id') {
      if (yearTotals[id]) {
        yearTotals[id].oneDay += parseFloat(fee);
      } else {
        yearTotals[id] = {
          id: id,
          oneDay: parseFloat(fee),
          ...getMetadata(id),
        };

        if (yearTotals[id].bundle) {
          bundles[yearTotals[id].bundle] = getBundle(yearTotals[id].bundle);
        }
      }

      if (charts[id]) {
        const chartData: FeeItem = {
          date: sdk.date.dateToTimestamp(date),
          primary: parseFloat(fee),
          secondary: null,
        };
        charts[id].push(chartData);
      }
    }
  }

  const data = Object.values(yearTotals);

  return { props: { data, bundles, charts } };
};

export default Home;
