import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

const COLORS = [
  'hsl(245, 58%, 51%)',
  'hsl(160, 84%, 39%)',
  'hsl(0, 84%, 60%)',
  'hsl(43, 74%, 66%)',
  'hsl(200, 70%, 50%)',
];

export default function PriceChart({ records, competitors }) {
  // Group records by date and competitor
  const chartData = React.useMemo(() => {
    if (!records?.length) return [];
    
    const grouped = {};
    records.forEach(r => {
      const date = format(new Date(r.created_date), 'dd/MM');
      if (!grouped[date]) grouped[date] = { date };
      const comp = competitors?.find(c => c.id === r.competitor_id);
      const name = comp?.name || r.competitor_id;
      grouped[date][name] = r.price;
    });
    
    return Object.values(grouped).sort((a, b) => {
      const [dA, mA] = a.date.split('/').map(Number);
      const [dB, mB] = b.date.split('/').map(Number);
      return mA - mB || dA - dB;
    });
  }, [records, competitors]);

  const competitorNames = React.useMemo(() => {
    if (!competitors?.length) return [];
    return competitors.map(c => c.name);
  }, [competitors]);

  if (!chartData.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Histórico de Preços</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado de preço registrado ainda. Adicione concorrentes e verifique preços.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Histórico de Preços</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                background: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Legend />
            {competitorNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}