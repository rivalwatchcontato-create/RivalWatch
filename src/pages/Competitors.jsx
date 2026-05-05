import { db } from "@/lib/db";

import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Search, Grid3X3, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import CompetitorCard from '@/components/competitors/CompetitorCard';
import AddCompetitorDialog from '@/components/competitors/AddCompetitorDialog';
import { checkAndUpdatePrice } from '@/lib/priceService';

export default function Competitors() {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [checkingIds, setCheckingIds] = useState(new Set());
  const queryClient = useQueryClient();

  const { data: competitors = [], isLoading } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => db.entities.Competitor.list('-updated_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Competitor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Concorrente adicionado!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Competitor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Concorrente removido');
    },
  });

  const handleCheckPrice = async (competitor) => {
    setCheckingIds(prev => new Set([...prev, competitor.id]));
    toast.info(`Verificando preço de ${competitor.name}...`);
    const result = await checkAndUpdatePrice(competitor);
    if (result.success) {
      const symbol = { BRL: 'R$', USD: '$', EUR: '€' }[competitor.currency] || 'R$';
      toast.success(`${competitor.name}: ${symbol}${result.price.toFixed(2)}`);
    } else {
      toast.error(`Erro ao verificar ${competitor.name}`);
    }
    setCheckingIds(prev => {
      const next = new Set(prev);
      next.delete(competitor.id);
      return next;
    });
    queryClient.invalidateQueries({ queryKey: ['competitors'] });
    queryClient.invalidateQueries({ queryKey: ['price-records'] });
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
  };

  const handleToggleStatus = async (competitor) => {
    const newStatus = competitor.status === 'active' ? 'paused' : 'active';
    await db.entities.Competitor.update(competitor.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['competitors'] });
    toast.success(`${competitor.name} ${newStatus === 'active' ? 'ativado' : 'pausado'}`);
  };

  const filtered = competitors.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Concorrentes</h1>
          <p className="text-muted-foreground text-sm mt-1">{competitors.length} concorrentes monitorados</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            {search ? 'Nenhum concorrente encontrado' : 'Nenhum concorrente adicionado ainda'}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Concorrente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(competitor => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              onCheckPrice={handleCheckPrice}
              onToggleStatus={handleToggleStatus}
              onDelete={(c) => deleteMutation.mutate(c.id)}
              isChecking={checkingIds.has(competitor.id)}
            />
          ))}
        </div>
      )}

      <AddCompetitorDialog open={showAdd} onOpenChange={setShowAdd} onSave={createMutation.mutateAsync} />
    </div>
  );
}