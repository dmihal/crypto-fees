import React, { useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { ProtocolData, Metadata } from 'data/types';
import { getBundle } from 'data/adapters';
import { getData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import FilterCard, { Filters, allCategories, allChains } from 'components/FilterCard';
import List from 'components/List';
import ShareModal from 'components/ShareModal';
import SocialTags from 'components/SocialTags';
import Toolbar from 'components/Toolbar';

interface HomeProps {
  data: ProtocolData[];
  bundles: { [id: string]: Metadata };
}

const toggle = (_val: boolean) => !_val;

const filterListToLabel = (list: any[], ids: string[]) =>
  list
    .filter((item: any) => ids.indexOf(item.id) !== -1)
    .map((item: any) => item.name)
    .join(', ');

export const Home: NextPage<HomeProps> = ({ data, bundles }) => {
  const router = useRouter();
  const [filterCardOpen, setFilterCardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [bundling, setBundling] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  let _data = [...data];
  let numFilters = 0;
  const tags = [];
  if (filters.categories) {
    numFilters += 1;
    _data = _data.filter((item: ProtocolData) => filters.categories.indexOf(item.category) !== -1);
    tags.push({
      id: 'categories',
      label: filterListToLabel(allCategories, filters.categories),
    });
  }
  if (filters.chains) {
    numFilters += 1;
    _data = _data.filter((item: ProtocolData) =>
      item.blockchain
        ? filters.chains.indexOf(item.blockchain) !== -1
        : filters.chains.indexOf('other') !== -1
    );
    tags.push({
      id: 'chains',
      label: filterListToLabel(allChains, filters.chains),
    });
  }

  for (let i = 0; i < _data.length; i += 1) {
    const item = _data[i];
    if (bundling && item.bundle) {
      const bundleItems = [item];

      for (let j = i + 1; j < _data.length; j += 1) {
        if (_data[j].bundle === item.bundle) {
          bundleItems.push(_data[j]);
        }
      }

      if (bundleItems.length > 1) {
        const bundleMetadata = bundles[item.bundle as string];
        let oneDay = 0;
        let sevenDayMA = 0;
        let price = null;
        let marketCap = null;

        for (const bundleItem of bundleItems) {
          _data.splice(_data.indexOf(bundleItem), 1);
          oneDay += bundleItem.oneDay;
          sevenDayMA += bundleItem.sevenDayMA;

          if (bundleMetadata.tokenCoingecko === bundleItem.tokenCoingecko) {
            price = bundleItem.price;
            marketCap = bundleItem.marketCap;
          }
        }
        _data.push({
          ...bundleMetadata,
          id: item.bundle,
          oneDay,
          sevenDayMA,
          bundleData: bundleItems,
          price,
          marketCap,
          psRatio: marketCap ? marketCap / (sevenDayMA * 365) : null,
        });
      }
    }
  }

  return (
    <main>
      <SocialTags />

      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <label>
        <input
          type="checkbox"
          checked={bundling}
          onChange={(e: any) => setBundling(e.target.checked)}
        />
        Bundling
      </label>

      <Toolbar
        onDateChange={(newDate: string) =>
          router.push(`/history/${newDate}`, null, { scroll: false })
        }
        onFilterToggle={() => setFilterCardOpen(toggle)}
        numFilters={numFilters}
        onShare={() => setShareOpen(true)}
        tags={tags}
        onTagRemoved={(tagId: string) => setFilters({ ...filters, [tagId]: undefined })}
      />

      <FilterCard
        open={filterCardOpen}
        filters={filters}
        onFilterChange={(_filters: Filters) => setFilters(_filters)}
      />

      <List data={_data} />

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        data={_data}
        date={formatDate(new Date())}
      />

      <style jsx>{`
        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
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

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const data = await getData();

  const bundles: { [id: string]: Metadata } = {};
  const filteredData = data.filter((val: any) => {
    // This is unrelated to filtering, but no need to loop twice
    if (val && val.bundle) {
      bundles[val.bundle] = getBundle(val.bundle);
    }

    return !!val;
  });

  return { props: { data: filteredData, bundles }, revalidate: 5 * 60 };
};

export default Home;
