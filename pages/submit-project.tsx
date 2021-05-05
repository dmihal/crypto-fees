import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'react-feather';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScLF8KcLpYsxzNl7Jv5AVe0D13ADXey7dcUb85N9Yw5LVNbmg/viewform';

const ListingCriteriaPage = () => {
  return (
    <main>
      <Head>
        <title key="title">Listing Criteria - Crypto Fees</title>
      </Head>

      <div>
        <Link href="/">
          <a>
            <ArrowLeft size={14} /> Back to list
          </a>
        </Link>
      </div>

      <h1 className="title">Submit a new project to CryptoFees.info</h1>

      <p>
        CryptoFees.info provides a simple metric for measuring the economic value of various
        blockchain protocols.
      </p>
      <p>
        As DeFi and the entire blockchain industry continues to grow, there{"'"}s been a surge in{' '}
        interest to be listed on this site. We{"'"}ve worked together with the community to develop{' '}
        this set of criteria to ensure that the site remains a simple and trustworthy source of
        information.
      </p>

      <h2>1. Make sure your protocol meets our criteria</h2>
      <p>To be listed, make sure your protocol meets the following criteria:</p>
      <ol>
        <li>The project is a decentralized protocol powered by blockchain technology</li>
        <li>The protocol has been live for at least 6 months</li>
        <li>Fees are designed to incentivize adding value to the protocol</li>
        <li>Any user may join the protocol to earn a share of fees</li>
        <li>If some fees accrue to a project treasury, it must be less than 33% of total fees</li>
      </ol>

      <h3>Example</h3>

      <div>Meets criteria:</div>
      <ul>
        <li>Data provided by an independent, respected institution like CoinMetrics</li>
        <li>Data provided by an open-source indexer, such as a Graph Protocol subgraph</li>
      </ul>

      <div>Does not meet criteria:</div>
      <ul>
        <li>DEX aggregator where fees are paid to the operator</li>
        <li>NFT marketplace where fees are paid to the NFT creator or the marketplace</li>
        <li>Protocol where a majority of the fees are paid to a permissioned treasury</li>
      </ul>

      <h2>2. Find a reliable data feed</h2>
      <p>
        CryptoFees.info is a stateless website, and relies on 3rd party APIs to source fee data.
      </p>

      <p>The best data sources are:</p>
      <ul>
        <li>Data provided by an independent, respected institution like CoinMetrics</li>
        <li>Data provided by an open-source indexer, such as a Graph Protocol subgraph</li>
      </ul>

      <p>
        In some cases, we may allow data from other APIs, however this is discouraged and subject to
        our discretion.
      </p>

      <h2>3. Submit an application</h2>
      <p>
        Complete the <a href={FORM_URL}>listing application form</a>. We{"'"}ll be in touch soon!
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

export default ListingCriteriaPage;
