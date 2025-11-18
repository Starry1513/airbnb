import { useQuery } from '@tanstack/react-query';
import { getBookingsForListing } from '../api/booking';
import { useAuthContext } from './useAuthContext';

export const useAcceptedBooking = (listingId: number) => {
  const { userEmail, isLoggedIn } = useAuthContext();
    
  const { data: bookingsResponse } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingsForListing,
    enabled: isLoggedIn,
  });

  const acceptedBookings = bookingsResponse?.bookings.filter(
    (booking) => 
      booking.listingId.toString() === listingId.toString() && 
            booking.status === 'accepted' && 
            booking.owner === userEmail
  ) || [];

  const acceptedBooking = acceptedBookings.length > 0 ? acceptedBookings[0] : undefined;

  return { acceptedBooking, acceptedBookings };
};

