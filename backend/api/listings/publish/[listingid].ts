import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, authed, enableCors, handleOptions } from '../../_lib/handler';
import { publishListing, assertOwnsListing } from '../../_lib/service';

export default async (req: VercelRequest, res: VercelResponse) => {
  enableCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  await catchErrors(
    authed(async (req, res, email) => {
      if (req.method !== 'PUT') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const { listingid } = req.query;
      const listingId = Array.isArray(listingid) ? listingid[0] : listingid;

      if (!listingId) {
        return res.status(400).json({ error: 'Missing listing ID' });
      }

      const { availability } = req.body;
      await assertOwnsListing(email, listingId);
      await publishListing(listingId, availability);
      return res.status(200).json({});
    })
  )(req, res);
};
