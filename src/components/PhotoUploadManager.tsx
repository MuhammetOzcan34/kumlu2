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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImg = useRef<HTMLImageElement>(null);
  
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

  const addWatermark = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    if (!addLogo || !firmaLogo || !logoImg.current) return;
    
    // Logo boyutunu %42 yap
    const logoWidth = canvas.width * 0.42; // %42 boyut
    const logoHeight = (logoImg.current.height / logoImg.current.width) * logoWidth;
    
    // Canvas'ı kaydet
    ctx.save();
    
    // Ortaya çevir ve çapraz açı ver (-30 derece)
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6); // -30 derece
    ctx.translate(-logoWidth / 2, -logoHeight / 2);
    
    // Logo şeffaflığı - %12 görünürlük
    ctx.globalAlpha = 0.12; // %12 görünürlük
    ctx.drawImage(logoImg.current, 0, 0, logoWidth, logoHeight);
    
    // Canvas'ı geri yükle
    ctx.restore();
  };

  const resizeImage = (file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          ctx.drawImage(img, 0, 0, width, height);
          
          // Logo filigran ekle
          addWatermark(canvas, ctx);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to blob conversion failed'));
            }
          }, 'image/jpeg', 0.85);
        } catch (error) {
          console.error('Image processing error:', error);
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  };

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
      const uploadPromises = Array.from(photos).map(async (file, index) => {
        try {
          console.log(`📸 İşleniyor ${index + 1}/${photos.length}:`, file.name);
          
          // Resize and add watermark
          const processedBlob = await resizeImage(file);
          
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
          const selectedCategoryData = selectedCategory ? filteredCategories.find(c => c.id === selectedCategory) : null;
          
          // Save to database
          const { error: dbError } = await supabase
            .from('fotograflar')
            .insert({
              baslik: file.name.replace(/\.[^/.]+$/, ""), // Dosya adını uzantısız olarak başlık yap
              aciklama: "", // Açıklama boş bırak
              dosya_yolu: storageData.path,
              kategori_id: selectedCategory && selectedCategory.trim() !== '' ? selectedCategory : null,
              kategori_adi: selectedCategoryData?.ad || null,
              kullanim_alani: [selectedUsageArea],
              gorsel_tipi: gorselTipi,
              mime_type: 'image/jpeg',
              boyut: processedBlob.size,
              logo_eklendi: addLogo && firmaLogo ? true : false,
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
      toast.error('Fotoğraf yüklenirken hata oluştu: ' + error.message);
    } finally {
      setIsUploading(false);
      console.log('🔄 Upload işlemi tamamlandı');
    }
  };

  // Logo yükleme
  useEffect(() => {
    if (firmaLogo && addLogo) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        logoImg.current = img;
        console.log('✅ Logo filigran için hazır');
      };
      img.onerror = () => {
        console.warn('⚠️ Logo yüklenemedi, filigran eklenmeyecek');
      };
      img.src = firmaLogo;
    }
  }, [firmaLogo, addLogo]);

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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