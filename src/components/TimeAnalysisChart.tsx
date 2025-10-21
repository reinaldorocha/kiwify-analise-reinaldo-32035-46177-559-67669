import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimeAnalysisData {
  period: string;
  vendas: number;
  receita: number;
}

interface TimeAnalysisChartProps {
  data: TimeAnalysisData[];
  title: string;
  description?: string;
}

export const TimeAnalysisChart = ({ data, title, description }: TimeAnalysisChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--success))" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'receita') return formatCurrency(value);
                return value;
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="vendas" fill="hsl(var(--primary))" name="Vendas" />
            <Bar yAxisId="right" dataKey="receita" fill="hsl(var(--success))" name="Receita" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
