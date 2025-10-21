import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ProductPerformance } from '@/types/sales';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductTableProps {
  data: ProductPerformance[];
}

type SortField = keyof ProductPerformance;
type SortDirection = 'asc' | 'desc' | null;

export const ProductTable = ({ data }: ProductTableProps) => {
  const [sortField, setSortField] = useState<SortField>('receitaLiquidaMinha');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [columnWidths, setColumnWidths] = useState({
    produto: 300,
    vendas: 100,
    receita: 150,
    receitaLiquidaTotal: 180,
    receitaLiquidaMinha: 180,
    ticketMedio: 130,
    reembolsos: 120,
  });
  const resizingRef = useRef<{
    column: keyof typeof columnWidths;
    startX: number;
    startWidth: number;
  } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') setSortDirection('asc');
      else if (sortDirection === 'asc') setSortDirection(null);
      else setSortDirection('desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4 ml-1" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4 ml-1" />;
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(product =>
      product.produto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortDirection && sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        return sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const handleResizeStart = (column: keyof typeof columnWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    resizingRef.current = {
      column,
      startX: e.clientX,
      startWidth: columnWidths[column]
    };
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const resizing = resizingRef.current;
      if (!resizing) return;
      
      const delta = moveEvent.clientX - resizing.startX;
      const newWidth = Math.max(80, resizing.startWidth + delta);
      
      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth
      }));
    };

    const handleMouseUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance por Produto</CardTitle>
        <CardDescription>Ranking dos produtos mais lucrativos</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: columnWidths.produto, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('produto')}
                    className="h-auto p-0 hover:bg-transparent font-medium"
                  >
                    Produto
                    {getSortIcon('produto')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('produto', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.vendas, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('vendas')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Vendas
                    {getSortIcon('vendas')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('vendas', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.receita, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('receita')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Receita Bruta
                    {getSortIcon('receita')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('receita', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.receitaLiquidaTotal, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('receitaLiquidaTotal')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Receita Líquida Total
                    {getSortIcon('receitaLiquidaTotal')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('receitaLiquidaTotal', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.receitaLiquidaMinha, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('receitaLiquidaMinha')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Minha Receita Líquida
                    {getSortIcon('receitaLiquidaMinha')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('receitaLiquidaMinha', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.ticketMedio, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('ticketMedio')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Ticket Médio
                    {getSortIcon('ticketMedio')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('ticketMedio', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="text-right" style={{ width: columnWidths.reembolsos, position: 'relative' }}>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('reembolsos')}
                    className="h-auto p-0 hover:bg-transparent font-medium ml-auto flex items-center"
                  >
                    Reembolsos
                    {getSortIcon('reembolsos')}
                  </Button>
                  <div
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize hover:bg-primary/20 group z-10 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart('reembolsos', e);
                    }}
                  >
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((product, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium" style={{ width: columnWidths.produto }}>
                    <div className="truncate" title={product.produto}>
                      {product.produto}
                    </div>
                  </TableCell>
                  <TableCell className="text-right" style={{ width: columnWidths.vendas }}>
                    {product.vendas}
                  </TableCell>
                  <TableCell className="text-right font-semibold" style={{ width: columnWidths.receita }}>
                    {formatCurrency(product.receita)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success" style={{ width: columnWidths.receitaLiquidaTotal }}>
                    {formatCurrency(product.receitaLiquidaTotal)}
                  </TableCell>
                  <TableCell className="text-right text-primary" style={{ width: columnWidths.receitaLiquidaMinha }}>
                    {formatCurrency(product.receitaLiquidaMinha)}
                  </TableCell>
                  <TableCell className="text-right" style={{ width: columnWidths.ticketMedio }}>
                    {formatCurrency(product.ticketMedio)}
                  </TableCell>
                  <TableCell className="text-right" style={{ width: columnWidths.reembolsos }}>
                    {product.reembolsos > 0 ? (
                      <span className="text-destructive">{product.reembolsos}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
