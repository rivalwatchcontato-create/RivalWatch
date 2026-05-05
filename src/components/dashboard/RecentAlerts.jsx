import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, AlertTriangle, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const alertConfig = {
  price_drop: { icon: TrendingDown, color: 'text-accent', bg: 'bg-accent/10', label: 'Queda' },
  price_increase: { icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Aumento' },
  product_unavailable: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Indisponível' },
  ai_insight: { icon: Brain, color: 'text-primary', bg: 'bg-primary/10', label: 'Insight' },
  new_competitor: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Novo' },
};

export default function RecentAlerts({ alerts }) {
  if (!alerts?.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Alertas Recentes</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum alerta ainda</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Alertas Recentes</CardTitle>
        <Link to="/alerts" className="text-xs text-primary hover:underline font-medium">Ver todos</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 5).map(alert => {
          const config = alertConfig[alert.type] || alertConfig.price_increase;
          const Icon = config.icon;
          return (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-lg ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {alert.competitor_name || 'Sistema'} · {format(new Date(alert.created_date), 'dd/MM HH:mm')}
                </p>
              </div>
              {alert.change_percent && (
                <Badge variant="outline" className={`text-xs ${alert.type === 'price_drop' ? 'text-accent border-accent/30' : 'text-destructive border-destructive/30'}`}>
                  {alert.change_percent > 0 ? '+' : ''}{alert.change_percent.toFixed(1)}%
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}