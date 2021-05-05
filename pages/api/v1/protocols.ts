import { NextApiRequest, NextApiResponse } from 'next';
import { getIDs, getMetadata } from 'data/adapters';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const protocols = getIDs().map((id: string) => ({ id, ...getMetadata(id) }));

  res.json({
    success: true,
    protocols,
  });
};

export default handler;
