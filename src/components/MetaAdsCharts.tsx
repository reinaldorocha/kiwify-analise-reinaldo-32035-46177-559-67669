import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaAdsData } from "@/types/metaAds";
import { calculateMetricsByGroup } from "@/utils/metaAdsCalculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface MetaAdsChartsProps {
  data: MetaAdsData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export const MetaAdsCharts = ({ data }: MetaAdsChartsProps) => {
  const campaignMetrics = calculateMetricsByGroup(data, 'nomeCampanha');
  const genderMetrics = calculateMetricsByGroup(data, 'genero');
  const ageMetrics = calculateMetricsByGroup(data, 'idade');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Dados para o gráfico de ROAS por Campanha
  const roasData = campaignMetrics.map(item => ({
    name: item.name.substring(0, 30) + (item.name.length > 30 ? '...' : ''),
    fullName: item.name,
    roas: item.metrics.roas,
    investido: item.metrics.totalInvestido,
    receita: item.metrics.totalReceita,
  }));

  // Dados para o gráfico de Pizza - Investimento por Gênero
  const genderInvestmentData = genderMetrics
    .filter(item => item.name && item.name !== 'unknown')
    .map(item => ({
      name: item.name === 'male' ? 'Masculino' : item.name === 'female' ? 'Feminino' : item.name,
      value: item.metrics.totalInvestido,
    }));

  // Dados para o gráfico de Barras - Desempenho por Idade
  const agePerformanceData = ageMetrics
    .filter(item => item.name)
    .map(item => ({
      name: item.name,
      compras: item.metrics.totalCompras,
      investido: item.metrics.totalInvestido,
      receita: item.metrics.totalReceita,
    }));

  // Dados para linha do tempo - Investimento por Dia
  const timelineData = data.reduce((acc, item) => {
    const dateKey = item.dia.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        investido: 0,
        compras: 0,
        receita: 0,
      };
    }
    acc[dateKey].investido += item.valorUsado;
    acc[dateKey].compras += item.compras;
    acc[dateKey].receita += item.valorConversaoCompra;
    return acc;
  }, {} as Record<string, any>);

  const timelineArray = Object.values(timelineData).sort((a: any, b: any) => 
    a.date.localeCompare(b.date)
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>ROAS por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{data.fullName}</p>
                        <p className="text-sm">ROAS: <span className="font-bold">{data.roas.toFixed(2)}x</span></p>
                        <p className="text-sm">Investido: {formatCurrency(data.investido)}</p>
                        <p className="text-sm">Receita: {formatCurrency(data.receita)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="roas" fill="#8884d8" name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Investimento por Gênero</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderInvestmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderInvestmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Faixa Etária</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agePerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar yAxisId="left" dataKey="compras" fill="#82ca9d" name="Compras" />
              <Bar yAxisId="right" dataKey="investido" fill="#8884d8" name="Investido" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Evolução Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="investido" stroke="#8884d8" name="Investido" />
              <Line type="monotone" dataKey="receita" stroke="#82ca9d" name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
