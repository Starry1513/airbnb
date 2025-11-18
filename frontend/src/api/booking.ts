import { apiCall } from './config';

export interface Bookings {
  bookings: Booking[];
}
export interface Booking {
  id: number;
  owner: string;
  dateRange: DateRange;
  totalPrice: number;
  listingId: number;
  status: BookingStatus;
}

export interface DateRange {
  start: string;
  end: string;
}

export type BookingStatus = 'pending' | 'accepted' | 'declined';


// get all bookings for a listing
export const getBookingsForListing = async (): Promise<Bookings> => {
  return apiCall('/bookings');
};


// /bookings/accept/{bookingid} 
// Authorization * (header) Bearer [token]
export const acceptBooking = async (bookingId: number): Promise<void> => {
  return apiCall(`/bookings/accept/${bookingId}`, {
    method: 'PUT',
  });
};  

// /bookings/decline/{bookingid}
// Authorization * (header) Bearer [token]
export const declineBooking = async (bookingId: number): Promise<void> => {
  return apiCall(`/bookings/decline/${bookingId}`, {
    method: 'PUT',
  });
};

// /bookings/{bookingid}
// Authorization * (header) Bearer [token]
export const deleteBooking = async (bookingId: number): Promise<void> => {
  return apiCall(`/bookings/${bookingId}`, {
    method: 'DELETE',
  });
};

// Profit calculation types (calculated on frontend)
export interface DailyProfit {
  date: string;
  daysAgo: number;
  amount: number;
  bookingCount: number;
}

export interface ProfitsResponse {
  profits: DailyProfit[];
  totalProfit: number;
  totalBookings: number;
}