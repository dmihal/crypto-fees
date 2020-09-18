import React, { useEffect } from 'react';
import Head from 'next/head';
import { NextPage, GetServerSideProps } from 'next';
import { FeeData, getFeeData, getUniswapV1Data, getUniswapV2Data, getSushiswapData } from 'data/feeData';
import { getBalancerData } from 'data/balancer';
import { getCurveData } from 'data/curve';
import { get0xData } from 'data/zerox';
import List from 'components/List';
import ReactGA from 'react-ga';

interface HomeProps {
  data: FeeData[];
}

const ASSETS = ['eth', 'btc', 'ltc', 'ada', 'xtz', 'bsv', 'bch', 'xrp', 'doge', 'xmr', 'xlm', 'bnb_mainnet'];

ReactGA.initialize("UA-150445352-3")

export const Home: NextPage<HomeProps> = ({ data }) => {
  useEffect(() => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Crypto Fees</title>
        <link rel="icon" href="/favicon.png" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet" />
      
        <meta property="og:title" content="Crypto Fees" />
        <meta property="og:image" content="https://cryptofees.info/api/screenshot" />
        <meta property="og:description" content="There's tons of crypto projects. Which ones are people actually paying to use?" />

        <meta name="twitter:title" content="Crypto Fees" />
        <meta name="twitter:description" content="There's tons of crypto projects. Which ones are people actually paying to use?" />
        <meta name="twitter:image" content={`https://cryptofees.info/api/screenshot?${(new Date()).getDate()}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <main>
        <h1 className="title">Crypto Fees</h1>

        <p className="description">
          There's tons of crypto projects.<br />
          Which ones are people actually paying to use?
        </p>

        <div>
          <a href="https://twitter.com/share?ref_src=twsrc%5Etfw" className="twitter-share-button" data-show-count="true">Tweet</a>
          <script async src="https://platform.twitter.com/widgets.js"></script>
        </div>

        <List data={data} />
      </main>

      <footer>
        <div>Data updates at midnight, UTC</div>
        <div>Network data from CoinMetrics, application data from The Graph</div>
        <div>Application data does not include Ethereum transaction fees</div>
        <div>Created by <a href="https://twitter.com/dmihal" target="twitter">David Mihal</a></div>
        <div>Design help from <a href="https://twitter.com/hey_heey_heeey" target="twitter">@heyheeyheeey</a></div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 2rem 0 3rem;
          flex: 1;
          display:flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: auto;
          border-top: 1px solid lightGray;
          text-align: center;
          padding: 2rem 0;
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
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'Noto Sans TC', sans-serif;
          background: #eeeeee;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};


export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [assetData, uniswapV1, uniswapV2, sushiswap, balancer, zerox, curve] = await Promise.all([
    Promise.all(ASSETS.map(getFeeData)),
    getUniswapV1Data(),
    getUniswapV2Data(),
    getSushiswapData(),
    getBalancerData(),
    get0xData(),
    getCurveData(),
  ]);

  const data = [...assetData, uniswapV1, uniswapV2, balancer, curve, sushiswap, zerox];

  if (res) {
    res.setHeader('Cache-Control', 's-maxage=1800');
  }

  return { props: { data } };
};

export default Home
