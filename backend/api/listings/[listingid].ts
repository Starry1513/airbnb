import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, authed, enableCors, handleOptions } from '../_lib/handler';
import { getListingDetails, updateListing, removeListing, assertOwnsListing } from '../_lib/service';

export default async (req: VercelRequest, res: VercelResponse) => {
  enableCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  const { listingid } = req.query;
  const listingId = Array.isArray(listingid) ? listingid[0] : listingid;

  if (!listingId) {
    return res.status(400).json({ error: 'Missing listing ID' });
  }

  if (req.method === 'GET') {
    await catchErrors(async (req, res) => {
      const listing = await getListingDetails(listingId);
      return res.status(200).json({ listing });
    })(req, res);
  } else if (req.method === 'PUT') {
    await catchErrors(
      authed(async (req, res, email) => {
        const { title, address, thumbnail, price, metadata } = req.body;
        await assertOwnsListing(email, listingId);
        await updateListing(listingId, title, address, thumbnail, price, metadata);
        return res.status(200).json({});
      })
    )(req, res);
  } else if (req.method === 'DELETE') {
    await catchErrors(
      authed(async (req, res, email) => {
        await assertOwnsListing(email, listingId);
        await removeListing(listingId);
        return res.status(200).json({});
      })
    )(req, res);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
