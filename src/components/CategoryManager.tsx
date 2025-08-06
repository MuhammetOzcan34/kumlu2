import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  ad: string;
  slug: string;
  aciklama: string;
  tip: 'kumlama' | 'tabela' | 'arac-giydirme';
  aktif: boolean;
  sira_no: number;
  created_at: string;
}

interface CategoryFormData {
  ad: string;
  slug: string;
  aciklama: string;
  tip: 'kumlama' | 'tabela' | 'arac-giydirme';
  aktif: boolean;
  sira_no: number;
}

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    ad: '',
    slug: '',
    aciklama: '',
    tip: 'kumlama',
    aktif: true,
    sira_no: 0
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('📋 Kategoriler yükleniyor...');
      const { data, error } = await supabase
        .from('kategoriler')
        .select('*')
        .order('sira_no', { ascending: true });

      if (error) throw error;
      console.log('✅ Kategoriler başarıyla yüklendi:', data?.length || 0, 'adet');
      setCategories(data || []);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleFormChange = (field: keyof CategoryFormData, value: string | boolean | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Ad değiştiğinde slug'ı otomatik oluştur
      if (field === 'ad') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setFormData({
      ad: '',
      slug: '',
      aciklama: '',
      tip: 'kumlama',
      aktif: true,
      sira_no: categories.length
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      ad: category.ad,
      slug: category.slug,
      aciklama: category.aciklama || '',
      tip: category.tip,
      aktif: category.aktif,
      sira_no: category.sira_no
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      ad: '',
      slug: '',
      aciklama: '',
      tip: 'kumlama',
      aktif: true,
      sira_no: 0
    });
  };

  const handleSubmit = async () => {
    if (!formData.ad.trim()) {
      toast.error('Kategori adı gerekli');
      return;
    }

    try {
      if (editingCategory) {
        // Güncelleme
        console.log('📝 Kategori güncelleniyor:', editingCategory.id);
        const { error } = await supabase
          .from('kategoriler')
          .update(formData)
          .eq('id', editingCategory.id);

        if (error) throw error;
        console.log('✅ Kategori başarıyla güncellendi:', formData.ad);
        toast.success('Kategori başarıyla güncellendi');
      } else {
        // Yeni ekleme
        console.log('➕ Yeni kategori ekleniyor:', formData.ad);
        const { error, data } = await supabase
          .from('kategoriler')
          .insert(formData)
          .select();

        if (error) throw error;
        console.log('✅ Kategori başarıyla eklendi:', data?.[0]?.id);
        toast.success('Kategori başarıyla eklendi');
      }

      closeDialog();
      // Kategorileri yeniden yükle
      setTimeout(() => {
        loadCategories();
      }, 500); // Veritabanının güncellenme süresi için kısa bir bekleme
    } catch (error) {
      console.error('❌ Kategori kaydetme hatası:', error);
      toast.error('Kategori kaydedilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ Kategori siliniyor:', id);
      const { error } = await supabase
        .from('kategoriler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('✅ Kategori başarıyla silindi:', id);
      toast.success('Kategori başarıyla silindi');
      
      // Kategorileri yeniden yükle
      setTimeout(() => {
        loadCategories();
      }, 500); // Veritabanının güncellenme süresi için kısa bir bekleme
    } catch (error) {
      console.error('❌ Kategori silme hatası:', error);
      toast.error('Kategori silinemedi');
    }
  };

  const getTipBadge = (tip: string) => {
    if (tip === 'kumlama') return 'default';
    if (tip === 'tabela') return 'secondary';
    if (tip === 'arac-giydirme') return 'outline';
    return 'default';
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Kategori Yönetimi
            </CardTitle>
            <CardDescription>
              Fotoğraf kategorilerini ekleyin, düzenleyin ve yönetin
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kategori
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-24">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.ad}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTipBadge(category.tip)}>
                      {category.tip === 'kumlama' ? 'Kumlama' : 
                       category.tip === 'tabela' ? 'Tabela' : 
                       category.tip === 'arac-giydirme' ? 'Araç Giydirme' : category.tip}
                    </Badge>
                  </TableCell>
                  <TableCell>{category.sira_no}</TableCell>
                  <TableCell>
                    <Badge variant={category.aktif ? 'default' : 'secondary'}>
                      {category.aktif ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{category.ad}" kategorisini silmek istediğinizden emin misiniz? 
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id)}
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
              <DialogDescription>
                Kategori bilgilerini girin. Slug otomatik oluşturulacaktır.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="ad">Kategori Adı *</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => handleFormChange('ad', e.target.value)}
                  placeholder="Kategori adını girin"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="kategori-slug"
                />
              </div>

              <div>
                <Label htmlFor="tip">Kategori Tipi</Label>
                <Select 
                  value={formData.tip} 
                  onValueChange={(value) => handleFormChange('tip', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kumlama">Kumlama</SelectItem>
                    <SelectItem value="tabela">Tabela</SelectItem>
                    <SelectItem value="arac-giydirme">Araç Giydirme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sira_no">Sıra Numarası</Label>
                <Input
                  id="sira_no"
                  type="number"
                  value={formData.sira_no}
                  onChange={(e) => handleFormChange('sira_no', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="aciklama">Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => handleFormChange('aciklama', e.target.value)}
                  placeholder="Kategori açıklaması"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingCategory ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};