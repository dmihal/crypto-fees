import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { FeeData } from 'data/adapters/feeData';
import { getData } from 'data/queries';
import { formatDate } from 'data/lib/time';
import List from 'components/List';
import Toolbar from 'components/Toolbar';

interface HomeProps {
  data: FeeData[];
}

export const Home: NextPage<HomeProps> = ({ data }) => {
  const router = useRouter();
  return (
    <main>
      <h1 className="title">Crypto Fees</h1>

      <p className="description">
        There&apos;s tons of crypto projects.
        <br />
        Which ones are people actually paying to use?
      </p>

      <p>
        Like this site?{' '}
        <a href="https://gitcoin.co/grants/1624/cryptofees-info">Support it on Gitcoin Grants</a>
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

      <Toolbar onDateChange={(newDate: Date) => router.push(`/history/${formatDate(newDate)}`)} />

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
  const data = await getData();
  const filteredData = data.filter((val: any) => !!val);

  return { props: { data: filteredData }, revalidate: 60 };
};

export default Home;
