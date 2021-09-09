import React, { useState } from 'react';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { usePlausible } from 'next-plausible';
import { getBundle } from 'data/adapters';
import { ProtocolData, Metadata } from 'data/types';
import { getHistoricalData } from 'data/queries';
import { filterCategories, filterChains, bundleItems } from 'data/utils';
import { isBefore } from 'data/lib/time';
import List from 'components/List';
import Toolbar from 'components/Toolbar';
import FilterCard, { Filters, allChains, allCategories } from 'components/FilterCard';
import { last7Days } from 'data/lib/time';
import ShareModal from 'components/ShareModal';
import SocialTags from 'components/SocialTags';

interface HistoricalDataPageProps {
  data: ProtocolData[];
  invalid?: boolean;
  date: string;
  bundles: { [id: string]: Metadata };
}

const toggle = (_val: boolean) => !_val;

export const HistoricalDataPage: NextPage<HistoricalDataPageProps> = ({
  data,
  invalid,
  date,
  bundles,
}) => {
  const plausible = usePlausible();
  const router = useRouter();

  const [bundling, setBundling] = useState(true);
  const [filterCardOpen, setFilterCardOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [shareOpen, setShareOpen] = useState(false);

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

  if (invalid) {
    return (
      <div>
        <p>Invalid date</p>
      </div>
    );
  }

  return (
    <main>
      <Head>
        <title key="title">{date} - CryptoFees.info</title>
      </Head>

      <SocialTags title={date} query={`date=${date}`} />

      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <Toolbar
        date={new Date(date)}
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

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} data={_data} date={date} />

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

export const getStaticProps: GetStaticProps<HistoricalDataPageProps> = async ({ params }) => {
  const date = params.date.toString();

  if (!/20\d{2}-\d{2}-\d{2}/.test(params.date.toString())) {
    return { props: { date: '', data: [], invalid: true, bundles: {} } };
  }

  if (!isBefore(date)) {
    return { props: { date, data: [], invalid: true, bundles: {} } };
  }

  const data = await getHistoricalData(params.date.toString());

  const bundles: { [id: string]: Metadata } = {};

  const filteredData = data.filter((val: any) => {
    // This is unrelated to filtering, but no need to loop twice
    if (val && val.bundle) {
      bundles[val.bundle] = getBundle(val.bundle);
    }

    return !!val;
  });

  return {
    props: {
      date,
      data: filteredData,
      bundles,
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: last7Days().map((date: string) => ({ params: { date } })),
    fallback: 'blocking',
  };
};

export default HistoricalDataPage;
