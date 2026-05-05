import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, MoreVertical, RefreshCw, Pause, Play, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

const statusMap = {
  active: { label: 'Ativo', className: 'bg-accent/10 text-accent border-accent/20' },
  paused: { label: 'Pausado', className: 'bg-muted text-muted-foreground border-border' },
  error: { label: 'Erro', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const currencySymbol = { BRL: 'R$', USD: '$', EUR: '€' };

export default function CompetitorCard({ competitor, onCheckPrice, onToggleStatus, onDelete, isChecking }) {
  const status = statusMap[competitor.status] || statusMap.active;
  const symbol = currencySymbol[competitor.currency] || 'R$';
  const changePercent = competitor.price_change_percent;

  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-lg font-bold text-primary">
            {competitor.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <Link to={`/competitors/${competitor.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
              {competitor.name}
            </Link>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{competitor.product_name}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCheckPrice(competitor)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Verificar preço
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleStatus(competitor)}>
              {competitor.status === 'active' ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {competitor.status === 'active' ? 'Pausar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(competitor.url, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" /> Abrir URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(competitor)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">
            {competitor.current_price ? `${symbol} ${competitor.current_price.toFixed(2)}` : '—'}
          </p>
          {changePercent != null && changePercent !== 0 && (
            <p className={`text-xs font-semibold mt-1 ${changePercent < 0 ? 'text-accent' : 'text-destructive'}`}>
              {changePercent > 0 ? '↑' : '↓'} {Math.abs(changePercent).toFixed(1)}% vs anterior
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={status.className}>{status.label}</Badge>
          {isChecking && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
        </div>
      </div>

      {competitor.last_checked && (
        <p className="text-xs text-muted-foreground mt-3">
          Última verificação: {new Date(competitor.last_checked).toLocaleString('pt-BR')}
        </p>
      )}
    </Card>
  );
}