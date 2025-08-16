import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, MessageCircle, Phone, Settings } from "lucide-react";

export function WhatsAppSettingsManager() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    whatsapp_enabled: true,
    whatsapp_number: "",
    whatsapp_default_message: "",
    whatsapp_widget_text: "",
    whatsapp_business_hours: "",
    whatsapp_response_time: ""
  });
  const { toast } = useToast();

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ayarlar")
        .select("*")
        .in("anahtar", [
          "whatsapp_enabled",
          "whatsapp_number", 
          "whatsapp_default_message",
          "whatsapp_widget_text",
          "whatsapp_business_hours",
          "whatsapp_response_time"
        ]);

      if (error) throw error;

      if (data) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.anahtar] = item.deger;
          return acc;
        }, {} as Record<string, string>);

        setSettings({
          whatsapp_enabled: settingsMap.whatsapp_enabled === "true",
          whatsapp_number: settingsMap.whatsapp_number || "",
          whatsapp_default_message: settingsMap.whatsapp_default_message || "",
          whatsapp_widget_text: settingsMap.whatsapp_widget_text || "",
          whatsapp_business_hours: settingsMap.whatsapp_business_hours || "",
          whatsapp_response_time: settingsMap.whatsapp_response_time || ""
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    try {
      setLoading(true);

      const settingsToSave = [
        { anahtar: "whatsapp_enabled", deger: settings.whatsapp_enabled.toString() },
        { anahtar: "whatsapp_number", deger: settings.whatsapp_number },
        { anahtar: "whatsapp_default_message", deger: settings.whatsapp_default_message },
        { anahtar: "whatsapp_widget_text", deger: settings.whatsapp_widget_text },
        { anahtar: "whatsapp_business_hours", deger: settings.whatsapp_business_hours },
        { anahtar: "whatsapp_response_time", deger: settings.whatsapp_response_time }
      ];

      // Upsert all settings
      const { error } = await supabase
        .from("ayarlar")
        .upsert(settingsToSave, { onConflict: "anahtar" });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "WhatsApp ayarları kaydedildi.",
      });
    } catch (error: unknown) {
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu: " + (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Tüm rakam olmayan karakterleri temizle
    const cleaned = value.replace(/\D/g, "");
    
    // Türkiye telefon numarası formatı (+90 5XX XXX XX XX)
    if (cleaned.length === 0) {
      return "";
    }
    
    // Eğer 90 ile başlıyorsa (ülke kodu varsa)
    if (cleaned.startsWith('90')) {
      const withoutCountryCode = cleaned.substring(2);
      if (withoutCountryCode.length <= 3) {
        return `+90 ${withoutCountryCode}`;
      } else if (withoutCountryCode.length <= 6) {
        return `+90 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3)}`;
      } else if (withoutCountryCode.length <= 8) {
        return `+90 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3, 6)} ${withoutCountryCode.slice(6)}`;
      } else {
        return `+90 ${withoutCountryCode.slice(0, 3)} ${withoutCountryCode.slice(3, 6)} ${withoutCountryCode.slice(6, 8)} ${withoutCountryCode.slice(8, 10)}`;
      }
    }
    
    // Eğer 0 ile başlıyorsa 0'ı kaldır
    const phoneNumber = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
    
    // Türk cep telefonu formatı (5XX XXX XX XX)
    if (phoneNumber.length <= 3) {
      return `+90 ${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `+90 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    } else if (phoneNumber.length <= 8) {
      return `+90 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6)}`;
    } else {
      return `+90 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setSettings(prev => ({ ...prev, whatsapp_number: formatted }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            WhatsApp İletişim Ayarları
          </CardTitle>
          <CardDescription>
            WhatsApp widget'ı ve iletişim ayarlarını yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Widget Aktif/Pasif */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">WhatsApp Widget'ı</Label>
              <p className="text-sm text-muted-foreground">
                Sitenizde WhatsApp iletişim butonunu göster/gizle
              </p>
            </div>
            <Switch
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, whatsapp_enabled: checked }))
              }
            />
          </div>

          {/* WhatsApp Numarası */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number" className="text-base font-medium">
              WhatsApp Numarası
            </Label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <Input
                id="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                maxLength={13}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              WhatsApp numaranızı Türkiye formatında girin (örn: +90 555 123 45 67 veya 0555 123 45 67)
            </p>
          </div>

          {/* Varsayılan Mesaj */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_default_message" className="text-base font-medium">
              Varsayılan Mesaj
            </Label>
            <Textarea
              id="whatsapp_default_message"
              value={settings.whatsapp_default_message}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, whatsapp_default_message: e.target.value }))
              }
              placeholder="Hızlı iletişim için varsayılan mesaj metni..."
              className="min-h-[80px]"
            />
            <p className="text-sm text-muted-foreground">
              Kullanıcılar hızlı iletişim butonuna tıkladığında gönderilecek mesaj
            </p>
          </div>

          {/* Widget Metni */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_widget_text" className="text-base font-medium">
              Widget Buton Metni
            </Label>
            <Input
              id="whatsapp_widget_text"
              value={settings.whatsapp_widget_text}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, whatsapp_widget_text: e.target.value }))
              }
              placeholder="WhatsApp ile iletişime geçin"
            />
            <p className="text-sm text-muted-foreground">
              WhatsApp butonunda görünecek metin (boş bırakılırsa varsayılan kullanılır)
            </p>
          </div>

          {/* Çalışma Saatleri */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_business_hours" className="text-base font-medium">
              Çalışma Saatleri
            </Label>
            <Input
              id="whatsapp_business_hours"
              value={settings.whatsapp_business_hours}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, whatsapp_business_hours: e.target.value }))
              }
              placeholder="Pazartesi - Cuma: 09:00 - 18:00"
            />
            <p className="text-sm text-muted-foreground">
              Müşterilerinize göstermek istediğiniz çalışma saatleri
            </p>
          </div>

          {/* Yanıt Süresi */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp_response_time" className="text-base font-medium">
              Yanıt Süresi
            </Label>
            <Input
              id="whatsapp_response_time"
              value={settings.whatsapp_response_time}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, whatsapp_response_time: e.target.value }))
              }
              placeholder="Genellikle 5 dakika içinde yanıt veririz"
            />
            <p className="text-sm text-muted-foreground">
              Müşterilerinize bildirmek istediğiniz yanıt süresi
            </p>
          </div>

          {/* Kaydet Butonu */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Önizleme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Önizleme
          </CardTitle>
          <CardDescription>
            WhatsApp widget'ının nasıl görüneceğini kontrol edin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {settings.whatsapp_widget_text || "WhatsApp ile iletişime geçin"}
                </p>
                {settings.whatsapp_business_hours && (
                  <p className="text-xs text-muted-foreground">
                    {settings.whatsapp_business_hours}
                  </p>
                )}
              </div>
            </div>
            
            {settings.whatsapp_response_time && (
              <p className="text-xs text-muted-foreground">
                ⏱️ {settings.whatsapp_response_time}
              </p>
            )}
            
            <div className="text-xs text-muted-foreground">
              <strong>Varsayılan Mesaj:</strong> {settings.whatsapp_default_message || "Henüz ayarlanmamış"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}