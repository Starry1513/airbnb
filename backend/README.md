# AirBrB API

REST API for AirBrB, a short-stay booking app. Runs as a single Vercel Node.js
function backed by PostgreSQL (Supabase).

**Stack:** Hono · Drizzle ORM · PostgreSQL · zod · JWT + bcrypt · Vitest + PGlite

```
api/index.ts          Vercel entry — adapts the Hono app to Node (req, res)
src/app.ts            Routes, auth middleware, CORS, error mapping
src/validation.ts     zod schemas for every request body / query string
src/services/         Business rules (users, listings, bookings)
src/db/schema.ts      Drizzle schema  →  drizzle/ (SQL migrations)
src/lib/              JWT/bcrypt, date-range helpers, HTTP errors
test/                 API tests against an in-memory Postgres (PGlite)
```

## Running locally

```bash
pnpm install
cp .env.example .env    # then fill in DATABASE_URL and JWT_SECRET
pnpm dev                # http://localhost:5005, docs at /docs
pnpm test               # no database needed
```

| Variable       | Required | Notes |
|----------------|----------|-------|
| `DATABASE_URL` | yes      | Postgres URL. For Supabase use the transaction pooler (port 6543). `POSTGRES_URL` also works. |
| `JWT_SECRET`   | yes      | ≥16 characters. The API refuses to issue or accept tokens without it. |
| `CORS_ORIGIN`  | no       | Comma-separated allowed origins. Defaults to `*`. |

## Database & migrations

The schema lives in `src/db/schema.ts`; migrations are generated from it:

```bash
pnpm db:generate   # write a new SQL migration after editing the schema
pnpm db:migrate    # apply pending migrations to DATABASE_URL
```

`drizzle/0000_baseline.sql` matches the tables the production database was
originally created with. **Don't run it against that database** — the tables
already exist. Before the first `db:migrate` there, mark the baseline as
applied (insert its hash into `drizzle.__drizzle_migrations`), or keep making
schema changes as new migrations only.

## API

All responses are JSON. Errors are `{ "error": string }` with status 400
(invalid input), 403 (missing/invalid token or not your resource), 404, or 409
(date clash). Authenticated routes need `Authorization: Bearer <token>`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/user/auth/register` | | `{ email, password, name }` → `{ token }` |
| POST | `/user/auth/login` | | `{ email, password }` → `{ token }` |
| POST | `/user/auth/logout` | ✓ | Invalidates the user's tokens |
| GET | `/listings` | | Search — see below |
| POST | `/listings/new` | ✓ | `{ title, address, price, thumbnail, metadata }` → `{ listingId }` |
| GET | `/listings/:id` | | `{ listing }` |
| PUT | `/listings/:id` | owner | Any subset of the create fields |
| DELETE | `/listings/:id` | owner | |
| PUT | `/listings/publish/:id` | owner | `{ availability: [{ from, to }] }` |
| PUT | `/listings/unpublish/:id` | owner | |
| PUT | `/listings/:id/review/:bookingId` | guest | `{ review: { rating 0–5, text } }` — accepted bookings only, once each |
| GET | `/bookings` | ✓ | Bookings you made + bookings on your listings |
| POST | `/bookings/new/:listingId` | ✓ | `{ dateRange: { start, end } }` → `{ bookingId }` |
| DELETE | `/bookings/:id` | guest | |
| PUT | `/bookings/accept/:id` | host | 409 if it overlaps an accepted booking |
| PUT | `/bookings/decline/:id` | host | |

Every route is also served under `/api/...`. Swagger UI is at `/docs`.

### Listing search

`GET /listings` with no parameters returns every listing (newest first), as
before. Optional query parameters:

| Param | Meaning |
|---|---|
| `q` | Case-insensitive match on title or city |
| `minPrice`, `maxPrice` | Nightly price |
| `minBedrooms`, `maxBedrooms` | Count of `metadata.bedrooms` |
| `minBathrooms`, `maxBathrooms` | `metadata.bathrooms` |
| `from`, `to` | Only listings available for the whole stay (give both) |
| `published` | `true` / `false` |
| `sort` | `newest` (default), `title_asc`, `title_desc`, `price_asc`, `price_desc`, `rating_desc` |
| `page`, `pageSize` | Pagination (pageSize ≤ 100, default 20). Response adds `page`, `pageSize`; `total` is always present. |

### Business rules enforced by the server

- Passwords are bcrypt-hashed. Plaintext passwords left by the previous
  backend are upgraded to a hash on the user's next successful login.
- Tokens expire after 7 days and stop working after logout.
- Booking price = nightly price × nights, computed server-side; the client's
  `totalPrice` is ignored.
- A booking must fit inside one of the listing's availability ranges and must
  not overlap an accepted booking. Accepting runs in a transaction that locks
  the listing, so two overlapping bookings can't both be accepted.
- Booking dates are returned as `{ start, end }` (older rows stored `{ from, to }`).
