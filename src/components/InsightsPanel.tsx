import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: string[];
}

export const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  return (
    <Card className="border-accent/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          <CardTitle>Insights Automáticos</CardTitle>
        </div>
        <CardDescription>Análises e recomendações baseadas nos dados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-accent/10 border border-accent/20"
            >
              <p className="text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
