import { Booking, getBookingsForListing } from './booking';
import { Listing, getListings } from './listing';

export interface Notification {
  id: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined';
  message: string;
  bookingId: number;
  listingId: number;
  listingTitle?: string;
  timestamp: number;
  read: boolean;
}

export interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
}

/**
 * Generate notifications based on booking data
 * Detects the following events:
 * 1. New booking request (Host receives) - detects new pending bookings
 * 2. Booking accepted/declined (Guest receives) - detects booking status change from pending to accepted/declined
 */
export const generateNotificationsFromBookings = (
  currentBookings: Booking[],
  previousBookings: Booking[] | null,
  userEmail: string,
  listings: Listing[]
): Notification[] => {
  const notifications: Notification[] = [];
  const now = Date.now();

  if (!previousBookings) {
    // First load, don't generate notifications
    console.log('[Notification] No previous bookings, skipping notification generation');
    return [];
  }

  // Create mapping from booking ID to booking
  const previousBookingMap = new Map(previousBookings.map(b => [b.id, b]));
  // Ensure listingId type matches (supports both string and number)
  const listingMap = new Map(listings.map(l => [String(l.id), l]));

  console.log('[Notification] Checking bookings:', {
    currentCount: currentBookings.length,
    previousCount: previousBookings.length,
    userEmail,
    listingsCount: listings.length,
    listingMapKeys: Array.from(listingMap.keys()).slice(0, 5) // Show first 5 keys for debugging
  });

  currentBookings.forEach(booking => {
    const previousBooking = previousBookingMap.get(booking.id);
    // Ensure booking.listingId is converted to string to match listingMap key
    const listingIdKey = String(booking.listingId);
    const listing = listingMap.get(listingIdKey);

    // Debug: log each booking check
    if (!previousBooking && booking.status === 'pending') {
      console.log('[Notification] Checking new pending booking:', {
        bookingId: booking.id,
        bookingListingId: booking.listingId,
        listingIdType: typeof booking.listingId,
        listingIdKey: listingIdKey,
        listingOwner: listing?.owner,
        userEmail,
        isOwner: listing?.owner === userEmail,
        listingExists: !!listing,
        foundListingId: listing?.id,
        listingTitle: listing?.title
      });
    }

    // 1. Detect new booking request (Host receives)
    // If current user is the listing owner, and this is a new pending booking
    if (!previousBooking && booking.status === 'pending' && listing?.owner === userEmail) {
      console.log('[Notification] New booking request detected:', {
        bookingId: booking.id,
        listingId: booking.listingId,
        listingOwner: listing?.owner,
        userEmail
      });
      notifications.push({
        id: `booking_request_${booking.id}`, // Use stable ID without timestamp
        type: 'booking_request',
        message: `New booking request for "${listing.title || `Listing #${listing.id}`}"`,
        bookingId: booking.id,
        listingId: booking.listingId,
        listingTitle: listing.title,
        timestamp: now,
        read: false,
      });
    }

    // 2. Detect booking status change (Guest receives)
    // If current user is the booking owner, and status changed from pending to accepted/declined
    if (previousBooking && previousBooking.status === 'pending') {
      if (booking.status === 'accepted' && booking.owner === userEmail) {
        console.log('[Notification] Booking accepted detected:', {
          bookingId: booking.id,
          bookingOwner: booking.owner,
          userEmail
        });
        notifications.push({
          id: `booking_accepted_${booking.id}`, // Use stable ID without timestamp
          type: 'booking_accepted',
          message: `Your booking request for "${listing?.title || `Listing #${booking.listingId}`}" has been accepted`,
          bookingId: booking.id,
          listingId: booking.listingId,
          listingTitle: listing?.title,
          timestamp: now,
          read: false,
        });
      } else if (booking.status === 'declined' && booking.owner === userEmail) {
        console.log('[Notification] Booking declined detected:', {
          bookingId: booking.id,
          bookingOwner: booking.owner,
          userEmail
        });
        notifications.push({
          id: `booking_declined_${booking.id}`, // Use stable ID without timestamp
          type: 'booking_declined',
          message: `Your booking request for "${listing?.title || `Listing #${booking.listingId}`}" has been declined`,
          bookingId: booking.id,
          listingId: booking.listingId,
          listingTitle: listing?.title,
          timestamp: now,
          read: false,
        });
      }
    }
  });

  console.log('[Notification] Generated notifications:', notifications.length);
  return notifications;
};

/**
 * Get all notifications (based on booking data)
 */
export const getAllNotifications = async (
  previousBookings: Booking[] | null,
  userEmail: string
): Promise<Notification[]> => {
  try {
    const [bookingsResponse, listingsResponse] = await Promise.all([
      getBookingsForListing(),
      getListings(),
    ]);

    const currentBookings = bookingsResponse.bookings || [];
    const listings = listingsResponse.listings || [];

    return generateNotificationsFromBookings(
      currentBookings,
      previousBookings,
      userEmail,
      listings
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

