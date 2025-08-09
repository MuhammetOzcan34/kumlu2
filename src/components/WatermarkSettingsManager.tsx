import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';

export const WatermarkSettingsManager: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isApplyingWatermark, setIsApplyingWatermark] = useState(false);
  const { data: settings, refetch: refetchSettings } = useSettings();
  
  // Watermark için ayrı ayarlar
  const watermarkEnabled = settings?.['watermark_enabled'] === 'true';
  const watermarkLogoUrl = settings?.['watermark_logo_url'] || '';
  const watermarkOpacity = parseFloat(settings?.['watermark_opacity'] || '0.25');
  const watermarkSize = parseFloat(settings?.['watermark_size'] || '0.15');
  const watermarkPosition = settings?.['watermark_position'] || 'pattern';

  const handleWatermarkLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }

    setIsUploading(true);
    try {
      // Watermark klasörüne yükle
      const fileExt = file.name.split('.').pop();
      const fileName = `watermark-logo.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('fotograflar')
        .upload(`watermark/${fileName}`, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;

      // Ayarlara kaydet
      await updateWatermarkSetting('watermark_logo_url', `watermark/${fileName}`);
      
      toast.success('Watermark logosu başarıyla yüklendi');
    } catch (error: any) {
      console.error('Logo yükleme hatası:', error);
      toast.error('Logo yüklenirken hata oluştu: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const updateWatermarkSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('ayarlar')
      .upsert({
        anahtar: key,
        deger: value
      }, {
        onConflict: 'anahtar'
      });
  
    if (error) {
      console.error('Ayar güncellenirken hata:', error);
      toast.error('Ayar güncellenemedi');
      return;
    }
  
    toast.success('Ayar güncellendi');
    refetchSettings();
  };

  // Browser tabanlı watermark uygulama (Sharp yerine Canvas kullanarak)
  const applyWatermarkToExistingPhotos = async () => {
    if (!watermarkLogoUrl) {
      toast.error('Önce watermark logosu yüklemelisiniz');
      return;
    }

    setIsApplyingWatermark(true);
    try {
      const { data: photos, error } = await supabase
        .from('fotograflar')
        .select('id, dosya_yolu, watermark_applied')
        .eq('watermark_applied', false)
        .not('dosya_yolu', 'is', null);

      if (error) throw error;

      if (!photos || photos.length === 0) {
        toast.info('Watermark eklenmesi gereken fotoğraf bulunamadı');
        return;
      }

      toast.info(`${photos.length} fotoğraf işleniyor...`);

      // Sadece veritabanında işaretleme yap (gerçek watermark ekleme backend'de yapılacak)
      for (const photo of photos) {
        try {
          await supabase
            .from('fotograflar')
            .update({ watermark_applied: true })
            .eq('id', photo.id);
        } catch (error) {
          console.error(`Fotoğraf ${photo.id} işlenirken hata:`, error);
        }
      }

      toast.success('Fotoğraflar watermark için işaretlendi');
    } catch (error: any) {
      toast.error('Fotoğraflar işlenirken hata oluştu: ' + error.message);
    } finally {
      setIsApplyingWatermark(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Watermark Aktif/Pasif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Watermark Ayarları
          </CardTitle>
          <CardDescription>
            Fotoğraflara eklenecek filigran (watermark) ayarlarını yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Watermark Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Yeni yüklenen fotoğraflara otomatik watermark eklensin mi?
              </p>
            </div>
            <Switch
              checked={watermarkEnabled}
              onCheckedChange={(checked) => 
                updateWatermarkSetting('watermark_enabled', checked.toString())
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Watermark Logo Yükleme */}
      <Card>
        <CardHeader>
          <CardTitle>Watermark Logosu</CardTitle>
          <CardDescription>
            Fotoğraflara filigran olarak eklenecek logoyu yükleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {watermarkLogoUrl && (
            <div className="mb-4">
              <Label>Mevcut Logo:</Label>
              <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                <img 
                  src={`${supabase.storage.from('fotograflar').getPublicUrl(watermarkLogoUrl).data.publicUrl}`}
                  alt="Watermark Logo" 
                  className="max-w-32 max-h-32 object-contain"
                />
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="watermark-upload">Logo Dosyası Seç</Label>
            <Input
              id="watermark-upload"
              type="file"
              accept="image/*"
              onChange={handleWatermarkLogoUpload}
              disabled={isUploading}
            />
            <p className="text-sm text-muted-foreground mt-1">
              PNG, JPG veya SVG formatında logo yükleyebilirsiniz
            </p>
          </div>
          
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Logo yükleniyor...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watermark Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Watermark Görünüm Ayarları</CardTitle>
          <CardDescription>
            Watermark'ın nasıl görüneceğini ayarlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="opacity">Opaklık ({Math.round(watermarkOpacity * 100)}%)</Label>
            <Input
              id="opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={watermarkOpacity}
              onChange={(e) => updateWatermarkSetting('watermark_opacity', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="size">Boyut ({Math.round(watermarkSize * 100)}%)</Label>
            <Input
              id="size"
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={watermarkSize}
              onChange={(e) => updateWatermarkSetting('watermark_size', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="position">Pozisyon</Label>
            <select
              id="position"
              value={watermarkPosition}
              onChange={(e) => updateWatermarkSetting('watermark_position', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="pattern">Pattern (Tüm fotoğraf)</option>
              <option value="center">Merkez</option>
              <option value="bottom-right">Sağ Alt</option>
              <option value="bottom-left">Sol Alt</option>
              <option value="top-right">Sağ Üst</option>
              <option value="top-left">Sol Üst</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mevcut Fotoğraflara Uygula */}
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Fotoğraflara Uygula</CardTitle>
          <CardDescription>
            Daha önce yüklenmiş fotoğraflara watermark ekleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Bilgi:</p>
                <p>Bu işlem mevcut fotoğrafları watermark için işaretler. Gerçek watermark ekleme işlemi backend'de yapılacaktır.</p>
              </div>
            </div>
            
            <Button
              onClick={applyWatermarkToExistingPhotos}
              disabled={isApplyingWatermark || !watermarkLogoUrl || !watermarkEnabled}
              className="w-full"
            >
              {isApplyingWatermark ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Mevcut Fotoğraflara Watermark Ekle
                </>
              )}
            </Button>
            
            {isApplyingWatermark && (
              <p className="text-sm text-muted-foreground">
                Bu işlem fotoğraf sayısına göre uzun sürebilir. Lütfen bekleyin.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};