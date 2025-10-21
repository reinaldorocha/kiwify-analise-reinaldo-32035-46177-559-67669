import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AffiliatePerformance } from '@/types/sales';
import { Badge } from '@/components/ui/badge';

interface AffiliateTableProps {
  data: AffiliatePerformance[];
}

export const AffiliateTable = ({ data }: AffiliateTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const totalReceita = data.reduce((sum, a) => sum + a.receita, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance de Afiliados</CardTitle>
        <CardDescription>Ranking dos afiliados por receita gerada</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Afiliado</TableHead>
              <TableHead className="text-right">Vendas</TableHead>
              <TableHead className="text-right">Receita Total</TableHead>
              <TableHead className="text-right">Comissão Paga</TableHead>
              <TableHead className="text-right">% da Receita</TableHead>
              <TableHead className="text-right">Ticket Médio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((affiliate, index) => {
              const ticketMedio = affiliate.vendas > 0 ? affiliate.receita / affiliate.vendas : 0;
              const percentReceita = totalReceita > 0 ? (affiliate.receita / totalReceita) * 100 : 0;
              
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {affiliate.nome}
                    {index < 3 && (
                      <Badge variant="secondary" className="ml-2">
                        Top {index + 1}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{affiliate.vendas}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(affiliate.receita)}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {formatCurrency(affiliate.comissao)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercent(percentReceita)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(ticketMedio)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
