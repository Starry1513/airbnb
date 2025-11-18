import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ProfitsGraph } from '@/components/listing/ProfitsGraph';

interface ProfitsSectionProps {
  profitsData: {
    profits: Array<{ date: string; amount: number }>;
    totalProfit: number;
    totalBookings: number;
  };
}

export function ProfitsSection({ profitsData }: ProfitsSectionProps) {
  if (profitsData.profits.length > 0 && profitsData.totalProfit > 0) {
    return (
      <div className="mb-6">
        <ProfitsGraph
          profits={profitsData.profits}
          totalProfit={profitsData.totalProfit}
          totalBookings={profitsData.totalBookings}
        />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Profits Graph (Last 30 Days)</CardTitle>
          <CardDescription>
            No profit data available. Accepted bookings with start dates in the past 30 days will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>To see profits in the graph:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Accept bookings for your listings</li>
              <li>Booking start dates must be within the past 30 days (or future bookings count as today)</li>
              <li>Only accepted bookings are counted</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
