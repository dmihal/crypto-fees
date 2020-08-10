import React, { useState } from 'react';
import Head from 'next/head';
import { NextPage, GetServerSideProps } from 'next';
import { FeeData, getFeeData, getUniswapV1Data, getUniswapV2Data } from 'data/feeData';

interface HomeProps {
  data: FeeData[];
}

const sortByDaily = (a: FeeData, b: FeeData) => b.oneDay - a.oneDay;
const sortByWeekly = (a: FeeData, b: FeeData) => b.sevenDayMA - a.sevenDayMA;

const ASSETS = ['eth', 'btc', 'ltc', 'ada', 'xtz', 'bsv', 'bch', 'xrp'];

export const Home: NextPage<HomeProps> = ({ data }) => {
  const [sort, setSort] = useState('weekly');

  const sortedData = data.sort(sort === 'weekly' ? sortByWeekly : sortByDaily);
  return (
    <div className="container">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">Crypto Fee Stats</h1>

        <p className="description">
          There's tons of crypto projects. Which ones are people actually paying to use?
        </p>

        <pre>{JSON.stringify(data, null, '  ')}</pre>

        <button onClick={() => setSort(sort === 'weekly' ? 'daily' : 'weekly')}>
          Showing {sort === 'weekly' ? '7 day average' : 'previous day'}
        </button>

        <ul>
          {sortedData.map((item: FeeData) => (
            <li key={item.id}>
              {item.id}: ${(sort === 'weekly' ? item.sevenDayMA : item.oneDay).toLocaleString()}
            </li>
          ))}
        </ul>
      </main>

      <footer>
        Network data from CoinMetrics.
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
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
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};


export const getServerSideProps: GetServerSideProps = async () => {
  const assetData = await Promise.all(ASSETS.map(getFeeData));
  const [uniswapV1, uniswapV2] = await Promise.all([
    getUniswapV1Data(),
    getUniswapV2Data(),
  ]);

  const data = [...assetData, uniswapV1, uniswapV2];

  return { props: { data } };
};

export default Home
