import { SalesData } from '@/types/sales';

export const parseCSV = (csvText: string): SalesData[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data: SalesData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Parse and normalize the data
    const sale: SalesData = {
      id: row['ID da venda'] || row['id'] || '',
      status: row['Status'] || row['status'] || '',
      produto: row['Produto'] || row['produto'] || '',
      cliente: row['Cliente'] || row['cliente'] || '',
      email: row['Email'] || row['email'] || '',
      telefone: row['Celular'] || row['Telefone'] || row['telefone'] || row['Telefone do Cliente'] || row['Phone'] || row['phone'] || '',
      valorLiquido: parseFloat(row['Valor líquido']?.replace(',', '.') || '0'),
      precoBase: parseFloat(row['Preço base do produto']?.replace(',', '.') || '0'),
      totalComAcrescimo: parseFloat(row['Total com acréscimo']?.replace(',', '.') || '0'),
      taxas: parseFloat(row['Taxas']?.replace(',', '.') || '0'),
      dataCriacao: parseDate(row['Data de Criação'] || row['data'] || ''),
      dataAtualizacao: parseDate(row['Data de Atualização'] || ''),
      nomeAfiliado: row['Nome do afiliado'] || '',
      comissaoAfiliado: parseFloat(row['Comissão do afiliado']?.replace(',', '.') || '0'),
      nomesCoprodutores: row['Nomes dos coprodutores'] || '',
      comissoesCoprodutores: row['Comissões dos coprodutores'] || '',
      pagamento: row['Pagamento'] || row['pagamento'] || '',
      parcelas: parseInt(row['Parcelas'] || '1'),
      tracking_source: row['Tracking utm_source'] || '',
      tracking_medium: row['Tracking utm_medium'] || '',
      tracking_campaign: row['Tracking utm_campaign'] || '',
    };
    
    data.push(sale);
  }
  
  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Try to parse DD/MM/YYYY HH:mm:ss format
  const parts = dateStr.split(' ');
  if (parts[0]) {
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const year = parseInt(dateParts[2]);
      
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        return new Date(year, month, day, 
          parseInt(timeParts[0] || '0'), 
          parseInt(timeParts[1] || '0'), 
          parseInt(timeParts[2] || '0')
        );
      }
      
      return new Date(year, month, day);
    }
  }
  
  return new Date(dateStr);
};
