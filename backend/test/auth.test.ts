import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { users } from '../src/db/schema';
import { setupTestApp } from './helpers';

let t: Awaited<ReturnType<typeof setupTestApp>>;
beforeAll(async () => { t = await setupTestApp(); });
beforeEach(async () => { await t.reset(); });

describe('auth', () => {
  it('registers, stores a bcrypt hash, and logs in', async () => {
    const reg = await t.request('POST', '/user/auth/register', {
      body: { email: 'a@a.com', password: 'secret123', name: 'Alice' },
    });
    expect(reg.status).toBe(200);
    expect(typeof reg.body.token).toBe('string');

    const [row] = await t.db.select().from(users).where(eq(users.email, 'a@a.com'));
    expect(row.password).not.toBe('secret123');
    expect(row.password).toMatch(/^\$2[aby]\$/);

    const login = await t.request('POST', '/user/auth/login', {
      body: { email: 'a@a.com', password: 'secret123' },
    });
    expect(login.status).toBe(200);
  });

  it('rejects duplicate emails and bad input', async () => {
    await t.registerUser('a@a.com');
    const dup = await t.request('POST', '/user/auth/register', {
      body: { email: 'a@a.com', password: 'secret123', name: 'A' },
    });
    expect(dup.status).toBe(400);
    expect(dup.body.error).toMatch(/already registered/);

    const bad = await t.request('POST', '/user/auth/register', {
      body: { email: 'not-an-email', password: 'secret123', name: 'A' },
    });
    expect(bad.status).toBe(400);
    expect(bad.body.error).toMatch(/^email:/);
  });

  it('rejects a wrong password with the same message as an unknown email', async () => {
    await t.registerUser('a@a.com');
    const wrong = await t.request('POST', '/user/auth/login', { body: { email: 'a@a.com', password: 'nope' } });
    const unknown = await t.request('POST', '/user/auth/login', { body: { email: 'x@x.com', password: 'nope' } });
    expect(wrong.status).toBe(400);
    expect(unknown.body.error).toBe(wrong.body.error);
  });

  it('upgrades a legacy plaintext password to a hash on login', async () => {
    await t.db.insert(users).values({ email: 'old@a.com', name: 'Old', password: 'plain-pass' });
    const login = await t.request('POST', '/user/auth/login', {
      body: { email: 'old@a.com', password: 'plain-pass' },
    });
    expect(login.status).toBe(200);
    const [row] = await t.db.select().from(users).where(eq(users.email, 'old@a.com'));
    expect(row.password).toMatch(/^\$2[aby]\$/);

    const again = await t.request('POST', '/user/auth/login', {
      body: { email: 'old@a.com', password: 'plain-pass' },
    });
    expect(again.status).toBe(200);
  });

  it('invalidates the token on logout', async () => {
    const token = await t.registerUser('a@a.com');
    expect((await t.request('GET', '/bookings', { token })).status).toBe(200);
    expect((await t.request('POST', '/user/auth/logout', { token })).status).toBe(200);
    expect((await t.request('GET', '/bookings', { token })).status).toBe(403);
  });

  it('rejects tokens without an expiry or signed with another secret', async () => {
    await t.registerUser('a@a.com');
    const noExp = jwt.sign({ email: 'a@a.com' }, process.env.JWT_SECRET!);
    const forged = jwt.sign({ email: 'a@a.com' }, 'giraffegiraffebeetroot', { expiresIn: '1h' });
    expect((await t.request('GET', '/bookings', { token: noExp })).status).toBe(403);
    expect((await t.request('GET', '/bookings', { token: forged })).status).toBe(403);
    expect((await t.request('GET', '/bookings')).status).toBe(403);
  });

  it('serves routes under both / and /api', async () => {
    expect((await t.request('GET', '/listings')).status).toBe(200);
    expect((await t.request('GET', '/api/listings')).status).toBe(200);
    expect((await t.request('GET', '/nope')).status).toBe(404);
  });
});
