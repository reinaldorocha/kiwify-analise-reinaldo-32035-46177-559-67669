export interface SalesData {
  id: string;
  status: string;
  produto: string;
  cliente: string;
  email: string;
  telefone?: string;
  valorLiquido: number;
  precoBase: number;
  totalComAcrescimo: number;
  taxas: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
  nomeAfiliado?: string;
  comissaoAfiliado?: number;
  nomesCoprodutores?: string;
  comissoesCoprodutores?: string;
  pagamento?: string;
  parcelas?: number;
  tracking_source?: string;
  tracking_medium?: string;
  tracking_campaign?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProductPerformance {
  produto: string;
  vendas: number;
  receita: number;
  receitaLiquidaTotal: number;
  receitaLiquidaMinha: number;
  ticketMedio: number;
  reembolsos: number;
}

export interface BuyerPerformance {
  nome: string;
  primeiroNome: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  totalCompras: number;
  produtos: string[];
  receitaTotal: number;
  receitaLiquidaTotal: number;
  ultimaCompra: Date;
}

export interface AffiliatePerformance {
  nome: string;
  vendas: number;
  comissao: number;
  receita: number;
}

export interface CoproducerPerformance {
  nome: string;
  vendas: number;
  comissao: number;
  participacao: number;
}
