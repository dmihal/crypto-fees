import React from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { FeeData } from 'data/adapters/feeData';
import { getHistoricalData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import List from 'components/List';
import Toolbar from 'components/Toolbar';

interface HistoricalDataPageProps {
  data: FeeData[];
  invalid?: boolean;
  date: string;
}

export const HistoricalDataPage: NextPage<HistoricalDataPageProps> = ({ data, date, invalid }) => {
  const router = useRouter();

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
        date={new Date(date)}
        onDateChange={(newDate: Date) => router.push(`/history/${formatDate(newDate)}`)}
      />

      <List data={data} />

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

  return { props: { data: filteredData, date: params.date.toString() } };
};

export default HistoricalDataPage;
