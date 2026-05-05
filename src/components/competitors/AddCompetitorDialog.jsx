import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function AddCompetitorDialog({ open, onOpenChange, onSave }) {
  const [form, setForm] = useState({
    name: '', url: '', product_name: '', currency: 'BRL', category: '', notes: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.url || !form.product_name) return;
    setSaving(true);
    await onSave({ ...form, status: 'active' });
    setSaving(false);
    setForm({ name: '', url: '', product_name: '', currency: 'BRL', category: '', notes: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Concorrente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Concorrente *</Label>
            <Input placeholder="Ex: Amazon" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>URL do Produto *</Label>
            <Input placeholder="https://..." value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Nome do Produto *</Label>
            <Input placeholder="Ex: iPhone 15 Pro" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Select value={form.currency} onValueChange={v => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">R$ (BRL)</SelectItem>
                  <SelectItem value="USD">$ (USD)</SelectItem>
                  <SelectItem value="EUR">€ (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Input placeholder="Ex: Eletrônicos" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea placeholder="Observações..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.url || !form.product_name}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}