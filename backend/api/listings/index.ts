import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, enableCors, handleOptions } from '../_lib/handler';
import { getAllListings } from '../_lib/service';

export default async (req: VercelRequest, res: VercelResponse) => {
  enableCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  await catchErrors(async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const listings = await getAllListings();
    return res.json({ listings });
  })(req, res);
};
