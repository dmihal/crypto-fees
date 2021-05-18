import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import SingleProtocolCard from 'components/SocialCard/SingleProtocolCard';
import { getMetadata } from 'data/adapters';
import path from 'path';
import { formatDate } from 'data/lib/time';
import { getDateRangeData } from 'data/queries';
import subDays from 'date-fns/subDays';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id.toString().replace('.png', '');
  const metadata = getMetadata(id);
  if (!metadata) {
    return res.json({ error: `Unknown ${id}` });
  }

  const feeData = await getDateRangeData(id, subDays(new Date(), 30), subDays(new Date(), 1));
  const data = feeData.map((val: any) => ({
    date: Math.floor(new Date(val.date).getTime() / 1000),
    primary: val.fee,
  }));

  const svg = ReactDOMServer.renderToString(
    React.createElement(SingleProtocolCard, {
      data,
      date: formatDate(subDays(new Date(), 1), '/'),
      name: metadata.name,
    })
  );

  const buffer = Buffer.from(svg);
  const output = await sharp(buffer, { density: 300 }).toFormat('png').toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.write(output, 'binary');
  res.end(null, 'binary');
};

export default handler;
