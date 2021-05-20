import React, { useState } from 'react';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ProtocolData } from 'data/types';
import { getHistoricalData } from 'data/queries';
import { formatDate, isBefore } from 'data/lib/time';
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
}

const toggle = (_val: boolean) => !_val;

const filterListToLabel = (list: any[], ids: string[]) =>
  list
    .filter((item: any) => ids.indexOf(item.id) !== -1)
    .map((item: any) => item.name)
    .join(', ');

export const HistoricalDataPage: NextPage<HistoricalDataPageProps> = ({ data, invalid, date }) => {
  const router = useRouter();

  const [filterCardOpen, setFilterCardOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [shareOpen, setShareOpen] = useState(false);

  let _data = data;
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

      <SocialTags title={date} />

      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <Toolbar
        date={new Date(date)}
        onDateChange={(newDate: Date) =>
          router.push(`/history/${formatDate(newDate)}`, null, { scroll: false })
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const date = params.date.toString();

  if (!/20\d{2}-\d{2}-\d{2}/.test(params.date.toString())) {
    return { props: { data: [], invalid: true } };
  }

  if (!isBefore(date)) {
    return { props: { data: [], invalid: true } };
  }

  const data = await getHistoricalData(params.date.toString());
  const filteredData = data.filter((val: any) => !!val);

  return {
    props: {
      date,
      data: filteredData,
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
