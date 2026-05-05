import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary/20">404</h1>
        <h2 className="text-xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground">A página que você procura não existe.</p>
        <Link to="/">
          <Button className="mt-4">
            <Home className="w-4 h-4 mr-2" /> Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}