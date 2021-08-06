import { NextApiRequest, NextApiResponse } from 'next';
import { getLastWeek } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getLastWeek();

  res.setHeader('Cache-Control', `max-age=0, s-maxage=${60 * 10}`);
  res.json({
    success: true,
    protocols: data.sort((a: any, b: any) => b.fees[0].fee - a.fees[0].fee),
  });
};

export default handler;
