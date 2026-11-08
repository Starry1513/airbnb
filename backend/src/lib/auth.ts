import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'node:crypto';

const TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    // Never fall back to a built-in secret: anyone could forge tokens with it.
    throw new Error('JWT_SECRET must be set to at least 16 characters');
  }
  return secret;
};

export const signToken = (email: string): string =>
  jwt.sign({ email }, getJwtSecret(), { algorithm: 'HS256', expiresIn: TOKEN_TTL });

/** Returns the email in a valid, unexpired token, or null. */
export const verifyToken = (token: string): string | null => {
  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] });
    if (typeof payload !== 'object' || typeof payload.email !== 'string') return null;
    // Tokens issued by the old backend never expired; reject them.
    if (typeof payload.exp !== 'number') return null;
    return payload.email;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string): Promise<string> =>
  bcrypt.hash(password, BCRYPT_ROUNDS);

const isBcryptHash = (value: string) => /^\$2[aby]\$\d{2}\$/.test(value);

/**
 * Checks a password against what's stored. `needsRehash` is true when the
 * stored value is a legacy plaintext password that should be upgraded.
 */
export const checkPassword = async (
  password: string,
  stored: string,
): Promise<{ ok: boolean; needsRehash: boolean }> => {
  if (isBcryptHash(stored)) {
    return { ok: await bcrypt.compare(password, stored), needsRehash: false };
  }
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, needsRehash: ok };
};
