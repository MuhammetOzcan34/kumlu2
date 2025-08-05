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
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUsageAreas, setSelectedUsageAreas] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImg = useRef<HTMLImageElement>(null);
  
  const firmaLogo = useSetting('firma_logo_url');

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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .select('id, ad, tip')
        .eq('aktif', true)
        .order('sira_no');

      if (error) throw error;
      
      // Debug: Kategorileri konsola yazdır
      console.log('📋 Yüklenen kategoriler:', data);
      
      // ID'si null olan kategorileri filtrele
      const validCategories = data?.filter(cat => cat.id && cat.id !== 'unknown') || [];
      setCategories(validCategories);
      
      console.log('✅ Geçerli kategoriler:', validCategories);
    } catch (error) {
      console.error('❌ Kategoriler yüklenirken hata:', error);
      setCategories([]);
    }
  };

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

          // Save to database
          const selectedCategoryData = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
          const { error: dbError } = await supabase
            .from('fotograflar')
            .insert({
              baslik: file.name.replace(/\.[^/.]+$/, ""), // Dosya adını uzantısız olarak başlık yap
              aciklama: "", // Açıklama boş bırak
              dosya_yolu: storageData.path,
              kategori_id: selectedCategory || null,
              kategori_adi: selectedCategoryData?.ad || null,
              kullanim_alani: selectedUsageAreas.length > 0 ? selectedUsageAreas : null,
              gorsel_tipi: selectedUsageAreas.includes('referanslar') ? 'referans_logo' : 'galeri',
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
              kullanim_alani: selectedUsageAreas,
              gorsel_tipi: selectedUsageAreas.includes('referanslar') ? 'referans_logo' : 'galeri'
            });
            throw dbError;
          }
          console.log(`✅ Tamamlandı: ${fileName}`);
          
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
      setSelectedCategory('');
      setSelectedUsageAreas([]);
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
            <Label htmlFor="category">Kategori</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
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
                    id={area.id}
                    checked={selectedUsageAreas.includes(area.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsageAreas(prev => [...prev, area.id]);
                      } else {
                        setSelectedUsageAreas(prev => prev.filter(id => id !== area.id));
                      }
                    }}
                  />
                  <Label htmlFor={area.id} className="text-sm">
                    {area.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

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
            disabled={isUploading || !photos}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Yükleniyor...' : 'Fotoğrafları Yükle'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};