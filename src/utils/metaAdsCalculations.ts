import { MetaAdsData, MetaAdsMetrics } from '@/types/metaAds';

export const calculateMetaAdsMetrics = (data: MetaAdsData[]): MetaAdsMetrics => {
  const totalInvestido = data.reduce((sum, item) => sum + item.valorUsado, 0);
  const totalCompras = data.reduce((sum, item) => sum + item.compras, 0);
  const totalReceita = data.reduce((sum, item) => sum + item.valorConversaoCompra, 0);
  const totalAlcance = data.reduce((sum, item) => sum + item.alcance, 0);
  const totalImpressoes = data.reduce((sum, item) => sum + item.impressoes, 0);
  const totalCliques = data.reduce((sum, item) => sum + item.cliquesTodos, 0);
  
  const roas = totalInvestido > 0 ? totalReceita / totalInvestido : 0;
  const custoMedioCompra = totalCompras > 0 ? totalInvestido / totalCompras : 0;
  const frequenciaMedia = totalAlcance > 0 ? totalImpressoes / totalAlcance : 0;
  const cpcMedio = totalCliques > 0 ? totalInvestido / totalCliques : 0;
  const cpmMedio = totalImpressoes > 0 ? (totalInvestido / totalImpressoes) * 1000 : 0;
  const ctrMedio = totalImpressoes > 0 ? (totalCliques / totalImpressoes) * 100 : 0;
  const taxaConversao = totalCliques > 0 ? (totalCompras / totalCliques) * 100 : 0;
  
  return {
    totalInvestido,
    totalCompras,
    totalReceita,
    roas,
    custoMedioCompra,
    totalAlcance,
    totalImpressoes,
    frequenciaMedia,
    cpcMedio,
    cpmMedio,
    ctrMedio,
    taxaConversao,
    totalCliques,
  };
};

export const groupByField = <T extends Record<string, any>>(
  data: T[],
  field: keyof T
): Record<string, T[]> => {
  return data.reduce((acc, item) => {
    const key = String(item[field]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

export const calculateMetricsByGroup = (
  data: MetaAdsData[],
  groupField: keyof MetaAdsData
): Array<{ name: string; metrics: MetaAdsMetrics }> => {
  const grouped = groupByField(data, groupField);
  
  return Object.entries(grouped).map(([name, items]) => ({
    name,
    metrics: calculateMetaAdsMetrics(items),
  }));
};
