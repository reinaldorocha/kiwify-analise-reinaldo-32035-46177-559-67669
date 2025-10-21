import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { BuyerPerformance } from '@/types/sales';
import { Search, ArrowUpDown, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface BuyerTableProps {
  data: BuyerPerformance[];
}

type SortField = 'nome' | 'totalCompras' | 'receitaTotal' | 'receitaLiquidaTotal' | 'ultimaCompra';
type SortOrder = 'asc' | 'desc';

export const BuyerTable = ({ data }: BuyerTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('receitaTotal');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPhoneForExport = (phone: string): string => {
    if (!phone) return '';
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    // Se não começar com 55, adiciona
    if (!cleaned.startsWith('55')) {
      return '55' + cleaned;
    }
    return cleaned;
  };

  const exportToCSV = () => {
    try {
      // Cabeçalho
      const headers = ['Primeiro nome', 'Sobrenome', 'Telefone', 'Etiquetas'];
      const csvContent = [headers.join('\t')];
      
      // Dados
      filteredAndSortedData.forEach(buyer => {
        const row = [
          buyer.primeiroNome,
          buyer.sobrenome,
          formatPhoneForExport(buyer.telefone || ''),
          '' // Etiquetas vazias conforme solicitado
        ];
        csvContent.push(row.join('\t'));
      });
      
      // Criar e baixar arquivo
      const blob = new Blob([csvContent.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `compradores_${format(new Date(), 'yyyy-MM-dd')}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Lista de compradores exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar lista de compradores');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(buyer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        buyer.nome.toLowerCase().includes(searchLower) ||
        buyer.email.toLowerCase().includes(searchLower) ||
        (buyer.telefone && buyer.telefone.toLowerCase().includes(searchLower)) ||
        buyer.produtos.some(p => p.toLowerCase().includes(searchLower))
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'totalCompras':
          comparison = a.totalCompras - b.totalCompras;
          break;
        case 'receitaTotal':
          comparison = a.receitaTotal - b.receitaTotal;
          break;
        case 'receitaLiquidaTotal':
          comparison = a.receitaLiquidaTotal - b.receitaLiquidaTotal;
          break;
        case 'ultimaCompra':
          comparison = a.ultimaCompra.getTime() - b.ultimaCompra.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  // Reset to page 1 when changing items per page
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers to display (show only a few pages around current)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range if near boundaries
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, maxVisible - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 2);
      }
      
      if (start > 2) pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) pages.push('...');
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown 
      className={`h-4 w-4 inline ml-1 ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} 
    />
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compradores</CardTitle>
            <CardDescription>
              Lista de todos os compradores com seus produtos e valores
            </CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Planilha
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, telefone ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} compradores
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('nome')}
                >
                  Comprador <SortIcon field="nome" />
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('totalCompras')}
                >
                  Compras <SortIcon field="totalCompras" />
                </TableHead>
                <TableHead>Produtos (Etiquetas)</TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('receitaTotal')}
                >
                  Receita Bruta <SortIcon field="receitaTotal" />
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('receitaLiquidaTotal')}
                >
                  Receita Líquida Total <SortIcon field="receitaLiquidaTotal" />
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('ultimaCompra')}
                >
                  Última Compra <SortIcon field="ultimaCompra" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((buyer, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {buyer.nome}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {buyer.email}
                  </TableCell>
                  <TableCell className="text-sm">
                    {buyer.telefone ? formatPhoneForExport(buyer.telefone) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{buyer.totalCompras}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {buyer.produtos.map((produto, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {produto.length > 30 ? produto.substring(0, 30) + '...' : produto}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(buyer.receitaTotal)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    {formatCurrency(buyer.receitaLiquidaTotal)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {format(buyer.ultimaCompra, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, idx) => (
                  <PaginationItem key={idx}>
                    {page === '...' ? (
                      <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
