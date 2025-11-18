import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  daysAgo: number;
  amount: number;
  date: string;
}

interface ProfitsLineChartProps {
  data: ChartDataPoint[];
  formatCurrency: (value: number) => string;
}

export function ProfitsLineChart({ data, formatCurrency }: ProfitsLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="daysAgo" label={{ value: 'Days Ago', position: 'insideBottom', offset: -5 }} reversed />
        <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} tickFormatter={formatCurrency} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `${label} days ago`} />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
