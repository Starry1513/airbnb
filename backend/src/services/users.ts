import { eq } from 'drizzle-orm';
import type { Database } from '../db/client';
import { users } from '../db/schema';
import { checkPassword, hashPassword, signToken } from '../lib/auth';
import { badRequest } from '../lib/errors';

export const register = async (db: Database, email: string, password: string, name: string) => {
  const passwordHash = await hashPassword(password);
  const inserted = await db
    .insert(users)
    .values({ email, name, password: passwordHash, sessionActive: true })
    .onConflictDoNothing()
    .returning({ email: users.email });
  if (inserted.length === 0) throw badRequest('Email address already registered');
  return signToken(email);
};

export const login = async (db: Database, email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  // Same message either way so the endpoint doesn't reveal which emails exist.
  if (!user) throw badRequest('Invalid email or password');

  const { ok, needsRehash } = await checkPassword(password, user.password);
  if (!ok) throw badRequest('Invalid email or password');

  await db
    .update(users)
    .set({
      sessionActive: true,
      ...(needsRehash ? { password: await hashPassword(password) } : {}),
    })
    .where(eq(users.email, email));
  return signToken(email);
};

export const logout = async (db: Database, email: string) => {
  await db.update(users).set({ sessionActive: false }).where(eq(users.email, email));
};

/** A token is only honoured while its user exists and hasn't logged out. */
export const isSessionActive = async (db: Database, email: string) => {
  const [user] = await db
    .select({ sessionActive: users.sessionActive })
    .from(users)
    .where(eq(users.email, email));
  return user?.sessionActive === true;
};
