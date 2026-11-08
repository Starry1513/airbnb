import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import { createApp } from '../src/app';
import type { Database } from '../src/db/client';
import * as schema from '../src/db/schema';

/** A fresh in-memory Postgres with the real migrations applied. */
export const setupTestApp = async () => {
  const client = new PGlite();
  const db = drizzle(client, { schema }) as unknown as Database;
  await migrate(drizzle(client), { migrationsFolder: 'drizzle' });
  const app = createApp(() => db);

  const request = async (
    method: string,
    path: string,
    { token, body }: { token?: string; body?: unknown } = {},
  ) => {
    const res = await app.request(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: (await res.json()) as any };
  };

  const reset = () => db.execute(sql`TRUNCATE users, listings, bookings, reviews RESTART IDENTITY CASCADE`);

  const registerUser = async (email: string, password = 'secret123', name = 'Test') => {
    const res = await request('POST', '/user/auth/register', { body: { email, password, name } });
    return res.body.token as string;
  };

  const listingBody = (overrides: Record<string, unknown> = {}) => ({
    title: 'Harbour View',
    address: { street: '1 George St', city: 'Sydney', state: 'NSW', postcode: '2000', country: 'Australia' },
    price: 100,
    thumbnail: '',
    metadata: {
      propertyType: 'Apartment',
      bathrooms: 1,
      bedrooms: [{ type: 'Queen', beds: 1 }],
      amenities: ['WiFi'],
    },
    ...overrides,
  });

  /** Creates and publishes a listing available for all of 2030. */
  const publishedListing = async (token: string, overrides: Record<string, unknown> = {}) => {
    const created = await request('POST', '/listings/new', { token, body: listingBody(overrides) });
    const id = created.body.listingId as number;
    await request('PUT', `/listings/publish/${id}`, {
      token,
      body: { availability: [{ from: '2030-01-01', to: '2030-12-31' }] },
    });
    return id;
  };

  return { app, db, client, request, reset, registerUser, listingBody, publishedListing };
};
