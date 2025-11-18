export interface User {
  name: string;
  password: string;
  sessionActive: boolean;
}

export interface Listing {
  title: string;
  owner: string;
  address: object;
  price: number;
  thumbnail: string;
  metadata: object;
  reviews: Review[];
  availability: DateRange[];
  published: boolean;
  postedOn: string | null;
}

export interface Review {
  [key: string]: any;
}

export interface DateRange {
  [key: string]: any;
}

export interface Booking {
  owner: string;
  dateRange: DateRange;
  totalPrice: number;
  listingId: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DataStore {
  users: Record<string, User>;
  listings: Record<string, Listing>;
  bookings: Record<string, Booking>;
}

export interface JWTPayload {
  email: string;
}
