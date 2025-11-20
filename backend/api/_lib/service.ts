import jwt from 'jsonwebtoken';
import { InputError, AccessError } from './error';
import * as db from './datastore';
import { DateRange, Review } from './types';

// Support both standard and prefixed (starry_) variable names
// Note: starry_SUPABASE_JWT_SECRET is for Supabase, not for app JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || process.env['starry_JWT_SECRET'] || 'giraffegiraffebeetroot';

/***************************************************************
                       State Management
***************************************************************/

// Note: resourceLock is not needed with Postgres as connection pooling handles concurrency
// Kept for API compatibility with memory-based version
export const resourceLock = <T>(callback: (resolve: (value: T) => void, reject: (reason: any) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    callback(resolve, reject);
  });

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = (authorization: string | undefined): string => {
  try {
    if (!authorization) {
      throw new AccessError('Invalid Token');
    }
    const token = authorization.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    return decoded.email;
  } catch {
    throw new AccessError('Invalid Token');
  }
};

export const login = async (email: string, password: string): Promise<string> => {
  if (!email) {
    throw new InputError('Must provide an email for user login');
  }
  if (!password) {
    throw new InputError('Must provide a password for user login');
  }

  const user = await db.getUser(email);
  if (!user) {
    throw new InputError('Invalid email or password');
  }

  if (user.password === password) {
    await db.updateUser(email, { sessionActive: true });
    return jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' });
  }

  throw new InputError('Invalid email or password');
};

export const logout = async (email: string): Promise<void> => {
  await db.updateUser(email, { sessionActive: false });
};

export const register = async (email: string, password: string, name: string): Promise<string> => {
  if (!email) {
    throw new InputError('Must provide an email for user registration');
  }
  if (!password) {
    throw new InputError('Must provide a password for user registration');
  }
  if (!name) {
    throw new InputError('Must provide a name for user registration');
  }

  const exists = await db.userExists(email);
  if (exists) {
    throw new InputError('Email address already registered');
  }

  await db.createUser(email, {
    name,
    password,
    sessionActive: true,
  });

  return jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' });
};

/***************************************************************
                       Listing Functions
***************************************************************/

export const assertOwnsListing = async (email: string, listingId: string): Promise<void> => {
  const owner = await db.getListingOwner(listingId);
  if (!owner) {
    throw new InputError('Invalid listing ID');
  }
  if (owner !== email) {
    throw new InputError('User does not own this Listing');
  }
};

export const assertOwnsBooking = async (email: string, bookingId: string): Promise<void> => {
  const owner = await db.getBookingOwner(bookingId);
  if (!owner) {
    throw new InputError('Invalid booking ID');
  }
  if (owner !== email) {
    throw new InputError('User does not own this booking');
  }
};

export const addListing = async (
  title: string,
  email: string,
  address: object,
  price: number,
  thumbnail: string,
  metadata: object
): Promise<string> => {
  if (title === undefined) {
    throw new InputError('Must provide a title for new listing');
  }

  const existingId = await db.getListingByTitle(title);
  if (existingId) {
    throw new InputError('A listing with this title already exists');
  }

  if (address === undefined) {
    throw new InputError('Must provide an address for new listing');
  }
  if (price === undefined || isNaN(price)) {
    throw new InputError('Must provide a valid price for new listing');
  }
  if (thumbnail === undefined) {
    throw new InputError('Must provide a thumbnail for new listing');
  }
  if (metadata === undefined) {
    throw new InputError('Must provide property details for this listing');
  }

  return await db.createListing({
    title,
    owner: email,
    address,
    price,
    thumbnail,
    metadata,
  });
};

export const getListingDetails = async (listingId: string): Promise<any> => {
  const listing = await db.getListing(listingId);
  if (!listing) {
    throw new InputError('Invalid listing ID');
  }
  return listing;
};

export const getAllListings = async (): Promise<any[]> => {
  return await db.getAllListings();
};

export const updateListing = async (
  listingId: string,
  title?: string,
  address?: object,
  thumbnail?: string,
  price?: number,
  metadata?: object
): Promise<void> => {
  const updates: any = {};
  if (address) updates.address = address;
  if (title) updates.title = title;
  if (thumbnail) updates.thumbnail = thumbnail;
  if (price) updates.price = price;
  if (metadata) updates.metadata = metadata;

  await db.updateListing(listingId, updates);
};

export const removeListing = async (listingId: string): Promise<void> => {
  await db.deleteListing(listingId);
};

export const publishListing = async (listingId: string, availability: DateRange[]): Promise<void> => {
  if (availability === undefined) {
    throw new InputError('Must provide listing availability');
  }

  const listing = await db.getListing(listingId);
  if (!listing) {
    throw new InputError('Invalid listing ID');
  }

  if (listing.published === true) {
    throw new InputError('This listing is already published');
  }

  await db.updateListing(listingId, {
    availability,
    published: true,
    postedOn: new Date().toISOString(),
  });
};

export const unpublishListing = async (listingId: string): Promise<void> => {
  const listing = await db.getListing(listingId);
  if (!listing) {
    throw new InputError('Invalid listing ID');
  }

  if (listing.published === false) {
    throw new InputError('This listing is already unpublished');
  }

  await db.updateListing(listingId, {
    availability: [],
    published: false,
    postedOn: null,
  });
};

export const leaveListingReview = async (
  email: string,
  listingId: string,
  bookingId: string,
  review: Review
): Promise<void> => {
  const booking = await db.getBooking(bookingId);
  if (!booking) {
    throw new InputError('Invalid booking ID');
  }

  const listing = await db.getListing(listingId);
  if (!listing) {
    throw new InputError('Invalid listing ID');
  }

  if (booking.owner !== email) {
    throw new InputError('User has not stayed at this listing');
  }

  if (booking.listingId !== listingId) {
    throw new InputError('This booking is not associated with this listing ID');
  }

  if (review === undefined) {
    throw new InputError('Must provide review contents');
  }

  await db.addReview(listingId, email, bookingId, review);
};

/***************************************************************
                       Booking Functions
***************************************************************/

export const makeNewBooking = async (
  owner: string,
  dateRange: DateRange,
  totalPrice: number,
  listingId: string
): Promise<string> => {
  const listing = await db.getListing(listingId);
  if (!listing) {
    throw new InputError('Invalid listing ID');
  }

  if (dateRange === undefined) {
    throw new InputError('Must provide a valid date range for the booking');
  }
  if (totalPrice === undefined || totalPrice < 0 || isNaN(totalPrice)) {
    throw new InputError('Must provide a valid total price for this booking');
  }
  if (listing.owner === owner) {
    throw new InputError('Cannot make bookings for your own listings');
  }
  if (listing.published === false) {
    throw new InputError('Cannot make a booking for an unpublished listing');
  }

  return await db.createBooking({
    owner,
    dateRange,
    totalPrice,
    listingId,
  });
};

export const getAllBookings = async (): Promise<any[]> => {
  return await db.getAllBookings();
};

export const removeBooking = async (bookingId: string): Promise<void> => {
  await db.deleteBooking(bookingId);
};

export const acceptBooking = async (owner: string, bookingId: string): Promise<void> => {
  const booking = await db.getBooking(bookingId);
  if (!booking) {
    throw new InputError('Invalid booking ID');
  }

  const listingOwner = await db.getListingOwner(booking.listingId);
  if (listingOwner !== owner) {
    throw new InputError("Cannot accept bookings for a listing that isn't yours");
  }

  if (booking.status === 'accepted') {
    throw new InputError('Booking has already been accepted');
  }
  if (booking.status === 'declined') {
    throw new InputError('Booking has already been declined');
  }

  await db.updateBooking(bookingId, { status: 'accepted' });
};

export const declineBooking = async (owner: string, bookingId: string): Promise<void> => {
  const booking = await db.getBooking(bookingId);
  if (!booking) {
    throw new InputError('Invalid booking ID');
  }

  const listingOwner = await db.getListingOwner(booking.listingId);
  if (listingOwner !== owner) {
    throw new InputError("Cannot decline bookings for a listing that isn't yours");
  }

  if (booking.status === 'declined') {
    throw new InputError('Booking has already been declined');
  }
  if (booking.status === 'accepted') {
    throw new InputError('Booking has already been accepted');
  }

  await db.updateBooking(bookingId, { status: 'declined' });
};
