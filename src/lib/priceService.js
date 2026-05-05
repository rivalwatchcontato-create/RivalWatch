import { db } from "@/lib/db";


const CURRENCY_SYMBOL = { BRL: 'R$', USD: '$', EUR: '€' };

// ─────────────────────────────────────────────
// 1. SCRAPING REAL via IA + Internet
// ─────────────────────────────────────────────
export async function scrapePrice(competitor) {
  const result = await db.integrations.Core.InvokeLLM({
    prompt: `Você é um agente de web scraping especializado em e-commerce.

Acesse a URL abaixo e extraia as informações do produto.

URL: ${competitor.url}
Produto esperado: "${competitor.product_name}"
Loja: "${competitor.name}"

Instruções:
1. Acesse a URL real e leia o conteúdo da página.
2. Extraia o preço atual de venda (preço à vista ou preço principal exibido).
3. Se houver preço parcelado e à vista, use o preço à vista.
4. Retorne null para "price" se o produto estiver indisponível ou a página não carregar.
5. Não invente valores — use apenas o que está na página.

Retorne um JSON com os campos solicitados.`,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        price: { type: 'number', description: 'Preço numérico sem símbolo. Null se não encontrado.' },
        product_name: { type: 'string', description: 'Nome do produto na página' },
        available: { type: 'boolean', description: 'True se produto disponível para compra' },
        raw_price_text: { type: 'string', description: 'Texto exato do preço (ex: "R$ 1.299,90")' },
        confidence: { type: 'number', description: 'Confiança da extração 0-100' }
      }
    }
  });

  return result;
}

// ─────────────────────────────────────────────
// 2. VERIFICAR E ATUALIZAR PREÇO DE UM CONCORRENTE
// ─────────────────────────────────────────────
export async function checkAndUpdatePrice(competitor) {
  const extracted = await scrapePrice(competitor);

  if (!extracted?.price) {
    await db.entities.Competitor.update(competitor.id, {
      status: 'error',
      last_checked: new Date().toISOString()
    });
    return { success: false, error: 'Preço não encontrado na página' };
  }

  const newPrice = extracted.price;
  const oldPrice = competitor.current_price;
  const changePercent = oldPrice && oldPrice !== newPrice
    ? ((newPrice - oldPrice) / oldPrice) * 100
    : 0;

  // Atualizar concorrente
  await db.entities.Competitor.update(competitor.id, {
    current_price: newPrice,
    previous_price: oldPrice || newPrice,
    price_change_percent: parseFloat(changePercent.toFixed(2)),
    last_checked: new Date().toISOString(),
    status: extracted.available === false ? 'error' : 'active'
  });

  // Salvar histórico de preço
  await db.entities.PriceRecord.create({
    competitor_id: competitor.id,
    price: newPrice,
    currency: competitor.currency || 'BRL',
    product_name: extracted.product_name || competitor.product_name,
    source_url: competitor.url,
    extracted_data: JSON.stringify(extracted)
  });

  // Criar alerta e enviar e-mail se preço mudou > 1%
  if (oldPrice && Math.abs(changePercent) > 1) {
    await _createAlertAndNotify(competitor, oldPrice, newPrice, changePercent);
  }

  return { success: true, price: newPrice, changePercent, rawText: extracted.raw_price_text };
}

// ─────────────────────────────────────────────
// 3. VERIFICAR TODOS OS CONCORRENTES ATIVOS
// ─────────────────────────────────────────────
export async function checkAllPrices(competitors) {
  const active = competitors.filter(c => c.status !== 'paused');
  const results = [];
  for (const c of active) {
    const result = await checkAndUpdatePrice(c);
    results.push({ competitor: c.name, ...result });
  }
  return results;
}

// ─────────────────────────────────────────────
// 4. CRIAR ALERTA + ENVIAR E-MAIL REAL
// ─────────────────────────────────────────────
async function _createAlertAndNotify(competitor, oldPrice, newPrice, changePercent) {
  const symbol = CURRENCY_SYMBOL[competitor.currency] || 'R$';
  const direction = changePercent < 0 ? 'caiu' : 'subiu';
  const alertType = changePercent < 0 ? 'price_drop' : 'price_increase';
  const severity = Math.abs(changePercent) > 15 ? 'critical'
    : Math.abs(changePercent) > 8 ? 'high'
    : Math.abs(changePercent) > 3 ? 'medium'
    : 'low';

  await db.entities.Alert.create({
    competitor_id: competitor.id,
    competitor_name: competitor.name,
    product_name: competitor.product_name,
    type: alertType,
    message: `${competitor.name}: "${competitor.product_name}" ${direction} de ${symbol}${oldPrice.toFixed(2)} → ${symbol}${newPrice.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`,
    old_price: oldPrice,
    new_price: newPrice,
    change_percent: parseFloat(changePercent.toFixed(2)),
    severity,
    is_read: false
  });

  // E-mail real apenas para variações relevantes (> 3%)
  if (Math.abs(changePercent) > 3) {
    const user = await db.auth.me().catch(() => null);
    if (user?.email) {
      const badgeColor = changePercent < 0 ? '#10b981' : '#ef4444';
      const badgeText = changePercent < 0 ? `▼ ${Math.abs(changePercent).toFixed(1)}% de queda` : `▲ ${changePercent.toFixed(1)}% de alta`;

      await db.integrations.Core.SendEmail({
        from_name: 'RivalWatch Alertas',
        to: user.email,
        subject: `${changePercent < 0 ? '📉' : '📈'} ${competitor.name}: ${competitor.product_name} ${direction} ${Math.abs(changePercent).toFixed(1)}%`,
        body: `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; background: #f4f4f8; margin: 0; padding: 24px;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1e1b4b; padding: 24px 28px;">
      <p style="color: #a5b4fc; font-size: 12px; margin: 0 0 4px;">RivalWatch — Alerta de Preço</p>
      <h1 style="color: white; font-size: 20px; margin: 0;">${competitor.name}</h1>
    </div>
    <div style="padding: 28px;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 16px;">${competitor.product_name}</p>
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
        <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 14px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">ANTES</p>
          <p style="color: #374151; font-size: 22px; font-weight: 700; margin: 0;">${symbol}${oldPrice.toFixed(2)}</p>
        </div>
        <div style="font-size: 22px; color: #9ca3af;">→</div>
        <div style="flex: 1; background: #f9fafb; border-radius: 8px; padding: 14px; text-align: center;">
          <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">AGORA</p>
          <p style="color: #374151; font-size: 22px; font-weight: 700; margin: 0;">${symbol}${newPrice.toFixed(2)}</p>
        </div>
      </div>
      <div style="background: ${badgeColor}18; border: 1px solid ${badgeColor}40; border-radius: 8px; padding: 12px 16px; text-align: center; margin-bottom: 20px;">
        <span style="color: ${badgeColor}; font-weight: 700; font-size: 15px;">${badgeText}</span>
      </div>
      <a href="${competitor.url}" style="display: block; background: #4f46e5; color: white; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Ver produto →</a>
    </div>
    <div style="padding: 16px 28px; border-top: 1px solid #f3f4f6;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center;">RivalWatch · Monitoramento inteligente de preços</p>
    </div>
  </div>
</body>
</html>`
      });
    }
  }
}

// ─────────────────────────────────────────────
// 5. IA REAL PARA INSIGHTS
// ─────────────────────────────────────────────
export async function generateInsight(competitors, priceRecords, type = 'market_overview') {
  const summary = competitors.map(c => ({
    nome: c.name,
    produto: c.product_name,
    precoAtual: c.current_price,
    precoAnterior: c.previous_price,
    variacao: c.price_change_percent ? `${c.price_change_percent.toFixed(1)}%` : '0%',
    moeda: c.currency || 'BRL',
    status: c.status
  }));

  const history = priceRecords.slice(0, 60).map(r => ({
    concorrente: competitors.find(c => c.id === r.competitor_id)?.name || '?',
    preco: r.price,
    data: r.created_date
  }));

  const prompts = {
    market_overview: `Você é um analista de inteligência competitiva especializado em e-commerce brasileiro.

Analise os dados abaixo e gere um relatório de visão geral do mercado.

Dados dos concorrentes:
${JSON.stringify(summary, null, 2)}

Histórico de preços (mais recentes primeiro):
${JSON.stringify(history, null, 2)}

Produza:
- Título do relatório
- Resumo executivo (2-3 frases)
- Análise completa em markdown (mínimo 200 palavras) com: panorama geral, movimentos de preço relevantes, oportunidades e riscos
- 3 a 5 recomendações práticas e acionáveis
- Score de confiança da análise (0-100)`,

    trend_analysis: `Você é um analista de tendências de precificação em e-commerce.

Identifique tendências nos dados abaixo.

Concorrentes: ${JSON.stringify(summary, null, 2)}
Histórico: ${JSON.stringify(history, null, 2)}

Produza:
- Título
- Resumo das tendências (2-3 frases)
- Análise em markdown: direção do mercado, padrões identificados, velocidade das mudanças, projeção para os próximos 7 dias
- Recomendações baseadas nas tendências
- Score de confiança (0-100)`,

    price_suggestion: `Você é um consultor de estratégia de preços para e-commerce.

Com base nos dados dos concorrentes, sugira a melhor estratégia de precificação.

Concorrentes: ${JSON.stringify(summary, null, 2)}
Histórico: ${JSON.stringify(history, null, 2)}

Produza:
- Título
- Resumo da estratégia sugerida (2-3 frases)
- Análise em markdown: faixa de preço ideal, quando subir/baixar, posicionamento competitivo recomendado, gatilhos para revisão de preço
- Recomendações concretas com valores se possível
- Score de confiança (0-100)`,

    competitor_summary: `Você é um analista de inteligência competitiva.

Faça um briefing detalhado sobre cada concorrente nos dados abaixo.

Concorrentes: ${JSON.stringify(summary, null, 2)}
Histórico: ${JSON.stringify(history, null, 2)}

Para cada concorrente produza um perfil: estratégia de preço observada, agressividade, frequência de mudanças.
Inclua também uma análise comparativa geral.

Estruture em markdown bem formatado.
Inclua: título, resumo (2-3 frases), análise completa, recomendações, score de confiança.`
  };

  const result = await db.integrations.Core.InvokeLLM({
    prompt: prompts[type] || prompts.market_overview,
    model: 'claude_sonnet_4_6',
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        summary: { type: 'string' },
        content: { type: 'string', description: 'Análise completa em markdown' },
        recommendations: { type: 'array', items: { type: 'string' } },
        confidence_score: { type: 'number' }
      }
    }
  });

  const insight = await db.entities.AIInsight.create({
    title: result.title,
    content: result.content,
    summary: result.summary,
    type,
    competitors_analyzed: competitors.map(c => c.id),
    recommendations: result.recommendations || [],
    confidence_score: result.confidence_score || 75
  });

  return insight;
}