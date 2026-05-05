import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, Bell, Brain, Clock, ArrowRight, CheckCircle, Zap, BarChart3, Shield } from 'lucide-react';

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
  { num: '01', title: 'Adicione o link do concorrente', desc: 'Cole a URL do produto que deseja monitorar. Pode ser qualquer e-commerce.' },
  { num: '02', title: 'A IA monitora automaticamente', desc: 'Nosso sistema acessa a página, extrai o preço e salva o histórico continuamente.' },
  { num: '03', title: 'Receba alertas e insights', desc: 'Quando o preço mudar, você é avisado por e-mail com análises e sugestões de ação.' },
];

const STATS = [
  { value: '< 30s', label: 'Para verificar um preço' },
  { value: '100%', label: 'Automatizado com IA' },
  { value: '3%', label: 'Threshold de alerta' },
  { value: '∞', label: 'Concorrentes monitorados' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [heroUrl, setHeroUrl] = React.useState('');

  const handleHeroCTA = () => {
    // Store URL in sessionStorage so dashboard onboarding can pick it up
    if (heroUrl.trim()) {
      sessionStorage.setItem('onboarding_url', heroUrl.trim());
    }
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-inter">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">RivalWatch</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Ir para o Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => window.location.href = '/api/auth/login'}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
                >
                  Entrar
                </button>
                <button
                  onClick={() => window.location.href = '/api/auth/login'}
                  className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Começar grátis <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> Monitoramento inteligente com IA
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Descubra quando seus concorrentes<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">
              mudam de preço
            </span>
            <br />— antes de perder vendas
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            O RivalWatch usa IA para monitorar automaticamente os preços dos seus concorrentes e te alertar em tempo real quando algo mudar.
          </p>

          {/* Inline URL input CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto mb-6">
            <input
              type="url"
              placeholder="Cole o link do produto do concorrente..."
              value={heroUrl}
              onChange={e => setHeroUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleHeroCTA()}
              className="flex-1 w-full h-13 px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
            />
            <button
              onClick={handleHeroCTA}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/25 whitespace-nowrap"
            >
              Começar monitoramento <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-4 text-sm text-gray-400">
            {['Sem cartão de crédito', 'Configuração em 2 minutos', 'Cancelamento gratuito'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-gray-100 bg-gray-50/60">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-violet-600 mb-1">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Tudo em um só lugar
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Dashboard completo com histórico de preços, alertas, e análises de IA — direto no seu navegador.
          </p>
        </div>

        {/* Mock dashboard UI */}
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-[#f0f2f8]">
          {/* Window chrome */}
          <div className="bg-gray-800 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="flex-1 mx-4">
              <div className="bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs mx-auto text-center">
                app.rivalwatch.com/dashboard
              </div>
            </div>
          </div>

          {/* Mock dashboard content */}
          <div className="flex" style={{ height: '380px' }}>
            {/* Sidebar */}
            <div className="w-[180px] bg-[#0f1123] flex-shrink-0 p-3 space-y-1">
              <div className="flex items-center gap-2 px-2 py-2 mb-4">
                <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-xs font-bold">RivalWatch</span>
              </div>
              {['Dashboard', 'Concorrentes', 'Alertas', 'Insights IA'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? 'bg-violet-600/30 text-violet-300' : 'text-gray-500'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {item}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="flex-1 p-5 overflow-hidden">
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Concorrentes', val: '4' },
                  { label: 'Preços em queda', val: '2', accent: true },
                  { label: 'Preços em alta', val: '1' },
                  { label: 'Alertas', val: '3' },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-gray-400 text-[10px] mb-1">{label}</p>
                    <p className={`text-xl font-bold ${accent ? 'text-emerald-500' : 'text-gray-800'}`}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Chart + alerts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-2">Histórico de Preços</p>
                  <div className="flex items-end gap-1 h-28">
                    {[60, 75, 55, 80, 65, 70, 50, 75, 60, 85, 70, 65, 55, 80].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#10b981' : '#3b82f6',
                          opacity: 0.6 + (i / 30)
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-[10px] text-gray-400 mb-2">Alertas Recentes</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Amazon', change: '-5.1%', color: 'text-emerald-500' },
                      { name: 'Magalu', change: '+1.3%', color: 'text-red-500' },
                      { name: 'Mercado L.', change: '-2.7%', color: 'text-emerald-500' },
                    ].map(({ name, change, color }) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-600">{name}</span>
                        <span className={`text-[10px] font-bold ${color}`}>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-gray-50/80 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que usar o RivalWatch?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Inteligência competitiva de nível enterprise, simples de usar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-base">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Em 3 passos simples você está monitorando seus concorrentes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* connecting line */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-violet-200 to-violet-200" />

          {STEPS.map(({ num, title, desc }) => (
            <div key={num} className="text-center relative">
              <div className="w-20 h-20 rounded-2xl bg-violet-600 text-white flex items-center justify-center text-2xl font-black mx-auto mb-5 shadow-lg shadow-violet-500/20">
                {num}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-violet-600 to-blue-700 py-20">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Shield className="w-3.5 h-3.5" /> 100% automatizado — sem configuração complexa
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
            Pare de perder vendas<br />por falta de informação
          </h2>
          <p className="text-violet-200 text-lg mb-10 max-w-xl mx-auto">
            Comece a monitorar seus concorrentes agora. Configure em menos de 2 minutos.
          </p>
          <button
            onClick={() => window.location.href = '/api/auth/login'}
            className="inline-flex items-center gap-2 bg-white text-violet-700 text-base font-bold px-10 py-4 rounded-xl transition-all hover:bg-violet-50 shadow-xl hover:-translate-y-0.5"
          >
            Começar agora — é grátis <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-violet-300 text-sm mt-5">Sem cartão de crédito · Sem limite de concorrentes</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm text-gray-700">RivalWatch</span>
          </div>
          <p className="text-xs text-gray-400">© 2026 RivalWatch · Monitoramento inteligente de preços com IA</p>
        </div>
      </footer>

    </div>
  );
}