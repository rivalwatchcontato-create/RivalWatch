import { db } from "@/lib/db";

import React, { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, TrendingDown, TrendingUp, Bell, RefreshCw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import PriceChart from '@/components/dashboard/PriceChart';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import OnboardingWidget from '@/components/dashboard/OnboardingWidget';
import { checkAllPrices } from '@/lib/priceService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [checkingAll, setCheckingAll] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => db.entities.Competitor.list('-updated_date', 100),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => db.entities.Alert.list('-created_date', 20),
  });

  const { data: records = [] } = useQuery({
    queryKey: ['price-records'],
    queryFn: () => db.entities.PriceRecord.list('-created_date', 200),
  });

  const activeCompetitors = competitors.filter(c => c.status === 'active');
  const priceDrops = competitors.filter(c => c.price_change_percent < 0);
  const priceIncreases = competitors.filter(c => c.price_change_percent > 0);
  const unreadAlerts = alerts.filter(a => !a.is_read);

  const handleCheckAll = async () => {
    if (!activeCompetitors.length) {
      toast.error('Nenhum concorrente ativo para verificar');
      return;
    }
    setCheckingAll(true);
    toast.info('Verificando preços de todos os concorrentes...');
    await checkAllPrices(activeCompetitors);
    toast.success('Verificação concluída!');
    setCheckingAll(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral do monitoramento de preços</p>
        </div>
        <div className="flex gap-3">
          <Link to="/insights">
            <Button variant="outline" size="sm">
              <Brain className="w-4 h-4 mr-2" /> Gerar Insight
            </Button>
          </Link>
          <Button size="sm" onClick={handleCheckAll} disabled={checkingAll}>
            <RefreshCw className={`w-4 h-4 mr-2 ${checkingAll ? 'animate-spin' : ''}`} />
            {checkingAll ? 'Verificando...' : 'Verificar Todos'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Concorrentes Ativos"
          value={activeCompetitors.length}
          subtitle={`${competitors.length} total`}
          icon={Users}
        />
        <StatsCard
          title="Preços em Queda"
          value={priceDrops.length}
          icon={TrendingDown}
          trend="down"
          trendValue={priceDrops.length > 0 ? `${priceDrops.length} produto(s)` : undefined}
        />
        <StatsCard
          title="Preços em Alta"
          value={priceIncreases.length}
          icon={TrendingUp}
          trend="up"
          trendValue={priceIncreases.length > 0 ? `${priceIncreases.length} produto(s)` : undefined}
        />
        <StatsCard
          title="Alertas Não Lidos"
          value={unreadAlerts.length}
          subtitle={`${alerts.length} total`}
          icon={Bell}
        />
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart records={records} competitors={competitors} />
        </div>
        <div>
          <RecentAlerts alerts={alerts} />
        </div>
      </div>

      {/* Quick Competitor Overview */}
      {competitors.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Concorrentes Recentes</h2>
            <Link to="/competitors" className="text-sm text-primary hover:underline font-medium">Ver todos →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {competitors.slice(0, 6).map(c => {
              const symbol = { BRL: 'R$', USD: '$', EUR: '€' }[c.currency] || 'R$';
              return (
                <Link key={c.id} to={`/competitors/${c.id}`} className="block">
                  <div className="p-4 rounded-xl bg-card border hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.product_name}</p>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold">
                        {c.current_price ? `${symbol}${c.current_price.toFixed(2)}` : '—'}
                      </span>
                      {c.price_change_percent != null && c.price_change_percent !== 0 && (
                        <span className={`text-xs font-semibold ${c.price_change_percent < 0 ? 'text-accent' : 'text-destructive'}`}>
                          {c.price_change_percent > 0 ? '+' : ''}{c.price_change_percent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Onboarding — shown when no competitors yet */}
      {competitors.length === 0 && (
        <OnboardingWidget
          onDone={() => queryClient.invalidateQueries({ queryKey: ['competitors'] })}
        />
      )}
    </div>
  );
}