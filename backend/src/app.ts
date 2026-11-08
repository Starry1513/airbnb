import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createMiddleware } from 'hono/factory';
import { ZodError, type ZodType } from 'zod';
import type { Database } from './db/client';
import { verifyToken } from './lib/auth';
import { HttpError, badRequest, forbidden } from './lib/errors';
import * as bookingService from './services/bookings';
import * as listingService from './services/listings';
import * as userService from './services/users';
import * as v from './validation';
import swaggerDocument from '../swagger.json';

type Env = { Variables: { db: Database; email: string } };

const readJson = async <T>(c: Context, schema: ZodType<T>): Promise<T> => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw badRequest('Request body must be valid JSON');
  }
  return schema.parse(body);
};

const idParam = (c: Context, name: string) => Number(c.req.param(name));

/** Postgres unique-violation, possibly wrapped by Drizzle. */
const isUniqueViolation = (err: unknown): boolean => {
  const e = err as { code?: string; cause?: { code?: string } } | undefined;
  return e?.code === '23505' || e?.cause?.code === '23505';
};

const formatZodError = (err: ZodError) => {
  const issue = err.issues[0];
  const path = issue.path.join('.');
  return path ? `${path}: ${issue.message}` : issue.message;
};

export const createApp = (getDb: () => Database) => {
  const requireAuth = createMiddleware<Env>(async (c, next) => {
    const header = c.req.header('Authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const email = token ? verifyToken(token) : null;
    if (!email || !(await userService.isSessionActive(c.var.db, email))) {
      throw forbidden('Invalid Token');
    }
    c.set('email', email);
    await next();
  });

  const api = new Hono<Env>();

  /* ---------- auth ---------- */
  api.post('/user/auth/register', async (c) => {
    const { email, password, name } = await readJson(c, v.registerBody);
    return c.json({ token: await userService.register(c.var.db, email, password, name) });
  });

  api.post('/user/auth/login', async (c) => {
    const { email, password } = await readJson(c, v.loginBody);
    return c.json({ token: await userService.login(c.var.db, email, password) });
  });

  api.post('/user/auth/logout', requireAuth, async (c) => {
    await userService.logout(c.var.db, c.var.email);
    return c.json({});
  });

  /* ---------- listings ---------- */
  api.get('/listings', async (c) => {
    const query = v.listingQuery.parse(c.req.query());
    return c.json(await listingService.searchListings(c.var.db, query));
  });

  api.post('/listings/new', requireAuth, async (c) => {
    const body = await readJson(c, v.newListingBody);
    try {
      return c.json({ listingId: await listingService.createListing(c.var.db, c.var.email, body) });
    } catch (err) {
      if (isUniqueViolation(err)) throw badRequest('A listing with this title already exists');
      throw err;
    }
  });

  api.get('/listings/:id{[0-9]+}', async (c) => {
    const { id: _id, ...listing } = await listingService.getListing(c.var.db, idParam(c, 'id'));
    return c.json({ listing });
  });

  api.put('/listings/:id{[0-9]+}', requireAuth, async (c) => {
    const id = idParam(c, 'id');
    await listingService.assertOwnsListing(c.var.db, c.var.email, id);
    const body = await readJson(c, v.updateListingBody);
    try {
      await listingService.updateListing(c.var.db, id, body);
    } catch (err) {
      if (isUniqueViolation(err)) throw badRequest('A listing with this title already exists');
      throw err;
    }
    return c.json({});
  });

  api.delete('/listings/:id{[0-9]+}', requireAuth, async (c) => {
    const id = idParam(c, 'id');
    await listingService.assertOwnsListing(c.var.db, c.var.email, id);
    await listingService.deleteListing(c.var.db, id);
    return c.json({});
  });

  api.put('/listings/publish/:id{[0-9]+}', requireAuth, async (c) => {
    const id = idParam(c, 'id');
    await listingService.assertOwnsListing(c.var.db, c.var.email, id);
    const { availability } = await readJson(c, v.publishBody);
    await listingService.publishListing(c.var.db, id, availability);
    return c.json({});
  });

  api.put('/listings/unpublish/:id{[0-9]+}', requireAuth, async (c) => {
    const id = idParam(c, 'id');
    await listingService.assertOwnsListing(c.var.db, c.var.email, id);
    await listingService.unpublishListing(c.var.db, id);
    return c.json({});
  });

  api.put('/listings/:id{[0-9]+}/review/:bookingId{[0-9]+}', requireAuth, async (c) => {
    const { review } = await readJson(c, v.reviewBody);
    await listingService.addReview(
      c.var.db,
      c.var.email,
      idParam(c, 'id'),
      idParam(c, 'bookingId'),
      review,
    );
    return c.json({});
  });

  /* ---------- bookings ---------- */
  api.get('/bookings', requireAuth, async (c) => {
    return c.json({ bookings: await bookingService.listBookingsFor(c.var.db, c.var.email) });
  });

  api.post('/bookings/new/:listingId{[0-9]+}', requireAuth, async (c) => {
    const { dateRange } = await readJson(c, v.newBookingBody);
    const bookingId = await bookingService.createBooking(
      c.var.db,
      c.var.email,
      idParam(c, 'listingId'),
      dateRange,
    );
    return c.json({ bookingId });
  });

  api.delete('/bookings/:id{[0-9]+}', requireAuth, async (c) => {
    await bookingService.deleteBooking(c.var.db, c.var.email, idParam(c, 'id'));
    return c.json({});
  });

  api.put('/bookings/accept/:id{[0-9]+}', requireAuth, async (c) => {
    await bookingService.acceptBooking(c.var.db, c.var.email, idParam(c, 'id'));
    return c.json({});
  });

  api.put('/bookings/decline/:id{[0-9]+}', requireAuth, async (c) => {
    await bookingService.declineBooking(c.var.db, c.var.email, idParam(c, 'id'));
    return c.json({});
  });

  /* ---------- docs ---------- */
  api.get('/', (c) => c.json({ name: 'AirBrB API', docs: '/docs' }));
  api.get('/openapi.json', (c) =>
    c.json({ ...swaggerDocument, schemes: [new URL(c.req.url).protocol.replace(':', '')] }),
  );
  api.get('/docs', (c) =>
    c.html(`<!doctype html><html><head><title>AirBrB API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: 'openapi.json', dom_id: '#ui' });</script></body></html>`),
  );

  /* ---------- app ---------- */
  const app = new Hono<Env>();
  if (process.env.NODE_ENV !== 'test') app.use(logger());

  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(
    cors({
      origin: allowedOrigins?.length ? allowedOrigins : '*',
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(async (c, next) => {
    c.set('db', getDb());
    await next();
  });

  // Vercel forwards both /listings and /api/listings here.
  app.route('/api', api);
  app.route('/', api);

  app.notFound((c) => c.json({ error: 'Not found' }, 404));
  app.onError((err, c) => {
    if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
    if (err instanceof ZodError) return c.json({ error: formatZodError(err) }, 400);
    console.error('[unhandled]', c.req.method, c.req.path, err);
    return c.json({ error: 'A system error occurred' }, 500);
  });

  return app;
};
