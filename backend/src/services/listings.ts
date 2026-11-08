import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import type { Database } from '../db/client';
import { bookings, listings, reviews, type ReviewData } from '../db/schema';
import { normalizeRange, rangeWithin } from '../lib/dates';
import { badRequest, forbidden, notFound } from '../lib/errors';
import type { ListingQuery } from '../validation';

/* ---------- SQL fragments over the JSONB columns ---------- */

/** Number of bedrooms: metadata.bedrooms is an array of rooms (or a legacy number). */
const bedroomCount = sql<number>`(CASE jsonb_typeof(${listings.metadata}->'bedrooms')
  WHEN 'array' THEN jsonb_array_length(${listings.metadata}->'bedrooms')
  WHEN 'number' THEN (${listings.metadata}->>'bedrooms')::numeric
  ELSE 0 END)`;

const bathroomCount = sql<number>`(CASE
  WHEN jsonb_typeof(${listings.metadata}->'bathrooms') = 'number'
    THEN (${listings.metadata}->>'bathrooms')::numeric
  WHEN (${listings.metadata}->>'bathrooms') ~ '^[0-9]+(\\.[0-9]+)?$'
    THEN (${listings.metadata}->>'bathrooms')::numeric
  ELSE 0 END)`;

/** First 10 chars of a JSON date string as a date, or NULL if it isn't one. */
const jsonDate = (expr: SQL) =>
  sql`(CASE WHEN ${expr} ~ '^\\d{4}-\\d{2}-\\d{2}' THEN substring(${expr} from 1 for 10)::date END)`;

/** Listing has an availability range covering the whole stay [from, to]. */
const availableFor = (from: string, to: string) => sql`EXISTS (
  SELECT 1 FROM jsonb_array_elements(
    CASE WHEN jsonb_typeof(${listings.availability}) = 'array' THEN ${listings.availability} ELSE '[]'::jsonb END
  ) AS a
  WHERE ${jsonDate(sql`coalesce(a->>'from', a->>'start')`)} <= ${from.slice(0, 10)}::date
    AND ${jsonDate(sql`coalesce(a->>'to', a->>'end')`)} >= ${to.slice(0, 10)}::date
)`;

const reviewsJson = sql<ReviewData[]>`(
  SELECT coalesce(json_agg(r.review_data ORDER BY r.created_at DESC), '[]'::json)
  FROM ${reviews} r WHERE r.listing_id = ${listings.id}
)`;

const averageRating = sql`(
  SELECT avg(coalesce(r.review_data->>'rating', r.review_data->>'score')::numeric)
  FROM ${reviews} r WHERE r.listing_id = ${listings.id}
)`;

const listingFields = {
  id: listings.id,
  title: listings.title,
  owner: listings.owner,
  address: listings.address,
  price: listings.price,
  thumbnail: listings.thumbnail,
  metadata: listings.metadata,
  availability: listings.availability,
  published: listings.published,
  postedOn: listings.postedOn,
  reviews: reviewsJson,
};

type ListingRow = {
  id: number;
  title: string;
  owner: string;
  address: unknown;
  price: string;
  thumbnail: string | null;
  metadata: unknown;
  availability: unknown;
  published: boolean | null;
  postedOn: Date | null;
  reviews: ReviewData[] | null;
};

const toListing = (row: ListingRow) => ({
  id: row.id,
  title: row.title,
  owner: row.owner,
  address: row.address ?? {},
  price: Number(row.price),
  thumbnail: row.thumbnail ?? '',
  metadata: row.metadata ?? {},
  availability: Array.isArray(row.availability) ? row.availability : [],
  published: row.published === true,
  postedOn: row.postedOn ? row.postedOn.toISOString() : null,
  reviews: row.reviews ?? [],
});

/* ---------- queries ---------- */

export const searchListings = async (db: Database, query: ListingQuery) => {
  const conditions: SQL[] = [];
  if (query.q) {
    const pattern = `%${query.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    conditions.push(
      or(ilike(listings.title, pattern), sql`${listings.address}->>'city' ILIKE ${pattern}`)!,
    );
  }
  if (query.published !== undefined) conditions.push(eq(listings.published, query.published));
  if (query.minPrice !== undefined) conditions.push(gte(listings.price, String(query.minPrice)));
  if (query.maxPrice !== undefined) conditions.push(lte(listings.price, String(query.maxPrice)));
  if (query.minBedrooms !== undefined) conditions.push(sql`${bedroomCount} >= ${query.minBedrooms}`);
  if (query.maxBedrooms !== undefined) conditions.push(sql`${bedroomCount} <= ${query.maxBedrooms}`);
  if (query.minBathrooms !== undefined) conditions.push(sql`${bathroomCount} >= ${query.minBathrooms}`);
  if (query.maxBathrooms !== undefined) conditions.push(sql`${bathroomCount} <= ${query.maxBathrooms}`);
  if (query.from || query.to) {
    if (!query.from || !query.to) throw badRequest('from and to must be given together');
    conditions.push(availableFor(query.from, query.to));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy = {
    newest: [desc(listings.createdAt), desc(listings.id)],
    title_asc: [asc(sql`lower(${listings.title})`)],
    title_desc: [desc(sql`lower(${listings.title})`)],
    price_asc: [asc(listings.price)],
    price_desc: [desc(listings.price)],
    rating_desc: [sql`${averageRating} DESC NULLS LAST`, desc(listings.id)],
  }[query.sort];

  const base = db.select(listingFields).from(listings).where(where).orderBy(...orderBy);
  const rows = query.page
    ? await base.limit(query.pageSize).offset((query.page - 1) * query.pageSize)
    : await base;

  const [{ total }] = await db.select({ total: count() }).from(listings).where(where);
  return {
    listings: rows.map(toListing),
    total,
    ...(query.page ? { page: query.page, pageSize: query.pageSize } : {}),
  };
};

export const getListing = async (db: Database, id: number) => {
  const [row] = await db.select(listingFields).from(listings).where(eq(listings.id, id));
  if (!row) throw notFound('Invalid listing ID');
  return toListing(row);
};

export const assertOwnsListing = async (db: Database, email: string, id: number) => {
  const [row] = await db.select({ owner: listings.owner }).from(listings).where(eq(listings.id, id));
  if (!row) throw notFound('Invalid listing ID');
  if (row.owner !== email) throw forbidden('User does not own this listing');
};

type ListingInput = {
  title: string;
  address: Record<string, unknown>;
  price: number;
  thumbnail: string;
  metadata: Record<string, unknown>;
};

export const createListing = async (db: Database, owner: string, input: ListingInput) => {
  const [row] = await db
    .insert(listings)
    .values({ ...input, owner, price: String(input.price) })
    .returning({ id: listings.id });
  return row.id;
};

export const updateListing = async (db: Database, id: number, input: Partial<ListingInput>) => {
  const { price, ...rest } = input;
  const values = { ...rest, ...(price !== undefined ? { price: String(price) } : {}) };
  if (Object.keys(values).length === 0) return;
  await db.update(listings).set(values).where(eq(listings.id, id));
};

export const deleteListing = async (db: Database, id: number) => {
  await db.delete(listings).where(eq(listings.id, id));
};

export const publishListing = async (
  db: Database,
  id: number,
  availability: { start: string; end: string }[],
) => {
  const listing = await getListing(db, id);
  if (listing.published) throw badRequest('This listing is already published');
  await db
    .update(listings)
    .set({
      // Stored as {from,to}, the format existing rows and the frontend use.
      availability: availability.map(({ start, end }) => ({ from: start, to: end })),
      published: true,
      postedOn: new Date(),
    })
    .where(eq(listings.id, id));
};

export const unpublishListing = async (db: Database, id: number) => {
  const listing = await getListing(db, id);
  if (!listing.published) throw badRequest('This listing is already unpublished');
  await db
    .update(listings)
    .set({ availability: [], published: false, postedOn: null })
    .where(eq(listings.id, id));
};

/** Whether a stay fits entirely inside one of the listing's availability ranges. */
export const isAvailable = (availability: unknown[], start: string, end: string) =>
  availability.some((raw) => {
    const range = normalizeRange(raw as Record<string, unknown>);
    return range !== null && rangeWithin(start, end, range.start, range.end);
  });

export const addReview = async (
  db: Database,
  email: string,
  listingId: number,
  bookingId: number,
  review: ReviewData,
) => {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  if (!booking) throw notFound('Invalid booking ID');
  await getListing(db, listingId);
  if (booking.owner !== email) throw forbidden('User has not stayed at this listing');
  if (booking.listingId !== listingId) {
    throw badRequest('This booking is not associated with this listing ID');
  }
  if (booking.status !== 'accepted') throw badRequest('Only accepted bookings can be reviewed');

  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, bookingId));
  if (existing) throw badRequest('This booking has already been reviewed');

  await db.insert(reviews).values({
    listingId,
    bookingId,
    reviewerEmail: email,
    reviewData: { ...review, userEmail: email },
  });
};
