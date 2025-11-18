import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, authed, enableCors, handleOptions } from '../../_lib/handler';
import { logout } from '../../_lib/service';

export default async (req: VercelRequest, res: VercelResponse) => {
  enableCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  await catchErrors(
    authed(async (req, res, email) => {
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      await logout(email);
      return res.json({});
    })
  )(req, res);
};
