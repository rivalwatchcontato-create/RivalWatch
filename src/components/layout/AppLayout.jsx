import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div className={cn("hidden lg:block")}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile sidebar */}
      <div className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-40 transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
      </div>

      <div className={cn(
        "transition-all duration-300",
        "lg:ml-[240px]",
        collapsed && "lg:ml-[68px]"
      )}>
        {/* Mobile top bar with menu button */}
        <div className="lg:hidden flex items-center gap-2 px-4 h-14 border-b bg-card">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-sm">RivalWatch</span>
        </div>
        <div className="hidden lg:block">
          <TopBar />
        </div>
        <main className="p-4 sm:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}