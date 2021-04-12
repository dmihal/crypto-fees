import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { getIDs, getMetadata } from 'data/adapters';

interface ProtocolDetailsProps {
  metadata: any;
}

export const ProtocolDetails: NextPage<ProtocolDetailsProps> = ({ metadata }) => {
  return (
    <main>
      <h1 className="title">Crypto Fees</h1>
      <pre>{JSON.stringify(metadata, null, '  ')}</pre>
    </main>
  );
};

export default ProtocolDetails;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  return { props: { metadata: getMetadata(params.id.toString()) }, revalidate: 60 };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getIDs().map((id: string) => ({ params: { id } })),
    fallback: false,
  };
};
