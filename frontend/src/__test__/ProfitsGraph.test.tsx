import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfitsGraph } from '../components/listing/ProfitsGraph';
import { DailyProfit } from '../api/booking';

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('ProfitsGraph', () => {
  const createMockProfit = (
    daysAgo: number,
    amount: number,
    bookingCount: number = 1
  ): DailyProfit => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return {
      date: date.toISOString().split('T')[0],
      daysAgo,
      amount,
      bookingCount,
    };
  };

  describe('Rendering', () => {
    it('should render graph title', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={150.00}
          totalBookings={1}
        />
      );

      expect(screen.getByText('Profits Graph (Last 30 Days)')).toBeInTheDocument();
    });

    it('should display total profit and booking count', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.00),
        createMockProfit(5, 200.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={350.00}
          totalBookings={2}
        />
      );

      expect(screen.getByText(/Total: \$350\.00 from 2 bookings/)).toBeInTheDocument();
    });

    it('should correctly handle singular booking form', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={150.00}
          totalBookings={1}
        />
      );

      expect(screen.getByText(/Total: \$150\.00 from 1 booking/)).toBeInTheDocument();
    });

    it('should render chart components', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={150.00}
          totalBookings={1}
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('x-axis')).toBeInTheDocument();
      expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
      expect(screen.getByTestId('grid')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    it('should handle multiple data points', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.00),
        createMockProfit(5, 200.00),
        createMockProfit(10, 100.00),
        createMockProfit(30, 50.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={500.00}
          totalBookings={4}
        />
      );

      expect(screen.getByText(/Total: \$500\.00 from 4 bookings/)).toBeInTheDocument();
    });

    it('should handle empty data array', () => {
      const profits: DailyProfit[] = [];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={0}
          totalBookings={0}
        />
      );

      expect(screen.getByText('Profits Graph (Last 30 Days)')).toBeInTheDocument();
      expect(screen.getByText(/Total: \$0\.00 from 0 bookings/)).toBeInTheDocument();
    });

    it('should handle zero profit case', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 0),
        createMockProfit(5, 0),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={0}
          totalBookings={0}
        />
      );

      expect(screen.getByText(/Total: \$0\.00 from 0 bookings/)).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should correctly format currency display', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 150.50),
        createMockProfit(5, 200.99),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={351.49}
          totalBookings={2}
        />
      );

      // Check total amount format (should show two decimal places)
      expect(screen.getByText(/Total: \$351\.49 from 2 bookings/)).toBeInTheDocument();
    });

    it('should handle large amounts', () => {
      const profits: DailyProfit[] = [
        createMockProfit(0, 10000.00),
      ];

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={10000.00}
          totalBookings={1}
        />
      );

      expect(screen.getByText(/Total: \$10000\.00 from 1 booking/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle full 30 days of data', () => {
      const profits: DailyProfit[] = [];
      for (let i = 0; i <= 30; i++) {
        profits.push(createMockProfit(i, i * 10));
      }

      render(
        <ProfitsGraph
          profits={profits}
          totalProfit={4650.00} // sum of 0*10 + 1*10 + ... + 30*10
          totalBookings={31}
        />
      );

      expect(screen.getByText(/Total: \$4650\.00 from 31 bookings/)).toBeInTheDocument();
    });
  });
});

