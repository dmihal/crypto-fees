import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getLastWeek } from 'data/queries';
import { getIDs, getMetadata } from 'data/adapters';
import ResponsePreview from 'components/ResponsePreview';
import { ArrowLeft } from 'react-feather';

interface APIDocsProps {
  lastWeek: any;
  protocols: any;
}

const APIDocsPage: NextPage<APIDocsProps> = ({ lastWeek, protocols }) => {
  return (
    <main>
      <Head>
        <title key="title">API - Crypto Fees</title>
      </Head>

      <div>
        <Link href="/">
          <a>
            <ArrowLeft size={14} /> Back to list
          </a>
        </Link>
      </div>

      <h1 className="title">CryptoFees.info API</h1>

      <p>CryptoFees.info provides a public API for easy access to fee data.</p>

      <div className="alert">
        CryptoFees is transitioning to using the{' '}
        <a href="https://cryptostats.community">CryptoStats protocol</a>
        {} as a data source.
        <br />
        For a more comprehensive API, check out {}
        <a href="https://cryptostats.community/discover/fees">
          the &quot;fees&quot; collection on CryptoStats
        </a>
        .
      </div>

      <h2>
        <pre>/api/v1/fees</pre>
      </h2>
      <p>Request metadata & fees from all supported protocols from the last 7 days.</p>
      <ResponsePreview>{JSON.stringify(lastWeek, null, '  ')}</ResponsePreview>

      <h2>
        <pre>/api/v1/protocols</pre>
      </h2>
      <p>Request metadata all supported protocols.</p>
      <ResponsePreview>{JSON.stringify(protocols, null, '  ')}</ResponsePreview>

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
        .alert {
          background: #ffb6b6;
          padding: 12px;
          border-radius: 8px;
          font-style: italic;
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
  const protocols = getIDs().map((id: string) => ({ id, ...getMetadata(id) }));

  return { props: { lastWeek, protocols }, revalidate: 60 * 10 };
};

export default APIDocsPage;
