import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

/** Any Drizzle Postgres database built on our schema (node-postgres in prod, PGlite in tests). */
export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export const getConnectionString = (): string | undefined =>
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.starry_POSTGRES_URL;

/**
 * Supabase's pooler uses a certificate chain that Node does not trust by
 * default. pg lets `sslmode` in the URL override the `ssl` option, so strip it
 * and configure TLS explicitly — scoped to this pool rather than disabling
 * certificate checks for the whole process.
 */
const buildPoolConfig = (connectionString: string) => {
  const url = new URL(connectionString);
  const wantsSsl = url.searchParams.has('sslmode') || url.hostname.endsWith('supabase.com');
  url.searchParams.delete('sslmode');
  return {
    connectionString: url.toString(),
    ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
    // Each serverless instance keeps a small pool; Supabase's transaction
    // pooler multiplexes them onto real connections.
    max: 3,
    idleTimeoutMillis: 10_000,
    // A paused/cold Supabase project can take several seconds to accept.
    connectionTimeoutMillis: 10_000,
  };
};

let cached: Database | undefined;

export const getDb = (): Database => {
  if (cached) return cached;
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error('DATABASE_URL (or POSTGRES_URL) is not set');
  }
  const pool = new Pool(buildPoolConfig(connectionString));
  pool.on('error', (err) => console.error('[db] idle client error', err.message));
  cached = drizzle(pool, { schema }) as unknown as Database;
  return cached;
};
