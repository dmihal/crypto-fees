import React, { useState } from 'react';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { ProtocolData } from 'data/types';
import { getData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import FilterCard, { Filters } from 'components/FilterCard';
import List from 'components/List';
import ShareModal from 'components/ShareModal';
import Toolbar from 'components/Toolbar';

interface HomeProps {
  data: ProtocolData[];
}

const toggle = (_val: boolean) => !_val;

export const Home: NextPage<HomeProps> = ({ data }) => {
  const router = useRouter();
  const [filterCardOpen, setFilterCardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  let _data = data;
  let numFilters = 0;
  if (filters.categories) {
    numFilters += 1;
    _data = _data.filter((item: ProtocolData) => filters.categories.indexOf(item.category) !== -1);
  }
  if (filters.chains) {
    numFilters += 1;
    _data = _data.filter((item: ProtocolData) =>
      item.blockchain
        ? filters.chains.indexOf(item.blockchain) !== -1
        : filters.chains.indexOf('other') !== -1
    );
  }

  return (
    <main>
      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <Toolbar
        onDateChange={(newDate: Date) =>
          router.push(`/history/${formatDate(newDate)}`, null, { scroll: false })
        }
        onFilterToggle={() => setFilterCardOpen(toggle)}
        numFilters={numFilters}
        onShare={() => setShareOpen(true)}
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
  const filteredData = data.filter((val: any) => !!val);

  return { props: { data: filteredData }, revalidate: 60 };
};

export default Home;
