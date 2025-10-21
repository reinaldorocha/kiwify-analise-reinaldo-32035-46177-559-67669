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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line,
  Area,
} from "recharts";

interface MetaAdsAdditionalChartsProps {
  data: MetaAdsData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const MetaAdsAdditionalCharts = ({ data }: MetaAdsAdditionalChartsProps) => {
  const campaignMetrics = calculateMetricsByGroup(data, 'nomeCampanha');
  const adSetMetrics = calculateMetricsByGroup(data, 'nomeConjuntoAnuncios');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Top 10 campanhas por CPA (menor é melhor)
  const topCampaignsByCPA = campaignMetrics
    .filter(c => c.metrics.totalCompras > 0)
    .sort((a, b) => a.metrics.custoMedioCompra - b.metrics.custoMedioCompra)
    .slice(0, 10)
    .map(c => ({
      name: c.name.substring(0, 25) + (c.name.length > 25 ? '...' : ''),
      fullName: c.name,
      cpa: c.metrics.custoMedioCompra,
      compras: c.metrics.totalCompras,
    }));

  // Performance Radar - Top 5 campanhas
  const top5Campaigns = campaignMetrics
    .sort((a, b) => b.metrics.totalInvestido - a.metrics.totalInvestido)
    .slice(0, 5);

  const radarData = [
    {
      metric: 'ROAS',
      ...Object.fromEntries(top5Campaigns.map(c => [
        c.name.substring(0, 20),
        Math.min(c.metrics.roas * 20, 100)
      ]))
    },
    {
      metric: 'CTR',
      ...Object.fromEntries(top5Campaigns.map(c => [
        c.name.substring(0, 20),
        Math.min(c.metrics.ctrMedio * 20, 100)
      ]))
    },
    {
      metric: 'Conv. Rate',
      ...Object.fromEntries(top5Campaigns.map(c => [
        c.name.substring(0, 20),
        Math.min(c.metrics.taxaConversao * 10, 100)
      ]))
    },
    {
      metric: 'Frequência',
      ...Object.fromEntries(top5Campaigns.map(c => [
        c.name.substring(0, 20),
        Math.min(c.metrics.frequenciaMedia * 20, 100)
      ]))
    },
  ];

  // Scatter: Investimento vs ROAS
  const scatterData = campaignMetrics
    .filter(c => c.metrics.totalCompras > 0)
    .map(c => ({
      name: c.name.substring(0, 30),
      investido: c.metrics.totalInvestido,
      roas: c.metrics.roas,
      compras: c.metrics.totalCompras,
    }));

  // Funil de conversão por conjunto de anúncios (top 10)
  const funnelData = adSetMetrics
    .sort((a, b) => b.metrics.totalImpressoes - a.metrics.totalImpressoes)
    .slice(0, 10)
    .map(item => ({
      name: item.name.substring(0, 30) + (item.name.length > 30 ? '...' : ''),
      impressoes: item.metrics.totalImpressoes,
      cliques: item.metrics.totalCliques,
      compras: item.metrics.totalCompras,
    }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* CPA por Campanha */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Campanhas - Menor CPA</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCampaignsByCPA} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{data.fullName}</p>
                        <p className="text-sm">CPA: {formatCurrency(data.cpa)}</p>
                        <p className="text-sm">Compras: {data.compras}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="cpa" fill="#82ca9d" name="CPA (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Radar de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Radar de Performance - Top 5 Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              {top5Campaigns.map((campaign, index) => (
                <Radar
                  key={campaign.name}
                  name={campaign.name.substring(0, 20)}
                  dataKey={campaign.name.substring(0, 20)}
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scatter: Investimento vs ROAS */}
      <Card>
        <CardHeader>
          <CardTitle>Investimento vs ROAS por Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="investido" 
                name="Investido" 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis dataKey="roas" name="ROAS" />
              <ZAxis dataKey="compras" range={[50, 400]} name="Compras" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{data.name}</p>
                        <p className="text-sm">Investido: {formatCurrency(data.investido)}</p>
                        <p className="text-sm">ROAS: {data.roas.toFixed(2)}x</p>
                        <p className="text-sm">Compras: {data.compras}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Scatter name="Campanhas" data={scatterData} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão - Top 10 Conjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR')} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="impressoes" 
                fill="#8884d8" 
                stroke="#8884d8" 
                name="Impressões"
                fillOpacity={0.3}
              />
              <Line 
                type="monotone" 
                dataKey="cliques" 
                stroke="#82ca9d" 
                name="Cliques" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="compras" 
                stroke="#ffc658" 
                name="Compras" 
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
