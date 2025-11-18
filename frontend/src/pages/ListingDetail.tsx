import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { fetchListingDetail, OneListing } from '../api/listingQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Bed, Bath, Home, Calendar, DollarSign } from 'lucide-react';
import { makeNewBooking, AvailabilityRange } from '../api/listing';
import { leaveReview } from '../api/listing';
import { Button } from '@/components/ui/button';
import { BookingDialog } from '@/components/listing/BookingDialog';
import { useAuthContext } from '../hooks/useAuthContext';
import { useAcceptedBooking } from '../hooks/useAcceptedBooking';
import { 
  calculateAverageRating, 
  calculateRatingDistribution
} from '../utils/ratingUtils';
import { RatingDisplay } from '@/components/listing/RatingDisplay';
import { ReviewList } from '@/components/listing/ReviewList';
import { PropertyDetails } from '@/components/listing/PropertyDetails';
import { ReviewDialog } from '@/components/listing/ReviewDialog';
import { RatingFilterDialog } from '@/components/listing/RatingFilterDialog';
import { ResultDialog } from '@/components/listing/ResultDialog';

export const ListingDetailContent = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const listingId = id ? Number(id) : 0;
  const { userEmail, isLoggedIn } = useAuthContext();
  const { acceptedBooking } = useAcceptedBooking(listingId);

  // State management
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityRange>({ start: "", end: "" });
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialogType, setResultDialogType] = useState<'success' | 'error'>('success');
  const [resultDialogMessage, setResultDialogMessage] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [ratingFilterDialogOpen, setRatingFilterDialogOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Fetch listing data
  const { data: listing, isLoading, isError, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => fetchListingDetail(listingId),
    enabled: !!listingId,
  });

  // Calculate derived data
  const avgRating = useMemo(() => 
    listing ? calculateAverageRating(listing.reviews) : 0, 
  [listing]
  );

  const ratingDistribution = useMemo(() => 
    listing ? calculateRatingDistribution(listing.reviews) : {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
  [listing]
  );


  const totalBeds = useMemo(
    () =>
      listing ? listing.metadata.bedrooms.reduce((sum: number, bedroom: { beds: number }) => sum + bedroom.beds, 0) : 0,
    [listing]
  );

  // Mutations
  const leaveReviewMutation = useMutation({
    mutationFn: async ({ listingId, bookingId, score, comment }: { 
            listingId: number; 
            bookingId: number; 
            score: number; 
            comment: string;
        }) => {
      return leaveReview(listingId, bookingId, score, comment);
    },
    onSuccess: (_, variables) => {
      // Optimistically update the reviews list
      queryClient.setQueryData(['listing', listingId], (oldData: OneListing | undefined) => {
        if (!oldData) return oldData;
        const newReview = {
          score: variables.score,
          comment: variables.comment,
          userEmail: userEmail || 'Unknown',
        };
        return {
          ...oldData,
          reviews: [...(oldData.reviews || []), newReview],
        };
      });
      queryClient.invalidateQueries({ queryKey: ['listing', listingId] });
      handleReviewDialogClose();
      showResultDialog('success', 'Your review has been posted successfully!');
    },
    onError: (error) => {
      console.error(error);
      handleReviewDialogClose();
      showResultDialog('error', error instanceof Error ? error.message : 'Failed to leave review. Please try again.');
    },
  });

  const makeNewBookingMutation = useMutation({
    mutationFn: async ({ dateRange, totalPrice }: { dateRange: string[]; totalPrice: number }) => {
      return makeNewBooking(listingId, dateRange, totalPrice);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setBookingDialogOpen(false);
      showResultDialog('success', 'Your booking has been confirmed successfully!');
      // Wait for backend data to update, then trigger notification check
      setTimeout(() => {
        // Trigger notification check via window event (if NotificationContext exposes triggerPoll)
        window.dispatchEvent(new CustomEvent('checkNotifications'));
      }, 1000);
    },
    onError: (error) => {
      console.error('Booking error:', error);
      setBookingDialogOpen(false);
      showResultDialog('error', error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    },
  });

  // Helper functions
  const handleReviewDialogClose = () => {
    setReviewDialogOpen(false);
    setReviewScore(0);
    setReviewComment('');
  };

  const showResultDialog = (type: 'success' | 'error', message: string) => {
    setResultDialogType(type);
    setResultDialogMessage(message);
    setResultDialogOpen(true);
  };

  const handleRatingClick = (rating: number | null) => {
    setSelectedRating(rating);
    setRatingFilterDialogOpen(true);
  };

  const handleReviewSubmit = () => {
    if (acceptedBooking && reviewScore >= 1 && reviewScore <= 5 && reviewComment.trim()) {
      leaveReviewMutation.mutate({
        listingId,
        bookingId: acceptedBooking.id,
        score: reviewScore,
        comment: reviewComment,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="h-64 w-full mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (isError) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
                        Error: {error instanceof Error ? error.message : 'Failed to load listing'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>Listing not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Image Section */}
        <div className="mb-6">
          <img
            src={listing.thumbnail}
            alt={listing.title}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{listing.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      {listing.address.street}, {listing.address.city}, {listing.address.state} {listing.address.postcode}, {listing.address.country}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>{listing.metadata.propertyType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    <span>{totalBeds} beds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    <span>{listing.metadata.bathrooms} bathrooms</span>
                  </div>
                  {avgRating > 0 && (
                    <RatingDisplay
                      avgRating={avgRating}
                      totalReviews={listing.reviews.length}
                      ratingDistribution={ratingDistribution}
                      onRatingClick={handleRatingClick}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <PropertyDetails metadata={listing.metadata} />

            {/* Reviews */}
            <ReviewList
              reviews={listing.reviews}
              canLeaveReview={isLoggedIn && !!acceptedBooking}
              onLeaveReviewClick={() => setReviewDialogOpen(true)}
              onRatingClick={handleRatingClick}
            />

            {/* Availability */}
            {listing.availability.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                                        Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {listing.availability
                      .filter((avail: AvailabilityRange) => avail.start && avail.end)
                      .map((avail: AvailabilityRange, index: number) => (
                        <div key={index} className="text-sm flex items-center justify-between">
                          <span>
                            <span className="font-medium">
                              {new Date(avail.start).toLocaleDateString()}
                            </span>
                            {' - '}
                            <span className="font-medium">
                              {new Date(avail.end).toLocaleDateString()}
                            </span>
                          </span>
                          <Button
                            onClick={() => {
                              setBookingDialogOpen(true);
                              setSelectedAvailability(avail);
                            }}
                            size="sm"
                          >
                                                        Book
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                                    Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                                    ${listing.price}
                  <span className="text-lg font-normal text-muted-foreground"> / night</span>
                </div>
                <CardDescription>
                                    Posted on {new Date(listing.postedOn).toLocaleDateString()}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle>Hosted by</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{listing.owner}</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Dialog */}
          {selectedAvailability.start && selectedAvailability.end && (
            <BookingDialog
              open={bookingDialogOpen}
              availability={selectedAvailability}
              onOpenChange={setBookingDialogOpen}
              onBook={(startDate: string, endDate: string) => {
                makeNewBookingMutation.mutate({
                  dateRange: [startDate, endDate],
                  totalPrice: listing.price
                });
              }}
              isBooking={makeNewBookingMutation.isPending}
            />
          )}

          {/* Review Dialog */}
          {reviewDialogOpen && acceptedBooking && (
            <ReviewDialog
              open={reviewDialogOpen}
              onOpenChange={setReviewDialogOpen}
              score={reviewScore}
              comment={reviewComment}
              onScoreChange={setReviewScore}
              onCommentChange={setReviewComment}
              onSubmit={handleReviewSubmit}
              isSubmitting={leaveReviewMutation.isPending}
              onCancel={handleReviewDialogClose}
            />
          )}

          {/* Result Dialog */}
          <ResultDialog
            open={resultDialogOpen}
            onOpenChange={setResultDialogOpen}
            type={resultDialogType}
            message={resultDialogMessage}
          />

          {/* Rating Filter Dialog */}
          {listing && (
            <RatingFilterDialog
              open={ratingFilterDialogOpen}
              onOpenChange={setRatingFilterDialogOpen}
              selectedRating={selectedRating}
              onRatingSelect={setSelectedRating}
              reviews={listing.reviews}
              ratingDistribution={ratingDistribution}
            />
          )}
        </div>
      </div>
    </div>
  );
};
