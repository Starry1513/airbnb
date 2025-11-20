import { query } from './db';
import { DataStore, User, Listing, Booking } from './types';

/**
 * PostgreSQL Data Store Implementation
 * This replaces the in-memory store with persistent database storage
 */

// ==================== User Operations ====================

export const getUser = async (email: string): Promise<User | null> => {
  const result = await query(
    'SELECT email, name, password, session_active FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    name: row.name,
    password: row.password,
    sessionActive: row.session_active,
  };
};

export const createUser = async (email: string, user: User): Promise<void> => {
  await query(
    'INSERT INTO users (email, name, password, session_active) VALUES ($1, $2, $3, $4)',
    [email, user.name, user.password, user.sessionActive]
  );
};

export const updateUser = async (email: string, user: Partial<User>): Promise<void> => {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (user.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(user.name);
  }
  if (user.password !== undefined) {
    updates.push(`password = $${paramIndex++}`);
    values.push(user.password);
  }
  if (user.sessionActive !== undefined) {
    updates.push(`session_active = $${paramIndex++}`);
    values.push(user.sessionActive);
  }

  if (updates.length > 0) {
    values.push(email);
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramIndex}`,
      values
    );
  }
};

export const userExists = async (email: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM users WHERE email = $1', [email]);
  return result.rows.length > 0;
};

// ==================== Listing Operations ====================

export const getListing = async (listingId: string): Promise<Listing | null> => {
  const result = await query(
    `SELECT id, title, owner, address, price, thumbnail, metadata,
            availability, published, posted_on
     FROM listings WHERE id = $1`,
    [listingId]
  );
  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Get reviews for this listing
  const reviewsResult = await query(
    'SELECT review_data FROM reviews WHERE listing_id = $1 ORDER BY created_at DESC',
    [listingId]
  );

  return {
    title: row.title,
    owner: row.owner,
    address: row.address,
    price: parseFloat(row.price),
    thumbnail: row.thumbnail,
    metadata: row.metadata,
    reviews: reviewsResult.rows.map(r => r.review_data),
    availability: row.availability || [],
    published: row.published,
    postedOn: row.posted_on,
  };
};

export const getAllListings = async (): Promise<Array<any>> => {
  const result = await query(
    `SELECT l.id, l.title, l.owner, l.address, l.thumbnail, l.price,
            COALESCE(json_agg(r.review_data) FILTER (WHERE r.id IS NOT NULL), '[]') as reviews
     FROM listings l
     LEFT JOIN reviews r ON l.id = r.listing_id
     GROUP BY l.id
     ORDER BY l.created_at DESC`
  );

  return result.rows.map(row => ({
    id: row.id,
    title: row.title,
    owner: row.owner,
    address: row.address,
    thumbnail: row.thumbnail,
    price: parseFloat(row.price),
    reviews: row.reviews,
  }));
};

export const createListing = async (listing: Omit<Listing, 'reviews' | 'availability' | 'published' | 'postedOn'>): Promise<string> => {
  const result = await query(
    `INSERT INTO listings (title, owner, address, price, thumbnail, metadata)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [listing.title, listing.owner, JSON.stringify(listing.address), listing.price, listing.thumbnail, JSON.stringify(listing.metadata)]
  );
  return result.rows[0].id.toString();
};

export const updateListing = async (listingId: string, updates: Partial<Listing>): Promise<void> => {
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    updateFields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.address !== undefined) {
    updateFields.push(`address = $${paramIndex++}`);
    values.push(JSON.stringify(updates.address));
  }
  if (updates.price !== undefined) {
    updateFields.push(`price = $${paramIndex++}`);
    values.push(updates.price);
  }
  if (updates.thumbnail !== undefined) {
    updateFields.push(`thumbnail = $${paramIndex++}`);
    values.push(updates.thumbnail);
  }
  if (updates.metadata !== undefined) {
    updateFields.push(`metadata = $${paramIndex++}`);
    values.push(JSON.stringify(updates.metadata));
  }
  if (updates.availability !== undefined) {
    updateFields.push(`availability = $${paramIndex++}`);
    values.push(JSON.stringify(updates.availability));
  }
  if (updates.published !== undefined) {
    updateFields.push(`published = $${paramIndex++}`);
    values.push(updates.published);
  }
  if (updates.postedOn !== undefined) {
    updateFields.push(`posted_on = $${paramIndex++}`);
    values.push(updates.postedOn);
  }

  if (updateFields.length > 0) {
    values.push(listingId);
    await query(
      `UPDATE listings SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }
};

export const deleteListing = async (listingId: string): Promise<void> => {
  await query('DELETE FROM listings WHERE id = $1', [listingId]);
};

export const listingExists = async (listingId: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM listings WHERE id = $1', [listingId]);
  return result.rows.length > 0;
};

export const getListingByTitle = async (title: string): Promise<string | null> => {
  const result = await query('SELECT id FROM listings WHERE title = $1', [title]);
  return result.rows.length > 0 ? result.rows[0].id.toString() : null;
};

export const getListingOwner = async (listingId: string): Promise<string | null> => {
  const result = await query('SELECT owner FROM listings WHERE id = $1', [listingId]);
  return result.rows.length > 0 ? result.rows[0].owner : null;
};

export const addReview = async (listingId: string, reviewerEmail: string, bookingId: string, review: any): Promise<void> => {
  await query(
    'INSERT INTO reviews (listing_id, reviewer_email, booking_id, review_data) VALUES ($1, $2, $3, $4)',
    [listingId, reviewerEmail, parseInt(bookingId), JSON.stringify(review)]
  );
};

// ==================== Booking Operations ====================

export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  const result = await query(
    'SELECT id, owner, listing_id, date_range, total_price, status FROM bookings WHERE id = $1',
    [bookingId]
  );
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    owner: row.owner,
    dateRange: row.date_range,
    totalPrice: parseFloat(row.total_price),
    listingId: row.listing_id.toString(),
    status: row.status,
  };
};

export const getAllBookings = async (): Promise<Array<any>> => {
  const result = await query(
    'SELECT id, owner, date_range, total_price, listing_id, status FROM bookings ORDER BY created_at DESC'
  );

  return result.rows.map(row => ({
    id: row.id,
    owner: row.owner,
    dateRange: row.date_range,
    totalPrice: parseFloat(row.total_price),
    listingId: row.listing_id.toString(),
    status: row.status,
  }));
};

export const createBooking = async (booking: Omit<Booking, 'status'>): Promise<string> => {
  const result = await query(
    'INSERT INTO bookings (owner, listing_id, date_range, total_price) VALUES ($1, $2, $3, $4) RETURNING id',
    [booking.owner, parseInt(booking.listingId), JSON.stringify(booking.dateRange), booking.totalPrice]
  );
  return result.rows[0].id.toString();
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<void> => {
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    updateFields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.dateRange !== undefined) {
    updateFields.push(`date_range = $${paramIndex++}`);
    values.push(JSON.stringify(updates.dateRange));
  }
  if (updates.totalPrice !== undefined) {
    updateFields.push(`total_price = $${paramIndex++}`);
    values.push(updates.totalPrice);
  }

  if (updateFields.length > 0) {
    values.push(bookingId);
    await query(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }
};

export const deleteBooking = async (bookingId: string): Promise<void> => {
  await query('DELETE FROM bookings WHERE id = $1', [bookingId]);
};

export const bookingExists = async (bookingId: string): Promise<boolean> => {
  const result = await query('SELECT 1 FROM bookings WHERE id = $1', [bookingId]);
  return result.rows.length > 0;
};

export const getBookingOwner = async (bookingId: string): Promise<string | null> => {
  const result = await query('SELECT owner FROM bookings WHERE id = $1', [bookingId]);
  return result.rows.length > 0 ? result.rows[0].owner : null;
};

// ==================== Legacy compatibility (for getDataStore pattern) ====================

export const getDataStore = async (): Promise<DataStore> => {
  // This is for backward compatibility but should not be used with Postgres
  // Individual operations should be used instead
  throw new Error('getDataStore() is not supported with Postgres backend. Use individual data operations.');
};

export const saveDataStore = async (updates: Partial<DataStore>): Promise<void> => {
  // This is for backward compatibility but should not be used with Postgres
  throw new Error('saveDataStore() is not supported with Postgres backend. Use individual data operations.');
};

export const resetDataStore = async (): Promise<void> => {
  // Delete all data
  await query('TRUNCATE users, listings, bookings, reviews CASCADE');
};
