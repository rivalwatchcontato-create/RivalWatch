import { db } from "@/lib/db";

import React from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingDown, TrendingUp, AlertTriangle, Brain, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const alertConfig = {
  price_drop: { icon: TrendingDown, color: 'text-accent', bg: 'bg-accent/10', label: 'Queda de Preço' },
  price_increase: { icon: TrendingUp, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Aumento de Preço' },
  product_unavailable: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Indisponível' },
  ai_insight: { icon: Brain, color: 'text-primary', bg: 'bg-primary/10', label: 'Insight IA' },
  new_competitor: { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Novo' },
};

const severityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive text-destructive-foreground',
};

export default function Alerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => db.entities.Alert.list('-created_date', 100),
  });

  const unread = alerts.filter(a => !a.is_read);
  const read = alerts.filter(a => a.is_read);

  const markAsRead = async (alert) => {
    await db.entities.Alert.update(alert.id, { is_read: true });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const markAllRead = async () => {
    for (const alert of unread) {
      await db.entities.Alert.update(alert.id, { is_read: true });
    }
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const AlertItem = ({ alert }) => {
    const config = alertConfig[alert.type] || alertConfig.price_increase;
    const Icon = config.icon;
    const symbol = 'R$';

    return (
      <div className={`p-4 rounded-xl border transition-all ${!alert.is_read ? 'bg-card shadow-sm' : 'bg-muted/30'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${config.bg} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge variant="outline" className={severityColors[alert.severity] || severityColors.medium}>
                    {alert.severity}
                  </Badge>
                  <Badge variant="outline">{config.label}</Badge>
                  {alert.change_percent && (
                    <span className={`text-xs font-semibold ${alert.change_percent < 0 ? 'text-accent' : 'text-destructive'}`}>
                      {alert.change_percent > 0 ? '+' : ''}{alert.change_percent.toFixed(1)}%
                    </span>
                  )}
                </div>
                {alert.old_price != null && alert.new_price != null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {symbol}{alert.old_price.toFixed(2)} → {symbol}{alert.new_price.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(alert.created_date), 'dd/MM HH:mm')}
                </span>
                {!alert.is_read && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(alert)}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground text-sm mt-1">{unread.length} não lidos de {alerts.length} total</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" /> Marcar todos como lidos
          </Button>
        )}
      </div>

      <Tabs defaultValue="unread">
        <TabsList>
          <TabsTrigger value="unread">Não Lidos ({unread.length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({alerts.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="unread" className="space-y-3 mt-4">
          {unread.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground mt-4">Nenhum alerta não lido</p>
            </div>
          ) : (
            unread.map(a => <AlertItem key={a.id} alert={a} />)
          )}
        </TabsContent>
        <TabsContent value="all" className="space-y-3 mt-4">
          {alerts.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground mt-4">Nenhum alerta ainda. Adicione concorrentes e verifique preços.</p>
            </div>
          ) : (
            alerts.map(a => <AlertItem key={a.id} alert={a} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}