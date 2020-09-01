import 'isomorphic-fetch';
import { NextApiRequest, NextApiResponse } from 'next';

async function getScreenshot() {
  const request = await fetch(`https://api.vercel.com/v1/projects/Crypto Fees`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_APP_VERCEL}`,
    },
  });
  const json = await request.json();
  const deploymentId = json.latestDeployments[0].id;

  return `https://vercel.com/api/screenshot?deploymentId=${deploymentId}`;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const screenshot = await getScreenshot();

  res.writeHead(302, {
    Location: screenshot,
  });
  res.end();
};

export default handler
