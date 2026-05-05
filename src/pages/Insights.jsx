import { db } from "@/lib/db";

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, BarChart3, Users, Loader2, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateInsight } from '@/lib/priceService';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';

const typeConfig = {
  market_overview: { icon: BarChart3, label: 'Visão de Mercado', color: 'bg-primary/10 text-primary' },
  trend_analysis: { icon: TrendingUp, label: 'Análise de Tendência', color: 'bg-accent/10 text-accent' },
  price_suggestion: { icon: Sparkles, label: 'Sugestão de Preço', color: 'bg-amber-500/10 text-amber-600' },
  competitor_summary: { icon: Users, label: 'Resumo de Concorrentes', color: 'bg-blue-500/10 text-blue-500' },
};

export default function Insights() {
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('market_overview');
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: insights = [] } = useQuery({
    queryKey: ['insights'],
    queryFn: () => db.entities.AIInsight.list('-created_date', 50),
  });

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => db.entities.Competitor.list('-updated_date', 100),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['price-records'],
    queryFn: () => db.entities.PriceRecord.list('-created_date', 200),
  });

  const handleGenerate = async () => {
    if (!competitors.length) {
      toast.error('Adicione concorrentes antes de gerar insights');
      return;
    }
    setGenerating(true);
    toast.info('Gerando insight com IA... Isso pode levar alguns segundos.');
    await generateInsight(competitors, records, selectedType);
    toast.success('Insight gerado!');
    setGenerating(false);
    queryClient.invalidateQueries({ queryKey: ['insights'] });
  };

  const handleDelete = async (id) => {
    await db.entities.AIInsight.delete(id);
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    toast.success('Insight removido');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights com IA</h1>
          <p className="text-muted-foreground text-sm mt-1">Análises inteligentes — powered by RivalWatch AI</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="market_overview">Visão de Mercado</SelectItem>
              <SelectItem value="trend_analysis">Análise de Tendência</SelectItem>
              <SelectItem value="price_suggestion">Sugestão de Preço</SelectItem>
              <SelectItem value="competitor_summary">Resumo de Concorrentes</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
            Gerar Insight
          </Button>
        </div>
      </div>

      {/* Insights List */}
      {insights.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-16 h-16 text-muted-foreground/20 mx-auto" />
          <h3 className="text-lg font-semibold mt-4">Nenhum insight gerado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Adicione concorrentes, verifique preços e gere insights com inteligência artificial.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map(insight => {
            const config = typeConfig[insight.type] || typeConfig.market_overview;
            const Icon = config.icon;
            const isExpanded = expandedId === insight.id;

            return (
              <Card key={insight.id} className="overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${config.color} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{insight.summary}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {insight.confidence_score && (
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence_score}% confiança
                            </Badge>
                          )}
                          <Badge variant="outline" className={config.color}>{config.label}</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(insight.created_date), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-5 pb-5 border-t pt-4">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{insight.content}</ReactMarkdown>
                    </div>
                    {insight.recommendations?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Recomendações:</h4>
                        {insight.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(insight.id); }}>
                        <Trash2 className="w-4 h-4 mr-1" /> Remover
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}