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

interface MetaAdsTableProps {
  data: MetaAdsData[];
}

export const MetaAdsTable = ({ data }: MetaAdsTableProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
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
          {data.map((row, index) => {
            const roas = row.valorUsado > 0 ? row.valorConversaoCompra / row.valorUsado : 0;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.nomeCampanha}</TableCell>
                <TableCell>{row.nomeConjuntoAnuncios}</TableCell>
                <TableCell>{row.nomeAnuncio}</TableCell>
                <TableCell>{row.idade}</TableCell>
                <TableCell>{row.genero}</TableCell>
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
          })}
        </TableBody>
      </Table>
    </div>
  );
};
