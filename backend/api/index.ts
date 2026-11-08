import { getRequestListener } from '@hono/node-server';
import { createApp } from '../src/app';
import { getDb } from '../src/db/client';

// Vercel Node.js function: every path is rewritten here by vercel.json.
export default getRequestListener(createApp(getDb).fetch);
