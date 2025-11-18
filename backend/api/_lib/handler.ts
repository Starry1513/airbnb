import { VercelRequest, VercelResponse } from '@vercel/node';
import { InputError, AccessError } from './error';
import { getEmailFromAuthorization } from './service';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;
type AuthHandler = (req: VercelRequest, res: VercelResponse, email: string) => Promise<void>;

export const catchErrors = (fn: Handler): Handler => async (req, res) => {
  try {
    console.log(`Authorization header is ${req.headers.authorization}`);
    if (req.method === 'GET') {
      console.log(`Query params are ${JSON.stringify(req.query)}`);
    } else {
      console.log(`Body params are ${JSON.stringify(req.body)}`);
    }
    await fn(req, res);
  } catch (err) {
    if (err instanceof InputError) {
      res.status(400).json({ error: err.message });
    } else if (err instanceof AccessError) {
      res.status(403).json({ error: err.message });
    } else {
      console.log(err);
      res.status(500).json({ error: 'A system error occurred' });
    }
  }
};

export const authed = (fn: AuthHandler): Handler => async (req, res) => {
  const email = getEmailFromAuthorization(req.headers.authorization);
  await fn(req, res, email);
};

export const enableCors = (res: VercelResponse): void => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

export const handleOptions = (req: VercelRequest, res: VercelResponse): boolean => {
  if (req.method === 'OPTIONS') {
    enableCors(res);
    res.status(200).end();
    return true;
  }
  return false;
};
