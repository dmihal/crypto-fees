import { NextApiRequest, NextApiResponse } from 'next';
import { getDateData } from 'data/queries';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = [];

  await Promise.all(Object.entries(req.query).map(async ([id, dates]) => {
    if (dates.length === 0) {
      return;
    }

    const protocolData = [];

    await Promise.all(dates.toString().split(',').map(async (date: string) => {
      const dayData = await getDateData(id, date);
      protocolData.push(dayData);
    }))

    data.push({ id, data: protocolData });
  }))

  res.json({
    success: true,
    data,
  });
};

export default handler;
