import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaAdsData } from "@/types/metaAds";
import { calculateMetaAdsMetrics } from "@/utils/metaAdsCalculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users, TrendingUp } from "lucide-react";
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
} from "recharts";

interface MetaAdsAudienceProfileProps {
  data: MetaAdsData[];
}

interface DemographicMetrics {
  segment: string;
  idade?: string;
  genero?: string;
  compras: number;
  investido: number;
  receita: number;
  roas: number;
  cpa: number;
  alcance: number;
  ctr: number;
  taxaConversao: number;
}

const ITEMS_PER_PAGE = 10;
const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  unknown: 'Não especificado'
};

const GENDER_COLORS: Record<string, string> = {
  male: '#3b82f6',
  female: '#ec4899',
  unknown: '#94a3b8'
};

export const MetaAdsAudienceProfile = ({ data }: MetaAdsAudienceProfileProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Análise por Idade
  const ageAnalysis = useMemo(() => {
    const grouped: Record<string, MetaAdsData[]> = {};
    
    data.forEach(item => {
      const age = item.idade || 'Não especificado';
      if (!grouped[age]) grouped[age] = [];
      grouped[age].push(item);
    });

    const result: DemographicMetrics[] = Object.entries(grouped).map(([idade, items]) => {
      const metrics = calculateMetaAdsMetrics(items);
      return {
        segment: idade,
        idade,
        compras: metrics.totalCompras,
        investido: metrics.totalInvestido,
        receita: metrics.totalReceita,
        roas: metrics.roas,
        cpa: metrics.custoMedioCompra,
        alcance: metrics.totalAlcance,
        ctr: metrics.ctrMedio,
        taxaConversao: metrics.taxaConversao,
      };
    });

    return result.sort((a, b) => b.compras - a.compras);
  }, [data]);

  // Análise por Gênero
  const genderAnalysis = useMemo(() => {
    const grouped: Record<string, MetaAdsData[]> = {};
    
    data.forEach(item => {
      const gender = item.genero || 'unknown';
      if (!grouped[gender]) grouped[gender] = [];
      grouped[gender].push(item);
    });

    const result: DemographicMetrics[] = Object.entries(grouped).map(([genero, items]) => {
      const metrics = calculateMetaAdsMetrics(items);
      return {
        segment: GENDER_LABELS[genero] || genero,
        genero,
        compras: metrics.totalCompras,
        investido: metrics.totalInvestido,
        receita: metrics.totalReceita,
        roas: metrics.roas,
        cpa: metrics.custoMedioCompra,
        alcance: metrics.totalAlcance,
        ctr: metrics.ctrMedio,
        taxaConversao: metrics.taxaConversao,
      };
    });

    return result.sort((a, b) => b.compras - a.compras);
  }, [data]);

  // Análise combinada (Idade + Gênero)
  const combinedAnalysis = useMemo(() => {
    const grouped: Record<string, MetaAdsData[]> = {};
    
    data.forEach(item => {
      const age = item.idade || 'Não especificado';
      const gender = GENDER_LABELS[item.genero] || item.genero || 'Não especificado';
      const key = `${age} - ${gender}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    const result: DemographicMetrics[] = Object.entries(grouped).map(([segment, items]) => {
      const metrics = calculateMetaAdsMetrics(items);
      const [idade, genero] = segment.split(' - ');
      return {
        segment,
        idade,
        genero,
        compras: metrics.totalCompras,
        investido: metrics.totalInvestido,
        receita: metrics.totalReceita,
        roas: metrics.roas,
        cpa: metrics.custoMedioCompra,
        alcance: metrics.totalAlcance,
        ctr: metrics.ctrMedio,
        taxaConversao: metrics.taxaConversao,
      };
    });

    return result.sort((a, b) => b.compras - a.compras);
  }, [data]);

  // Paginação
  const totalPages = Math.ceil(combinedAnalysis.length / ITEMS_PER_PAGE);
  const paginatedData = combinedAnalysis.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Dados para gráficos
  const ageChartData = ageAnalysis.map(item => ({
    name: item.idade,
    Compras: item.compras,
    Investido: item.investido,
  }));

  const genderPieData = genderAnalysis.map(item => ({
    name: item.segment,
    value: item.compras,
    color: GENDER_COLORS[item.genero || 'unknown'],
  }));

  const totalPurchases = genderAnalysis.reduce((sum, item) => sum + item.compras, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Compradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Distribuídos em {combinedAnalysis.length} segmentos demográficos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Segmento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{combinedAnalysis[0]?.segment || '-'}</div>
            <p className="text-xs text-muted-foreground">
              {combinedAnalysis[0]?.compras || 0} compras • ROAS {combinedAnalysis[0]?.roas.toFixed(2) || '0.00'}x
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Compras por Idade */}
        <Card>
          <CardHeader>
            <CardTitle>Compras por Faixa Etária</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'Investido' ? formatCurrency(value) : value,
                    name
                  ]}
                />
                <Legend />
                <Bar dataKey="Compras" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Gênero */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Gênero</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil Detalhado do Público Comprador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-right">Compras</TableHead>
                  <TableHead className="text-right">Investido</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum dado disponível
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.segment}</span>
                          <span className="text-xs text-muted-foreground">
                            Alcance: {item.alcance.toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.compras}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.investido)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.receita)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          item.roas >= 3 ? "default" : 
                          item.roas >= 2 ? "secondary" : 
                          "destructive"
                        }>
                          {item.roas.toFixed(2)}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.cpa)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ctr.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {item.taxaConversao.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, combinedAnalysis.length)} de{' '}
                {combinedAnalysis.length} segmentos
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="text-sm">
                  Página {currentPage} de {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
