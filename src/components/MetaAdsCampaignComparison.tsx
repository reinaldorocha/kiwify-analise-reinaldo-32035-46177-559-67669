import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaAdsData } from "@/types/metaAds";
import { calculateMetricsByGroup } from "@/utils/metaAdsCalculations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetaAdsCampaignComparisonProps {
  data: MetaAdsData[];
}

type SortField = 'name' | 'investido' | 'receita' | 'roas' | 'compras' | 'cpa';
type SortDirection = 'asc' | 'desc';

export const MetaAdsCampaignComparison = ({ data }: MetaAdsCampaignComparisonProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('investido');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const campaignMetrics = useMemo(() => {
    const grouped = calculateMetricsByGroup(data, 'nomeCampanha');
    // Add campaign type to each campaign
    return grouped.map(item => {
      const campaignData = data.find(d => d.nomeCampanha === item.name);
      return {
        ...item,
        tipo: campaignData?.veiculacaoCampanha || 'N/A'
      };
    });
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter and sort campaigns
  const processedData = useMemo(() => {
    let filtered = campaignMetrics;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'investido':
          aValue = a.metrics.totalInvestido;
          bValue = b.metrics.totalInvestido;
          break;
        case 'receita':
          aValue = a.metrics.totalReceita;
          bValue = b.metrics.totalReceita;
          break;
        case 'roas':
          aValue = a.metrics.roas;
          bValue = b.metrics.roas;
          break;
        case 'compras':
          aValue = a.metrics.totalCompras;
          bValue = b.metrics.totalCompras;
          break;
        case 'cpa':
          aValue = a.metrics.custoMedioCompra;
          bValue = b.metrics.custoMedioCompra;
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [campaignMetrics, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 inline ml-1" /> : 
      <ChevronDown className="h-4 w-4 inline ml-1" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Campanhas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas... (ex: combo, simulados, PCPI)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Badge variant="secondary">
                {processedData.length} campanha{processedData.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('name')}>
                      Campanha
                      <SortIcon field="name" />
                    </Button>
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('investido')}>
                      Investido
                      <SortIcon field="investido" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('receita')}>
                      Receita
                      <SortIcon field="receita" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('roas')}>
                      ROAS
                      <SortIcon field="roas" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('compras')}>
                      Compras
                      <SortIcon field="compras" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('cpa')}>
                      CPA
                      <SortIcon field="cpa" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Taxa Conv.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Nenhuma campanha encontrada' : 'Nenhum dado disponível'}
                    </TableCell>
                  </TableRow>
                ) : (
                  processedData.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="truncate" title={item.name}>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {item.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.metrics.totalInvestido)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.metrics.totalReceita)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          item.metrics.roas >= 3 ? "default" : 
                          item.metrics.roas >= 2 ? "secondary" : 
                          "destructive"
                        }>
                          {item.metrics.roas.toFixed(2)}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.metrics.totalCompras}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.metrics.custoMedioCompra)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.metrics.ctrMedio.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {item.metrics.taxaConversao.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
