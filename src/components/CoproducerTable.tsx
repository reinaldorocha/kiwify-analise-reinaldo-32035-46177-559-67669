import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CoproducerPerformance } from '@/types/sales';

interface CoproducerTableProps {
  data: CoproducerPerformance[];
}

export const CoproducerTable = ({ data }: CoproducerTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Coprodução</CardTitle>
          <CardDescription>Nenhum coprodutor identificado nos dados</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalComissao = data.reduce((sum, c) => sum + c.comissao, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Coprodução</CardTitle>
        <CardDescription>
          Total de comissões pagas: {formatCurrency(totalComissao)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coprodutor</TableHead>
              <TableHead className="text-right">Vendas</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
              <TableHead className="text-right">Participação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((coproducer, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{coproducer.nome}</TableCell>
                <TableCell className="text-right">{coproducer.vendas}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {formatCurrency(coproducer.comissao)}
                </TableCell>
                <TableCell className="text-right">
                  {coproducer.participacao.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
