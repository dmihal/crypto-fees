import { NextApiRequest, NextApiResponse } from 'next';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const TIMEOUT_MS = process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT) : 10000;

export const wrapHandler = (handler: Handler): Handler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let completed = false;

    const handlerPromise = handler(req, res).then(() => {
      completed = true;
    });

    await Promise.race([
      handlerPromise,
      new Promise<void>((resolve) =>
        setTimeout(() => {
          if (!completed) {
            res.status(500).json({
              success: false,
              error: 'Query timed out',
            });
            resolve();
          }
        }, TIMEOUT_MS)
      ),
    ]);
  };
};
