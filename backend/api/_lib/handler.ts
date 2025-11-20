import { VercelRequest, VercelResponse } from '@vercel/node';
import { InputError, AccessError } from './error';
import { getEmailFromAuthorization } from './service';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>;
type AuthHandler = (req: VercelRequest, res: VercelResponse, email: string) => Promise<void>;

export const catchErrors = (fn: Handler): Handler => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err: any) {
    // Log full error details for debugging
    console.error('[catchErrors] Caught error:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      type: err?.constructor?.name,
      isInputError: err instanceof InputError,
      isAccessError: err instanceof AccessError
    });
    
    if (err instanceof InputError) {
      res.status(400).json({ error: err.message });
    } else if (err instanceof AccessError) {
      res.status(403).json({ error: err.message });
    } else {
      // For database errors, provide more details
      if (err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
        console.error('Database connection error:', err);
        res.status(500).json({ 
          error: 'Database connection failed. Please check environment variables.' 
        });
      } else if (err?.message?.includes('relation') || err?.message?.includes('does not exist')) {
        console.error('Database schema error:', err);
        res.status(500).json({ 
          error: 'Database schema error. Please run migrations.' 
        });
      } else {
        res.status(500).json({ 
          error: 'A system error occurred',
          // In development, include error message
          ...(process.env.NODE_ENV !== 'production' && { details: err?.message })
        });
      }
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
