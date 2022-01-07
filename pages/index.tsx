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
import Link from 'next/link';
import { ChevronRight } from 'react-feather';

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

      <Link href="/2021">
        <a className="cta">
          <div style={{ fontWeight: 'bold', marginRight: '8px' }}>2021 in Fees 🎉🗓</div>
          <div>Check out the total fees spent in 2021, and what trends we can see from them</div>
          <ChevronRight />
        </a>
      </Link>

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

        .cta {
          text-decoration: none;
          background: #fad3f6;
          padding: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          color: #4b0c56;
        }

        .cta:hover {
          background: #edbce8;
        }

        :global(body) {
          margin-top: 56px !important;
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
