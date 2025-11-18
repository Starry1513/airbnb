import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmptyListingsState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">No Listings Yet</CardTitle>
          <CardDescription>You haven&apos;t created any listings yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/listings/new')} size="lg" className="w-full">
            Create Your First Listing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
