import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Mirrors the tables already running in production (originally created by
 * database/schema.sql), so the baseline migration is a no-op there.
 */

export type AvailabilityRange = { from: string; to: string };
export type BookingDateRange = { start: string; end: string };
export type ReviewData = { rating: number; text: string; [key: string]: unknown };

export const users = pgTable('users', {
  email: varchar('email', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  // bcrypt hash. Rows created by the old backend hold plaintext and are
  // upgraded to a hash the next time that user logs in.
  password: varchar('password', { length: 255 }).notNull(),
  sessionActive: boolean('session_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const listings = pgTable(
  'listings',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull().unique(),
    owner: varchar('owner', { length: 255 })
      .notNull()
      .references(() => users.email, { onDelete: 'cascade' }),
    address: jsonb('address').notNull().$type<Record<string, unknown>>(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    thumbnail: text('thumbnail'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    availability: jsonb('availability').$type<unknown[]>().default(sql`'[]'::jsonb`),
    published: boolean('published').default(false),
    postedOn: timestamp('posted_on'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('idx_listings_owner').on(t.owner),
    index('idx_listings_published').on(t.published),
  ],
);

export const bookings = pgTable(
  'bookings',
  {
    id: serial('id').primaryKey(),
    owner: varchar('owner', { length: 255 })
      .notNull()
      .references(() => users.email, { onDelete: 'cascade' }),
    listingId: integer('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    dateRange: jsonb('date_range').notNull().$type<Record<string, string>>(),
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [
    index('idx_bookings_owner').on(t.owner),
    index('idx_bookings_listing').on(t.listingId),
    index('idx_bookings_status').on(t.status),
    check('bookings_status_check', sql`${t.status} IN ('pending', 'accepted', 'declined')`),
  ],
);

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    listingId: integer('listing_id')
      .notNull()
      .references(() => listings.id, { onDelete: 'cascade' }),
    reviewerEmail: varchar('reviewer_email', { length: 255 })
      .notNull()
      .references(() => users.email, { onDelete: 'cascade' }),
    bookingId: integer('booking_id').references((): AnyPgColumn => bookings.id, {
      onDelete: 'set null',
    }),
    reviewData: jsonb('review_data').notNull().$type<ReviewData>(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (t) => [index('idx_reviews_listing').on(t.listingId)],
);
