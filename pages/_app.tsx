import React, { useEffect } from 'react';
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga';
import PlausibleProvider from 'next-plausible';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import Header from 'components/Header';
import Footer from 'components/Footer';
import i18nReources from 'i18n.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: i18nReources as any,
    detection: {
      caches: [],
    },

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

ReactGA.initialize('UA-150445352-3');

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();

  useEffect(() => {
    ReactGA.set({ page: router.asPath });
    ReactGA.pageview(router.asPath);
  }, [router.pathname]);

  return (
    <div className="container">
      <Head>
        <title key="title">CryptoFees.info</title>
        <link rel="icon" href="/favicon.png" />
        <link href="https://use.typekit.net/jrq0bbf.css" rel="stylesheet" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/react-datepicker/3.6.0/react-datepicker.min.css"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&amp;display=swap"
          rel="stylesheet"
        />
      </Head>

      <PlausibleProvider domain="cryptofees.info">
        <Header />

        <Component {...pageProps} />

        <Footer />
      </PlausibleProvider>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }

        footer {
          width: 100%;
          height: auto;
          border-top: 1px solid lightGray;
          text-align: center;
          padding: 2rem 0;
        }
        .gitcoin {
          background: rgb(255 0 0 / 20%);
          text-align: center;
          padding: 4px;
          margin: -0.5rem;
          margin-bottom: 2px;
          align-self: stretch;
        }
      `}</style>
      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'sofia-pro', sans-serif;
          background: #f9fafc;
          color: #091636;
        }

        * {
          box-sizing: border-box;
        }

        a {
          color: #091636;
          text-decoration: underline;
        }
        a:hover {
          color: #666666;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default App;
