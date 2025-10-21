import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'hsl(var(--success))',
  waiting_payment: 'hsl(var(--chart-2))',
  refused: 'hsl(var(--destructive))',
  refunded: 'hsl(var(--warning))',
  chargedback: 'hsl(var(--destructive))',
  canceled: 'hsl(var(--warning))',
  waiting: 'hsl(var(--chart-2))',
  pending: 'hsl(var(--muted))',
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pago',
  waiting_payment: 'Aguardando Pagamento',
  refused: 'Recusado',
  refunded: 'Reembolsado',
  chargedback: 'Estornado',
  canceled: 'Cancelado',
  waiting: 'Aguardando',
  pending: 'Pendente',
};

export const StatusChart = ({ data, title = "Distribuição por Status" }: StatusChartProps) => {
  const formattedData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.name] || item.name,
    originalName: item.name,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={STATUS_COLORS[entry.originalName] || 'hsl(var(--chart-5))'} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
