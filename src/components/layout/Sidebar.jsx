
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { 
  LayoutDashboard, Users, Bell, Brain, Settings, 
  TrendingUp, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/competitors', icon: Users, label: 'Concorrentes' },
  { path: '/alerts', icon: Bell, label: 'Alertas' },
  { path: '/insights', icon: Brain, label: 'Insights IA' },
  { path: '/settings', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base tracking-tight whitespace-nowrap">
              RivalWatch
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all w-full"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}