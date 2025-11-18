import { Card, CardContent } from '@/components/ui/card';
import { DailyProfit } from '@/api/booking';
import { ProfitsChartHeader } from './ProfitsChartHeader';
import { ProfitsLineChart } from './ProfitsLineChart';

interface ProfitsGraphProps {
  profits: DailyProfit[];
  totalProfit: number;
  totalBookings: number;
}

export const ProfitsGraph = ({ profits, totalProfit, totalBookings }: ProfitsGraphProps) => {
  const chartData = profits && profits.length > 0
    ? [...profits].reverse().map(profit => ({
      daysAgo: profit.daysAgo,
      amount: profit.amount,
      date: new Date(profit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
    : [];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <Card>
      <ProfitsChartHeader totalProfit={totalProfit} totalBookings={totalBookings} formatCurrency={formatCurrency} />
      <CardContent>
        <div className="h-64 w-full">
          <ProfitsLineChart data={chartData} formatCurrency={formatCurrency} />
        </div>
      </CardContent>
    </Card>
  );
};
