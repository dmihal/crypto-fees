import { CryptoStatsSDK } from '@cryptostats/sdk';
import { getDateData } from 'data/queries';
import { NextApiRequest, NextApiResponse } from 'next';

const DATE_REGEX = /20\d{2}-[01]\d-\d{2}/

const handleErrors = (handler: (req: NextApiRequest, res: NextApiResponse) => void) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await handler(req, res);
  } catch (e: any) {
    res.end(`Error generating CSV: ${e.message}`);
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { 'start-date': startDate, 'end-date': endDate, protocols } = req.query as { [key: string]: string }
  if (!startDate || !endDate) {
    throw new Error('Paramaters start-date and end-date must be provided');
  }
  if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
    throw new Error('Invalid date format');
  }
  if (!/[a-z-]+(,[a-z-]+)*/.test(protocols)) {
    throw new Error('Invalid protocol list');
  }

  const protocolList = protocols.split(',');
  const sdk = new CryptoStatsSDK();
  const dateList = sdk.date.getDateRange(startDate, endDate);
  
  const data = await Promise.all(dateList.map(async date => {
    const dayData = await Promise.all(protocolList.map(async (protocol): Promise<string> => {
      const { fee } = await getDateData(protocol, date);
      return fee || '-';
    }))
    return dayData;
  }));

  let csv = `Date,${protocols}\n`;
  for (const i in dateList) {
    csv += `${dateList[i]},${data[i].join(',')}\n`;
  }

  res.setHeader('Content-type', 'text/csv');
  res.end(csv);
};

export default handleErrors(handler);
