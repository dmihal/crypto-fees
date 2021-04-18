import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { getIDs, getMetadata } from 'data/adapters';
import { getDateRangeData } from 'data/queries';
import subDays from 'date-fns/subDays';
import Chart from 'components/Chart';

interface ProtocolDetailsProps {
  id: string;
  metadata: any;
  feeCache: any;
}

export const ProtocolDetails: NextPage<ProtocolDetailsProps> = ({ id, metadata, feeCache }) => {
  const filteredData = feeCache[id].map((day: any) => ({
    date: new Date(day.date).getTime() / 1000,
    fee: day.fee,
  }));

  return (
    <main>
      <h1 className="title">CryptoFees.info</h1>
      <h2 className="subtitle">{metadata.name}</h2>

      <Chart data={filteredData} />

      <p>{metadata.description}</p>
      <p>{metadata.feeDescription}</p>
    </main>
  );
};

export default ProtocolDetails;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params.id.toString();
  return {
    props: {
      id,
      metadata: getMetadata(id),
      feeCache: {
        [id]: await getDateRangeData(id, subDays(new Date(), 90), new Date()),
      },
    },
    revalidate: 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getIDs().map((id: string) => ({ params: { id } })),
    fallback: false,
  };
};
