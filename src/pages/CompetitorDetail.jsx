import { db } from "@/lib/db";

import React from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { checkAndUpdatePrice } from '@/lib/priceService';
import { toast } from 'sonner';

const currencySymbol = { BRL: 'R$', USD: '$', EUR: '€' };

export default function CompetitorDetail() {
  const { id } = useParams();
  const [checking, setChecking] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => db.entities.Competitor.list('-updated_date', 100),
  });

  const competitor = competitors.find(c => c.id === id);

  const { data: records = [] } = useQuery({
    queryKey: ['price-records', id],
    queryFn: () => db.entities.PriceRecord.filter({ competitor_id: id }, '-created_date', 100),
    enabled: !!id,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', id],
    queryFn: () => db.entities.Alert.filter({ competitor_id: id }, '-created_date', 20),
    enabled: !!id,
  });

  const handleCheck = async () => {
    if (!competitor) return;
    setChecking(true);
    toast.info('Verificando preço...');
    const result = await checkAndUpdatePrice(competitor);
    if (result.success) {
      toast.success(`Preço atualizado: ${currencySymbol[competitor.currency] || 'R$'}${result.price.toFixed(2)}`);
    } else {
      toast.error('Erro ao verificar preço');
    }
    setChecking(false);
    queryClient.invalidateQueries({ queryKey: ['competitors'] });
    queryClient.invalidateQueries({ queryKey: ['price-records', id] });
    queryClient.invalidateQueries({ queryKey: ['alerts', id] });
  };

  if (!competitor) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Concorrente não encontrado</p>
        <Link to="/competitors"><Button variant="outline" className="mt-4">Voltar</Button></Link>
      </div>
    );
  }

  const symbol = currencySymbol[competitor.currency] || 'R$';
  const chartData = records.map(r => ({
    date: format(new Date(r.created_date), 'dd/MM HH:mm'),
    price: r.price
  })).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/competitors">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{competitor.name}</h1>
          <p className="text-muted-foreground text-sm">{competitor.product_name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open(competitor.url, '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" /> Abrir URL
        </Button>
        <Button size="sm" onClick={handleCheck} disabled={checking}>
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          Verificar Preço
        </Button>
      </div>

      {/* Price Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Preço Atual</p>
          <p className="text-3xl font-bold mt-1">
            {competitor.current_price ? `${symbol}${competitor.current_price.toFixed(2)}` : '—'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Preço Anterior</p>
          <p className="text-3xl font-bold mt-1">
            {competitor.previous_price ? `${symbol}${competitor.previous_price.toFixed(2)}` : '—'}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Variação</p>
          <div className="flex items-center gap-2 mt-1">
            {competitor.price_change_percent != null && competitor.price_change_percent !== 0 ? (
              <>
                {competitor.price_change_percent < 0 ? (
                  <TrendingDown className="w-6 h-6 text-accent" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-destructive" />
                )}
                <span className={`text-3xl font-bold ${competitor.price_change_percent < 0 ? 'text-accent' : 'text-destructive'}`}>
                  {competitor.price_change_percent > 0 ? '+' : ''}{competitor.price_change_percent.toFixed(1)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">—</span>
            )}
          </div>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Histórico de Preços</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="price" stroke="hsl(245, 58%, 51%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Nenhum registro de preço ainda. Clique em "Verificar Preço" para começar.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts for this competitor */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Alertas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {alert.type === 'price_drop' ? (
                  <TrendingDown className="w-4 h-4 text-accent flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0" />
                )}
                <p className="text-sm flex-1">{alert.message}</p>
                <span className="text-xs text-muted-foreground">{format(new Date(alert.created_date), 'dd/MM HH:mm')}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}