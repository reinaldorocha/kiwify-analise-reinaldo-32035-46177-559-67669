import { useState, useMemo, useEffect } from 'react';
import { parseCSV } from '@/utils/csvParser';
import { 
  calculateMetrics, 
  getRevenueOverTime, 
  getProductPerformance,
  getAffiliatePerformance,
  getCoproducerPerformance,
  getStatusDistribution,
  getPaymentMethodDistribution,
  getBuyerPerformance,
  getTimeAnalysis,
  getTrafficSourceAnalysis,
  generateInsights
} from '@/utils/analyticsCalculations';
import { parsePartnershipData } from '@/utils/partnershipParser';
import { 
  calculatePartnershipMetrics,
  getPartnershipTimeSeries,
  getPartnerComparison,
  getProfitComparison,
  getROITimeSeries
} from '@/utils/partnershipCalculations';
import { parseMetaAdsCSV } from '@/utils/metaAdsParser';
import { calculateMetaAdsMetrics } from '@/utils/metaAdsCalculations';
import { SalesData } from '@/types/sales';
import { PartnershipData } from '@/types/partnership';
import { MetaAdsData } from '@/types/metaAds';
import { FileUploader } from '@/components/FileUploader';
import { FilterPanel } from '@/components/FilterPanel';
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from '@/components/RevenueChart';
import { ProductTable } from '@/components/ProductTable';
import { StatusChart } from '@/components/StatusChart';
import { CoproducerTable } from '@/components/CoproducerTable';
import { InsightsPanel } from '@/components/InsightsPanel';
import { BuyerTable } from '@/components/BuyerTable';
import { TimeAnalysisChart } from '@/components/TimeAnalysisChart';
import { AffiliateTable } from '@/components/AffiliateTable';
import { PartnershipChart } from '@/components/PartnershipChart';
import { PartnershipTable } from '@/components/PartnershipTable';
import { PartnershipPieChart } from '@/components/PartnershipPieChart';
import { MetaAdsTable } from '@/components/MetaAdsTable';
import { MetaAdsCharts } from '@/components/MetaAdsCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingCart, TrendingUp, Percent, BarChart3, RefreshCw, Users, LogOut, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [partnershipData, setPartnershipData] = useState<PartnershipData[]>([]);
  const [metaAdsData, setMetaAdsData] = useState<MetaAdsData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trafficManagerCost, setTrafficManagerCost] = useState<number>(0);
  const [filters, setFilters] = useState<{
    startDate?: Date;
    endDate?: Date;
    products?: string[];
    statuses?: string[];
    affiliates?: string[];
    coproducers?: string[];
    paymentMethods?: string[];
  }>({});

  const handleFileLoad = (content: string) => {
    try {
      setIsLoading(true);
      const parsed = parseCSV(content);
      setSalesData(parsed);
      setFilters({});
      toast.success(`${parsed.length} vendas carregadas com sucesso!`);
    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      toast.error('Erro ao processar o arquivo CSV. Verifique o formato.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnershipLoad = async (sheetUrl: string) => {
    try {
      setIsLoading(true);
      
      // Extract spreadsheet ID from URL and create export URL
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        toast.error('Link inválido. Use um link do Google Sheets.');
        return;
      }
      
      const spreadsheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      
      const response = await fetch(exportUrl);
      const text = await response.text();
      const parsed = parsePartnershipData(text);
      
      if (parsed.length === 0) {
        toast.error('Nenhum dado encontrado na planilha.');
        return;
      }
      
      setPartnershipData(parsed);
      toast.success(`${parsed.length} dias de parceria carregados!`);
    } catch (error) {
      console.error('Erro ao carregar dados de parceria:', error);
      toast.error('Erro ao carregar dados de parceria. Verifique o link e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMetaAdsLoad = (content: string) => {
    try {
      setIsLoading(true);
      const parsed = parseMetaAdsCSV(content);
      setMetaAdsData(parsed);
      toast.success(`${parsed.length} registros do Meta Ads carregados com sucesso!`);
    } catch (error) {
      console.error('Erro ao processar CSV do Meta Ads:', error);
      toast.error('Erro ao processar o arquivo CSV do Meta Ads. Verifique o formato.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = [...salesData];

    if (filters.startDate) {
      filtered = filtered.filter(s => s.dataCriacao >= filters.startDate!);
    }
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => s.dataCriacao <= endOfDay);
    }
    if (filters.products && filters.products.length > 0) {
      filtered = filtered.filter(s => filters.products!.includes(s.produto));
    }
    if (filters.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(s => filters.statuses!.includes(s.status));
    }
    if (filters.affiliates && filters.affiliates.length > 0) {
      filtered = filtered.filter(s => s.nomeAfiliado && filters.affiliates!.includes(s.nomeAfiliado));
    }
    if (filters.coproducers && filters.coproducers.length > 0) {
      filtered = filtered.filter(s => {
        if (!s.nomesCoprodutores) return false;
        const nomes = s.nomesCoprodutores.split(';').map(name => name.trim());
        return nomes.some(nome => filters.coproducers!.includes(nome));
      });
    }
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      filtered = filtered.filter(s => s.pagamento && filters.paymentMethods!.includes(s.pagamento));
    }

    return filtered;
  }, [salesData, filters]);

  const dataForCommission = useMemo(() => {
    if (!filters.coproducers || filters.coproducers.length === 0) return filteredData;
    const selected = new Set(filters.coproducers);
    return filteredData.map((s) => {
      if (!s.nomesCoprodutores || !s.comissoesCoprodutores) return s;
      const nomes = s.nomesCoprodutores.split(';').map((n) => n.trim());
      const coms = s.comissoesCoprodutores
        .split(';')
        .map((c) => parseFloat(c.trim().replace(',', '.')) || 0);
      const selectedAmounts: string[] = [];
      nomes.forEach((nome, idx) => {
        if (selected.has(nome)) {
          selectedAmounts.push(String(coms[idx] || 0));
        }
      });
      return { ...s, comissoesCoprodutores: selectedAmounts.join(';') };
    });
  }, [filteredData, filters.coproducers]);

  const metrics = dataForCommission.length > 0 ? calculateMetrics(dataForCommission) : null;
  const revenueData = filteredData.length > 0 ? getRevenueOverTime(filteredData) : [];
  const productPerf = dataForCommission.length > 0 ? getProductPerformance(dataForCommission) : [];
  const affiliatePerf = filteredData.length > 0 ? getAffiliatePerformance(filteredData) : [];
  const coproducerPerf = filteredData.length > 0 ? getCoproducerPerformance(filteredData) : [];
  const statusDist = filteredData.length > 0 ? getStatusDistribution(filteredData) : [];
  const paymentDist = filteredData.length > 0 ? getPaymentMethodDistribution(filteredData) : [];
  const buyerPerf = dataForCommission.length > 0 ? getBuyerPerformance(dataForCommission) : [];
  const dayOfWeekData = filteredData.length > 0 ? getTimeAnalysis(filteredData, 'dayOfWeek') : [];
  const hourData = filteredData.length > 0 ? getTimeAnalysis(filteredData, 'hour') : [];
  const trafficData = filteredData.length > 0 ? getTrafficSourceAnalysis(filteredData) : [];
  const insights = metrics ? generateInsights(dataForCommission, metrics) : [];

  // Partnership calculations
  const partnershipMetrics = partnershipData.length > 0 ? calculatePartnershipMetrics(partnershipData) : null;
  const partnershipTimeSeries = partnershipData.length > 0 ? getPartnershipTimeSeries(partnershipData) : [];
  const partnerComparison = partnershipData.length > 0 ? getPartnerComparison(partnershipData) : [];
  const profitComparison = partnershipData.length > 0 ? getProfitComparison(partnershipData) : [];
  const roiTimeSeries = partnershipData.length > 0 ? getROITimeSeries(partnershipData) : [];

  // Meta Ads calculations
  const metaAdsMetrics = metaAdsData.length > 0 ? calculateMetaAdsMetrics(metaAdsData) : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Render without requiring sales data
  const hasSalesData = salesData.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Analytics Kiwify</h1>
                {hasSalesData ? (
                  <p className="text-sm text-muted-foreground">
                    {filteredData.length} de {salesData.length} vendas
                    {filteredData.length !== salesData.length && ' (filtrado)'}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Análise inteligente de vendas e parcerias</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasSalesData && <FileUploader onFileLoad={handleFileLoad} compact />}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/login');
                  toast.success('Logout realizado com sucesso!');
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sales" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Análise de Vendas
            </TabsTrigger>
            <TabsTrigger value="partnership" className="gap-2">
              <Users className="h-4 w-4" />
              Análise de Parceria
            </TabsTrigger>
            <TabsTrigger value="metaads" className="gap-2">
              <Target className="h-4 w-4" />
              Meta Ads
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {!hasSalesData ? (
              <div className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Análise de Vendas</h3>
                <p className="text-muted-foreground mb-6">Faça upload de um arquivo CSV para começar</p>
                <FileUploader onFileLoad={handleFileLoad} />
              </div>
            ) : (
              <>
            {/* Filters */}
            <section className="mb-6">
              <FilterPanel 
                data={salesData} 
                filters={filters} 
                onFilterChange={setFilters}
              />
            </section>

        {/* Overview Metrics */}
        {metrics && (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">📊 Visão Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <MetricCard
                  title="Receita Bruta"
                  value={formatCurrency(metrics.receitaBruta)}
                  icon={<DollarSign className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Total de Taxas"
                  value={formatCurrency(metrics.totalTaxas)}
                  icon={<DollarSign className="h-4 w-4" />}
                  trend="neutral"
                />
                <MetricCard
                  title="Receita Líquida Total"
                  value={formatCurrency(metrics.receitaLiquidaTotal)}
                  icon={<DollarSign className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Sua Receita Líquida"
                  value={formatCurrency(metrics.receitaLiquida)}
                  icon={<DollarSign className="h-4 w-4" />}
                  trend="up"
                />
                <MetricCard
                  title="Total de Vendas Pagas"
                  value={metrics.totalVendas}
                  icon={<ShoppingCart className="h-4 w-4" />}
                />
                <MetricCard
                  title="Ticket Médio"
                  value={formatCurrency(metrics.ticketMedio)}
                  icon={<TrendingUp className="h-4 w-4" />}
                />
              </div>
            </section>

            <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Taxa de Conversão"
                value={`${metrics.taxaConversao.toFixed(1)}%`}
                icon={<Percent className="h-4 w-4" />}
                trend={metrics.taxaConversao > 80 ? 'up' : 'neutral'}
              />
              <MetricCard
                title="Total de Pedidos"
                value={metrics.totalPedidos}
                icon={<ShoppingCart className="h-4 w-4" />}
              />
              <MetricCard
                title="Comissão Coprodutores"
                value={formatCurrency(metrics.totalComissoesCoprodutores)}
                icon={<DollarSign className="h-4 w-4" />}
              />
              <MetricCard
                title="Taxa de Reembolsos"
                value={`${metrics.percentualReembolsos.toFixed(1)}%`}
                icon={<Percent className="h-4 w-4" />}
                trend={metrics.percentualReembolsos < 5 ? 'up' : 'down'}
              />
              <MetricCard
                title="Total de Reembolsos"
                value={metrics.totalReembolsosQtd}
                icon={<RefreshCw className="h-4 w-4" />}
                trend="neutral"
              />
              <MetricCard
                title="Valor de Reembolsos"
                value={formatCurrency(metrics.totalReembolsos)}
                icon={<RefreshCw className="h-4 w-4" />}
                trend="neutral"
              />
            </section>
          </>
        )}

        {/* Revenue Chart */}
        {revenueData.length > 0 && (
          <section className="mb-8">
            <RevenueChart data={revenueData} />
          </section>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <section className="mb-8">
            <InsightsPanel insights={insights} />
          </section>
        )}

        {/* Product Performance */}
        {productPerf.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🧩 Performance por Produto</h2>
            <ProductTable data={productPerf} />
          </section>
        )}

        {/* Affiliate Performance */}
        {affiliatePerf.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🎯 Afiliados</h2>
            <AffiliateTable data={affiliatePerf} />
          </section>
        )}

        {/* Time Analysis */}
        {(dayOfWeekData.length > 0 || hourData.length > 0) && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">📅 Análise Temporal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dayOfWeekData.length > 0 && (
                <TimeAnalysisChart 
                  data={dayOfWeekData} 
                  title="Vendas por Dia da Semana"
                  description="Identifique os melhores dias para vender"
                />
              )}
              {hourData.length > 0 && (
                <TimeAnalysisChart 
                  data={hourData} 
                  title="Vendas por Horário"
                  description="Descubra os horários de pico"
                />
              )}
            </div>
          </section>
        )}

        {/* Charts */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {statusDist.length > 0 && <StatusChart data={statusDist} title="Distribuição por Status" />}
          {paymentDist.length > 0 && <StatusChart data={paymentDist} title="Distribuição por Forma de Pagamento" />}
        </section>

        {/* Coproduction */}
        {coproducerPerf.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">💼 Coprodução</h2>
            <CoproducerTable data={coproducerPerf} />
          </section>
        )}

            {/* Buyers */}
            {buyerPerf.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">👥 Compradores</h2>
                <BuyerTable data={buyerPerf} />
              </section>
            )}
            </>
            )}
          </TabsContent>

          <TabsContent value="partnership">
            {partnershipData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 max-w-2xl mx-auto">
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Análise de Parceria</h3>
                <p className="text-muted-foreground mb-6 text-center">
                  Cole o link da sua planilha do Google Sheets para começar a análise
                </p>
                <div className="w-full space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-sm"
                      id="sheet-url-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.currentTarget;
                          handlePartnershipLoad(input.value);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('sheet-url-input') as HTMLInputElement;
                        if (input?.value) {
                          handlePartnershipLoad(input.value);
                        } else {
                          toast.error('Cole o link da planilha');
                        }
                      }}
                      disabled={isLoading}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isLoading ? 'Carregando...' : 'Carregar'}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Certifique-se de que a planilha está compartilhada publicamente ou com permissão de visualização
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Load New Sheet Option */}
                <section className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Cole o link de uma nova planilha..."
                        className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-sm"
                        id="sheet-url-reload-input"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            if (input.value) {
                              handlePartnershipLoad(input.value);
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('sheet-url-reload-input') as HTMLInputElement;
                          if (input?.value) {
                            handlePartnershipLoad(input.value);
                            input.value = '';
                          } else {
                            toast.error('Cole o link da planilha');
                          }
                        }}
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                      >
                        {isLoading ? 'Carregando...' : 'Carregar'}
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium whitespace-nowrap">Gestor de Tráfego:</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={trafficManagerCost || ''}
                        onChange={(e) => setTrafficManagerCost(parseFloat(e.target.value) || 0)}
                        className="w-40 px-4 py-2 rounded-md border border-input bg-background text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </section>

                {/* Partnership Metrics */}
                {partnershipMetrics && (
                  <>
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">💰 Métricas Gerais da Parceria</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                          title="Faturamento Total"
                          value={formatCurrency(partnershipMetrics.fatTotalGeral)}
                          icon={<DollarSign className="h-4 w-4" />}
                          trend="up"
                        />
                        <MetricCard
                          title="Gasto em Tráfego"
                          value={formatCurrency(partnershipMetrics.gastoTrafegoTotal)}
                          icon={<TrendingUp className="h-4 w-4" />}
                          trend="neutral"
                        />
                        <MetricCard
                          title="Lucro Líquido Total"
                          value={formatCurrency(partnershipMetrics.lucroLiquidoTotal)}
                          icon={<DollarSign className="h-4 w-4" />}
                          trend="up"
                        />
                        <MetricCard
                          title="Retorno Médio"
                          value={`${partnershipMetrics.retornoMedio.toFixed(1)}%`}
                          icon={<Percent className="h-4 w-4" />}
                          trend={partnershipMetrics.retornoMedio > 100 ? 'up' : 'neutral'}
                        />
                      </div>
                    </section>

                    <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        title="Fat. Jhon (55%)"
                        value={formatCurrency(partnershipMetrics.fatJhonTotal)}
                        icon={<Users className="h-4 w-4" />}
                      />
                      <MetricCard
                        title="Fat. JR (45%)"
                        value={formatCurrency(partnershipMetrics.fatJrTotal)}
                        icon={<Users className="h-4 w-4" />}
                      />
                      <MetricCard
                        title="Lucro Jhon"
                        value={formatCurrency(partnershipMetrics.lucroJhonTotal)}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend="up"
                      />
                      <MetricCard
                        title="Lucro JR"
                        value={formatCurrency(partnershipMetrics.lucroJrTotal)}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend="up"
                      />
                    </section>

                    <section className="mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <MetricCard
                          title="Diferença de Lucro (Jhon - JR)"
                          value={formatCurrency(partnershipMetrics.lucroJhonTotal - partnershipMetrics.lucroJrTotal)}
                          icon={<TrendingUp className="h-4 w-4" />}
                          trend={partnershipMetrics.lucroJhonTotal > partnershipMetrics.lucroJrTotal ? 'up' : partnershipMetrics.lucroJhonTotal < partnershipMetrics.lucroJrTotal ? 'down' : 'neutral'}
                        />
                      </div>
                    </section>

                    {/* Lucros após Gestor de Tráfego */}
                    {trafficManagerCost > 0 && (
                      <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">💼 Lucros Líquidos após Gestor de Tráfego</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <MetricCard
                            title="Custo Gestor de Tráfego"
                            value={formatCurrency(trafficManagerCost)}
                            icon={<DollarSign className="h-4 w-4" />}
                            trend="neutral"
                          />
                          <MetricCard
                            title="Jhon paga (60%)"
                            value={formatCurrency(trafficManagerCost * 0.6)}
                            icon={<DollarSign className="h-4 w-4" />}
                            trend="neutral"
                          />
                          <MetricCard
                            title="JR paga (40%)"
                            value={formatCurrency(trafficManagerCost * 0.4)}
                            icon={<DollarSign className="h-4 w-4" />}
                            trend="neutral"
                          />
                          <MetricCard
                            title="Lucro Líquido Jhon"
                            value={formatCurrency(partnershipMetrics.lucroJhonTotal - (trafficManagerCost * 0.6))}
                            icon={<DollarSign className="h-4 w-4" />}
                            trend={partnershipMetrics.lucroJhonTotal - (trafficManagerCost * 0.6) > 0 ? 'up' : 'down'}
                          />
                          <MetricCard
                            title="Lucro Líquido JR"
                            value={formatCurrency(partnershipMetrics.lucroJrTotal - (trafficManagerCost * 0.4))}
                            icon={<DollarSign className="h-4 w-4" />}
                            trend={partnershipMetrics.lucroJrTotal - (trafficManagerCost * 0.4) > 0 ? 'up' : 'down'}
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <MetricCard
                            title="Diferença de Lucro após Gestor (Jhon - JR)"
                            value={formatCurrency((partnershipMetrics.lucroJhonTotal - (trafficManagerCost * 0.6)) - (partnershipMetrics.lucroJrTotal - (trafficManagerCost * 0.4)))}
                            icon={<TrendingUp className="h-4 w-4" />}
                            trend={(partnershipMetrics.lucroJhonTotal - (trafficManagerCost * 0.6)) > (partnershipMetrics.lucroJrTotal - (trafficManagerCost * 0.4)) ? 'up' : (partnershipMetrics.lucroJhonTotal - (trafficManagerCost * 0.6)) < (partnershipMetrics.lucroJrTotal - (trafficManagerCost * 0.4)) ? 'down' : 'neutral'}
                          />
                        </div>
                      </section>
                    )}

                    <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MetricCard
                        title="Dias Positivos"
                        value={partnershipMetrics.diasPositivos}
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend="up"
                      />
                      <MetricCard
                        title="Dias Negativos"
                        value={partnershipMetrics.diasNegativos}
                        icon={<RefreshCw className="h-4 w-4" />}
                        trend="neutral"
                      />
                    </section>
                  </>
                )}

                {/* Charts */}
                {partnershipTimeSeries.length > 0 && (
                  <section className="mb-8">
                    <PartnershipChart
                      data={partnershipTimeSeries}
                      title="📈 Evolução Temporal"
                      description="Faturamento, lucro e gastos ao longo do tempo"
                      dataKeys={[
                        { key: 'Faturamento Total', color: 'hsl(var(--chart-1))', name: 'Faturamento Total' },
                        { key: 'Lucro Líquido', color: 'hsl(var(--chart-2))', name: 'Lucro Líquido' },
                        { key: 'Gasto Tráfego', color: 'hsl(var(--destructive))', name: 'Gasto Tráfego' },
                      ]}
                    />
                  </section>
                )}

                {roiTimeSeries.length > 0 && (
                  <section className="mb-8">
                    <PartnershipChart
                      data={roiTimeSeries}
                      title="📊 Retorno sobre Investimento (ROI)"
                      description="Evolução do retorno percentual ao longo do tempo"
                      dataKeys={[
                        { key: 'Retorno (%)', color: 'hsl(var(--chart-3))', name: 'Retorno (%)' },
                      ]}
                    />
                  </section>
                )}

                {/* Comparison Charts */}
                <section className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {partnerComparison.length > 0 && (
                    <PartnershipPieChart
                      data={partnerComparison}
                      title="👥 Comparação de Faturamento"
                      description="Divisão 55% / 45%"
                    />
                  )}
                  {profitComparison.length > 0 && (
                    <PartnershipPieChart
                      data={profitComparison}
                      title="💵 Comparação de Lucros"
                      description="Lucro líquido de cada parceiro"
                    />
                  )}
                </section>

                {/* Data Table */}
                {partnershipData.length > 0 && (
                  <section className="mb-8">
                    <PartnershipTable data={partnershipData} />
                  </section>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="metaads">
            {metaAdsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Análise Meta Ads</h3>
                <p className="text-muted-foreground mb-6">Faça upload do relatório CSV do Meta Ads para começar</p>
                <FileUploader onFileLoad={handleMetaAdsLoad} />
              </div>
            ) : (
              <>
                {/* Header with Upload Button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">📱 Análise Meta Ads</h2>
                    <p className="text-muted-foreground">{metaAdsData.length} registros analisados</p>
                  </div>
                  <FileUploader onFileLoad={handleMetaAdsLoad} compact />
                </div>

                {/* Overview Metrics */}
                {metaAdsMetrics && (
                  <section className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">📊 Visão Geral</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <MetricCard
                        title="Total Investido"
                        value={formatCurrency(metaAdsMetrics.totalInvestido)}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend="neutral"
                      />
                      <MetricCard
                        title="Total Receita"
                        value={formatCurrency(metaAdsMetrics.totalReceita)}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend="up"
                      />
                      <MetricCard
                        title="ROAS (Retorno sobre Investimento)"
                        value={`${metaAdsMetrics.roas.toFixed(2)}x`}
                        icon={<TrendingUp className="h-4 w-4" />}
                        trend={metaAdsMetrics.roas >= 3 ? 'up' : metaAdsMetrics.roas >= 2 ? 'neutral' : 'down'}
                      />
                      <MetricCard
                        title="Total de Compras"
                        value={metaAdsMetrics.totalCompras}
                        icon={<ShoppingCart className="h-4 w-4" />}
                        trend="up"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                      <MetricCard
                        title="Custo por Compra (CPA)"
                        value={formatCurrency(metaAdsMetrics.custoMedioCompra)}
                        icon={<DollarSign className="h-4 w-4" />}
                        trend="neutral"
                      />
                      <MetricCard
                        title="Alcance Total"
                        value={metaAdsMetrics.totalAlcance.toLocaleString('pt-BR')}
                        icon={<Users className="h-4 w-4" />}
                        trend="up"
                      />
                      <MetricCard
                        title="Total de Impressões"
                        value={metaAdsMetrics.totalImpressoes.toLocaleString('pt-BR')}
                        icon={<BarChart3 className="h-4 w-4" />}
                        trend="up"
                      />
                      <MetricCard
                        title="Taxa de Conversão"
                        value={`${metaAdsMetrics.taxaConversao.toFixed(2)}%`}
                        icon={<Percent className="h-4 w-4" />}
                        trend={metaAdsMetrics.taxaConversao >= 5 ? 'up' : metaAdsMetrics.taxaConversao >= 2 ? 'neutral' : 'down'}
                      />
                      <MetricCard
                        title="CTR Médio"
                        value={`${metaAdsMetrics.ctrMedio.toFixed(2)}%`}
                        icon={<Percent className="h-4 w-4" />}
                        trend={metaAdsMetrics.ctrMedio >= 2 ? 'up' : metaAdsMetrics.ctrMedio >= 1 ? 'neutral' : 'down'}
                      />
                    </div>
                  </section>
                )}

                {/* Charts */}
                <section className="mb-8">
                  <MetaAdsCharts data={metaAdsData} />
                </section>

                {/* Data Table */}
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">📋 Dados Detalhados</h2>
                  <MetaAdsTable data={metaAdsData} />
                </section>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
