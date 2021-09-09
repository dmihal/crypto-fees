import React, { useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { usePlausible } from 'next-plausible';
import { ProtocolData, Metadata } from 'data/types';
import { getBundle } from 'data/adapters';
import { getData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import { filterCategories, filterChains, bundleItems } from 'data/utils';
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

export const Home: NextPage<HomeProps> = ({ data, bundles }) => {
  const plausible = usePlausible();
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

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <Toolbar
        onDateChange={(newDate: string) =>
          router.push(`/history/${newDate}`, null, { scroll: false })
        }
        onFilterToggle={() => setFilterCardOpen(toggle)}
        numFilters={numFilters}
        bundle={bundling}
        onBundleChange={setBundling}
        onShare={() => {
          setShareOpen(true);
          plausible('open-share');
        }}
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

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
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
