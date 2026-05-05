import { db } from "@/lib/db";

import React, { useState, useEffect } from 'react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Bell, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_alerts: true,
    alert_threshold: '5',
    default_currency: 'BRL',
    check_frequency: 'daily',
  });

  useEffect(() => {
    db.auth.me().then(u => {
      setUser(u);
      if (u.settings) {
        setSettings(prev => ({ ...prev, ...u.settings }));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await db.auth.updateMe({ settings });
    toast.success('Configurações salvas!');
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas preferências no RivalWatch</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10"><User className="w-4 h-4 text-primary" /></div>
          <CardTitle className="text-base">Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={user?.full_name || ''} disabled className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email || ''} disabled className="bg-muted/50" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10"><Bell className="w-4 h-4 text-primary" /></div>
          <CardTitle className="text-base">Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Alertas por e-mail</p>
              <p className="text-xs text-muted-foreground">Receba notificações de mudanças de preço por e-mail</p>
            </div>
            <Switch
              checked={settings.email_alerts}
              onCheckedChange={v => setSettings({ ...settings, email_alerts: v })}
            />
          </div>
          <div className="space-y-2">
            <Label>Limite de alerta (%)</Label>
            <p className="text-xs text-muted-foreground">Notificar apenas quando a variação for maior que</p>
            <Select value={settings.alert_threshold} onValueChange={v => setSettings({ ...settings, alert_threshold: v })}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1%</SelectItem>
                <SelectItem value="3">3%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <div className="p-2 rounded-lg bg-primary/10"><Shield className="w-4 h-4 text-primary" /></div>
          <CardTitle className="text-base">Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Moeda padrão</Label>
            <Select value={settings.default_currency} onValueChange={v => setSettings({ ...settings, default_currency: v })}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ (BRL)</SelectItem>
                <SelectItem value="USD">$ (USD)</SelectItem>
                <SelectItem value="EUR">€ (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar Configurações
      </Button>
    </div>
  );
}