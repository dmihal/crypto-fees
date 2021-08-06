import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import path from 'path';
import SocialCard from 'components/SocialCard';
import { getBundle } from 'data/adapters';
import { getData, getHistoricalData } from 'data/queries';
import { Metadata } from 'data/types';
import { formatDate } from 'data/lib/time';
import { bundleItems } from 'data/utils';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { date } = req.query;

  const data = date ? await getHistoricalData(date.toString()) : await getData();

  const bundles: { [id: string]: Metadata } = {};
  const filteredData = data.filter((val: any) => {
    // This is unrelated to filtering, but no need to loop twice
    if (val && val.bundle) {
      bundles[val.bundle] = getBundle(val.bundle);
    }

    return !!val;
  });

  const bundledData = bundleItems(filteredData, bundles);

  const svg = ReactDOMServer.renderToString(
    React.createElement(SocialCard, {
      data: bundledData,
      date: date ? date.toString() : formatDate(new Date()),
    })
  );

  const buffer = Buffer.from(svg);
  const output = await sharp(buffer, { density: 300 }).toFormat('png').toBuffer();

  res.setHeader('Cache-Control', 'max-age=0, s-maxage=240');
  res.setHeader('Content-Type', 'image/png');
  res.write(output, 'binary');
  res.end(null, 'binary');
};

export default handler;
