import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Booking, getBookingsForListing, acceptBooking, declineBooking } from '../api/booking';
import { fetchListingsWithDetails, OneListing } from '../api/listingQueries';
import { useAuthContext } from '../hooks/useAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, DollarSign, User, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const BookingRequests = () => {
  // Get listingId from URL parameters (optional - if provided, show only that listing)
  const { id } = useParams<{ id: string }>();
  const listingId = id ? Number(id) : null;
  const { userEmail, isLoggedIn } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get all listings for current user
  const { data: allListings, isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListingsWithDetails,
    enabled: isLoggedIn,
  });

  // Get all bookings
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingsForListing,
    enabled: isLoggedIn,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Mutations for accept/decline
  const acceptMutation = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Trigger notification check
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('checkNotifications'));
      }, 1000);
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Trigger notification check
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('checkNotifications'));
      }, 1000);
    },
  });

  // Filter listings owned by current user
  const myListings = allListings?.filter(
    (listing: OneListing) => listing.owner === userEmail
  ) || [];

  // Filter listings by listingId if provided
  const targetListings = listingId
    ? myListings.filter(listing => listing.id === listingId)
    : myListings;

  // Group bookings by listingId
  const bookingsByListing = targetListings.map(listing => {
    const listingBookings = bookingsResponse?.bookings.filter(
      (booking: Booking) => {
        // Convert both to numbers for comparison (backend returns listingId as string)
        const bookingListingId = Number(booking.listingId);
        const listingIdNum = Number(listing.id);
        return bookingListingId === listingIdNum;
      }
    ) || [];

    return {
      listing,
      bookings: listingBookings,
    };
  });

  const isLoading = listingsLoading || bookingsLoading;

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
    case 'accepted':
      return 'default';
    case 'declined':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
                        Please log in to view booking requests
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {listingId ? `Booking Requests for Listing #${listingId}` : 'All Booking Requests'}
          </h1>
          <p className="text-muted-foreground">
                        Manage booking requests for your listings
          </p>
        </div>

        {bookingsByListing.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No listings found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookingsByListing.map(({ listing, bookings }) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                      <CardDescription>
                                                Listing ID: {listing.id} • {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    {listing.thumbnail && (
                      <img
                        src={listing.thumbnail}
                        alt={listing.title}
                        className="w-20 h-20 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No bookings for this listing</p>
                    </div>
                  ) : (
                    <div className="space-y-0 divide-y">
                      {bookings.map((booking: Booking) => (
                        <div key={booking.id} className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant={getStatusVariant(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                                                    Booking ID: {booking.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Guest:</span>
                                  <span>{booking.owner}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Dates:</span>
                                  <span>
                                    {new Date(booking.dateRange.start).toLocaleDateString()} - {new Date(booking.dateRange.end).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">Total Price:</span>
                                  <span className="font-semibold">${booking.totalPrice}</span>
                                </div>
                              </div>
                            </div>

                            {booking.status.toLowerCase() === 'pending' && (
                              <div className="flex gap-2 sm:flex-col">
                                <Button
                                  onClick={() => acceptMutation.mutate(booking.id)}
                                  disabled={acceptMutation.isPending || declineMutation.isPending}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                    Accept
                                </Button>
                                <Button
                                  onClick={() => declineMutation.mutate(booking.id)}
                                  disabled={acceptMutation.isPending || declineMutation.isPending}
                                  variant="destructive"
                                  size="sm"
                                  className="flex-1"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                                                    Decline
                                </Button>
                              </div>
                            )}

                            {booking.status.toLowerCase() !== 'pending' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {booking.status.toLowerCase() === 'accepted' ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="capitalize">{booking.status}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    <Button
                      onClick={() => navigate(`/listings/${listing.id}`)}
                      className="w-full"
                      variant="outline"
                    >
                                            View Listing Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



export default BookingRequests;