import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app';
import { getDb } from './db/client';

// Local development server: `pnpm dev`.
const port = Number(process.env.PORT ?? 5005);
serve({ fetch: createApp(getDb).fetch, port }, () => {
  console.log(`AirBrB API listening on http://localhost:${port}`);
});
