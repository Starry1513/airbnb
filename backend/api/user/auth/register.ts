import { VercelRequest, VercelResponse } from '@vercel/node';
import { catchErrors, enableCors, handleOptions } from '../../_lib/handler';
import { register } from '../../_lib/service';

export default async (req: VercelRequest, res: VercelResponse) => {
  enableCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  await catchErrors(async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { email, password, name } = req.body;
    const token = await register(email, password, name);
    return res.json({ token });
  })(req, res);
};
