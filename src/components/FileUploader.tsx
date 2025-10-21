import { useCallback } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploaderProps {
  onFileLoad: (content: string) => void;
  compact?: boolean;
}

export const FileUploader = ({ onFileLoad, compact = false }: FileUploaderProps) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  if (compact) {
    return (
      <Button variant="outline" size="sm" asChild>
        <label className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Novo CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </Button>
    );
  }

  return (
    <Card className="border-dashed border-2 hover:border-primary transition-colors">
      <CardContent className="flex flex-col items-center justify-center p-12">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Envie seu arquivo CSV</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Arraste e solte ou clique para selecionar o arquivo CSV exportado da Kiwify
        </p>
        <Button asChild>
          <label className="cursor-pointer">
            Selecionar Arquivo
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </Button>
      </CardContent>
    </Card>
  );
};
