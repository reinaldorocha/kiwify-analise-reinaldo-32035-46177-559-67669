import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaAdsData } from "@/types/metaAds";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface MetaAdsTablePaginatedProps {
  data: MetaAdsData[];
}

export const MetaAdsTablePaginated = ({ data }: MetaAdsTablePaginatedProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage] = useState(20);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    const searchLower = searchTerm.toLowerCase();
    return data.filter(row => 
      row.nomeCampanha?.toLowerCase().includes(searchLower) ||
      row.nomeConjuntoAnuncios?.toLowerCase().includes(searchLower) ||
      row.nomeAnuncio?.toLowerCase().includes(searchLower) ||
      row.nomeConta?.toLowerCase().includes(searchLower)
    );
  }, [data, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por campanha, conjunto de anúncios, anúncio ou conta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchTerm && (
          <Badge variant="secondary">
            {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Conjunto de Anúncios</TableHead>
              <TableHead>Anúncio</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Gênero</TableHead>
              <TableHead className="text-right">Investido</TableHead>
              <TableHead className="text-right">Compras</TableHead>
              <TableHead className="text-right">Receita</TableHead>
              <TableHead className="text-right">ROAS</TableHead>
              <TableHead className="text-right">CPA</TableHead>
              <TableHead className="text-right">Alcance</TableHead>
              <TableHead className="text-right">Impressões</TableHead>
              <TableHead className="text-right">Cliques</TableHead>
              <TableHead className="text-right">CTR %</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                const roas = row.valorUsado > 0 ? row.valorConversaoCompra / row.valorUsado : 0;
                return (
                  <TableRow key={`${row.idAnuncio}-${index}`}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={row.nomeCampanha}>
                      {row.nomeCampanha}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate" title={row.nomeConjuntoAnuncios}>
                      {row.nomeConjuntoAnuncios}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={row.nomeAnuncio}>
                      {row.nomeAnuncio}
                    </TableCell>
                    <TableCell>{row.idade}</TableCell>
                    <TableCell>
                      {row.genero === 'male' ? 'M' : row.genero === 'female' ? 'F' : row.genero}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.valorUsado)}</TableCell>
                    <TableCell className="text-right">{row.compras}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.valorConversaoCompra)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={roas >= 3 ? "default" : roas >= 2 ? "secondary" : "destructive"}>
                        {formatNumber(roas, 2)}x
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.custoPorCompra)}</TableCell>
                    <TableCell className="text-right">{row.alcance.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">{row.impressoes.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right">{row.cliquesTodos}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.ctrTodos, 2)}%</TableCell>
                    <TableCell>
                      <Badge variant={row.veiculacaoCampanha === 'active' ? 'default' : 'outline'}>
                        {row.veiculacaoCampanha}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de {filteredData.length} registros
          </p>
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
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
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
    </div>
  );
};
