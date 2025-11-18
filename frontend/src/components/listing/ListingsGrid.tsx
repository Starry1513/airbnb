import { useNavigate } from 'react-router-dom';
import { ListingCard } from '@/components/listing/ListingCard';
import { OneListing } from '@/pages/Loading';

interface ListingsGridProps {
  listings: OneListing[];
  onDelete: (id: number) => void;
  onPublish: (id: number) => void;
  onUnpublish: (id: number) => void;
}

export function ListingsGrid({ listings, onDelete, onPublish, onUnpublish }: ListingsGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map(listing => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onEdit={() => navigate(`/listings/${listing.id}/edit`)}
          onDelete={() => onDelete(listing.id)}
          onPublish={() => onPublish(listing.id)}
          onUnpublish={() => onUnpublish(listing.id)}
        />
      ))}
    </div>
  );
}
