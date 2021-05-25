import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import SocialCard from 'components/SocialCard';
import { getData, getHistoricalData } from 'data/queries';
import path from 'path';
import { formatDate } from 'data/lib/time';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { date } = req.query;

  const data = date ? await getHistoricalData(date.toString()) : await getData();

  const filteredData = data.filter((val: any) => !!val);

  const svg = ReactDOMServer.renderToString(
    React.createElement(SocialCard, {
      data: filteredData,
      date: formatDate(new Date()),
    })
  );

  const buffer = Buffer.from(svg);
  const output = await sharp(buffer, { density: 300 }).toFormat('png').toBuffer();

  res.setHeader('Content-Type', 'image/png');
  res.write(output, 'binary');
  res.end(null, 'binary');
};

export default handler;
