import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getLastWeek } from 'data/queries';
import ResponsePreview from 'components/ResponsePreview';

interface APIDocsProps {
  lastWeek: any;
}

const APIDocsPage: NextPage<APIDocsProps> = ({ lastWeek }) => {
  return (
    <main>
      <Head>
        <title key="title">API - Crypto Fees</title>
      </Head>

      <div>
        <Link href="/">
          <a>Back to project list</a>
        </Link>
      </div>

      <h1 className="title">CryptoFees.info API</h1>

      <p>CryptoFees.info provides a public API for easy access to fee data.</p>
      <p>Data from the CryptoFees.info API may be freely used in non-commercial projects.</p>

      <h2>
        <pre>/api/v1/fees</pre>
      </h2>
      <p>Request metadata & fees from all supported protocols from the last 7 days.</p>
      <ResponsePreview>{JSON.stringify(lastWeek, null, '  ')}</ResponsePreview>

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

export const getStaticProps: GetStaticProps = async () => {
  const lastWeekData = await getLastWeek();
  const lastWeek = {
    success: true,
    protocols: lastWeekData.sort((a: any, b: any) => b.fees[0].fee - a.fees[0].fee),
  };

  return { props: { lastWeek }, revalidate: 60 };
};

export default APIDocsPage;
