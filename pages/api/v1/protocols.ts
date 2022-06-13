import { NextApiRequest, NextApiResponse } from 'next';
import { getIDs, getMetadata } from 'data/adapters';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const protocols = getIDs().map((id: string) => ({ id, ...getMetadata(id) }));

  res.setHeader(
    'Cache-Control',
    `max-age=0, s-maxage=${60 * 60}, stale-while-revalidate=${60 * 30}`
  );
  res.json({
    success: true,
    protocols,
  });
};

export default handler;
