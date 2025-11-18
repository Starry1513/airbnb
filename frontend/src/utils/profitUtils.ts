import { Booking } from '../api/booking';
import { OneListing } from '../api/listingQueries';
import { DailyProfit, ProfitsResponse } from '../api/booking';

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 */
export function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse date string to YYYY-MM-DD format, handling both ISO and simple date strings
 */
function parseDateString(dateStr: string): string {
  // If it's an ISO string with time, extract just the date part
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
}

/**
 * Calculate profits from bookings data (frontend calculation)
 * @param bookings - All bookings from API
 * @param userListings - User's listings to filter bookings
 * @returns Profits data for the past 30 days
 */
export const calculateProfits = (
  bookings: Booking[],
  userListings: OneListing[]
): ProfitsResponse => {
  // Safety checks
  if (!bookings || !Array.isArray(bookings) || !userListings || !Array.isArray(userListings)) {
    return {
      profits: [],
      totalProfit: 0,
      totalBookings: 0,
    };
  }

  // Get user's listing IDs (convert to strings for comparison)
  const userListingIds = userListings
    .filter(listing => listing && listing.id != null)
    .map(listing => String(listing.id));

  // Filter accepted bookings for user's listings
  const acceptedBookings = bookings.filter(
    booking =>
      booking &&
      booking.listingId != null &&
      userListingIds.includes(String(booking.listingId)) &&
      booking.status === 'accepted'
  );

  // Initialize 30 days of data (0-30 days ago)
  const profitsByDate: { [key: string]: DailyProfit } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateLocal(today);

  for (let i = 0; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = formatDateLocal(date);
    profitsByDate[dateStr] = {
      date: dateStr,
      daysAgo: i,
      amount: 0,
      bookingCount: 0,
    };
  }

  // Calculate daily profits
  acceptedBookings.forEach(booking => {
    // Validate date range - support both {start, end} and {from, to} formats
    if (!booking.dateRange) {
      return;
    }

    // Support both {start, end} and {from, to} formats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startDateStr = (booking.dateRange as any).start || (booking.dateRange as any).from;
    if (!startDateStr) {
      return;
    }

    // Parse the date string to get just YYYY-MM-DD
    const bookingDateStr = parseDateString(startDateStr);

    // Create date from YYYY-MM-DD string (this creates date in local timezone)
    const bookingDate = new Date(bookingDateStr + 'T00:00:00');

    // Check if date is valid
    if (isNaN(bookingDate.getTime())) {
      return;
    }

    bookingDate.setHours(0, 0, 0, 0);

    // Calculate days difference
    const daysDiff = Math.floor((today.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));

    let targetDateStr: string;

    if (daysDiff < 0) {
      // Future booking: count it as today (when it was accepted)
      targetDateStr = todayStr;
    } else if (daysDiff <= 30) {
      // Past booking within 30 days: use booking start date
      targetDateStr = bookingDateStr;
    } else {
      // Booking more than 30 days ago: skip it
      return;
    }

    if (profitsByDate[targetDateStr]) {
      profitsByDate[targetDateStr].amount += booking.totalPrice;
      profitsByDate[targetDateStr].bookingCount += 1;
    }
  });

  // Convert to array and sort (daysAgo from 0 to 30)
  const profits = Object.values(profitsByDate)
    .sort((a, b) => a.daysAgo - b.daysAgo);

  const totalProfit = profits.reduce((sum, p) => sum + p.amount, 0);
  const totalBookings = profits.reduce((sum, p) => sum + p.bookingCount, 0);

  return {
    profits,
    totalProfit,
    totalBookings,
  };
};
