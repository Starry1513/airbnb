import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, authed, enableCors, handleOptions } from '../../../../_lib/handler';
import { leaveListingReview } from '../../../../_lib/service';

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

      const { listingid, bookingid } = req.query;
      const listingId = Array.isArray(listingid) ? listingid[0] : listingid;
      const bookingId = Array.isArray(bookingid) ? bookingid[0] : bookingid;

      if (!listingId || !bookingId) {
        return res.status(400).json({ error: 'Missing listing ID or booking ID' });
      }

      const { review } = req.body;
      await leaveListingReview(email, listingId, bookingId, review);
      return res.status(200).json({});
    })
  )(req, res);
};
