import { PartnershipData, PartnershipMetrics } from '@/types/partnership';

export const calculatePartnershipMetrics = (data: PartnershipData[]): PartnershipMetrics => {
  const fatTotalGeral = data.reduce((sum, d) => sum + d.fatTotal, 0);
  const fatJhonTotal = data.reduce((sum, d) => sum + d.fatJhon, 0);
  const fatJrTotal = data.reduce((sum, d) => sum + d.fatJr, 0);
  const gastoTrafegoTotal = data.reduce((sum, d) => sum + d.gastoTrafego, 0);
  const lucroLiquidoTotal = data.reduce((sum, d) => sum + d.lucroLiquidoTotal, 0);
  const lucroJhonTotal = data.reduce((sum, d) => sum + d.lucroLiqJhon, 0);
  const lucroJrTotal = data.reduce((sum, d) => sum + d.lucroLiqJr, 0);
  
  const retornoMedio = data.reduce((sum, d) => sum + d.retornoPercentual, 0) / data.length;
  
  const diasPositivos = data.filter(d => d.lucroLiquidoTotal > 0).length;
  const diasNegativos = data.filter(d => d.lucroLiquidoTotal < 0).length;
  
  const sortedByProfit = [...data].sort((a, b) => b.lucroLiquidoTotal - a.lucroLiquidoTotal);
  const melhorDia = { data: sortedByProfit[0].data, valor: sortedByProfit[0].lucroLiquidoTotal };
  const piorDia = { data: sortedByProfit[sortedByProfit.length - 1].data, valor: sortedByProfit[sortedByProfit.length - 1].lucroLiquidoTotal };
  
  return {
    fatTotalGeral,
    fatJhonTotal,
    fatJrTotal,
    gastoTrafegoTotal,
    lucroLiquidoTotal,
    lucroJhonTotal,
    lucroJrTotal,
    retornoMedio,
    diasPositivos,
    diasNegativos,
    melhorDia,
    piorDia,
  };
};

export const getPartnershipTimeSeries = (data: PartnershipData[]) => {
  return data.map(d => {
    const dateStr = d.data && !isNaN(d.data.getTime()) 
      ? d.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : 'Data inválida';
    
    return {
      date: dateStr,
      'Faturamento Total': d.fatTotal,
      'Lucro Líquido': d.lucroLiquidoTotal,
      'Gasto Tráfego': d.gastoTrafego,
    };
  });
};

export const getPartnerComparison = (data: PartnershipData[]) => {
  const jhonTotal = data.reduce((sum, d) => sum + d.fatJhon, 0);
  const jrTotal = data.reduce((sum, d) => sum + d.fatJr, 0);
  const jhonLucro = data.reduce((sum, d) => sum + d.lucroLiqJhon, 0);
  const jrLucro = data.reduce((sum, d) => sum + d.lucroLiqJr, 0);
  
  return [
    { name: 'Faturamento Jhon', value: jhonTotal },
    { name: 'Faturamento JR', value: jrTotal },
  ];
};

export const getProfitComparison = (data: PartnershipData[]) => {
  const jhonLucro = data.reduce((sum, d) => sum + d.lucroLiqJhon, 0);
  const jrLucro = data.reduce((sum, d) => sum + d.lucroLiqJr, 0);
  
  return [
    { name: 'Lucro Jhon', value: jhonLucro },
    { name: 'Lucro JR', value: jrLucro },
  ];
};

export const getROITimeSeries = (data: PartnershipData[]) => {
  return data.map(d => {
    const dateStr = d.data && !isNaN(d.data.getTime()) 
      ? d.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      : 'Data inválida';
    
    return {
      date: dateStr,
      'Retorno (%)': d.retornoPercentual,
    };
  });
};
