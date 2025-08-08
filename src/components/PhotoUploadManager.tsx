import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSetting } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { loadLogo, processImage } from '@/lib/watermark';

interface PhotoUploadManagerProps {
  onPhotoUploaded?: () => void;
}

interface Category {
  id: string;
  ad: string;
  tip: string;
}

export const PhotoUploadManager: React.FC<PhotoUploadManagerProps> = ({ onPhotoUploaded }) => {
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [addLogo, setAddLogo] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUsageArea, setSelectedUsageArea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const firmaLogo = useSetting('firma_logo_url');

  // Tüm kategorileri çek
  const { data: allCategories = [] } = useCategories();

  const usageAreas = [
    { id: 'ana-sayfa-slider', label: 'Ana Sayfa Slider', categoryType: null },
    { id: 'kumlama', label: 'Kumlama Sayfası', categoryType: 'kumlama' },
    { id: 'tabela', label: 'Tabela Sayfası', categoryType: 'tabela' },
    { id: 'arac-giydirme', label: 'Araç Giydirme Sayfası', categoryType: 'arac-giydirme' },
    { id: 'referanslar', label: 'Referanslar Sayfası', categoryType: null }
  ];

  // Kullanım alanı değiştiğinde kategorileri filtrele
  useEffect(() => {
    if (selectedUsageArea) {
      const usageArea = usageAreas.find(area => area.id === selectedUsageArea);
      if (usageArea?.categoryType) {
        const filtered = allCategories.filter(cat => cat.tip === usageArea.categoryType);
        setFilteredCategories(filtered);
        console.log(`📋 ${usageArea.label} için kategoriler:`, filtered);
      } else {
        setFilteredCategories([]);
      }
      // Kategori seçimini temizle
      setSelectedCategory('');
    } else {
      setFilteredCategories([]);
      setSelectedCategory('');
    }
  }, [selectedUsageArea, allCategories]);

  const handleUpload = async () => {
    if (!photos || photos.length === 0) {
      toast.error('Lütfen en az bir fotoğraf seçin');
      return;
    }

    if (!selectedUsageArea) {
      toast.error('Lütfen bir kullanım alanı seçin');
      return;
    }

    setIsUploading(true);
    console.log('🔄 Upload başlatılıyor...', photos.length, 'fotoğraf');

    try {
      // Logo yükleme işlemini bir kez yap ve tüm fotoğraflar için kullan
      let logoImage: HTMLImageElement | null = null;
      
      if (addLogo && firmaLogo) {
        console.log('🔄 Logo yükleme işlemi başlatılıyor...');
        console.log('📋 firmaLogo değeri:', firmaLogo);
        
        try {
          const logoResult = await loadLogo(firmaLogo);
          if (logoResult.success && logoResult.image) {
            logoImage = logoResult.image;
            console.log('✅ Logo başarıyla yüklendi ve filigran için hazır');
          } else {
            console.warn('⚠️ Logo yüklenemedi:', logoResult.error?.message);
            toast.warning('Logo yüklenemedi, fotoğraflar filigransız yüklenecek');
          }
        } catch (error) {
          console.error('❌ Logo yükleme hatası:', error);
          toast.warning('Logo yüklenemedi, fotoğraflar filigransız yüklenecek');
        }
      } else {
        console.log('ℹ️ Logo ekleme kapalı');
      }

      const uploadPromises = Array.from(photos).map(async (file, index) => {
        try {
          console.log(`📸 İşleniyor ${index + 1}/${photos.length}:`, file.name);
          
          // Resize and add watermark using the new module
          const processedBlob = await processImage(
            file,
            addLogo ? logoImage : null, // Logo eklenecekse ve logo yüklendiyse gönder
            1920, // maxWidth
            1080, // maxHeight
            {
              size: 0.15,      // Görüntünün %15'i kadar
              opacity: 0.25,    // %25 opaklık
              angle: -30,      // -30 derece açı
              position: 'pattern',
              patternRows: 4,
              patternCols: 3
            }
          );
          
          // Generate unique filename
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2);
          const extension = file.name.split('.').pop();
          const fileName = `photo_${timestamp}_${randomId}_${index}.${extension}`;
          
          console.log(`⬆️ Yükleniyor: ${fileName}`);
          
          // Upload to Supabase Storage
          const { data: storageData, error: storageError } = await supabase.storage
            .from('fotograflar')
            .upload(fileName, processedBlob, {
              contentType: 'image/jpeg',
              upsert: false
            });

          if (storageError) throw storageError;

          // Görsel tipini belirle
          let gorselTipi = 'galeri';
          if (selectedUsageArea === 'ana-sayfa-slider') {
            gorselTipi = 'slider';
          } else if (selectedUsageArea === 'referanslar') {
            gorselTipi = 'referans_logo';
          }

          // Kategori bilgilerini al
          console.log('🔍 Seçilen kategori kontrolü:', { 
            selectedCategory, 
            type: typeof selectedCategory, 
            isValid: selectedCategory && typeof selectedCategory === 'string' && selectedCategory.trim() !== '' && selectedCategory.trim() !== 'undefined'
          });
          
          const selectedCategoryData = selectedCategory ? filteredCategories.find(c => c.id === selectedCategory) : null;
          console.log('📋 Seçilen kategori verisi:', selectedCategoryData);
          
          // Save to database
          const { error: dbError } = await supabase
            .from('fotograflar')
            .insert({
              baslik: file.name.replace(/\.[^/.]+$/, ""), // Dosya adını uzantısız olarak başlık yap
              aciklama: "", // Açıklama boş bırak
              dosya_yolu: storageData.path,
              kategori_id: selectedCategory && typeof selectedCategory === 'string' && selectedCategory.trim() !== '' && selectedCategory.trim() !== 'undefined' ? selectedCategory.trim() : null,
              kategori_adi: selectedCategoryData?.ad || null,
              kullanim_alani: [selectedUsageArea],
              gorsel_tipi: gorselTipi,
              mime_type: 'image/jpeg',
              boyut: processedBlob.size,
              logo_eklendi: addLogo && logoImage !== null,
              aktif: true,
              sira_no: 0
            });

          if (dbError) throw dbError;
          
          console.log(`✅ Tamamlandı: ${fileName}`);
          return { success: true, fileName };
        } catch (error) {
          console.error(`❌ Hata (${file.name}):`, error);
          return { success: false, fileName: file.name, error };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        toast.success(`${successful} fotoğraf başarıyla yüklendi${failed > 0 ? `, ${failed} fotoğraf başarısız` : ''}`);
        onPhotoUploaded?.();
        
        // Form temizle
        setPhotos(null);
        setSelectedUsageArea('');
        setSelectedCategory('');
        if (photoInputRef.current) {
          photoInputRef.current.value = '';
        }
      } else {
        toast.error('Hiçbir fotoğraf yüklenemedi');
      }
    } catch (error) {
      console.error('❌ Upload hatası:', error);
      toast.error('Fotoğraf yükleme sırasında hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Fotoğraf Yükleme
        </CardTitle>
        <CardDescription>
          Fotoğrafları seçin, kullanım alanını belirtin ve yükleyin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="photos">Fotoğraflar</Label>
          <Input
            id="photos"
            type="file"
            multiple
            accept="image/*"
            ref={photoInputRef}
            onChange={(e) => setPhotos(e.target.files)}
            className="mt-1"
          />
          {photos && (
            <p className="text-sm text-muted-foreground mt-1">
              {photos.length} fotoğraf seçildi
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="usage-area">Kullanım Alanı</Label>
          <Select value={selectedUsageArea} onValueChange={setSelectedUsageArea}>
            <SelectTrigger>
              <SelectValue placeholder="Kullanım alanı seçin" />
            </SelectTrigger>
            <SelectContent>
              {usageAreas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredCategories.length > 0 && (
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin (opsiyonel)" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="add-logo"
            checked={addLogo}
            onCheckedChange={setAddLogo}
          />
          <Label htmlFor="add-logo">Fotoğraflara logo filigranı ekle</Label>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={!photos || photos.length === 0 || !selectedUsageArea || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <ImageIcon className="mr-2 h-4 w-4 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Fotoğrafları Yükle
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};