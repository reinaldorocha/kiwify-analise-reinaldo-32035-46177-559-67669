import { MetaAdsData } from '@/types/metaAds';

export const parseMetaAdsCSV = (csvText: string): MetaAdsData[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const data: MetaAdsData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    
    // Skip summary rows (where all key fields are empty)
    if (!values[0] && !values[1] && !values[2] && !values[3]) continue;
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    const metaAd: MetaAdsData = {
      nomeConta: row['Nome da conta'] || '',
      nomeCampanha: row['Nome da campanha'] || '',
      nomeConjuntoAnuncios: row['Nome do conjunto de anúncios'] || '',
      nomeAnuncio: row['Nome do anúncio'] || '',
      anuncios: row['Anúncios'] || '',
      idade: row['Idade'] || '',
      genero: row['Gênero'] || row['Genero'] || '',
      dia: parseDate(row['Dia'] || ''),
      idConta: row['Identificação da conta'] || '',
      idCampanha: row['Identificação da campanha'] || '',
      idConjuntoAnuncios: row['Identificação do conjunto de anúncios'] || '',
      idAnuncio: row['Identificação do anúncio'] || '',
      alcance: parseInt(row['Alcance'] || '0'),
      impressoes: parseInt(row['Impressões'] || row['Impressoes'] || '0'),
      frequencia: parseFloat(row['Frequência'] || row['Frequencia'] || '0'),
      moeda: row['Moeda'] || 'BRL',
      valorUsado: parseFloat(row['Valor usado (BRL)'] || '0'),
      compras: parseInt(row['Compras'] || '0'),
      custoPorCompra: parseFloat(row['Custo por compra'] || '0'),
      valorConversaoCompra: parseFloat(row['Valor de conversão da compra'] || row['Valor de conversao da compra'] || '0'),
      cliquesLink: parseInt(row['Cliques no link'] || '0'),
      cpcLink: parseFloat(row['CPC (custo por clique no link)'] || '0'),
      cliquesTodos: parseInt(row['Cliques (todos)'] || '0'),
      cpcTodos: parseFloat(row['CPC (todos)'] || '0'),
      cpm: parseFloat(row['CPM (custo por 1.000 impressões)'] || row['CPM (custo por 1.000 impressoes)'] || '0'),
      ctrTodos: parseFloat(row['CTR (todos)'] || '0'),
      visualizacoes: parseInt(row['Visualizações'] || row['Visualizacoes'] || '0'),
      taxaComprasPorVisualizacoes: parseFloat(row['Taxa de compras por visualizações da página de destino'] || row['Taxa de compras por visualizacoes da pagina de destino'] || '0'),
      custoPor1000Contas: parseFloat(row['Custo por 1.000 contas da Central de Contas alcançadas'] || row['Custo por 1.000 contas da Central de Contas alcancadas'] || '0'),
      veiculacaoAnuncio: row['Veiculação do anúncio'] || row['Veiculacao do anuncio'] || '',
      veiculacaoConjuntoAnuncios: row['Veiculação do conjunto de anúncios'] || row['Veiculacao do conjunto de anuncios'] || '',
      veiculacaoCampanha: row['Veiculação da campanha'] || row['Veiculacao da campanha'] || '',
      inicioRelatorios: parseDate(row['Início dos relatórios'] || row['Inicio dos relatorios'] || ''),
      terminoRelatorios: parseDate(row['Término dos relatórios'] || row['Termino dos relatorios'] || ''),
    };
    
    data.push(metaAd);
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
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // Try to parse YYYY-MM-DD format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
};
