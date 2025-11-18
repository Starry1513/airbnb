import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { InputError, AccessError } from './error';
import { getDataStore, saveDataStore } from './datastore';
import { Listing, Booking, Review, DateRange } from './types';

const lock = new AsyncLock();

const JWT_SECRET = process.env.JWT_SECRET || 'giraffegiraffebeetroot';

/***************************************************************
                       State Management
***************************************************************/

export const resourceLock = <T>(callback: (resolve: (value: T) => void, reject: (reason: any) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    lock.acquire('resourceLock', callback(resolve, reject));
  });

const randNum = (max: number): number => Math.round(Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10));
const generateId = (currentList: string[], max = 999999999): string => {
  let R = randNum(max);
  while (currentList.includes(R.toString())) {
    R = randNum(max);
  }
  return R.toString();
};

const newListingId = (listings: Record<string, Listing>): string => generateId(Object.keys(listings));
const newBookingId = (bookings: Record<string, Booking>): string => generateId(Object.keys(bookings));

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
    const { email } = decoded;
    const { users } = getDataStore();
    if (!(email in users)) {
      throw new AccessError('Invalid Token');
    }
    return email;
  } catch {
    throw new AccessError('Invalid Token');
  }
};

export const login = (email: string, password: string): Promise<string> =>
  resourceLock<string>((resolve, reject) => {
    const { users } = getDataStore();
    if (!email) {
      return reject(new InputError('Must provide an email for user login'));
    } else if (!password) {
      return reject(new InputError('Must provide a password for user login'));
    } else if (email && email in users) {
      if (users[email].password === password) {
        users[email].sessionActive = true;
        saveDataStore({ users });
        resolve(jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' }));
      }
    }
    return reject(new InputError('Invalid email or password'));
  });

export const logout = (email: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { users } = getDataStore();
    users[email].sessionActive = false;
    saveDataStore({ users });
    resolve();
  });

export const register = (email: string, password: string, name: string): Promise<string> =>
  resourceLock<string>((resolve, reject) => {
    const { users } = getDataStore();
    if (!email) {
      return reject(new InputError('Must provide an email for user registration'));
    } else if (!password) {
      return reject(new InputError('Must provide a password for user registration'));
    } else if (!name) {
      return reject(new InputError('Must provide a name for user registration'));
    } else if (email && email in users) {
      return reject(new InputError('Email address already registered'));
    } else {
      users[email] = {
        name,
        password,
        sessionActive: true,
      };
      saveDataStore({ users });
      const token = jwt.sign({ email }, JWT_SECRET, { algorithm: 'HS256' });
      resolve(token);
    }
  });

/***************************************************************
                       Listing Functions
***************************************************************/

const newListingPayload = (
  title: string,
  owner: string,
  address: object,
  price: number,
  thumbnail: string,
  metadata: object
): Listing => ({
  title,
  owner,
  address,
  price,
  thumbnail,
  metadata,
  reviews: [],
  availability: [],
  published: false,
  postedOn: null,
});

export const assertOwnsListing = (email: string, listingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings } = getDataStore();
    if (!(listingId in listings)) {
      return reject(new InputError('Invalid listing ID'));
    } else if (listings[listingId].owner !== email) {
      return reject(new InputError('User does not own this Listing'));
    } else {
      resolve();
    }
  });

export const assertOwnsBooking = (email: string, bookingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { bookings } = getDataStore();
    if (!(bookingId in bookings)) {
      return reject(new InputError('Invalid booking ID'));
    } else if (bookings[bookingId].owner !== email) {
      return reject(new InputError('User does not own this booking'));
    } else {
      resolve();
    }
  });

export const addListing = (
  title: string,
  email: string,
  address: object,
  price: number,
  thumbnail: string,
  metadata: object
): Promise<string> =>
  resourceLock<string>((resolve, reject) => {
    const { listings } = getDataStore();
    if (title === undefined) {
      return reject(new InputError('Must provide a title for new listing'));
    } else if (Object.keys(listings).find((key) => listings[key].title === title) !== undefined) {
      return reject(new InputError('A listing with this title already exists'));
    } else if (address === undefined) {
      return reject(new InputError('Must provide an address for new listing'));
    } else if (price === undefined || isNaN(price)) {
      return reject(new InputError('Must provide a valid price for new listing'));
    } else if (thumbnail === undefined) {
      return reject(new InputError('Must provide a thumbnail for new listing'));
    } else if (metadata === undefined) {
      return reject(new InputError('Must provide property details for this listing'));
    } else {
      const id = newListingId(listings);
      listings[id] = newListingPayload(title, email, address, price, thumbnail, metadata);
      saveDataStore({ listings });
      resolve(id);
    }
  });

export const getListingDetails = (listingId: string): Promise<Listing> =>
  resourceLock<Listing>((resolve, reject) => {
    const { listings } = getDataStore();
    resolve({
      ...listings[listingId],
    });
  });

export const getAllListings = (): Promise<any[]> =>
  resourceLock<any[]>((resolve, reject) => {
    const { listings } = getDataStore();
    resolve(
      Object.keys(listings).map((key) => ({
        id: parseInt(key, 10),
        title: listings[key].title,
        owner: listings[key].owner,
        address: listings[key].address,
        thumbnail: listings[key].thumbnail,
        price: listings[key].price,
        reviews: listings[key].reviews,
      })),
    );
  });

export const updateListing = (
  listingId: string,
  title?: string,
  address?: object,
  thumbnail?: string,
  price?: number,
  metadata?: object
): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings } = getDataStore();
    if (address) {
      listings[listingId].address = address;
    }
    if (title) {
      listings[listingId].title = title;
    }
    if (thumbnail) {
      listings[listingId].thumbnail = thumbnail;
    }
    if (price) {
      listings[listingId].price = price;
    }
    if (metadata) {
      listings[listingId].metadata = metadata;
    }
    saveDataStore({ listings });
    resolve();
  });

export const removeListing = (listingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings } = getDataStore();
    delete listings[listingId];
    saveDataStore({ listings });
    resolve();
  });

export const publishListing = (listingId: string, availability: DateRange[]): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings } = getDataStore();
    if (availability === undefined) {
      return reject(new InputError('Must provide listing availability'));
    } else if (listings[listingId].published === true) {
      return reject(new InputError('This listing is already published'));
    } else {
      listings[listingId].availability = availability;
      listings[listingId].published = true;
      listings[listingId].postedOn = new Date().toISOString();
      saveDataStore({ listings });
      resolve();
    }
  });

export const unpublishListing = (listingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings } = getDataStore();
    if (listings[listingId].published === false) {
      return reject(new InputError('This listing is already unpublished'));
    } else {
      listings[listingId].availability = [];
      listings[listingId].published = false;
      listings[listingId].postedOn = null;
      saveDataStore({ listings });
      resolve();
    }
  });

export const leaveListingReview = (
  email: string,
  listingId: string,
  bookingId: string,
  review: Review
): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings, bookings } = getDataStore();
    if (!(bookingId in bookings)) {
      return reject(new InputError('Invalid booking ID'));
    } else if (!(listingId in listings)) {
      return reject(new InputError('Invalid listing ID'));
    } else if (bookings[bookingId].owner !== email) {
      return reject(new InputError('User has not stayed at this listing'));
    } else if (bookings[bookingId].listingId !== listingId) {
      return reject(new InputError('This booking is not associated with this listing ID'));
    } else if (review === undefined) {
      return reject(new InputError('Must provide review contents'));
    } else {
      listings[listingId].reviews.push(review);
      saveDataStore({ listings });
      resolve();
    }
  });

/***************************************************************
                       Booking Functions
***************************************************************/

const newBookingPayload = (
  owner: string,
  dateRange: DateRange,
  totalPrice: number,
  listingId: string
): Booking => ({
  owner,
  dateRange,
  totalPrice,
  listingId,
  status: 'pending',
});

export const makeNewBooking = (
  owner: string,
  dateRange: DateRange,
  totalPrice: number,
  listingId: string
): Promise<string> =>
  resourceLock<string>((resolve, reject) => {
    const { listings, bookings } = getDataStore();
    if (!(listingId in listings)) {
      return reject(new InputError('Invalid listing ID'));
    } else if (dateRange === undefined) {
      return reject(new InputError('Must provide a valid date range for the booking'));
    } else if (totalPrice === undefined || totalPrice < 0 || isNaN(totalPrice)) {
      return reject(new InputError('Must provide a valid total price for this booking'));
    } else if (listings[listingId].owner === owner) {
      return reject(new InputError('Cannot make bookings for your own listings'));
    } else if (listings[listingId].published === false) {
      return reject(new InputError('Cannot make a booking for an unpublished listing'));
    } else {
      const id = newBookingId(bookings);
      bookings[id] = newBookingPayload(owner, dateRange, totalPrice, listingId);
      saveDataStore({ bookings });
      resolve(id);
    }
  });

export const getAllBookings = (): Promise<any[]> =>
  resourceLock<any[]>((resolve, reject) => {
    const { bookings } = getDataStore();
    resolve(
      Object.keys(bookings).map((key) => ({
        id: parseInt(key, 10),
        owner: bookings[key].owner,
        dateRange: bookings[key].dateRange,
        totalPrice: bookings[key].totalPrice,
        listingId: bookings[key].listingId,
        status: bookings[key].status,
      })),
    );
  });

export const removeBooking = (bookingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { bookings } = getDataStore();
    delete bookings[bookingId];
    saveDataStore({ bookings });
    resolve();
  });

export const acceptBooking = (owner: string, bookingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings, bookings } = getDataStore();
    if (!(bookingId in bookings)) {
      return reject(new InputError('Invalid booking ID'));
    } else if (
      Object.keys(listings).find((key) => key === bookings[bookingId].listingId && listings[key].owner === owner) ===
      undefined
    ) {
      return reject(new InputError("Cannot accept bookings for a listing that isn't yours"));
    } else if (bookings[bookingId].status === 'accepted') {
      return reject(new InputError('Booking has already been accepted'));
    } else if (bookings[bookingId].status === 'declined') {
      return reject(new InputError('Booking has already been declined'));
    } else {
      bookings[bookingId].status = 'accepted';
      saveDataStore({ bookings });
      resolve();
    }
  });

export const declineBooking = (owner: string, bookingId: string): Promise<void> =>
  resourceLock<void>((resolve, reject) => {
    const { listings, bookings } = getDataStore();
    if (!(bookingId in bookings)) {
      return reject(new InputError('Invalid booking ID'));
    } else if (
      Object.keys(listings).find((key) => key === bookings[bookingId].listingId && listings[key].owner === owner) ===
      undefined
    ) {
      return reject(new InputError("Cannot accept bookings for a listing that isn't yours"));
    } else if (bookings[bookingId].status === 'declined') {
      return reject(new InputError('Booking has already been declined'));
    } else if (bookings[bookingId].status === 'accepted') {
      return reject(new InputError('Booking has already been accepted'));
    } else {
      bookings[bookingId].status = 'declined';
      saveDataStore({ bookings });
      resolve();
    }
  });
