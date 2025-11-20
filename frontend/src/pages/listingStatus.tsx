import { Booking } from '../api/booking';
// import { OneListing } from '../api/listingQueries'; // Unused import

/**
 * Calculate how many days the listing has been online
 */
export function calculateDaysOnline(postedOn: string): number {
  if (!postedOn) return 0;
  const postedDate = new Date(postedOn);
  if (isNaN(postedDate.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  postedDate.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - postedDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate how many days this year the listing has been booked
 * Only counts accepted bookings within the current year
 */
export function calculateBookedDaysThisYear(
  bookings: Booking[],
  listingId: number
): number {
  if (!bookings || bookings.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

  // Filter accepted bookings for this listing
  const acceptedBookings = bookings.filter(
    booking =>
      booking.listingId.toString() === listingId.toString() &&
      booking.status === 'accepted' &&
      booking.dateRange
  );

  let totalDays = 0;
  const bookedDates = new Set<string>();

  acceptedBookings.forEach(booking => {
    // Support both {start, end} and {from, to} formats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startStr = (booking.dateRange as any).start || (booking.dateRange as any).from;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const endStr = (booking.dateRange as any).end || (booking.dateRange as any).to;

    if (!startStr || !endStr) return;

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

    // Clamp dates to current year
    const clampedStart = startDate < yearStart ? yearStart : startDate;
    const clampedEnd = endDate > yearEnd ? yearEnd : endDate;

    if (clampedStart > clampedEnd) return;

    // Count each day in the booking range
    const currentDate = new Date(clampedStart);
    while (currentDate <= clampedEnd) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (!bookedDates.has(dateStr)) {
        bookedDates.add(dateStr);
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  return totalDays;
}

/**
 * Calculate total profit this year from accepted bookings
 */
export function calculateProfitThisYear(
  bookings: Booking[],
  listingId: number
): number {
  if (!bookings || bookings.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

  // Filter accepted bookings for this listing within this year
  const acceptedBookings = bookings.filter(booking => {
    if (
      booking.listingId.toString() !== listingId.toString() ||
      booking.status !== 'accepted' ||
      !booking.dateRange
    ) {
      return false;
    }

    // Support both {start, end} and {from, to} formats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const startStr = (booking.dateRange as any).start || (booking.dateRange as any).from;
    if (!startStr) return false;

    const startDate = new Date(startStr);
    if (isNaN(startDate.getTime())) return false;

    // Check if booking starts within this year
    return startDate >= yearStart && startDate <= yearEnd;
  });

  return acceptedBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
}

