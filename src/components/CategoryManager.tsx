import React, { useState, useEffect, useRef } from 'react';
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
  
  // Timeout referansları için
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    loadCategories();
    
    // Cleanup function - component unmount'da tüm timeout'ları temizle
    return () => {
      timeoutRefs.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      timeoutRefs.current.clear();
    };
  }, []);

  const loadCategories = async () => {
    try {
      console.log('📋 CategoryManager - Kategoriler yükleniyor...');
      setIsLoading(true); // Yükleme başladığında loading durumunu true yap
      
      const { data, error } = await supabase
        .from('kategoriler')
        .select('*')
        .order('sira_no', { ascending: true });

      if (error) throw error;
      
      console.log('✅ CategoryManager - Kategoriler başarıyla yüklendi:', (data || []).length, 'adet');
      console.log('📊 CategoryManager - Kategori verileri:', data);
      
      // Verileri state'e kaydet
      setCategories(data || []);
    } catch (error) {
      console.error('❌ CategoryManager - Kategoriler yüklenirken hata:', error);
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
      // Kategori verilerini hazırla
      const kategoriData = {
        ad: formData.ad,
        slug: formData.slug,
        aciklama: formData.aciklama,
        tip: formData.tip,
        aktif: formData.aktif,
        sira_no: formData.sira_no,
        updated_at: new Date().toISOString()
      };

      if (editingCategory) {
        // Güncelleme için ID ekle
        kategoriData.id = editingCategory.id;
      } else {
        // Yeni kategori için created_at ekle
        kategoriData.created_at = new Date().toISOString();
      }

      // Upsert işlemi - Hem ekleme hem güncelleme için tek method
      const { error } = await supabase
        .from('kategoriler')
        .upsert(kategoriData, {
          onConflict: editingCategory ? 'id' : 'slug',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Kategori kayıt hatası:', error);
        throw error;
      }

      toast.success(editingCategory ? 'Kategori başarıyla güncellendi' : 'Kategori başarıyla eklendi');

      closeDialog();
      
      // Kategorileri yeniden yükle - daha uzun bir bekleme süresi
      console.log('⏱️ CategoryManager - Kategoriler yeniden yüklenecek (1 saniye bekleniyor)');
      const timeoutId = setTimeout(() => {
        loadCategories();
        timeoutRefs.current.delete(timeoutId);
      }, 1000); // Veritabanının güncellenme süresi için daha uzun bir bekleme
      timeoutRefs.current.add(timeoutId);
    } catch (error) {
      console.error('❌ CategoryManager - Kategori kaydetme hatası:', error);
      toast.error('Kategori kaydedilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ CategoryManager - Kategori siliniyor:', id);
      
      // Önce kategoriyi kontrol et
      const { data: categoryData, error: checkError } = await supabase
        .from('kategoriler')
        .select('*')
        .eq('id', id)
        .single();
        
      if (checkError) {
        console.error('❌ CategoryManager - Kategori bulunamadı:', id, checkError);
        throw new Error('Kategori bulunamadı');
      }
      
      console.log('🔍 CategoryManager - Silinecek kategori:', categoryData);
      
      // Kategoriyi sil
      const { error } = await supabase
        .from('kategoriler')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      console.log('✅ CategoryManager - Kategori başarıyla silindi:', id);
      toast.success('Kategori başarıyla silindi');
      
      // Kategorileri yeniden yükle - daha uzun bir bekleme süresi
      console.log('⏱️ CategoryManager - Kategoriler yeniden yüklenecek (1.5 saniye bekleniyor)');
      const timeoutId = setTimeout(() => {
        loadCategories();
        timeoutRefs.current.delete(timeoutId);
      }, 1500); // Veritabanının güncellenme süresi için daha uzun bir bekleme
      timeoutRefs.current.add(timeoutId);
    } catch (error) {
      console.error('❌ CategoryManager - Kategori silme hatası:', error);
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
                <Label htmlFor="kategori-ad">Kategori Adı *</Label>
                <Input
                  id="kategori-ad"
                  name="kategori_ad"
                  value={formData.ad}
                  onChange={(e) => handleFormChange('ad', e.target.value)}
                  placeholder="Kategori adını girin"
                  autoComplete="off"
                />
              </div>

              <div>
                <Label htmlFor="kategori-slug">Slug</Label>
                <Input
                  id="kategori-slug"
                  name="kategori_slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange('slug', e.target.value)}
                  placeholder="kategori-slug"
                  autoComplete="off"
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
                <Label htmlFor="kategori-sira-no">Sıra Numarası</Label>
                <Input
                  id="kategori-sira-no"
                  name="kategori_sira_no"
                  type="number"
                  value={formData.sira_no}
                  onChange={(e) => handleFormChange('sira_no', parseInt(e.target.value) || 0)}
                  min="0"
                  autoComplete="off"
                />
              </div>

              <div>
                <Label htmlFor="kategori-aciklama">Açıklama</Label>
                <Textarea
                  id="kategori-aciklama"
                  name="kategori_aciklama"
                  value={formData.aciklama}
                  onChange={(e) => handleFormChange('aciklama', e.target.value)}
                  placeholder="Kategori açıklaması"
                  rows={3}
                  autoComplete="off"
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