import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServisBedeli {
  id: string;
  kategori: string;
  hizmet_adi: string;
  birim: string;
  birim_fiyat: number;
  aciklama?: string;
  sira_no: number;
  aktif: boolean;
  created_at: string;
}

export const ServisBedelleriManager: React.FC = () => {
  const [servisler, setServisler] = useState<ServisBedeli[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingServis, setEditingServis] = useState<ServisBedeli | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    kategori: '',
    hizmet_adi: '',
    birim: 'm²',
    birim_fiyat: 0,
    aciklama: '',
    sira_no: 0,
    aktif: true
  });

  const kategoriler = [
    'Cam Kumlama',
    'Araç Giydirme',
    'Tabela Üretimi',
    'Dijital Baskı',
    'Montaj Hizmetleri',
    'Diğer'
  ];

  const birimler = [
    'm²',
    'adet',
    'metre',
    'saatlik',
    'günlük',
    'proje'
  ];

  useEffect(() => {
    loadServisler();
  }, []);

  const loadServisler = async () => {
    try {
      const { data, error } = await supabase
        .from('servis_bedelleri')
        .select('*')
        .order('kategori', { ascending: true })
        .order('sira_no', { ascending: true });

      if (error) throw error;
      setServisler(data || []);
    } catch (error) {
      console.error('Servis bedelleri yüklenirken hata:', error);
      toast.error('Servis bedelleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.kategori || !formData.hizmet_adi) {
        toast.error('Kategori ve hizmet adı zorunludur');
        return;
      }

      const { error } = await supabase
        .from('servis_bedelleri')
        .insert([formData]);

      if (error) throw error;

      toast.success('Servis bedeli eklendi');
      setIsAddDialogOpen(false);
      setFormData({
        kategori: '',
        hizmet_adi: '',
        birim: 'm²',
        birim_fiyat: 0,
        aciklama: '',
        sira_no: 0,
        aktif: true
      });
      loadServisler();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      toast.error('Servis bedeli eklenemedi');
    }
  };

  const handleEdit = (servis: ServisBedeli) => {
    setEditingServis(servis);
    setFormData({
      kategori: servis.kategori,
      hizmet_adi: servis.hizmet_adi,
      birim: servis.birim,
      birim_fiyat: servis.birim_fiyat,
      aciklama: servis.aciklama || '',
      sira_no: servis.sira_no,
      aktif: servis.aktif
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingServis) return;

    try {
      const { error } = await supabase
        .from('servis_bedelleri')
        .update(formData)
        .eq('id', editingServis.id);

      if (error) throw error;

      toast.success('Servis bedeli güncellendi');
      setIsEditDialogOpen(false);
      setEditingServis(null);
      loadServisler();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Servis bedeli güncellenemedi');
    }
  };

  const handleDelete = async (servis: ServisBedeli) => {
    try {
      const { error } = await supabase
        .from('servis_bedelleri')
        .delete()
        .eq('id', servis.id);

      if (error) throw error;

      toast.success('Servis bedeli silindi');
      loadServisler();
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Servis bedeli silinemedi');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Servis Bedelleri Yönetimi
        </CardTitle>
        <CardDescription>
          Servis bedelleri ve fiyat listesini yönetin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            Toplam {servisler.length} servis
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Servis Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Servis Bedeli Ekle</DialogTitle>
                <DialogDescription>
                  Yeni bir servis bedeli tanımlayın
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select value={formData.kategori} onValueChange={(value) => setFormData(prev => ({ ...prev, kategori: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoriler.map((kategori) => (
                        <SelectItem key={kategori} value={kategori}>
                          {kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hizmet_adi">Hizmet Adı</Label>
                  <Input
                    id="hizmet_adi"
                    value={formData.hizmet_adi}
                    onChange={(e) => setFormData(prev => ({ ...prev, hizmet_adi: e.target.value }))}
                    placeholder="Hizmet adını girin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birim">Birim</Label>
                    <Select value={formData.birim} onValueChange={(value) => setFormData(prev => ({ ...prev, birim: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {birimler.map((birim) => (
                          <SelectItem key={birim} value={birim}>
                            {birim}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="birim_fiyat">Birim Fiyat (₺)</Label>
                    <Input
                      id="birim_fiyat"
                      type="number"
                      step="0.01"
                      value={formData.birim_fiyat}
                      onChange={(e) => setFormData(prev => ({ ...prev, birim_fiyat: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Textarea
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                    placeholder="İsteğe bağlı açıklama"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="sira_no">Sıra No</Label>
                  <Input
                    id="sira_no"
                    type="number"
                    value={formData.sira_no}
                    onChange={(e) => setFormData(prev => ({ ...prev, sira_no: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="aktif"
                    checked={formData.aktif}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aktif: checked }))}
                  />
                  <Label htmlFor="aktif">Aktif</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSubmit}>
                  Ekle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {Object.entries(
            servisler.reduce((acc, servis) => {
              if (!acc[servis.kategori]) {
                acc[servis.kategori] = [];
              }
              acc[servis.kategori].push(servis);
              return acc;
            }, {} as Record<string, ServisBedeli[]>)
          ).map(([kategori, kategoriServisler]) => (
            <div key={kategori} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">{kategori}</h3>
              <div className="space-y-2">
                {kategoriServisler.map((servis) => (
                  <div key={servis.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{servis.hizmet_adi}</h4>
                        {servis.aktif ? (
                          <Badge variant="default" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Pasif
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(servis.birim_fiyat)} / {servis.birim}
                      </div>
                      {servis.aciklama && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {servis.aciklama}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(servis)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Servis Bedeli Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu servis bedelini kalıcı olarak silmek istediğinizden emin misiniz?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(servis)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Servis Bedeli Düzenle</DialogTitle>
              <DialogDescription>
                Servis bedeli bilgilerini güncelleyin
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-kategori">Kategori</Label>
                <Select value={formData.kategori} onValueChange={(value) => setFormData(prev => ({ ...prev, kategori: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {kategoriler.map((kategori) => (
                      <SelectItem key={kategori} value={kategori}>
                        {kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-hizmet_adi">Hizmet Adı</Label>
                <Input
                  id="edit-hizmet_adi"
                  value={formData.hizmet_adi}
                  onChange={(e) => setFormData(prev => ({ ...prev, hizmet_adi: e.target.value }))}
                  placeholder="Hizmet adını girin"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-birim">Birim</Label>
                  <Select value={formData.birim} onValueChange={(value) => setFormData(prev => ({ ...prev, birim: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {birimler.map((birim) => (
                        <SelectItem key={birim} value={birim}>
                          {birim}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-birim_fiyat">Birim Fiyat (₺)</Label>
                  <Input
                    id="edit-birim_fiyat"
                    type="number"
                    step="0.01"
                    value={formData.birim_fiyat}
                    onChange={(e) => setFormData(prev => ({ ...prev, birim_fiyat: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-aciklama">Açıklama</Label>
                <Textarea
                  id="edit-aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                  placeholder="İsteğe bağlı açıklama"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-sira_no">Sıra No</Label>
                <Input
                  id="edit-sira_no"
                  type="number"
                  value={formData.sira_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, sira_no: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-aktif"
                  checked={formData.aktif}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aktif: checked }))}
                />
                <Label htmlFor="edit-aktif">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleUpdate}>
                Güncelle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};