import React, { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-150445352-3');

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    ReactGA.set({ page: router.pathname });
    ReactGA.pageview(router.pathname);
  }, [router.pathname]);

  return (
    <div className="container">
      <Head>
        <title key="title">Crypto Fees</title>
        <link rel="icon" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/3.6.0/react-datepicker.min.css"
        />

        <meta property="og:title" content="Crypto Fees" />
        <meta property="og:image" content="https://cryptofees.info/api/screenshot" />
        <meta
          property="og:description"
          content="There's tons of crypto projects. Which ones are people actually paying to use?"
        />

        <meta name="twitter:title" content="Crypto Fees" />
        <meta
          name="twitter:description"
          content="There's tons of crypto projects. Which ones are people actually paying to use?"
        />
        <meta
          name="twitter:image"
          content={`https://cryptofees.info/api/screenshot?${new Date().getDate()}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Component {...pageProps} />

      <footer>
        <div>Data updates at midnight, UTC</div>
        <div>Network data from CoinMetrics, application data from The Graph</div>
        <div>Application data does not include Ethereum transaction fees</div>
        <div>
          Created by{' '}
          <a href="https://twitter.com/dmihal" target="twitter">
            David Mihal
          </a>
        </div>
        <div>
          Design help from{' '}
          <a href="https://twitter.com/hey_heey_heeey" target="twitter">
            @heyheeyheeey
          </a>
        </div>

        <div>
          <Link href="/submit-project">
            <a>Want to add a project to CryptoFees.info?</a>
          </Link>
        </div>

        <div>
          <b>cryptofees.info</b>
          {' | '}
          <a href="https://ethereumnodes.com">ethereumnodes.com</a>
          {' | '}
          <a href="https://money-movers.info">money-movers.info</a>
        </div>
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

        footer {
          width: 100%;
          height: auto;
          border-top: 1px solid lightGray;
          text-align: center;
          padding: 2rem 0;
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

        a {
          color: #666666;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default App;
