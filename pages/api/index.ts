import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
  res.writeHead(302, {
    Location: '/api-docs',
  });
  res.end();
};

export default handler;
