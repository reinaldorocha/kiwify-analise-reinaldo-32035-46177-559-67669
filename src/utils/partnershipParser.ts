import { PartnershipData } from '@/types/partnership';

const parseDate = (dateStr: string): Date => {
  // Parse dates like "terça-feira, setembro 23, 2025"
  const months: Record<string, number> = {
    janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
    julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
  };
  
  // Split by comma: ["terça-feira", " setembro 23", " 2025"]
  const parts = dateStr.split(',').map(p => p.trim());
  if (parts.length < 3) {
    console.warn('Formato de data inválido (menos de 3 partes):', dateStr, parts);
    return new Date();
  }
  
  // Split the middle part: "setembro 23" -> ["setembro", "23"]
  const dateParts = parts[1].split(' ').filter(p => p);
  if (dateParts.length < 2) {
    console.warn('Partes da data insuficientes:', dateStr, dateParts);
    return new Date();
  }
  
  const monthName = dateParts[0].toLowerCase();
  const month = months[monthName];
  const day = parseInt(dateParts[1]);
  const year = parseInt(parts[2]); // Year is in parts[2], not dateParts[2]!
  
  if (month === undefined || isNaN(day) || isNaN(year)) {
    console.warn('Valores de data inválidos:', { dateStr, monthName, day, year });
    return new Date();
  }
  
  const date = new Date(year, month, day);
  
  if (isNaN(date.getTime())) {
    console.warn('Data resultante inválida:', dateStr);
    return new Date();
  }
  
  console.log(`✅ Data parseada: ${dateStr} -> ${date.toLocaleDateString('pt-BR')}`);
  return date;
};

const parseCurrency = (value: string): number => {
  if (!value || value === '-') return 0;
  
  // Remove R$, espaços, pontos e troca vírgula por ponto
  let cleanValue = value.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.');
  
  // Handle negative values with dash before R$
  const isNegative = cleanValue.includes('-');
  cleanValue = cleanValue.replace('-', '');
  
  const number = parseFloat(cleanValue);
  return isNegative ? -number : number;
};

const parsePercentage = (value: string): number => {
  if (!value || value === '-' || value === '#DIV/0!') return 0;
  return parseFloat(value.replace('%', '').replace(',', '.'));
};

export const parsePartnershipData = (content: string): PartnershipData[] => {
  console.log('📊 Iniciando parse de dados de parceria...');
  console.log('Primeiras 500 chars:', content.substring(0, 500));
  
  const lines = content.trim().split('\n');
  console.log(`Total de linhas: ${lines.length}`);
  
  const dataRows: PartnershipData[] = [];
  
  // Process CSV data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma but handle quoted values
    const cells: string[] = [];
    let currentCell = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    
    if (cells.length < 9) continue;
    
    // Skip header and footer rows
    if (cells[0] === 'DATA' || cells[0] === 'RESULTADO' || cells[0] === '' || cells[0] === 'I' || cells[0].includes('TOTAL')) continue;
    
    try {
      const data = parseDate(cells[0]);
      const fatJhon = parseCurrency(cells[1]);
      const fatJr = parseCurrency(cells[2]);
      const fatTotal = parseCurrency(cells[3]);
      const gastoTrafego = parseCurrency(cells[4]);
      const lucroLiqJhon = parseCurrency(cells[5]);
      const lucroLiqJr = parseCurrency(cells[6]);
      const lucroLiquidoTotal = parseCurrency(cells[7]);
      const retornoPercentual = parsePercentage(cells[8]);
      
      // Skip rows with zero or invalid total
      if (fatTotal === 0 || isNaN(fatTotal)) {
        console.log(`Linha ${i} ignorada - fatTotal: ${fatTotal}`);
        continue;
      }
      
      console.log(`✅ Linha ${i} processada:`, { data, fatTotal });
      
      dataRows.push({
        data,
        fatJhon,
        fatJr,
        fatTotal,
        gastoTrafego,
        lucroLiqJhon,
        lucroLiqJr,
        lucroLiquidoTotal,
        retornoPercentual,
      });
    } catch (e) {
      console.warn(`❌ Erro ao processar linha ${i}:`, cells, e);
    }
  }
  
  console.log(`✅ Total de registros válidos: ${dataRows.length}`);
  return dataRows;
};
