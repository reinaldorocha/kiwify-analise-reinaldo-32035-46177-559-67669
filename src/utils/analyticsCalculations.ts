import { SalesData, ProductPerformance, AffiliatePerformance, CoproducerPerformance, BuyerPerformance } from '@/types/sales';

export const calculateMetrics = (data: SalesData[]) => {
  const paidSales = data.filter(s => s.status === 'paid');
  const refundedSales = data.filter(s => s.status === 'refunded' || s.status === 'canceled');
  
  const receitaBruta = paidSales.reduce((sum, s) => sum + s.totalComAcrescimo, 0);
  const receitaLiquida = paidSales.reduce((sum, s) => sum + s.valorLiquido, 0);
  const totalTaxas = paidSales.reduce((sum, s) => sum + s.taxas, 0);
  const totalComissoes = paidSales.reduce((sum, s) => sum + (s.comissaoAfiliado || 0), 0);
  const totalReembolsos = refundedSales.reduce((sum, s) => sum + s.totalComAcrescimo, 0);
  
  // Calcular comissões de coprodutores (somar todas as comissões de cada venda)
  const totalComissoesCoprodutores = paidSales.reduce((sum, sale) => {
    if (sale.comissoesCoprodutores) {
      const comissoes = sale.comissoesCoprodutores.split(';').map(c => parseFloat(c.trim().replace(',', '.')) || 0);
      const somaComissoes = comissoes.reduce((s, c) => s + c, 0);
      return sum + somaComissoes;
    }
    return sum;
  }, 0);
  
  // Receita líquida total = valor líquido meu + comissões de coprodutores
  const receitaLiquidaTotal = receitaLiquida + totalComissoesCoprodutores;
  
  // Total de taxas = diferença entre receita bruta e receita líquida total
  const totalTaxasCalculado = receitaBruta - receitaLiquidaTotal;
  
  const ticketMedio = paidSales.length > 0 ? receitaBruta / paidSales.length : 0;
  const percentualReembolsos = data.length > 0 ? (refundedSales.length / data.length) * 100 : 0;
  
  return {
    totalVendas: paidSales.length,
    totalPedidos: data.length,
    receitaBruta,
    receitaLiquida,
    receitaLiquidaTotal,
    totalComissoesCoprodutores,
    ticketMedio,
    totalTaxas: totalTaxasCalculado,
    totalComissoes,
    totalReembolsos,
    totalReembolsosQtd: refundedSales.length,
    percentualReembolsos,
    taxaConversao: data.length > 0 ? (paidSales.length / data.length) * 100 : 0,
  };
};

export const getRevenueOverTime = (data: SalesData[]) => {
  const paidSales = data.filter(s => s.status === 'paid');
  
  const grouped = paidSales.reduce((acc, sale) => {
    const date = sale.dataCriacao.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += sale.totalComAcrescimo;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(grouped)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getProductPerformance = (data: SalesData[]): ProductPerformance[] => {
  const paidSales = data.filter(s => s.status === 'paid');
  
  const grouped = paidSales.reduce((acc, sale) => {
    const produto = sale.produto;
    if (!acc[produto]) {
      acc[produto] = {
        produto,
        vendas: 0,
        receita: 0,
        receitaLiquidaMinha: 0,
        comissoesCoprodutores: 0,
        reembolsos: 0,
      };
    }
    acc[produto].vendas++;
    acc[produto].receita += sale.totalComAcrescimo;
    acc[produto].receitaLiquidaMinha += sale.valorLiquido;
    
    // Calcular comissão dos coprodutores para este produto (somar todas)
    if (sale.comissoesCoprodutores) {
      const comissoes = sale.comissoesCoprodutores.split(';').map(c => parseFloat(c.trim().replace(',', '.')) || 0);
      const somaComissoes = comissoes.reduce((s, c) => s + c, 0);
      acc[produto].comissoesCoprodutores += somaComissoes;
    }
    
    return acc;
  }, {} as Record<string, Omit<ProductPerformance, 'ticketMedio' | 'receitaLiquidaTotal'> & { comissoesCoprodutores: number }>);
  
  // Add refunds
  data.filter(s => s.status === 'refunded' || s.status === 'canceled').forEach(sale => {
    if (grouped[sale.produto]) {
      grouped[sale.produto].reembolsos++;
    }
  });
  
  return Object.values(grouped)
    .map(p => ({
      produto: p.produto,
      vendas: p.vendas,
      receita: p.receita,
      receitaLiquidaMinha: p.receitaLiquidaMinha,
      receitaLiquidaTotal: p.receitaLiquidaMinha + p.comissoesCoprodutores,
      ticketMedio: p.vendas > 0 ? p.receita / p.vendas : 0,
      reembolsos: p.reembolsos,
    }))
    .sort((a, b) => b.receita - a.receita);
};

export const getAffiliatePerformance = (data: SalesData[]): AffiliatePerformance[] => {
  const paidSales = data.filter(s => s.status === 'paid' && s.nomeAfiliado);
  
  const grouped = paidSales.reduce((acc, sale) => {
    const nome = sale.nomeAfiliado || 'Direto';
    if (!acc[nome]) {
      acc[nome] = {
        nome,
        vendas: 0,
        comissao: 0,
        receita: 0,
      };
    }
    acc[nome].vendas++;
    acc[nome].comissao += sale.comissaoAfiliado || 0;
    acc[nome].receita += sale.totalComAcrescimo;
    return acc;
  }, {} as Record<string, AffiliatePerformance>);
  
  return Object.values(grouped).sort((a, b) => b.receita - a.receita);
};

export const getCoproducerPerformance = (data: SalesData[]): CoproducerPerformance[] => {
  const paidSales = data.filter(s => s.status === 'paid' && s.nomesCoprodutores);
  
  const totalReceita = paidSales.reduce((sum, s) => sum + s.totalComAcrescimo, 0);
  
  const grouped = paidSales.reduce((acc, sale) => {
    // Separar nomes e comissões por ponto e vírgula
    const nomes = sale.nomesCoprodutores?.split(';').map(n => n.trim()).filter(n => n) || [];
    const comissoes = sale.comissoesCoprodutores?.split(';').map(c => parseFloat(c.trim().replace(',', '.')) || 0) || [];
    
    if (nomes.length === 0) return acc;
    
    // Processar cada coprodutor individualmente
    nomes.forEach((nome, index) => {
      const comissao = comissoes[index] || 0;
      
      if (!acc[nome]) {
        acc[nome] = {
          nome,
          vendas: 0,
          comissao: 0,
          participacao: 0,
        };
      }
      acc[nome].vendas++;
      acc[nome].comissao += comissao;
    });
    
    return acc;
  }, {} as Record<string, CoproducerPerformance>);
  
  return Object.values(grouped)
    .map(c => ({
      ...c,
      participacao: totalReceita > 0 ? (c.comissao / totalReceita) * 100 : 0,
    }))
    .sort((a, b) => b.comissao - a.comissao);
};

export const getStatusDistribution = (data: SalesData[]) => {
  const statusCount = data.reduce((acc, sale) => {
    const status = sale.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
};

export const getPaymentMethodDistribution = (data: SalesData[]) => {
  const paidSales = data.filter(s => s.status === 'paid');
  
  const paymentCount = paidSales.reduce((acc, sale) => {
    const method = sale.pagamento || 'Não informado';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(paymentCount).map(([name, value]) => ({ name, value }));
};

export const generateInsights = (data: SalesData[], metrics: ReturnType<typeof calculateMetrics>) => {
  const insights: string[] = [];
  
  if (metrics.percentualReembolsos > 10) {
    insights.push(`⚠️ Taxa de reembolso elevada (${metrics.percentualReembolsos.toFixed(1)}%). Considere revisar a qualidade do produto ou as expectativas dos clientes.`);
  } else if (metrics.percentualReembolsos < 5) {
    insights.push(`✅ Excelente taxa de reembolso (${metrics.percentualReembolsos.toFixed(1)}%). Os clientes estão satisfeitos com o produto.`);
  }
  
  if (metrics.ticketMedio > 100) {
    insights.push(`💰 Ticket médio alto (R$ ${metrics.ticketMedio.toFixed(2)}). Oportunidade para estratégias de upsell.`);
  }
  
  const productPerf = getProductPerformance(data);
  if (productPerf.length > 0) {
    insights.push(`🏆 Produto mais lucrativo: ${productPerf[0].produto} (R$ ${productPerf[0].receita.toFixed(2)})`);
  }
  
  const affiliatePerf = getAffiliatePerformance(data);
  if (affiliatePerf.length > 0 && affiliatePerf[0].vendas > 10) {
    insights.push(`🎯 Top afiliado: ${affiliatePerf[0].nome} com ${affiliatePerf[0].vendas} vendas`);
  }
  
  const coproducerPerf = getCoproducerPerformance(data);
  if (coproducerPerf.length > 0) {
    const totalCoprod = coproducerPerf.reduce((sum, c) => sum + c.comissao, 0);
    const percCoprod = (totalCoprod / metrics.receitaBruta) * 100;
    insights.push(`🤝 Coprodução representa ${percCoprod.toFixed(1)}% da receita total`);
  }
  
  // Taxa de recompra
  const buyerPerf = getBuyerPerformance(data);
  const compradores = buyerPerf.length;
  const totalCompras = buyerPerf.reduce((sum, b) => sum + b.totalCompras, 0);
  const taxaRecompra = compradores > 0 ? ((totalCompras - compradores) / compradores) * 100 : 0;
  if (taxaRecompra > 20) {
    insights.push(`🔄 Alta taxa de recompra (${taxaRecompra.toFixed(1)}%). Seus clientes estão voltando!`);
  } else if (taxaRecompra < 10) {
    insights.push(`📈 Taxa de recompra baixa (${taxaRecompra.toFixed(1)}%). Considere estratégias de fidelização.`);
  }
  
  return insights;
};

export const getTimeAnalysis = (data: SalesData[], type: 'dayOfWeek' | 'hour') => {
  const paidSales = data.filter(s => s.status === 'paid');
  
  const grouped: Record<string, { vendas: number; receita: number }> = {};
  
  paidSales.forEach(sale => {
    let key: string;
    
    if (type === 'dayOfWeek') {
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      key = dayNames[sale.dataCriacao.getDay()];
    } else {
      key = `${sale.dataCriacao.getHours()}h`;
    }
    
    if (!grouped[key]) {
      grouped[key] = { vendas: 0, receita: 0 };
    }
    
    grouped[key].vendas++;
    grouped[key].receita += sale.totalComAcrescimo;
  });
  
  return Object.entries(grouped).map(([period, data]) => ({
    period,
    vendas: data.vendas,
    receita: data.receita,
  })).sort((a, b) => {
    if (type === 'dayOfWeek') {
      const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return days.indexOf(a.period) - days.indexOf(b.period);
    }
    return parseInt(a.period) - parseInt(b.period);
  });
};

export const getTrafficSourceAnalysis = (data: SalesData[]) => {
  const paidSales = data.filter(s => s.status === 'paid' && s.tracking_source);
  
  const grouped = paidSales.reduce((acc, sale) => {
    const source = sale.tracking_source || 'Direto';
    if (!acc[source]) {
      acc[source] = {
        fonte: source,
        vendas: 0,
        receita: 0,
        conversao: 0,
      };
    }
    acc[source].vendas++;
    acc[source].receita += sale.totalComAcrescimo;
    return acc;
  }, {} as Record<string, { fonte: string; vendas: number; receita: number; conversao: number }>);
  
  return Object.values(grouped).sort((a, b) => b.receita - a.receita);
};

export const getBuyerPerformance = (data: SalesData[]): BuyerPerformance[] => {
  const paidSales = data.filter(s => s.status === 'paid');
  
  const grouped = paidSales.reduce((acc, sale) => {
    const key = sale.email || sale.cliente;
    if (!acc[key]) {
      // Separar nome em primeiro nome e sobrenome
      const nomePartes = sale.cliente.split(' ');
      const primeiroNome = nomePartes[0] || '';
      const sobrenome = nomePartes.slice(1).join(' ') || '';
      
      acc[key] = {
        nome: sale.cliente,
        primeiroNome,
        sobrenome,
        email: sale.email,
        telefone: sale.telefone || '',
        totalCompras: 0,
        produtos: [] as string[],
        receitaTotal: 0,
        receitaLiquidaMinha: 0,
        comissoesCoprodutores: 0,
        ultimaCompra: sale.dataCriacao,
      };
    }
    acc[key].totalCompras++;
    acc[key].produtos.push(sale.produto);
    acc[key].receitaTotal += sale.totalComAcrescimo;
    acc[key].receitaLiquidaMinha += sale.valorLiquido;
    
    // Calcular comissão dos coprodutores (somar todas)
    if (sale.comissoesCoprodutores) {
      const comissoes = sale.comissoesCoprodutores.split(';').map(c => parseFloat(c.trim().replace(',', '.')) || 0);
      const somaComissoes = comissoes.reduce((s, c) => s + c, 0);
      acc[key].comissoesCoprodutores += somaComissoes;
    }
    
    if (sale.dataCriacao > acc[key].ultimaCompra) {
      acc[key].ultimaCompra = sale.dataCriacao;
    }
    return acc;
  }, {} as Record<string, {
    nome: string;
    primeiroNome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    totalCompras: number;
    produtos: string[];
    receitaTotal: number;
    receitaLiquidaMinha: number;
    comissoesCoprodutores: number;
    ultimaCompra: Date;
  }>);
  
  return Object.values(grouped)
    .map(b => ({
      nome: b.nome,
      primeiroNome: b.primeiroNome,
      sobrenome: b.sobrenome,
      email: b.email,
      telefone: b.telefone,
      totalCompras: b.totalCompras,
      produtos: Array.from(new Set(b.produtos)),
      receitaTotal: b.receitaTotal,
      receitaLiquidaTotal: b.receitaLiquidaMinha + b.comissoesCoprodutores,
      ultimaCompra: b.ultimaCompra,
    }))
    .sort((a, b) => b.receitaTotal - a.receitaTotal);
};
