import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import {
  FeeData,
  getFeeData,
  getLinkswapData,
  getUniswapV1Data,
  getUniswapV2Data,
  getSushiswapData,
} from 'data/feeData';
import { getBalancerData } from 'data/balancer';
import { getBancorData } from 'data/bancor';
import { getCompoundData } from 'data/compound';
import { getCurveData } from 'data/curve';
import { getHegicData } from 'data/hegic';
import { getOmenData } from 'data/omen';
import { get0xData } from 'data/zerox';
import { getRenData } from 'data/ren';
import { getSynthetixData } from 'data/synthetix';
import { getPolymarketData } from 'data/polymarket';
import { getPolkadotData, getKusamaData } from 'data/polkadot';
import { getMstableData } from 'data/mStable';
import { getTBTCData } from 'data/tbtc';
import { getTornadoData } from 'data/tornado';
import { getAaveData } from 'data/aave';
import List from 'components/List';

interface HomeProps {
  data: FeeData[];
}

const ASSETS = [
  'eth',
  'btc',
  'ltc',
  'ada',
  'xtz',
  'bsv',
  'bch',
  'xrp',
  'doge',
  'xmr',
  'xlm',
  'bnb_mainnet',
];

export const Home: NextPage<HomeProps> = ({ data }) => {
  return (
    <main>
      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <div>
        <a
          href="https://twitter.com/share?ref_src=twsrc%5Etfw"
          className="twitter-share-button"
          data-show-count="true"
        >
          Tweet
        </a>
        <script async src="https://platform.twitter.com/widgets.js"></script>
      </div>

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

        footer {
          width: 100%;
          height: auto;
          border-top: 1px solid lightGray;
          text-align: center;
          padding: 2rem 0;
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
  const handleFailure = (e: any) => {
    console.warn(e);
    return null;
  };

  const [assetData, ...appData] = await Promise.all([
    Promise.all(ASSETS.map(getFeeData)).catch(() => []),
    getUniswapV1Data().catch(handleFailure),
    getUniswapV2Data().catch(handleFailure),
    getLinkswapData().catch(handleFailure),
    getBalancerData().catch(handleFailure),
    getBancorData().catch(handleFailure),
    get0xData().catch(handleFailure),
    getCurveData().catch(handleFailure),
    getHegicData().catch(handleFailure),
    getKusamaData().catch(handleFailure),
    getOmenData().catch(handleFailure),
    getPolymarketData().catch(handleFailure),
    getPolkadotData().catch(handleFailure),
    getRenData().catch(handleFailure),
    getSushiswapData().catch(handleFailure),
    getSynthetixData().catch(handleFailure),
    getMstableData().catch(handleFailure),
    getTornadoData().catch(handleFailure),
    getTBTCData().catch(handleFailure),
    getAaveData().catch(handleFailure),
    getCompoundData().catch(handleFailure),
  ]);

  const data = [...assetData, ...appData].filter((val: any) => !!val);

  return { props: { data }, revalidate: 60 };
};

export default Home;
