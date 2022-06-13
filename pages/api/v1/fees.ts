import { NextApiRequest, NextApiResponse } from 'next';
import { getLastWeek } from 'data/queries';
import { wrapHandler } from 'utils/api';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getLastWeek();

  res.setHeader(
    'Cache-Control',
    `max-age=0, s-maxage=${60 * 15}, stale-while-revalidate=${60 * 5}`
  );
  res.json({
    success: true,
    protocols: data.sort((a: any, b: any) => b.fees[0].fee - a.fees[0].fee),
  });
};

export default wrapHandler(handler);
