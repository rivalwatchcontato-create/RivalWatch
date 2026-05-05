import { db } from "@/lib/db";

import React, { useState } from 'react';

import { checkAndUpdatePrice } from '@/lib/priceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingWidget({ onDone }) {
  const [url, setUrl] = useState(() => {
    const saved = sessionStorage.getItem('onboarding_url') || '';
    if (saved) sessionStorage.removeItem('onboarding_url');
    return saved;
  });
  const [step, setStep] = useState('idle'); // idle | creating | checking | done
  const [result, setResult] = useState(null);

  const handleStart = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error('Cole uma URL válida para continuar');
      return;
    }

    try {
      // Extract domain as competitor name
      let name = '';
      try {
        name = new URL(trimmed).hostname.replace('www.', '');
      } catch {
        name = 'Concorrente';
      }

      setStep('creating');

      // Create competitor record
      const competitor = await db.entities.Competitor.create({
        name,
        url: trimmed,
        product_name: 'Produto monitorado',
        status: 'active',
        currency: 'BRL',
      });

      setStep('checking');
      toast.info(`Buscando preço em ${name}...`);

      // Check price immediately
      const priceResult = await checkAndUpdatePrice(competitor);

      if (priceResult.success) {
        setResult({ competitor, price: priceResult.price });
        setStep('done');
        toast.success('Concorrente criado e preço capturado!');
      } else {
        setStep('done');
        setResult({ competitor, price: null });
        toast.warning('Concorrente criado! Não foi possível capturar o preço agora.');
      }

      onDone?.();
    } catch (err) {
      setStep('idle');
      toast.error('Erro ao criar concorrente. Verifique a URL e tente novamente.');
    }
  };

  const isLoading = step === 'creating' || step === 'checking';

  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-6">
      {/* Icon + title */}
      <div>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Zap className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Comece em 30 segundos</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
          Cole o link do produto do seu concorrente e a IA captura o preço automaticamente.
        </p>
      </div>

      {/* Input */}
      {step !== 'done' ? (
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Input
            placeholder="https://loja.com.br/produto"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleStart()}
            className="flex-1 h-11 text-sm"
            disabled={isLoading}
          />
          <Button onClick={handleStart} disabled={isLoading || !url.trim()} className="h-11 px-6 whitespace-nowrap">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {step === 'creating' ? 'Criando...' : 'Verificando preço...'}
              </>
            ) : (
              <>
                Começar monitoramento <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-3 text-emerald-600 font-semibold">
          <CheckCircle className="w-5 h-5" />
          {result?.price
            ? `Monitoramento iniciado! Preço atual: R$${result.price.toFixed(2)}`
            : 'Concorrente adicionado com sucesso!'}
        </div>
      )}

      {/* Steps hint */}
      {step === 'idle' && (
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          {['1. Cole a URL', '2. IA extrai o preço', '3. Receba alertas'].map((s, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
              {s.slice(3)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}