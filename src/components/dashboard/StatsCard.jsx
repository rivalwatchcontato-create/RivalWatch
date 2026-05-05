import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, className }) {
  const isPositive = trend === 'up';
  
  return (
    <Card className={cn("p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trendValue && (
            <p className={cn(
              "text-xs font-semibold flex items-center gap-1",
              isPositive ? "text-accent" : "text-destructive"
            )}>
              {isPositive ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}