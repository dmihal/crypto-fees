import { NextApiRequest, NextApiResponse } from 'next';
import sdk from 'data/sdk';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const list = sdk.getList('fees');

  const protocols = await Promise.all(
    list.getAdapters().map(async (adapter: any) => ({
      id: adapter.id,
      ...(await adapter.getMetadata()),
    }))
  );

  res.json({
    success: true,
    protocols,
  });
};

export default handler;
