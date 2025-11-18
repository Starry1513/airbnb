import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchListingsWithDetails, OneListing } from '../api/listingQueries';
import { useAuthContext } from '../hooks/useAuthContext';
import { getBookingsForListing } from '../api/booking';
import { calculateProfits } from '../utils/profitUtils';
import { useMyListingMutations } from '@/hooks/useMyListingMutations';
import { ListingsErrorState } from '@/components/listing/ListingsErrorState';
import { NotLoggedInState } from '@/components/listing/NotLoggedInState';
import { ListingsLoadingState } from '@/components/listing/ListingsLoadingState';
import { EmptyListingsState } from '@/components/listing/EmptyListingsState';
import { MyListingsHeader } from '@/components/listing/MyListingsHeader';
import { ProfitsSection } from '@/components/listing/ProfitsSection';
import { ListingsGrid } from '@/components/listing/ListingsGrid';
import { PublishUnpublishDialogs } from '@/components/listing/PublishUnpublishDialogs';
import { ResultDialog } from '@/components/listing/ResultDialog';

export default function MyListing() {
  const { userEmail, isLoggedIn } = useAuthContext();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number>(0);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [resultDialogType, setResultDialogType] = useState<'success' | 'error'>('success');
  const [resultDialogMessage, setResultDialogMessage] = useState('');

  const { data: listings, isLoading: listingsLoading, isError, error } = useQuery({
    queryKey: ['listings'],
    queryFn: fetchListingsWithDetails,
    enabled: isLoggedIn,
  });

  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingsForListing,
    enabled: isLoggedIn,
  });

  const myListings = useMemo(() => listings?.filter((listing: OneListing) => listing.owner === userEmail) as OneListing[] || [], [listings, userEmail]);
  const profitsData = useMemo(() => (!bookingsResponse?.bookings || !myListings || myListings.length === 0) ? { profits: [], totalProfit: 0, totalBookings: 0 } : calculateProfits(bookingsResponse.bookings, myListings), [bookingsResponse, myListings]);
  
  const showSuccessDialog = (message: string) => {
    setResultDialogType('success');
    setResultDialogMessage(message);
    setResultDialogOpen(true);
  };

  const { publishMutation, unpublishMutation, deleteMutation } = useMyListingMutations({
    onPublishSuccess: () => {
      setPublishDialogOpen(false);
      showSuccessDialog('Listing published successfully!');
    },
    onUnpublishSuccess: () => {
      setUnpublishDialogOpen(false);
      showSuccessDialog('Listing unpublished successfully!');
    },
  });

  if (isError) return <ListingsErrorState error={error} />;
  if (!isLoggedIn) return <NotLoggedInState />;
  if (listingsLoading || bookingsLoading) return <ListingsLoadingState />;
  if (!myListings || myListings.length === 0) return <EmptyListingsState />;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto p-4">
        <MyListingsHeader listingCount={myListings.length} />
        {isLoggedIn && myListings && myListings.length > 0 && (
          <ProfitsSection profitsData={profitsData} />
        )}
        <ListingsGrid
          listings={myListings}
          onDelete={(id) => deleteMutation.mutate(id)}
          onPublish={(id) => { setSelectedListingId(id); setPublishDialogOpen(true); }}
          onUnpublish={(id) => { setSelectedListingId(id); setUnpublishDialogOpen(true); }}
        />
      </div>
      <PublishUnpublishDialogs
        publishDialogOpen={publishDialogOpen}
        setPublishDialogOpen={setPublishDialogOpen}
        unpublishDialogOpen={unpublishDialogOpen}
        setUnpublishDialogOpen={setUnpublishDialogOpen}
        selectedListingId={selectedListingId}
        setSelectedListingId={setSelectedListingId}
        onPublish={(data) => publishMutation.mutate(data)}
        onUnpublish={(listingId) => unpublishMutation.mutate(listingId)}
        publishReset={() => publishMutation.reset()}
        unpublishReset={() => unpublishMutation.reset()}
        publishError={publishMutation.error instanceof Error ? publishMutation.error.message : undefined}
        unpublishError={unpublishMutation.error instanceof Error ? unpublishMutation.error.message : undefined}
      />
      <ResultDialog
        open={resultDialogOpen}
        onOpenChange={setResultDialogOpen}
        type={resultDialogType}
        message={resultDialogMessage}
      />
    </div>
  );
}