import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SalesData } from '@/types/sales';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

const STATUS_LABELS: Record<string, string> = {
  paid: 'Pago',
  waiting_payment: 'Aguardando Pagamento',
  refused: 'Recusado',
  refunded: 'Reembolsado',
  chargedback: 'Estornado',
  canceled: 'Cancelado',
  waiting: 'Aguardando',
  pending: 'Pendente',
};

interface FilterPanelProps {
  data: SalesData[];
  filters: {
    startDate?: Date;
    endDate?: Date;
    products?: string[];
    statuses?: string[];
    affiliates?: string[];
    coproducers?: string[];
    paymentMethods?: string[];
  };
  onFilterChange: (filters: any) => void;
}

export const FilterPanel = ({ data, filters, onFilterChange }: FilterPanelProps) => {
  const products = Array.from(new Set(data.map(s => s.produto))).filter(Boolean);
  const statuses = Array.from(new Set(data.map(s => s.status))).filter(Boolean);
  const affiliates = Array.from(new Set(data.map(s => s.nomeAfiliado).filter(Boolean)));
  const coproducers = Array.from(new Set(
    data.flatMap(s => 
      s.nomesCoprodutores 
        ? s.nomesCoprodutores.split(';').map(name => name.trim())
        : []
    ).filter(Boolean)
  ));
  const paymentMethods = Array.from(new Set(data.map(s => s.pagamento).filter(Boolean)));

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'startDate' || key === 'endDate') return value !== undefined;
    return Array.isArray(value) && value.length > 0;
  });

  const clearFilters = () => {
    onFilterChange({});
  };

  const toggleArrayFilter = (filterKey: string, value: string) => {
    const currentValues = (filters[filterKey as keyof typeof filters] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ ...filters, [filterKey]: newValues.length > 0 ? newValues : undefined });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filtros</CardTitle>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => onFilterChange({ ...filters, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => onFilterChange({ ...filters, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Product Filter */}
          <div className="space-y-2">
            <Label>Produtos ({filters.products?.length || 0} selecionados)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {filters.products && filters.products.length > 0
                    ? `${filters.products.length} produto(s)`
                    : 'Todos os produtos'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="start">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product} className="flex items-start space-x-2">
                      <Checkbox
                        id={`product-${product}`}
                        checked={filters.products?.includes(product)}
                        onCheckedChange={() => toggleArrayFilter('products', product)}
                      />
                      <label
                        htmlFor={`product-${product}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {product}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status ({filters.statuses?.length || 0} selecionados)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {filters.statuses && filters.statuses.length > 0
                    ? `${filters.statuses.length} status`
                    : 'Todos os status'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="start">
                <div className="space-y-2">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.statuses?.includes(status)}
                        onCheckedChange={() => toggleArrayFilter('statuses', status)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {STATUS_LABELS[status] || status}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Affiliate Filter */}
          {affiliates.length > 0 && (
            <div className="space-y-2">
              <Label>Afiliados ({filters.affiliates?.length || 0} selecionados)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {filters.affiliates && filters.affiliates.length > 0
                      ? `${filters.affiliates.length} afiliado(s)`
                      : 'Todos os afiliados'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-card" align="start">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {affiliates.map((affiliate) => (
                      <div key={affiliate} className="flex items-center space-x-2">
                        <Checkbox
                          id={`affiliate-${affiliate}`}
                          checked={filters.affiliates?.includes(affiliate)}
                          onCheckedChange={() => toggleArrayFilter('affiliates', affiliate)}
                        />
                        <label
                          htmlFor={`affiliate-${affiliate}`}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {affiliate}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Coproducer Filter */}
          {coproducers.length > 0 && (
            <div className="space-y-2">
              <Label>Coprodutores ({filters.coproducers?.length || 0} selecionados)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {filters.coproducers && filters.coproducers.length > 0
                      ? `${filters.coproducers.length} coprodutor(es)`
                      : 'Todos os coprodutores'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-card" align="start">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {coproducers.map((coproducer) => (
                      <div key={coproducer} className="flex items-center space-x-2">
                        <Checkbox
                          id={`coproducer-${coproducer}`}
                          checked={filters.coproducers?.includes(coproducer)}
                          onCheckedChange={() => toggleArrayFilter('coproducers', coproducer)}
                        />
                        <label
                          htmlFor={`coproducer-${coproducer}`}
                          className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {coproducer}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <Label>Formas de Pagamento ({filters.paymentMethods?.length || 0} selecionadas)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {filters.paymentMethods && filters.paymentMethods.length > 0
                    ? `${filters.paymentMethods.length} forma(s)`
                    : 'Todas as formas'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-card" align="start">
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={`payment-${method}`}
                        checked={filters.paymentMethods?.includes(method)}
                        onCheckedChange={() => toggleArrayFilter('paymentMethods', method)}
                      />
                      <label
                        htmlFor={`payment-${method}`}
                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
