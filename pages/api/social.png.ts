import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { Readable } from 'stream';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import SocialCard from 'components/SocialCard';
import { getData } from 'data/queries';
import path from 'path';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await getData();
  const svg = ReactDOMServer.renderToString(
    React.createElement(SocialCard, {
      data,
    })
  );
  const stream = Readable.from([svg]);

  const toPng = sharp().toFormat('png');

  res.setHeader('Content-Type', 'image/png');

  stream.pipe(toPng).pipe(res);
};

export default handler;
