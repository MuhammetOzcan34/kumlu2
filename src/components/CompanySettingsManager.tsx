import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Building, Save, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface CompanySettings {
  firma_adi: string;
  firma_website: string;
  firma_telefon: string;
  firma_email: string;
  firma_adres: string;
  firma_logo_url: string;
}

export const CompanySettingsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<CompanySettings>({
    firma_adi: '',
    firma_website: '',
    firma_telefon: '',
    firma_email: '',
    firma_adres: '',
    firma_logo_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('ayarlar')
        .select('anahtar, deger')
        .in('anahtar', ['firma_adi', 'firma_website', 'firma_telefon', 'firma_email', 'firma_adres', 'firma_logo_url']);

      if (error) throw error;

      const settingsMap: any = {};
      data.forEach(item => {
        settingsMap[item.anahtar] = item.deger || '';
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Firma bilgileri yüklenirken hata:', error);
      toast.error('Firma bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const fileName = `company-logo-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('fotograflar')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (error) throw error;

      return data.path;
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let logoUrl = settings.firma_logo_url;

      // Yeni logo yüklendi ise önce onu yükle
      if (logoFile) {
        const logoPath = await handleLogoUpload(logoFile);
        logoUrl = `https://aqewamsbifugrevmoiqj.supabase.co/storage/v1/object/public/fotograflar/${logoPath}`;
        setLogoFile(null);
      }

      // Tüm ayarları güncelle
      const updates = [];
      for (const [key, value] of Object.entries(settings)) {
        if (key === 'firma_logo_url') {
          updates.push({
            anahtar: key,
            deger: logoUrl,
            aciklama: 'Firma logo dosya yolu'
          });
        } else {
          updates.push({
            anahtar: key,
            deger: value,
            aciklama: getSettingDescription(key)
          });
        }
      }

      // Batch upsert işlemi
      for (const update of updates) {
        const { error } = await supabase
          .from('ayarlar')
          .upsert(update, { 
            onConflict: 'anahtar'
          });

        if (error) throw error;
      }

      // State'i güncelle
      setSettings(prev => ({
        ...prev,
        firma_logo_url: logoUrl
      }));

      toast.success('Firma bilgileri başarıyla kaydedildi');
      
      // Invalidate settings cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      console.log('🔄 Settings cache invalidated');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      toast.error('Firma bilgileri kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      firma_adi: 'Firma adı',
      firma_website: 'Firma website adresi',
      firma_telefon: 'Firma telefon numarası',
      firma_email: 'Firma e-posta adresi',
      firma_adres: 'Firma adresi',
      firma_logo_url: 'Firma logo dosya yolu'
    };
    return descriptions[key] || '';
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
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Firma Bilgileri
        </CardTitle>
        <CardDescription>
          Firma profilinizi yönetin. Bu bilgiler fotoğraflara ve web sitesinde görünecektir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firma_adi">Firma Adı *</Label>
            <Input
              id="firma_adi"
              value={settings.firma_adi}
              onChange={(e) => handleInputChange('firma_adi', e.target.value)}
              placeholder="Firma adınızı girin"
            />
          </div>

          <div>
            <Label htmlFor="firma_email">E-posta *</Label>
            <Input
              id="firma_email"
              type="email"
              value={settings.firma_email}
              onChange={(e) => handleInputChange('firma_email', e.target.value)}
              placeholder="info@firmaniz.com"
            />
          </div>

          <div>
            <Label htmlFor="firma_telefon">Telefon</Label>
            <Input
              id="firma_telefon"
              value={settings.firma_telefon}
              onChange={(e) => handleInputChange('firma_telefon', e.target.value)}
              placeholder="+90 (xxx) xxx xx xx"
            />
          </div>

          <div>
            <Label htmlFor="firma_website">Website</Label>
            <Input
              id="firma_website"
              value={settings.firma_website}
              onChange={(e) => handleInputChange('firma_website', e.target.value)}
              placeholder="www.firmaniz.com"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="firma_adres">Adres</Label>
          <Textarea
            id="firma_adres"
            value={settings.firma_adres}
            onChange={(e) => handleInputChange('firma_adres', e.target.value)}
            placeholder="Firma adresinizi girin"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="logo">Firma Logosu</Label>
          <div className="space-y-4">
            {/* Current Logo Display */}
            {settings.firma_logo_url && (
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <img 
                  src={settings.firma_logo_url.startsWith('http') 
                    ? settings.firma_logo_url 
                    : `https://aqewamsbifugrevmoiqj.supabase.co/storage/v1/object/public/fotograflar/${settings.firma_logo_url}`
                  }
                  alt="Mevcut Logo" 
                  className="h-16 w-16 object-contain border rounded"
                  onError={(e) => {
                    console.error('Logo yükleme hatası:', settings.firma_logo_url);
                    e.currentTarget.src = '';
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Mevcut Logo</p>
                  <p className="text-xs text-muted-foreground">{settings.firma_logo_url}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange('firma_logo_url', '')}
                >
                  Kaldır
                </Button>
              </div>
            )}
            
            {/* Logo Upload */}
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setLogoFile(file);
              }}
            />
            
            {logoFile && (
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="h-16 w-16 bg-muted rounded border flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">Yeni Logo Seçildi</p>
                  <p className="text-xs text-muted-foreground">{logoFile.name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoFile(null)}
                >
                  İptal
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-32"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};