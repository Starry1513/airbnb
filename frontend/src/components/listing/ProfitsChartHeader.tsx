import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

interface ProfitsChartHeaderProps {
  totalProfit: number;
  totalBookings: number;
  formatCurrency: (value: number) => string;
}

export function ProfitsChartHeader({ totalProfit, totalBookings, formatCurrency }: ProfitsChartHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profits Graph (Last 30 Days)
          </CardTitle>
          <CardDescription>
            Total: {formatCurrency(totalProfit)} from {totalBookings} booking{totalBookings !== 1 ? 's' : ''}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}
