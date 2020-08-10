import React from 'react';
import Head from 'next/head';
import { NextPage, GetServerSideProps } from 'next';
import { FeeData, getFeeData, getUniswapV1Data, getUniswapV2Data } from 'data/feeData';
import List from 'components/List';

interface HomeProps {
  data: FeeData[];
}

const ASSETS = ['eth', 'btc', 'ltc', 'ada', 'xtz', 'bsv', 'bch', 'xrp'];

export const Home: NextPage<HomeProps> = ({ data }) => {
  return (
    <div className="container">
      <Head>
        <title>Crypto Fees</title>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet" />
      
        <meta property="og:title" content="Crypto Fees" />
        <meta property="og:image" content="https://cryptofees.info/screenshot.jpg" />
        <meta property="og:description" content="There's tons of crypto projects. Which ones are people actually paying to use?" />

        <meta name="twitter:title" content="Crypto Fees" />
        <meta name="twitter:description" content="There's tons of crypto projects. Which ones are people actually paying to use?" />
        <meta name="twitter:image" content="https://cryptofees.info/screenshot.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <h1 className="title">Crypto Fees</h1>

        <p className="description">
          There's tons of crypto projects. Which ones are people actually paying to use?
        </p>

        <List data={data} />
      </main>

      <footer>
        <div>Network data from CoinMetrics.</div>
        <div>Uniswap data from The Graph</div>
        <div>Uniswap data does not include Ethereum transaction fees</div>
        <div>Created by <a href="https://twitter.com/dmihal" target="twitter">David Mihal</a></div>
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
          text-align: center;
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
          font-family: 'Noto Sans TC', sans-serif;
          background: #aaaaaa;
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
