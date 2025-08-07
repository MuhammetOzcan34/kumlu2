import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSetting } from '@/hooks/useSettings';
import { useCategories } from '@/hooks/useCategories';
import { SUPABASE_BASE_URL } from '@/integrations/supabase/client';
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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addLogo, setAddLogo] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUsageArea, setSelectedUsageArea] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoImg = useRef<HTMLImageElement | null>(null);
  const logoLoadPromise = useRef<Promise<HTMLImageElement | null> | null>(null);
  
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

  // Filigran ve resim işleme fonksiyonları watermark.ts modülüne taşındı

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
        console.log('📋 firmaLogo tipi:', typeof firmaLogo);
        console.log('📋 firmaLogo boş mu?:', !firmaLogo || firmaLogo.trim() === '');
        
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
              size: 0.6,      // Görüntünün %60'ı kadar
              opacity: 0.5,    // %50 opaklık
              angle: -30,      // -30 derece açı
              position: 'center'
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
              logo_eklendi: addLogo && logoImage !== null, // Logo eklenip eklenmediğini doğru şekilde kaydet
              aktif: true,
              sira_no: 0
            });

          if (dbError) {
            console.error('❌ Veritabanı hatası:', dbError);
            console.error('📊 Gönderilen veri:', {
              baslik: file.name.replace(/\.[^/.]+$/, ""),
              dosya_yolu: storageData.path,
              kategori_id: selectedCategory,
              kategori_adi: selectedCategoryData?.ad,
              kullanim_alani: [selectedUsageArea],
              gorsel_tipi: gorselTipi
            });
            throw dbError;
          }
          console.log(`✅ Tamamlandı: ${fileName}`);
          console.log('📊 Veritabanına kaydedilen veri:', {
            baslik: file.name.replace(/\.[^/.]+$/, ""),
            dosya_yolu: storageData.path,
            kategori_id: selectedCategory,
            kategori_adi: selectedCategoryData?.ad,
            kullanim_alani: [selectedUsageArea],
            gorsel_tipi: gorselTipi
          });
          
          return fileName;
        } catch (error) {
          console.error(`❌ Hata (${index + 1}):`, error);
          throw error;
        }
      });

      await Promise.all(uploadPromises);
      console.log('🎉 Tüm fotoğraflar başarıyla yüklendi');

      toast.success(`${photos.length} fotoğraf başarıyla yüklendi`);
      
      // Reset form
      setPhotos(null);
      setTitle('');
      setDescription('');
      setSelectedUsageArea('');
      setSelectedCategory('');
      if (photoInputRef.current) photoInputRef.current.value = '';
      
      onPhotoUploaded?.();
      
    } catch (error) {
      console.error('❌ Upload hatası:', error);
      toast.error('Fotoğraf yüklenirken hata oluştu: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      console.log('🔄 Upload işlemi tamamlandı');
    }
  };

  // Logo yükleme useEffect kaldırıldı - artık watermark.ts modülü kullanılıyor

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Fotoğraf Yükleme
          </CardTitle>
          <CardDescription>
            Fotoğraflar otomatik olarak boyutlandırılır {addLogo && firmaLogo && "ve logo filigranı eklenir"}
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
            />
            {photos && (
              <p className="text-sm text-muted-foreground mt-1">
                {photos.length} fotoğraf seçildi
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="usageArea">Kullanım Alanı</Label>
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
            <p className="text-sm text-muted-foreground mt-1">
              Fotoğrafın hangi sayfada gösterileceğini seçin
            </p>
          </div>

          {selectedUsageArea && filteredCategories.length > 0 && (
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Bu kullanım alanı için mevcut kategoriler
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="addLogo"
              checked={addLogo}
              onCheckedChange={setAddLogo}
            />
            <Label htmlFor="addLogo" className="text-sm">
              Logo filigranı ekle {firmaLogo ? '✅' : '❌'}
            </Label>
          </div>

          <Button
            onClick={handleUpload} 
            disabled={isUploading || !photos || !selectedUsageArea}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Yükleniyor...' : 'Fotoğrafları Yükle'}
          </Button>
          
          {!selectedUsageArea && photos && (
            <p className="text-sm text-amber-600 text-center">
              ⚠️ Lütfen bir kullanım alanı seçin
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};