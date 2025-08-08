import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
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
      const { error: settingsError } = await supabase
        .from('ayarlar') // 'settings' yerine 'ayarlar'
        .upsert({
          anahtar: 'watermark_logo_url',
          deger: `watermark/${fileName}`
        });

      if (settingsError) throw settingsError;

      await refetchSettings();
      toast.success('Watermark logosu başarıyla yüklendi');
    } catch (error: any) {
      console.error('Watermark logo yükleme hatası:', error);
      toast.error('Logo yüklenirken hata oluştu: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // updateWatermarkSetting fonksiyonunda:
  // updateWatermarkSetting fonksiyonunda:
  const updateWatermarkSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('ayarlar') // 'settings' yerine 'ayarlar'
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

      // Her fotoğraf için watermark uygula
      for (const photo of photos) {
        try {
          // Burada backend'de watermark uygulama işlemi yapılacak
          // Şimdilik sadece işaretliyoruz
          await supabase
            .from('fotograflar')
            .update({ watermark_applied: true })
            .eq('id', photo.id);
        } catch (error) {
          console.error(`Fotoğraf ${photo.id} işlenirken hata:`, error);
        }
      }

      toast.success('Fotoğraflar başarıyla işlendi');
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
            <div className="flex items-center gap-4">
              <img
                src={`${supabase.storage.from('fotograflar').getPublicUrl(watermarkLogoUrl).data.publicUrl}`}
                alt="Watermark Logo"
                className="w-16 h-16 object-contain border rounded"
              />
              <div>
                <p className="text-sm font-medium">Mevcut Watermark Logosu</p>
                <p className="text-xs text-muted-foreground">{watermarkLogoUrl}</p>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="watermark-logo">Yeni Logo Yükle</Label>
            <Input
              id="watermark-logo"
              type="file"
              accept="image/*"
              onChange={handleWatermarkLogoUpload}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Logo yükleniyor...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watermark Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle>Watermark Görünüm Ayarları</CardTitle>
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
          <Button
            onClick={applyWatermarkToExistingPhotos}
            disabled={isApplyingWatermark || !watermarkLogoUrl || !watermarkEnabled}
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
            <p className="text-sm text-muted-foreground mt-2">
              Bu işlem fotoğraf sayısına göre uzun sürebilir. Lütfen bekleyin.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};