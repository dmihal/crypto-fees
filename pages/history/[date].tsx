import React, { useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ProtocolData } from 'data/types';
import { getHistoricalData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import List from 'components/List';
import Toolbar from 'components/Toolbar';
import FilterCard, { Filters } from 'components/FilterCard';
import fs from 'fs';

interface HistoricalDataPageProps {
  data: ProtocolData[];
  invalid?: boolean;
  date: string;
}

const toggle = (_val: boolean) => !_val;

export const HistoricalDataPage: NextPage<HistoricalDataPageProps> = ({ data, invalid }) => {
  const router = useRouter();

  const [filterCardOpen, setFilterCardOpen] = useState(false);
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

  if (invalid) {
    return (
      <div>
        <p>Invalid date</p>
      </div>
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
      />

      <FilterCard
        open={filterCardOpen}
        filters={filters}
        onFilterChange={(_filters: Filters) => setFilters(_filters)}
      />

      <List data={_data} />

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

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!/20\d{2}-\d{2}-\d{2}/.test(params.date.toString())) {
    return { props: { data: [], invalid: true } };
  }

  const data = await getHistoricalData(params.date.toString());
  const filteredData = data.filter((val: any) => !!val);

  return { props: { data: filteredData, date: params.date.toString(), file: fs.readdirSync(process.cwd()), dir: process.cwd() } };
};

export default HistoricalDataPage;
