import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'react-feather';

const APIDocsPage: NextPage = () => {
  return (
    <main>
      <Head>
        <title key="title">Frequently Asked Questions - CryptoFees.info</title>
      </Head>

      <div>
        <Link href="/">
          <a>
            <ArrowLeft size={14} /> Back to list
          </a>
        </Link>
      </div>

      <h1 className="title">CryptoFees.info Frequently Asked Questions</h1>

      <h2>Wait... aren&apos;t fees bad?</h2>
      <p>Numbers aren&apos;t good or bad, they&apos;re just numbers!</p>
      <p>
        However, total fees can be a strong indicator for which protocols have actual economic
        activity behind them.
      </p>

      <h2>Can you add information about fees-per-transaction?</h2>
      <p>
        CryptoFees.info doesn&apos;t just show data for layer-1 blockchains, it also shows fees for{' '}
        blockchain applicaitons, like decentralized exchanges, lending protocols, etc.
        Fee-per-transaction isn&apos;t a relevant metric for applications, so it&apos;s not
        included.
      </p>
      <p>
        Furthermore, fee-per-transaction implies that all transactions are equivelant. A simple
        token transfer is very different from a DEX trade, HTLC-lock, rollup data block, etc.
      </p>

      <h2>Where does this data come from?</h2>
      <p>
        Fee data comes from various sources. Data for many of the layer 1 chains comes from{' '}
        CoinMetrics, while data for many of the applications comes from Graph Protocol subgraphs.
      </p>
      <p>
        For more information, view the details of each protocol, or check the{' '}
        <a href="https://github.com/dmihal/crypto-fees">CryptoFees source code repository</a>.
      </p>

      <h2>Can you add data for [protocol]?</h2>
      <p>
        Visit the{' '}
        <Link href="/submit-project">
          <a>submit project page</a>
        </Link>{' '}
        for more details.
      </p>

      <h2>How does CryptoFees.info make money?</h2>
      <p>Generally, it doesn&apos;t! This site is run as a free, open-source community resource.</p>
      <p>
        If you&apos;d like to support the continued development of this site, you can always make a
        donation to our <a href="https://gitcoin.co/grants/1624/cryptofees-info">Gitcoin Grants</a>.
      </p>

      <style jsx>{`
        main {
          max-width: 600px;
          margin: 20px 0;
        }
        h1 {
          text-align: center;
        }
        h3 {
          font-size: 16px;
        }
      `}</style>
    </main>
  );
};

export default APIDocsPage;
