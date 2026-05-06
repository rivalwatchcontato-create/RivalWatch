import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, Bell, Brain, Clock, ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Monitoramento automático',
    desc: 'A IA acessa os sites dos seus concorrentes e extrai os preços automaticamente, sem você precisar fazer nada.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Bell,
    title: 'Alertas em tempo real',
    desc: 'Receba e-mails instantâneos quando um concorrente mudar o preço, com detalhes completos da variação.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'Insights com IA',
    desc: 'O sistema analisa o comportamento dos concorrentes e gera recomendações estratégicas de precificação.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Clock,
    title: 'Economia de tempo',
    desc: 'Pare de monitorar preços manualmente. O RivalWatch faz isso por você 24/7.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const STEPS = [
  { num: '01', title: 'Adicione o link do concorrente', desc: 'Cole a URL do produto que deseja monitorar.' },
  { num: '02', title: 'A IA monitora automaticamente', desc: 'Nosso sistema extrai o preço continuamente.' },
  { num: '03', title: 'Receba alertas e insights', desc: 'Você é avisado quando houver mudanças.' },
];

const STATS = [
  { value: '< 30s', label: 'Para verificar um preço' },
  { value: '100%', label: 'Automatizado com IA' },
  { value: '3%', label: 'Threshold de alerta' },
  { value: '∞', label: 'Concorrentes monitorados' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleHeroCTA = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-inter">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">RivalWatch</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Ir para o Dashboard <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleHeroCTA}
                  className="text-sm text-gray-600 px-3 py-2"
                >
                  Entrar
                </button>

                <button
                  onClick={handleHeroCTA}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Começar grátis
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-24 bg-gradient-to-br from-violet-50 to-blue-50">
        <h1 className="text-5xl font-bold mb-6">
          Monitoramento de preços com <span className="text-violet-600">IA</span>
        </h1>

        <p className="text-gray-500 max-w-xl mx-auto mb-10">
          Descubra quando seus concorrentes mudam de preço em tempo real.
        </p>

        <button
          onClick={handleHeroCTA}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold"
        >
          Começar agora
        </button>

        <div className="mt-6 flex justify-center gap-4 text-sm text-gray-400">
          <span>Sem cartão</span>
          <span>•</span>
          <span>Configuração rápida</span>
        </div>
      </section>

      {/* FEATURES (resumido sem alteração lógica) */}
      <section className="py-20 max-w-6xl mx-auto px-5 grid md:grid-cols-4 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="p-5 bg-white shadow rounded-xl">
            <f.icon className="text-violet-600 mb-3" />
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="bg-violet-600 text-white text-center py-20">
        <h2 className="text-3xl font-bold mb-4">
          Comece a monitorar agora
        </h2>

        <p className="mb-6 text-violet-100">
          Sem configuração complexa. Sem cartão.
        </p>

        <button
          onClick={handleHeroCTA}
          className="bg-white text-violet-700 px-6 py-3 rounded-xl font-bold"
        >
          Começar grátis
        </button>
      </section>

    </div>
  );
}