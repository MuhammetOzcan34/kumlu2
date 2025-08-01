import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Images, Trash2, Edit3, Eye, EyeOff, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQueryClient } from '@tanstack/react-query';

interface Photo {
  id: string;
  baslik: string;
  aciklama: string;
  dosya_yolu: string;
  kategori_id: string;
  kategori_adi: string;
  kullanim_alani: string[];
  aktif: boolean;
  created_at: string;
  logo_eklendi: boolean;
  boyut: number;
}

interface Category {
  id: string;
  ad: string;
  tip: string;
}

export const PhotoGalleryManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editCategoryId, setEditCategoryId] = useState('no-category');
  const [editUsageAreas, setEditUsageAreas] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [usageAreaFilter, setUsageAreaFilter] = useState<string>('all');

  // Cache temizleme fonksiyonu
  const invalidatePhotoCache = () => {
    queryClient.invalidateQueries({ queryKey: ["photos"] });
    queryClient.refetchQueries({ queryKey: ["photos"] });
    console.log('Photo cache invalidated and refetched');
  };

  const usageAreas = [
    { id: 'ana-sayfa-slider', label: 'Ana Sayfa Slider' },
    { id: 'galeri', label: 'Fotoğraf Galerisi' },
    { id: 'referanslar', label: 'Referanslar Sayfası' },
    { id: 'hakkimizda', label: 'Hakkımızda Sayfası' },
    { id: 'iletisim', label: 'İletişim Sayfası' },
    { id: 'blog', label: 'Blog/Haberler' },
    { id: 'arac-giydirme', label: 'Araç Giydirme Sayfası' }
  ];

  useEffect(() => {
    loadPhotos();
    loadCategories();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, selectedCategoryFilter, statusFilter, usageAreaFilter]);

  const filterPhotos = () => {
    let filtered = [...photos];

    // Kategori filtresi
    if (selectedCategoryFilter !== 'all') {
      filtered = filtered.filter(photo => photo.kategori_id === selectedCategoryFilter);
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(photo => photo.aktif === isActive);
    }

    // Kullanım alanı filtresi
    if (usageAreaFilter !== 'all') {
      filtered = filtered.filter(photo => 
        photo.kullanim_alani && photo.kullanim_alani.includes(usageAreaFilter)
      );
    }

    setFilteredPhotos(filtered);
  };

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('fotograflar')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Fotoğraflar yüklenirken hata:', error);
      toast.error('Fotoğraflar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .select('id, ad, tip')
        .eq('aktif', true)
        .order('sira_no');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('fotograflar').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditTitle(photo.baslik || '');
    setEditDescription(photo.aciklama || '');
    setEditActive(photo.aktif);
    setEditCategoryId(photo.kategori_id || 'no-category');
    setEditUsageAreas(photo.kullanim_alani || []);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;

    try {
      const { error } = await supabase
        .from('fotograflar')
        .update({
          baslik: editTitle,
          aciklama: editDescription,
          aktif: editActive,
          kategori_id: editCategoryId === 'no-category' ? null : editCategoryId,
          kategori_adi: editCategoryId === 'no-category' ? null : categories.find(c => c.id === editCategoryId)?.ad || null,
          kullanim_alani: editUsageAreas
        })
        .eq('id', editingPhoto.id);

      if (error) throw error;

      toast.success('Fotoğraf güncellendi');
      setIsEditDialogOpen(false);
      setEditingPhoto(null);
      loadPhotos();
      invalidatePhotoCache(); // Cache'i temizle
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Fotoğraf güncellenemedi');
    }
  };

  const handleDelete = async (photo: Photo) => {
    try {
      // Storage'dan dosyayı sil
      const { error: storageError } = await supabase.storage
        .from('fotograflar')
        .remove([photo.dosya_yolu]);

      if (storageError) {
        console.warn('Storage silme hatası:', storageError);
      }

      // Veritabanından kaydı sil
      const { error: dbError } = await supabase
        .from('fotograflar')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      toast.success('Fotoğraf silindi');
      loadPhotos();
      invalidatePhotoCache(); // Cache'i temizle
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Fotoğraf silinemedi');
    }
  };

  const handleSelectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([]);
    } else {
      setSelectedPhotos(filteredPhotos.map(photo => photo.id));
    }
  };

  const handleSelectPhoto = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedPhotos.length === 0) return;

    try {
      // Seçili fotoğrafları al
      const photosToDelete = photos.filter(photo => selectedPhotos.includes(photo.id));

      // Storage'dan dosyaları sil
      const filePaths = photosToDelete.map(photo => photo.dosya_yolu);
      const { error: storageError } = await supabase.storage
        .from('fotograflar')
        .remove(filePaths);

      if (storageError) {
        console.error('Storage silme hatası:', storageError);
      }

      // Veritabanından kayıtları sil
      const { error: dbError } = await supabase
        .from('fotograflar')
        .delete()
        .in('id', selectedPhotos);

      if (dbError) throw dbError;

      toast.success(`${selectedPhotos.length} fotoğraf başarıyla silindi`);
      setSelectedPhotos([]);
      loadPhotos();
      invalidatePhotoCache(); // Cache'i temizle
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      toast.error('Fotoğraflar silinirken hata oluştu');
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Tüm fotoğrafları al
      const allPhotos = photos;

      // Storage'dan tüm dosyaları sil
      const filePaths = allPhotos.map(photo => photo.dosya_yolu);
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('fotograflar')
          .remove(filePaths);

        if (storageError) {
          console.error('Storage silme hatası:', storageError);
        }
      }

      // Veritabanından tüm kayıtları sil
      const { error: dbError } = await supabase
        .from('fotograflar')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Tüm kayıtları sil

      if (dbError) throw dbError;

      toast.success(`Tüm fotoğraflar başarıyla silindi`);
      loadPhotos();
      invalidatePhotoCache(); // Cache'i temizle
    } catch (error) {
      console.error('Tüm fotoğrafları silme hatası:', error);
      toast.error('Fotoğraflar silinirken hata oluştu');
    } finally {
      setIsDeleteAllDialogOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <CardTitle>Fotoğraf Galerisi</CardTitle>
        <CardDescription>
          Yüklenen fotoğrafları görüntüleyin ve yönetin
        </CardDescription>
        
        {/* Filtreler */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label htmlFor="category-filter" className="text-sm">Kategori:</Label>
            <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tüm kategoriler" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm kategoriler</SelectItem>
                <SelectItem value="no-category">Kategorisiz</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.ad} ({category.tip})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm">Durum:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="usage-area-filter" className="text-sm">Kullanım Alanı:</Label>
            <Select value={usageAreaFilter} onValueChange={setUsageAreaFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="ana-sayfa-slider">Ana Sayfa Slider</SelectItem>
                <SelectItem value="galeri">Fotoğraf Galerisi</SelectItem>
                <SelectItem value="referanslar">Referanslar Sayfası</SelectItem>
                <SelectItem value="hakkimizda">Hakkımızda Sayfası</SelectItem>
                <SelectItem value="iletisim">İletişim Sayfası</SelectItem>
                <SelectItem value="blog">Blog/Haberler</SelectItem>
                <SelectItem value="arac-giydirme">Araç Giydirme Sayfası</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Toplu işlem butonları */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0 ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </Button>
          {selectedPhotos.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              Seçilenleri Sil ({selectedPhotos.length})
            </Button>
          )}
          {filteredPhotos.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteAllDialogOpen(true)}
            >
              Tümünü Sil
            </Button>
          )}
        </div>
        
        {/* Sonuç sayısı */}
        <div className="text-sm text-muted-foreground mt-2">
          {filteredPhotos.length} fotoğraf gösteriliyor (toplam {photos.length})
        </div>
      </CardHeader>
      <CardContent>
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {photos.length === 0 ? 'Henüz fotoğraf yüklenmemiş' : 'Seçilen filtrelere uygun fotoğraf bulunamadı'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedPhotos.length === filteredPhotos.length && filteredPhotos.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                </TableHead>
                <TableHead>Fotoğraf</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Kullanım Alanları</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Boyut</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {filteredPhotos.map((photo) => (
                <TableRow key={photo.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedPhotos.includes(photo.id)}
                      onChange={() => handleSelectPhoto(photo.id)}
                      className="h-4 w-4"
                    />
                  </TableCell>
                  <TableCell>
                <div className="w-32 h-24 relative">
                  <img
                    src={getImageUrl(photo.dosya_yolu)}
                    alt={photo.baslik || 'Fotoğraf'}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    {photo.logo_eklendi && (
                      <Badge variant="secondary" className="text-xs">Logo</Badge>
                    )}
                    {photo.aktif ? (
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
                </div>
                  </TableCell>
                  <TableCell>
                  <h4 className="font-medium text-sm line-clamp-1">
                    {photo.baslik || 'Başlıksız'}
                  </h4>
                  </TableCell>
                  <TableCell>
                  {photo.aciklama && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {photo.aciklama}
                    </p>
                  )}
                  </TableCell>
                  <TableCell>
                    {photo.kategori_adi && (
                      <Badge variant="outline" className="text-xs">
                        {photo.kategori_adi}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                  {photo.kullanim_alani && photo.kullanim_alani.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {photo.kullanim_alani.slice(0, 2).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {photo.kullanim_alani.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{photo.kullanim_alani.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`photo-${photo.id}-active`}
                        checked={photo.aktif}
                        onCheckedChange={(checked) => {
                          const updatedPhotos = photos.map(p => 
                            p.id === photo.id ? { ...p, aktif: checked } : p
                          );
                          setPhotos(updatedPhotos);
                          // Supabase'e güncelleme yap
                          supabase
                            .from('fotograflar')
                            .update({ aktif: checked })
                            .eq('id', photo.id)
                            .then(({ error }) => {
                              if (error) {
                                console.error('Fotoğraf durumu güncellenemedi:', error);
                                toast.error('Fotoğraf durumu güncellenemedi');
                              } else {
                                toast.success('Fotoğraf durumu güncellendi');
                              }
                            });
                        }}
                      />
                      <Label htmlFor={`photo-${photo.id}-active`} className="text-sm">
                        {photo.aktif ? 'Aktif' : 'Pasif'}
                      </Label>
                  </div>
                  </TableCell>
                  <TableCell>
                    {formatFileSize(photo.boyut || 0)}
                  </TableCell>
                  <TableCell>
                    {new Date(photo.created_at).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       className="flex-1"
                       onClick={() => handleEdit(photo)}
                     >
                       <Edit3 className="h-3 w-3 mr-1" />
                       Düzenle
                     </Button>
                     
                     <AlertDialog>
                       <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" className="flex-1">
                           <Trash2 className="h-3 w-3 mr-1" />
                           Sil
                         </Button>
                       </AlertDialogTrigger>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Fotoğrafı Sil</AlertDialogTitle>
                           <AlertDialogDescription>
                             Bu fotoğrafı kalıcı olarak silmek istediğinizden emin misiniz? 
                             Bu işlem geri alınamaz.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>İptal</AlertDialogCancel>
                           <AlertDialogAction
                             onClick={() => handleDelete(photo)}
                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
         )}
         
         {/* Tek düzenleme dialogu */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Fotoğraf Düzenle</DialogTitle>
               <DialogDescription>
                 Fotoğraf bilgilerini güncelleyin
               </DialogDescription>
             </DialogHeader>
             <div className="space-y-4">
               <div>
                 <Label htmlFor="edit-title">Başlık</Label>
                 <Input
                   id="edit-title"
                   value={editTitle}
                   onChange={(e) => setEditTitle(e.target.value)}
                   placeholder="Fotoğraf başlığı"
                 />
               </div>
               <div>
                 <Label htmlFor="edit-description">Açıklama</Label>
                 <Textarea
                   id="edit-description"
                   value={editDescription}
                   onChange={(e) => setEditDescription(e.target.value)}
                   placeholder="Fotoğraf açıklaması"
                   rows={3}
                 />
               </div>
               
               <div>
                 <Label htmlFor="edit-category">Kategori</Label>
                 <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                   <SelectTrigger>
                     <SelectValue placeholder="Kategori seçin" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="no-category">Kategori Yok</SelectItem>
                     {categories?.map((category) => (
                       <SelectItem key={category.id} value={category.id || 'unknown'}>
                         {category.ad} ({category.tip})
                       </SelectItem>
                     )) || []}
                   </SelectContent>
                 </Select>
               </div>
               
               <div>
                 <Label>Kullanım Alanları</Label>
                 <div className="grid grid-cols-2 gap-2 mt-2">
                   {usageAreas.map((area) => (
                     <div key={area.id} className="flex items-center space-x-2">
                       <Checkbox
                         id={`edit-${area.id}`}
                         checked={editUsageAreas.includes(area.id)}
                         onCheckedChange={(checked) => {
                           if (checked) {
                             setEditUsageAreas(prev => [...prev, area.id]);
                           } else {
                             setEditUsageAreas(prev => prev.filter(id => id !== area.id));
                           }
                         }}
                       />
                       <Label htmlFor={`edit-${area.id}`} className="text-sm">
                         {area.label}
                       </Label>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="flex items-center space-x-2">
                 <Switch
                   id="edit-active"
                   checked={editActive}
                   onCheckedChange={setEditActive}
                 />
                 <Label htmlFor="edit-active">Aktif</Label>
               </div>
             </div>
             <DialogFooter>
               <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                 İptal
               </Button>
               <Button onClick={handleSaveEdit}>
                 Kaydet
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
         
         {/* Tümünü silme dialogu */}
         <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>Tüm Fotoğrafları Sil</AlertDialogTitle>
               <AlertDialogDescription>
                 Tüm fotoğrafları kalıcı olarak silmek istediğinizden emin misiniz? 
                 Bu işlem geri alınamaz.
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>İptal</AlertDialogCancel>
               <AlertDialogAction
                 onClick={handleDeleteAll}
                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               >
                 Tümünü Sil
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
       </CardContent>
     </Card>
   );
 };