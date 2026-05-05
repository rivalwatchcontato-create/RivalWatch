import { db } from "@/lib/db";

import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

export default function TopBar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
    db.entities.Alert.filter({ is_read: false }).then(alerts => {
      setUnreadCount(alerts.length);
    }).catch(() => {});
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar concorrentes, produtos..."
            className="pl-9 bg-muted/50 border-0 h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/alerts" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.full_name || 'Usuário'}</span>
        </div>
      </div>
    </header>
  );
}