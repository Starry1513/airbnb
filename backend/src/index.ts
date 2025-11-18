import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { pgTable, serial, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'airbrb-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

export type DateRange = {
  start: string;
  end: string;
};

export type ListingReview = {
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ListingMetadata = Record<string, unknown>;

export type BookingStatus = 'pending' | 'accepted' | 'declined';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  sessionActive: boolean('session_active').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  ownerEmail: text('owner_email')
    .notNull()
    .references(() => users.email, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  thumbnail: text('thumbnail').notNull(),
  price: integer('price').notNull(),
  metadata: jsonb('metadata').$type<ListingMetadata>().notNull(),
  availability: jsonb('availability').$type<DateRange[]>().default(sql`'[]'::jsonb`).notNull(),
  reviews: jsonb('reviews').$type<ListingReview[]>().default(sql`'[]'::jsonb`).notNull(),
  published: boolean('published').default(false).notNull(),
  postedOn: timestamp('posted_on', { withTimezone: true }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email')
    .notNull()
    .references(() => users.email, { onDelete: 'cascade' }),
  listingId: integer('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  dateRange: jsonb('date_range').$type<DateRange>().notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status').$type<BookingStatus>().default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const db = drizzle(sql);

const hashPassword = (password: string) => {
  const salt = process.env.PASSWORD_SALT ?? 'airbrb-dev-salt';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
};

const issueToken = (email: string) =>
  jwt.sign({ email }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  });

export async function registerUser(email: string, password: string, name: string) {
  if (!email) throw new Error('Must provide an email for user registration');
  if (!password) throw new Error('Must provide a password for user registration');
  if (!name) throw new Error('Must provide a name for user registration');

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) throw new Error('Email address already registered');

  const passwordHash = hashPassword(password);
  await db.insert(users).values({ email, name, passwordHash, sessionActive: true });
  return { token: issueToken(email) };
}

export async function loginUser(email: string, password: string) {
  if (!email) throw new Error('Must provide an email for user login');
  if (!password) throw new Error('Must provide a password for user login');

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) throw new Error('Invalid email or password');
  if (user.passwordHash !== hashPassword(password)) throw new Error('Invalid email or password');

  await db.update(users).set({ sessionActive: true }).where(eq(users.email, email));
  return { token: issueToken(email) };
}

export async function logoutUser(email: string) {
  await db.update(users).set({ sessionActive: false }).where(eq(users.email, email));
}

export async function createListing(
  payload: {
    title: string;
    ownerEmail: string;
    address: string;
    thumbnail: string;
    price: number;
    metadata: ListingMetadata;
  },
) {
  const { title, ownerEmail, address, thumbnail, price, metadata } = payload;
  if (!title) throw new Error('Must provide a title for new listing');
  if (!address) throw new Error('Must provide an address for new listing');
  if (price === undefined || Number.isNaN(price)) throw new Error('Must provide a valid price for new listing');
  if (!thumbnail) throw new Error('Must provide a thumbnail for new listing');
  if (!metadata) throw new Error('Must provide property details for this listing');

  const duplicate = await db.select().from(listings).where(eq(listings.title, title));
  if (duplicate.length) throw new Error('A listing with this title already exists');

  const inserted = await db
    .insert(listings)
    .values({
      title,
      ownerEmail,
      address,
      thumbnail,
      price,
      metadata,
    })
    .returning({ id: listings.id });

  return inserted[0]?.id;
}

export async function getAllListings() {
  return db
    .select({
      id: listings.id,
      title: listings.title,
      ownerEmail: listings.ownerEmail,
      address: listings.address,
      thumbnail: listings.thumbnail,
      price: listings.price,
      reviews: listings.reviews,
      published: listings.published,
      postedOn: listings.postedOn,
    })
    .from(listings);
}

export async function getListingDetails(listingId: number) {
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
  if (!listing) throw new Error('Invalid listing ID');
  return listing;
}

const ensureListingOwner = async (email: string, listingId: number) => {
  const listing = await getListingDetails(listingId);
  if (listing.ownerEmail !== email) {
    throw new Error('User does not own this Listing');
  }
  return listing;
};

export async function updateListing(
  listingId: number,
  email: string,
  updates: Partial<{
    title: string;
    address: string;
    thumbnail: string;
    price: number;
    metadata: ListingMetadata;
  }>,
) {
  await ensureListingOwner(email, listingId);
  await db
    .update(listings)
    .set({
      ...updates,
    })
    .where(eq(listings.id, listingId));
}

export async function deleteListing(listingId: number, email: string) {
  await ensureListingOwner(email, listingId);
  await db.delete(listings).where(eq(listings.id, listingId));
}

export async function publishListing(listingId: number, email: string, availability: DateRange[]) {
  if (!availability) throw new Error('Must provide listing availability');
  const listing = await ensureListingOwner(email, listingId);
  if (listing.published) throw new Error('This listing is already published');

  await db
    .update(listings)
    .set({
      published: true,
      availability,
      postedOn: new Date(),
    })
    .where(eq(listings.id, listingId));
}

export async function unpublishListing(listingId: number, email: string) {
  const listing = await ensureListingOwner(email, listingId);
  if (!listing.published) throw new Error('This listing is already unpublished');

  await db
    .update(listings)
    .set({
      published: false,
      availability: [],
      postedOn: null,
    })
    .where(eq(listings.id, listingId));
}

export async function leaveListingReview(
  email: string,
  listingId: number,
  bookingId: number,
  review: Omit<ListingReview, 'author' | 'createdAt'> & { rating: number; comment: string },
) {
  if (!review) throw new Error('Must provide review contents');
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error('Invalid booking ID');
  if (booking.ownerEmail !== email) throw new Error('User has not stayed at this listing');
  if (booking.listingId !== listingId) throw new Error('This booking is not associated with this listing ID');

  const listing = await getListingDetails(listingId);
  const nextReviews = [
    ...(listing.reviews ?? []),
    {
      author: email,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString(),
    },
  ];

  await db.update(listings).set({ reviews: nextReviews }).where(eq(listings.id, listingId));
}

export async function getAllBookings() {
  return db
    .select({
      id: bookings.id,
      ownerEmail: bookings.ownerEmail,
      dateRange: bookings.dateRange,
      totalPrice: bookings.totalPrice,
      listingId: bookings.listingId,
      status: bookings.status,
    })
    .from(bookings);
}

export async function getBooking(bookingId: number) {
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId));
  return booking;
}

export async function createBooking(
  ownerEmail: string,
  listingId: number,
  dateRange: DateRange,
  totalPrice: number,
) {
  const listing = await getListingDetails(listingId);
  if (!dateRange) throw new Error('Must provide a valid date range for the booking');
  if (totalPrice === undefined || totalPrice < 0 || Number.isNaN(totalPrice)) {
    throw new Error('Must provide a valid total price for this booking');
  }
  if (listing.ownerEmail === ownerEmail) throw new Error('Cannot make bookings for your own listings');
  if (!listing.published) throw new Error('Cannot make a booking for an unpublished listing');

  const inserted = await db
    .insert(bookings)
    .values({
      ownerEmail,
      listingId,
      dateRange,
      totalPrice,
    })
    .returning({ id: bookings.id });

  return inserted[0]?.id;
}

const ensureBookingOwner = async (email: string, bookingId: number) => {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error('Invalid booking ID');
  const listing = await getListingDetails(booking.listingId);
  if (listing.ownerEmail !== email) throw new Error("Cannot accept bookings for a listing that isn't yours");
  return { booking, listing };
};

export async function removeBooking(bookingId: number, email: string) {
  const { booking, listing } = await ensureBookingOwner(email, bookingId);
  if (listing.ownerEmail !== email && booking.ownerEmail !== email) {
    throw new Error('User does not own this booking');
  }
  await db.delete(bookings).where(eq(bookings.id, bookingId));
}

export async function acceptBooking(email: string, bookingId: number) {
  const { booking } = await ensureBookingOwner(email, bookingId);
  if (booking.status === 'accepted') throw new Error('Booking has already been accepted');
  if (booking.status === 'declined') throw new Error('Booking has already been declined');
  await db.update(bookings).set({ status: 'accepted' }).where(eq(bookings.id, bookingId));
}

export async function declineBooking(email: string, bookingId: number) {
  const { booking } = await ensureBookingOwner(email, bookingId);
  if (booking.status === 'declined') throw new Error('Booking has already been declined');
  if (booking.status === 'accepted') throw new Error('Booking has already been accepted');
  await db.update(bookings).set({ status: 'declined' }).where(eq(bookings.id, bookingId));
}

export async function assertOwnsBooking(email: string, bookingId: number) {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error('Invalid booking ID');
  if (booking.ownerEmail !== email) throw new Error('User does not own this booking');
}
