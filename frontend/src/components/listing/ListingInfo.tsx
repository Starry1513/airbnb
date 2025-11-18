import { StarRating } from "@/components/StarRating";
import { Listing } from "../../api/listing";

interface ListingInfoProps {
  listing: Listing;
  ifDateRange?: boolean;
}

export function ListingInfo({ listing, ifDateRange = false }: ListingInfoProps) {
  const totalBeds = listing.metadata?.bedrooms?.reduce((sum, room) => sum + room.beds, 0) || 0;
  const avgRating = listing.reviews && listing.reviews.length > 0
    ? listing.reviews.reduce((sum, r) => sum + r.score, 0) / listing.reviews.length
    : 0;

  return (
    <div className="space-y-2 mb-4">
      {listing.price && (
        <p className="text-2xl font-bold">${listing.price} {ifDateRange ? '/ stay' : '/ night'}</p>
      )}

      {listing.metadata?.propertyType && (
        <p className="text-sm text-muted-foreground">
          {listing.metadata.propertyType}
        </p>
      )}

      {listing.metadata && (
        <p className="text-sm text-muted-foreground">
          {totalBeds} beds · {listing.metadata.bathrooms || 0} baths
        </p>
      )}

      {listing.reviews && listing.reviews.length > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={avgRating} size={18} />
          <span className="text-sm text-muted-foreground">
            ({listing.reviews.length} {listing.reviews.length === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      )}

      {listing.published && (
        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
          Published
        </span>
      )}
    </div>
  );
}
