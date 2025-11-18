import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Listing } from "../../api/listing";
import { ListingThumbnail } from "./ListingThumbnail";
import { ListingInfo } from "./ListingInfo";
import { useNavigate } from "react-router-dom";

interface ListingCardCheckoutProps {
  listing: Listing;
  ifDateRange?: boolean;
}

export function ListingCardCheckout({ listing, ifDateRange = false }: ListingCardCheckoutProps) {
  const navigate = useNavigate();
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/listings/${listing.id}`)}>
      <ListingThumbnail thumbnail={listing.thumbnail} title={listing.title} />

      <CardHeader>
        <CardTitle className="text-xl truncate">{listing.title}</CardTitle>
        <CardDescription>ID: {listing.id}</CardDescription>
      </CardHeader>

      <CardContent>
        <ListingInfo listing={listing} ifDateRange={ifDateRange} />
      </CardContent>


    </Card>
  );
}
