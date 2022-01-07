import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import SingleProtocolCard from 'components/SocialCard/SingleProtocolCard';
import { getMetadata, ensureListLoaded, getBundle, getIDs } from 'data/adapters';
import path from 'path';
import { formatDate } from 'data/lib/time';
import { getDateRangeData } from 'data/queries';
import subDays from 'date-fns/subDays';
import icons from 'components/icons';

// These statements causes Next to bundle these files
path.resolve(process.cwd(), 'fonts', 'fonts.conf');
path.resolve(process.cwd(), 'fonts', 'SofiaProRegular.ttf');

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await ensureListLoaded();

  const id = req.query.id.toString().replace('.png', '');
  let metadata;
  let bundle = false;
  try {
    metadata = getMetadata(id);
  } catch (e) {
    try {
      metadata = getBundle(id);
      bundle = true;
    } catch (e) {
      e // Avoid eslint bugs
    }
  }
  if (!metadata) {
    return res.json({ error: `Unknown ${id}` });
  }

  let data: { date: number, primary: number }[] = []

  const startDate = subDays(new Date(), 30);
  const endDate = subDays(new Date(), 1);

  if (bundle) {
    const adapterIds = getIDs().filter((adapterId: string) => {
      const metadata = getMetadata(adapterId);
      return metadata.bundle === id;
    })

    const feeData = await Promise.all(adapterIds.map((id: string) => getDateRangeData(id, startDate, endDate)))

    for (let i = 0; i < feeData[0].length; i += 1) {
      const date = Math.floor(new Date(feeData[0][i].date).getTime() / 1000)
      const primary = feeData.reduce((total: number, protocol: any) => total + protocol[i].fee, 0)
      data.push({ date, primary });
    }
  } else {
    const feeData = await getDateRangeData(id, startDate, endDate);
    data = feeData.map((val: any) => ({
      date: Math.floor(new Date(val.date).getTime() / 1000),
      primary: val.fee,
    }));
  }

  const svg = ReactDOMServer.renderToString(
    React.createElement(SingleProtocolCard, {
      data,
      date: formatDate(subDays(new Date(), 1), '/'),
      name: metadata.name,
      icon: metadata.icon || icons[id],
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
