import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PartnershipData } from '@/types/partnership';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PartnershipTableProps {
  data: PartnershipData[];
}

export const PartnershipTable = ({ data }: PartnershipTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short',
      day: '2-digit', 
      month: 'short' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Dados Diários</CardTitle>
        <CardDescription>Detalhamento completo de faturamento e lucros</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Data</TableHead>
                <TableHead className="text-right">Fat. Jhon</TableHead>
                <TableHead className="text-right">Fat. JR</TableHead>
                <TableHead className="text-right">Fat. Total</TableHead>
                <TableHead className="text-right">Gasto Tráfego</TableHead>
                <TableHead className="text-right">Lucro Líq. Total</TableHead>
                <TableHead className="text-right">Retorno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{formatDate(row.data)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.fatJhon)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.fatJr)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(row.fatTotal)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(row.gastoTrafego)}</TableCell>
                  <TableCell className={`text-right font-semibold ${row.lucroLiquidoTotal >= 0 ? 'text-success' : 'text-destructive'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {row.lucroLiquidoTotal >= 0 ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {formatCurrency(row.lucroLiquidoTotal)}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${row.retornoPercentual >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {row.retornoPercentual.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
