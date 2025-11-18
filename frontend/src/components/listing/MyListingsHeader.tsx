import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MyListingsHeaderProps {
  listingCount: number;
}

export function MyListingsHeader({ listingCount }: MyListingsHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-3xl">My Listings</CardTitle>
            <CardDescription>You have {listingCount} listing(s)</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/booking-requests')} variant="default" size="sm">View All Booking Requests</Button>
            <Button onClick={() => navigate('/listings/new')} variant="outline" size="sm">+ Create New Listing</Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
