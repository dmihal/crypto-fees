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

interface HomeProps {
  data: ProtocolData[];
  bundles: { [id: string]: any };
}

const toggle = (_val: boolean) => !_val;

export const Home: NextPage<HomeProps> = ({ data, bundles }) => {
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

      <Toolbar
        onFilterToggle={() => setFilterCardOpen(toggle)}
        numFilters={numFilters}
        bundle={bundling}
        onBundleChange={setBundling}
        tags={tags}
        onTagRemoved={(tagId: string) => setFilters({ ...filters, [tagId]: undefined })}
      />

      <FilterCard
        open={filterCardOpen}
        filters={filters}
        onFilterChange={(_filters: Filters) => setFilters(_filters)}
      />

      <YearList data={_data} />

      <style jsx>{`
        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
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

  for await (const line of rl) {
    const [, , /* _date */ fee, id] = line.split(',');
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
    }
  }

  const data = Object.values(yearTotals);

  return { props: { data, bundles } };
};

export default Home;
