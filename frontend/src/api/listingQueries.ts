import { getListings, getOneListing, GetOneListing, Listing } from './listing';

export interface OneListing extends GetOneListing {
  id: number;
}

export const fetchListings = async () => {
  const response = await getListings();
  if (!response.listings) throw new Error('Failed to fetch listings');
  return response.listings;
};

export const fetchListingDetail = async (id: number): Promise<OneListing> => {
  const response = await getOneListing({ listingId: id });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedReviews = response.reviews?.map((review: any) => ({
    score: review.rating ?? review.score,
    comment: review.text ?? review.comment,
    userEmail: review.userEmail ?? 'Unknown',
  })) || [];
  
  // Convert availability from {from, to} to {start, end} format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedAvailability = response.availability?.map((avail: any) => ({
    start: avail.from ?? avail.start,
    end: avail.to ?? avail.end,
  })) || [];
  
  return { ...response, id, reviews: transformedReviews, availability: transformedAvailability };
};

export const fetchListingsWithDetails = async (): Promise<(OneListing)[]> => {
  let listings: Listing[] = [];
  try {
    listings = await fetchListings();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch listings');
  }

  // Return empty array if no listings, don't throw error
  if (listings.length === 0) return [];

  return await Promise.all(
    listings.map(async (listing) => {
      return await fetchListingDetail(listing.id);
    })
  );
};
