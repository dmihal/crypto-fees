import { NextApiRequest, NextApiResponse } from 'next';
import { getLastWeek } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getLastWeek();

  res.json({
    success: true,
    protocols: data.sort((a: any, b: any) => b.fees[0].fee - a.fees[0].fee),
  });
};

export default handler;
