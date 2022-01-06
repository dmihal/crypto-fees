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
import { ArrowLeft } from 'react-feather';
import Link from 'next/link';

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
      <SocialTags title="2021 in Fees" image="/2021.png" />

      <h1 className="title">2021 in Fees</h1>

      <p className="description">What did people pay to use in 2021?</p>

      <div className="back-container">
        <Link href="/">
          <a>
            <ArrowLeft size={14} /> Back to list
          </a>
        </Link>
      </div>

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
        began crossing all-time-highs, new users began rushing in to try out DeFi, NFTs, and more.
      </p>
      <p>
        As we prepare for another crazy year in crypto, let&apos;s take a look back at some
        interesting trends that we can see in the 2021 fee data.
      </p>

      <h2>Ethereum fees take off</h2>
      <p>
        We can&apos;t talk about fees in 2021 without mentioning Ethereum&apos;s massive revenue
        numbers. Ethereum&apos;s fees peaked out on May 11th with over $117m, before slumping down
        for the summer.
      </p>

      <Chart data={charts.eth} primary="eth" protocols={{ eth: 'Ethereum' }} />
      <div className="label">Ethereum</div>

      <h2>Native-asset yield farming</h2>
      <p>
        In 2020, the period now known as &quot;DeFi Summer&quot; saw explosive growth in DeFi
        applications. Key to this growth was &quot;yield farming&quot;, also known as &quot;
        liquidity mining&quot;, where DeFi protocols would use token issuance to incentivize
        liquidity and other capital lockups.
      </p>
      <p>
        While yield farming remains an important primitive of the DeFi ecosystem, 2021 saw these
        farms augmented with native assets. Polygon, Avalanche and Fantom all allocated substantial
        amounts of their token supply towards rewards for providing liquidity on decentralized
        exchanges, lending markets, and more.
      </p>
      <p>
        The following charts show fees on Avalanche and Fantom, with the beginning of their
        liquidity incentives denoted by purple dots.
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
      <div className="label">Avalanche</div>

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
      <div className="label">Fantom</div>

      <h2>Tokens drive usage, even without incentives</h2>
      <p>
        While it seems intuitive that tokens drive usage of projects, the launch of the ENS token
        provides an interesting case study. The Ethereum Name Service (ENS) launched in 2017, and
        earns fees from the sale of .eth domain names. While the protocol showed considerable growth
        throughout 2021, the revenue spiked after the launch of the ENS governance token.
      </p>
      <p>
        In the month prior to the token launch, the protocol earned an average of $60k per day in
        fees. Even after the spike of usage had cooled off, the protocol still earned an average of
        $194k per day (over 3x growth). And unlike many other protocols, this token is not issued to
        incentivize growth.
      </p>

      <Chart
        data={charts.ens.slice(250, 360)}
        primary="ens"
        protocols={{ ens: 'ENS' }}
        events={[
          {
            date: '2021-11-09',
            description: 'ENS DAO & token launched',
          },
        ]}
      />
      <div className="label">ENS</div>

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

        h2 {
          margin-top: 50px;
        }

        p {
          max-width: 720px;
          font-size: 20px;
          color: #414046;
        }

        main :global(.recharts-responsive-container) {
          max-width: 900px;
        }

        main :global(.list) {
          margin-bottom: 20px;
        }

        .label {
          background: #fad3f6;
          padding: 8px 16px;
          margin: 18px;
          font-size: 14px;
        }

        .back-container {
          max-width: 600px;
          width: 100%;
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
    // 'uniswap-v3': [],
    // 'uniswap-v2': [],
    fantom: [],
    ens: [],
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
