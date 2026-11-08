import { and, desc, eq, ne, or } from 'drizzle-orm';
import type { Database } from '../db/client';
import { bookings, listings } from '../db/schema';
import { nightsBetween, normalizeRange, rangesOverlap } from '../lib/dates';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors';
import { isAvailable } from './listings';

type BookingRow = typeof bookings.$inferSelect;

const toBooking = (row: BookingRow) => ({
  id: row.id,
  owner: row.owner,
  // Old rows were stored as {from,to}; always return {start,end}.
  dateRange: normalizeRange(row.dateRange) ?? { start: '', end: '' },
  totalPrice: Number(row.totalPrice),
  listingId: row.listingId,
  status: row.status ?? 'pending',
});

/** Bookings the user made, plus bookings on listings the user hosts. */
export const listBookingsFor = async (db: Database, email: string) => {
  const rows = await db
    .select({ booking: bookings })
    .from(bookings)
    .innerJoin(listings, eq(bookings.listingId, listings.id))
    .where(or(eq(bookings.owner, email), eq(listings.owner, email)))
    .orderBy(desc(bookings.createdAt), desc(bookings.id));
  return rows.map((r) => toBooking(r.booking));
};

/** Does [start,end] clash with an accepted booking on this listing (other than `exceptId`)? */
const clashesWithAccepted = async (
  db: Pick<Database, 'select'>,
  listingId: number,
  start: string,
  end: string,
  exceptId?: number,
) => {
  const accepted = await db
    .select({ id: bookings.id, dateRange: bookings.dateRange })
    .from(bookings)
    .where(
      and(
        eq(bookings.listingId, listingId),
        eq(bookings.status, 'accepted'),
        exceptId !== undefined ? ne(bookings.id, exceptId) : undefined,
      ),
    );
  return accepted.some((b) => {
    const range = normalizeRange(b.dateRange);
    return range !== null && rangesOverlap(start, end, range.start, range.end);
  });
};

export const createBooking = async (
  db: Database,
  email: string,
  listingId: number,
  range: { start: string; end: string },
) => {
  const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
  if (!listing) throw notFound('Invalid listing ID');
  if (listing.owner === email) throw badRequest('Cannot make bookings for your own listings');
  if (!listing.published) throw badRequest('Cannot make a booking for an unpublished listing');

  const availability = Array.isArray(listing.availability) ? listing.availability : [];
  if (!isAvailable(availability, range.start, range.end)) {
    throw badRequest('The listing is not available for those dates');
  }
  if (await clashesWithAccepted(db, listingId, range.start, range.end)) {
    throw conflict('Those dates are already booked');
  }

  // Price is computed here; the client's totalPrice is not trusted.
  const totalPrice = Number(listing.price) * nightsBetween(range.start, range.end);
  const [row] = await db
    .insert(bookings)
    .values({ owner: email, listingId, dateRange: range, totalPrice: totalPrice.toFixed(2) })
    .returning({ id: bookings.id });
  return row.id;
};

const getBookingWithHost = async (db: Pick<Database, 'select'>, bookingId: number) => {
  const [row] = await db
    .select({ booking: bookings, host: listings.owner })
    .from(bookings)
    .innerJoin(listings, eq(bookings.listingId, listings.id))
    .where(eq(bookings.id, bookingId));
  if (!row) throw notFound('Invalid booking ID');
  return row;
};

export const deleteBooking = async (db: Database, email: string, bookingId: number) => {
  const { booking } = await getBookingWithHost(db, bookingId);
  if (booking.owner !== email) throw forbidden('User does not own this booking');
  await db.delete(bookings).where(eq(bookings.id, bookingId));
};

const assertPending = (status: string | null) => {
  if (status === 'accepted') throw badRequest('Booking has already been accepted');
  if (status === 'declined') throw badRequest('Booking has already been declined');
};

export const acceptBooking = async (db: Database, email: string, bookingId: number) => {
  await db.transaction(async (tx) => {
    const { booking, host } = await getBookingWithHost(tx, bookingId);
    if (host !== email) throw forbidden("Cannot accept bookings for a listing that isn't yours");
    assertPending(booking.status);

    // Lock the listing so two concurrent accepts can't both pass the clash check.
    await tx.select({ id: listings.id }).from(listings).where(eq(listings.id, booking.listingId)).for('update');

    const range = normalizeRange(booking.dateRange);
    if (range && (await clashesWithAccepted(tx, booking.listingId, range.start, range.end, bookingId))) {
      throw conflict('Another accepted booking already covers those dates');
    }
    await tx.update(bookings).set({ status: 'accepted' }).where(eq(bookings.id, bookingId));
  });
};

export const declineBooking = async (db: Database, email: string, bookingId: number) => {
  const { booking, host } = await getBookingWithHost(db, bookingId);
  if (host !== email) throw forbidden("Cannot decline bookings for a listing that isn't yours");
  assertPending(booking.status);
  await db.update(bookings).set({ status: 'declined' }).where(eq(bookings.id, bookingId));
};
