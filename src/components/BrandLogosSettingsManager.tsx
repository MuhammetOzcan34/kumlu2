import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Image, Settings, Clock, Upload, X } from "lucide-react";

// Fotoğraf arayüzünü tanımlayalım
interface Fotograf {
  id: string;
  dosya_yolu: string;
  watermark_applied: boolean;
}

export function BrandLogosSettingsManager() {
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState<number | null>(null);
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [settings, setSettings] = useState({
    brand_popup_enabled: true,
    brand_popup_title: "",
    brand_popup_description: "",
    brand_popup_duration: "3000",
    brand_logo_1_name: "",
    brand_logo_1_image: "",
    brand_logo_1_description: "",
    brand_logo_2_name: "",
    brand_logo_2_image: "",
    brand_logo_2_description: "",
    brand_logo_3_name: "",
    brand_logo_3_image: "",
    brand_logo_3_description: "",
    brand_logo_4_name: "",
    brand_logo_4_image: "",
    brand_logo_4_description: "",
    brand_logo_5_name: "",
    brand_logo_5_image: "",
    brand_logo_5_description: "",
    brand_logo_6_name: "",
    brand_logo_6_image: "",
    brand_logo_6_description: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ayarlar")
        .select("*")
        .in("anahtar", [
          "brand_popup_enabled",
          "brand_popup_title",
          "brand_popup_description", 
          "brand_popup_duration",
          "brand_logo_1_name",
          "brand_logo_1_image",
          "brand_logo_1_description",
          "brand_logo_2_name",
          "brand_logo_2_image",
          "brand_logo_2_description",
          "brand_logo_3_name",
          "brand_logo_3_image",
          "brand_logo_3_description",
          "brand_logo_4_name",
          "brand_logo_4_image",
          "brand_logo_4_description",
          "brand_logo_5_name",
          "brand_logo_5_image",
          "brand_logo_5_description",
          "brand_logo_6_name",
          "brand_logo_6_image",
          "brand_logo_6_description"
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.anahtar] = item.deger;
          return acc;
        }, {} as any);

        setSettings({
          brand_popup_enabled: settingsMap.brand_popup_enabled === "true",
          brand_popup_title: settingsMap.brand_popup_title || "",
          brand_popup_description: settingsMap.brand_popup_description || "",
          brand_popup_duration: settingsMap.brand_popup_duration || "3000",
          brand_logo_1_name: settingsMap.brand_logo_1_name || "",
          brand_logo_1_image: settingsMap.brand_logo_1_image || "",
          brand_logo_1_description: settingsMap.brand_logo_1_description || "",
          brand_logo_2_name: settingsMap.brand_logo_2_name || "",
          brand_logo_2_image: settingsMap.brand_logo_2_image || "",
          brand_logo_2_description: settingsMap.brand_logo_2_description || "",
          brand_logo_3_name: settingsMap.brand_logo_3_name || "",
          brand_logo_3_image: settingsMap.brand_logo_3_image || "",
          brand_logo_3_description: settingsMap.brand_logo_3_description || "",
          brand_logo_4_name: settingsMap.brand_logo_4_name || "",
          brand_logo_4_image: settingsMap.brand_logo_4_image || "",
          brand_logo_4_description: settingsMap.brand_logo_4_description || "",
          brand_logo_5_name: settingsMap.brand_logo_5_name || "",
          brand_logo_5_image: settingsMap.brand_logo_5_image || "",
          brand_logo_5_description: settingsMap.brand_logo_5_description || "",
          brand_logo_6_name: settingsMap.brand_logo_6_name || "",
          brand_logo_6_image: settingsMap.brand_logo_6_image || "",
          brand_logo_6_description: settingsMap.brand_logo_6_description || ""
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File, index: number) => {
    try {
      setUploadingLogo(index);
      
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Dosya boyutu 5MB'dan büyük olamaz");
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        throw new Error("Sadece resim dosyaları yüklenebilir");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `brand-logos/${Date.now()}-${index}.${fileExt}`;

      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Settings'i güncelle
      const imageKey = `brand_logo_${index}_image` as keyof typeof settings;
      setSettings(prev => ({ ...prev, [imageKey]: publicUrl }));

      toast({
        title: "Başarılı",
        description: "Logo başarıyla yüklendi.",
      });

    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Logo yüklenirken bir hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadLogo(file, index);
    }
  };

  const removeLogo = (index: number) => {
    const imageKey = `brand_logo_${index}_image` as keyof typeof settings;
    setSettings(prev => ({ ...prev, [imageKey]: "" }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);

      const settingsToSave = [
        { anahtar: "brand_popup_enabled", deger: settings.brand_popup_enabled.toString() },
        { anahtar: "brand_popup_title", deger: settings.brand_popup_title },
        { anahtar: "brand_popup_description", deger: settings.brand_popup_description },
        { anahtar: "brand_popup_duration", deger: settings.brand_popup_duration },
        { anahtar: "brand_logo_1_name", deger: settings.brand_logo_1_name },
        { anahtar: "brand_logo_1_image", deger: settings.brand_logo_1_image },
        { anahtar: "brand_logo_1_description", deger: settings.brand_logo_1_description },
        { anahtar: "brand_logo_2_name", deger: settings.brand_logo_2_name },
        { anahtar: "brand_logo_2_image", deger: settings.brand_logo_2_image },
        { anahtar: "brand_logo_2_description", deger: settings.brand_logo_2_description },
        { anahtar: "brand_logo_3_name", deger: settings.brand_logo_3_name },
        { anahtar: "brand_logo_3_image", deger: settings.brand_logo_3_image },
        { anahtar: "brand_logo_3_description", deger: settings.brand_logo_3_description },
        { anahtar: "brand_logo_4_name", deger: settings.brand_logo_4_name },
        { anahtar: "brand_logo_4_image", deger: settings.brand_logo_4_image },
        { anahtar: "brand_logo_4_description", deger: settings.brand_logo_4_description },
        { anahtar: "brand_logo_5_name", deger: settings.brand_logo_5_name },
        { anahtar: "brand_logo_5_image", deger: settings.brand_logo_5_image },
        { anahtar: "brand_logo_5_description", deger: settings.brand_logo_5_description },
        { anahtar: "brand_logo_6_name", deger: settings.brand_logo_6_name },
        { anahtar: "brand_logo_6_image", deger: settings.brand_logo_6_image },
        { anahtar: "brand_logo_6_description", deger: settings.brand_logo_6_description }
      ];

      const { error } = await supabase
        .from("ayarlar")
        .upsert(settingsToSave, { onConflict: "anahtar" });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Marka logoları ayarları kaydedildi.",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderLogoSection = (index: number) => {
    const nameKey = `brand_logo_${index}_name` as keyof typeof settings;
    const imageKey = `brand_logo_${index}_image` as keyof typeof settings;
    const descriptionKey = `brand_logo_${index}_description` as keyof typeof settings;
    const hasImage = settings[imageKey];

    return (
      <Card key={index} className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Image className="w-5 h-5 sm:w-6 sm:h-6" />
            Marka {index}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Marka Adı - Mobilde daha büyük input */}
          <div className="space-y-2">
            <Label htmlFor={`logo_${index}_name`} className="text-sm sm:text-base font-medium">
              Marka Adı
            </Label>
            <Input
              id={`logo_${index}_name`}
              value={typeof settings[nameKey] === 'string' ? settings[nameKey] : ''}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, [nameKey]: e.target.value }))
              }
              placeholder={`Marka ${index} adı`}
              className="h-12 sm:h-10 text-base sm:text-sm"
            />
          </div>

          {/* Logo Resmi - Mobilde daha büyük yükleme alanı */}
          <div className="space-y-3">
            <Label className="text-sm sm:text-base font-medium">Logo Resmi</Label>
            <div className="space-y-3">
              {/* Dosya Yükleme Alanı - Mobilde daha büyük */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 sm:p-4 min-h-[160px] sm:min-h-[120px]">
                <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-2">
                  {hasImage ? (
                    <div className="relative">
                      <img
                        src={typeof settings[imageKey] === 'string' ? settings[imageKey] : ''}
                        alt={`Marka ${index} önizleme`}
                        className="w-32 h-32 sm:w-24 sm:h-24 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-8 h-8 sm:w-6 sm:h-6 p-0 touch-manipulation"
                        onClick={() => removeLogo(index)}
                      >
                        <X className="w-4 h-4 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  ) : (
                    <Upload className="w-12 h-12 sm:w-8 sm:h-8 text-muted-foreground" />
                  )}
                  
                  <div className="text-center w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={uploadingLogo === index}
                      className="flex items-center gap-2 h-12 sm:h-10 px-6 sm:px-4 text-base sm:text-sm w-full sm:w-auto touch-manipulation"
                    >
                      {uploadingLogo === index ? (
                        <>
                          <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Yükleniyor...
                        </>
                      ) : hasImage ? (
                        <>
                          <Upload className="w-5 h-5 sm:w-4 sm:h-4" />
                          Değiştir
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 sm:w-4 sm:h-4" />
                          Logo Yükle
                        </>
                      )}
                    </Button>
                    <input
                      ref={(el) => fileInputRefs.current[index] = el}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e, index)}
                      className="hidden"
                    />
                  </div>
                  
                  {!hasImage && (
                    <p className="text-sm sm:text-xs text-muted-foreground text-center px-2">
                      PNG, JPG, GIF (max 5MB)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Açıklama - Mobilde daha büyük textarea */}
          <div className="space-y-2">
            <Label htmlFor={`logo_${index}_description`} className="text-sm sm:text-base font-medium">
              Açıklama
            </Label>
            <Textarea
              id={`logo_${index}_description`}
              value={typeof settings[descriptionKey] === 'string' ? settings[descriptionKey] : ''}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, [descriptionKey]: e.target.value }))
              }
              placeholder={`Marka ${index} açıklaması`}
              className="min-h-[80px] sm:min-h-[60px] text-base sm:text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pop-up Ayarları */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Settings className="w-6 h-6 sm:w-5 sm:h-5" />
            Pop-up Ayarları
          </CardTitle>
          <CardDescription className="text-base sm:text-sm mt-2">
            Cam Kumlama sayfasında görünecek marka logoları pop-up'ını yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
          {/* Pop-up Aktif/Pasif */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 p-4 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none">
            <div className="space-y-1">
              <Label className="text-base sm:text-base font-medium">Pop-up Aktif</Label>
              <p className="text-sm text-muted-foreground">
                Cam Kumlama sayfasında pop-up'ı göster/gizle
              </p>
            </div>
            <Switch
              checked={settings.brand_popup_enabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, brand_popup_enabled: checked }))
              }
              className="scale-125 sm:scale-100"
            />
          </div>

          {/* Pop-up Başlığı */}
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="popup_title" className="text-base font-medium">
              Pop-up Başlığı
            </Label>
            <Input
              id="popup_title"
              value={typeof settings.brand_popup_title === 'string' ? settings.brand_popup_title : ''}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, brand_popup_title: e.target.value }))
              }
              placeholder="Kullandığımız Markalar"
              className="h-12 sm:h-10 text-base sm:text-sm"
            />
          </div>

          {/* Pop-up Açıklaması */}
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="popup_description" className="text-base font-medium">
              Pop-up Açıklaması
            </Label>
            <Textarea
              id="popup_description"
              value={typeof settings.brand_popup_description === 'string' ? settings.brand_popup_description : ''}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, brand_popup_description: e.target.value }))
              }
              placeholder="Kaliteli hizmet için tercih ettiğimiz markalar"
              className="min-h-[100px] sm:min-h-[60px] text-base sm:text-sm resize-none"
            />
          </div>

          {/* Pop-up Süresi */}
          <div className="space-y-3 sm:space-y-2">
            <Label htmlFor="popup_duration" className="text-base font-medium">
              Pop-up Süresi (milisaniye)
            </Label>
            <div className="flex items-center gap-3 sm:gap-2">
              <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              <Input
                id="popup_duration"
                type="number"
                value={typeof settings.brand_popup_duration === 'string' ? settings.brand_popup_duration : ''}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, brand_popup_duration: e.target.value }))
                }
                placeholder="3000"
                min="1000"
                max="10000"
                className="h-12 sm:h-10 text-base sm:text-sm"
              />
            </div>
            <p className="text-sm text-muted-foreground px-2 sm:px-0">
              Pop-up'ın kaç milisaniye sonra otomatik kapanacağı (1000ms = 1 saniye)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Marka Logoları */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Image className="w-6 h-6 sm:w-5 sm:h-5" />
            Marka Logoları
          </CardTitle>
          <CardDescription className="text-base sm:text-sm mt-2">
            6 adet marka logosu ve açıklamalarını yapılandırın. Logoları yükleyerek ekleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {/* Mobilde tek sütun, desktop'ta iki sütun */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(renderLogoSection)}
          </div>
        </CardContent>
      </Card>

      {/* Kaydet Butonu */}
      <div className="flex justify-center sm:justify-end px-4 sm:px-0">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="w-full sm:w-auto min-w-[120px] h-12 sm:h-10 text-base sm:text-sm font-medium"
          size="lg"
        >
          {loading ? (
            <>
              <div className="mr-2 h-5 w-5 sm:h-4 sm:w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5 sm:h-4 sm:w-4" />
              Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
