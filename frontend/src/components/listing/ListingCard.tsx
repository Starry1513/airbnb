import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Listing } from "../../api/listing";
import { ListingThumbnail } from "./ListingThumbnail";
import { ListingInfo } from "./ListingInfo";
import { ListingActions } from "./ListingActions";

interface ListingCardProps {
  listing: Listing;
  onEdit: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ListingCard({ listing, onEdit, onDelete, onPublish, onUnpublish }: ListingCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <ListingThumbnail thumbnail={listing.thumbnail} title={listing.title} />

      <CardHeader>
        <CardTitle className="text-xl truncate">{listing.title}</CardTitle>
        <CardDescription>ID: {listing.id}</CardDescription>
      </CardHeader>

      <CardContent>
        <ListingInfo listing={listing} />
        <ListingActions
          listingId={listing.id}
          published={listing.published}
          onEdit={onEdit}
          onDelete={onDelete}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
        />
      </CardContent>
    </Card>
  );
}
