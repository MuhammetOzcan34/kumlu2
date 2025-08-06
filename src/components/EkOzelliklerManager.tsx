import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface EkOzellik {
  id: string;
  ad: string;
  aciklama: string;
  carpani: number;
  aktif: boolean;
}

export const EkOzelliklerManager: React.FC = () => {
  const [ekOzellikler, setEkOzellikler] = useState<EkOzellik[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<EkOzellik>>({ ad: '', aciklama: '', carpani: 0, aktif: true });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEkOzellikler = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ek_ozellikler').select('*').order('ad');
    if (!error) setEkOzellikler(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEkOzellikler(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'number' ? Number(value) : value 
    });
  };

  const handleSwitch = (val: boolean) => setForm({ ...form, aktif: val });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ad) return toast.error('Ad zorunlu');
    setLoading(true);
    if (editingId) {
      const { error } = await supabase.from('ek_ozellikler').update(form).eq('id', editingId);
      if (!error) toast.success('Güncellendi');
    } else {
      const { error } = await supabase.from('ek_ozellikler').insert([{ 
        ad: form.ad || '',
        aciklama: form.aciklama || null,
        carpani: form.carpani || 0,
        aktif: form.aktif ?? true
      }]);
      if (!error) toast.success('Eklendi');
    }
    setForm({ ad: '', aciklama: '', carpani: 0, aktif: true });
    setEditingId(null);
    fetchEkOzellikler();
    setLoading(false);
  };

  const handleEdit = (ozellik: EkOzellik) => {
    setForm(ozellik);
    setEditingId(ozellik.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    const { error } = await supabase.from('ek_ozellikler').delete().eq('id', id);
    if (!error) toast.success('Silindi');
    fetchEkOzellikler();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ek Özellikler</CardTitle>
        <CardDescription>Hesaplama için ek özellikleri yönetin</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-2 mb-6">
          <Input name="ad" value={form.ad || ''} onChange={handleChange} placeholder="Ek Özellik Adı" required />
          <Textarea name="aciklama" value={form.aciklama || ''} onChange={handleChange} placeholder="Açıklama" />
          <Input name="carpani" type="number" value={form.carpani || 0} onChange={handleChange} placeholder="Çarpan (%)" />
          <div className="flex items-center gap-2">
            <Switch checked={form.aktif ?? true} onCheckedChange={handleSwitch} />
            <span>Aktif</span>
          </div>
          <Button type="submit" disabled={loading}>{editingId ? 'Güncelle' : 'Ekle'}</Button>
          {editingId && <Button type="button" variant="outline" onClick={() => { setForm({ ad: '', aciklama: '', carpani: 0, aktif: true }); setEditingId(null); }}>Vazgeç</Button>}
        </form>
        <div className="space-y-2">
          {ekOzellikler.map((ozellik) => (
            <div key={ozellik.id} className="flex items-center justify-between border rounded p-2">
              <div>
                <div className="font-medium">{ozellik.ad}</div>
                <div className="text-xs text-muted-foreground">{ozellik.aciklama}</div>
                <div className="text-xs">Çarpan: %{ozellik.carpani}</div>
                <div className="text-xs">{ozellik.aktif ? 'Aktif' : 'Pasif'}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(ozellik)}>Düzenle</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(ozellik.id)}>Sil</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 