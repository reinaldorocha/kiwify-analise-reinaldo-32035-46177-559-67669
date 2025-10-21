export interface PartnershipData {
  data: Date;
  fatJhon: number;
  fatJr: number;
  fatTotal: number;
  gastoTrafego: number;
  lucroLiqJhon: number;
  lucroLiqJr: number;
  lucroLiquidoTotal: number;
  retornoPercentual: number;
}

export interface PartnershipMetrics {
  fatTotalGeral: number;
  fatJhonTotal: number;
  fatJrTotal: number;
  gastoTrafegoTotal: number;
  lucroLiquidoTotal: number;
  lucroJhonTotal: number;
  lucroJrTotal: number;
  retornoMedio: number;
  diasPositivos: number;
  diasNegativos: number;
  melhorDia: { data: Date; valor: number };
  piorDia: { data: Date; valor: number };
}
