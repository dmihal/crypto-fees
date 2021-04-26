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
        <link href="https://use.typekit.net/jrq0bbf.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/3.6.0/react-datepicker.min.css"
        />

        <meta property="og:title" content="Crypto Fees" />
        <meta
          property="og:image"
          content={`https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/social.png`}
        />
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
          content={`https://${
            process.env.NEXT_PUBLIC_VERCEL_URL
          }/api/social.png?${new Date().getDate()}`}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header>
        <ul className="header-links">
          <li className="header-link">
            <div>cryptofees.info</div>
          </li>
          <li className="header-link">
            <a href="https://money-movers.info/">money-movers.info</a>
          </li>
        </ul>
      </header>

      <Component {...pageProps} />

      <footer>
        <div>Data updates at midnight, UTC</div>
        <div>
          Created by{' '}
          <a href="https://twitter.com/dmihal" target="twitter">
            David Mihal
          </a>
        </div>

        <div>
          <Link href="/submit-project">
            <a>Request Project</a>
          </Link>
          {' | '}
          <Link href="/api-docs">
            <a>API Documentation</a>
          </Link>
        </div>

        <div>
          <b>cryptofees.info</b>
          {' | '}
          <a href="https://ethereumnodes.com">ethereumnodes.com</a>
          {' | '}
          <a href="https://money-movers.info">money-movers.info</a>
          {' | '}
          <a href="https://stakers.info">stakers.info</a>
          {' | '}
          <a href="https://open-orgs.info">open-orgs.info</a>
        </div>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }

        .header-links {
          display: flex;
          margin: 0;
          padding: 0;
        }

        .header-link {
          list-style: none;
        }

        .header-link > * {
          padding: 8px;
          display: block;
          border: solid 1px transparent;
          margin: 0 4px;
        }

        .header-link > a:hover {
          border-radius: 3px;
          border: solid 1px #d0d1d9;
          text-decoration: none;
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
          font-family: 'sofia-pro', sans-serif;
          background: #f9fafc;
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
