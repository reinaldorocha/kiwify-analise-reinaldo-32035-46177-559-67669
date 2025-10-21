export interface MetaAdsData {
  nomeConta: string;
  nomeCampanha: string;
  nomeConjuntoAnuncios: string;
  nomeAnuncio: string;
  anuncios: string;
  idade: string;
  genero: string;
  dia: Date;
  idConta: string;
  idCampanha: string;
  idConjuntoAnuncios: string;
  idAnuncio: string;
  alcance: number;
  impressoes: number;
  frequencia: number;
  moeda: string;
  valorUsado: number;
  compras: number;
  custoPorCompra: number;
  valorConversaoCompra: number;
  cliquesLink: number;
  cpcLink: number;
  cliquesTodos: number;
  cpcTodos: number;
  cpm: number;
  ctrTodos: number;
  visualizacoes: number;
  taxaComprasPorVisualizacoes: number;
  custoPor1000Contas: number;
  veiculacaoAnuncio: string;
  veiculacaoConjuntoAnuncios: string;
  veiculacaoCampanha: string;
  inicioRelatorios: Date;
  terminoRelatorios: Date;
}

export interface MetaAdsMetrics {
  totalInvestido: number;
  totalCompras: number;
  totalReceita: number;
  roas: number;
  custoMedioCompra: number;
  totalAlcance: number;
  totalImpressoes: number;
  frequenciaMedia: number;
  cpcMedio: number;
  cpmMedio: number;
  ctrMedio: number;
  taxaConversao: number;
  totalCliques: number;
}
