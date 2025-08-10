import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Save, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InstagramSettings {
  instagram_username: string;
  instagram_access_token: string;
  instagram_enabled: boolean;
  instagram_post_count: number;
  instagram_cache_duration: number;
}

export const InstagramSettingsManager = () => {
  const [settings, setSettings] = useState<InstagramSettings>({
    instagram_username: "",
    instagram_access_token: "",
    instagram_enabled: false,
    instagram_post_count: 6,
    instagram_cache_duration: 3600
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // localStorage'dan ayarları yükle
      const savedSettings = {
        instagram_username: localStorage.getItem("instagram_username") || "",
        instagram_access_token: localStorage.getItem("instagram_access_token") || "",
        instagram_enabled: localStorage.getItem("instagram_enabled") === "true",
        instagram_post_count: parseInt(localStorage.getItem("instagram_post_count") || "6"),
        instagram_cache_duration: parseInt(localStorage.getItem("instagram_cache_duration") || "3600")
      };

      setSettings(savedSettings);
    } catch (error) {
      console.error("Ayarlar yüklenirken hata:", error);
      toast({
        title: "Hata",
        description: "Ayarlar yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // localStorage'a ayarları kaydet
      localStorage.setItem("instagram_username", settings.instagram_username);
      localStorage.setItem("instagram_access_token", settings.instagram_access_token);
      localStorage.setItem("instagram_enabled", settings.instagram_enabled.toString());
      localStorage.setItem("instagram_post_count", settings.instagram_post_count.toString());
      localStorage.setItem("instagram_cache_duration", settings.instagram_cache_duration.toString());

      toast({
        title: "Başarılı",
        description: "Instagram ayarları başarıyla kaydedildi.",
      });
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testInstagramConnection = async () => {
    setTesting(true);
    try {
      // Instagram kullanıcı adını test et
      const { instagramAPI } = await import('@/api/instagram');
      const result = await instagramAPI.testConnection(settings.instagram_username);

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Instagram profili bulundu ve erişilebilir.",
        });
      } else {
        toast({
          title: "Uyarı",
          description: result.error || "Instagram profili bulunamadı. Public olduğundan emin olun.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Instagram test hatası:", error);
      toast({
        title: "Hata",
        description: "Instagram bağlantısı test edilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (key: keyof InstagramSettings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Ayarlar yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Instagram Ayarları
        </CardTitle>
        <CardDescription>
          Instagram hesabınızı bağlayın ve paylaşımlarınızı web sitenizde gösterin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instagram Bağlantı Durumu */}
        <Alert>
          <Instagram className="h-4 w-4" />
          <AlertDescription>
            Instagram entegrasyonu için sadece kullanıcı adınızı girin. 
            <strong>Önemli:</strong> Instagram profilinizin public (herkese açık) olması gerekir.
            Private hesaplar için paylaşımlar görüntülenemez.
          </AlertDescription>
        </Alert>

        {/* Instagram Kullanıcı Adı */}
        <div className="space-y-2">
          <Label htmlFor="instagram_username">Instagram Kullanıcı Adı</Label>
          <Input
            id="instagram_username"
            placeholder="ornek_kullanici"
            value={settings.instagram_username}
            onChange={(e) => handleInputChange("instagram_username", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            @ işareti olmadan kullanıcı adınızı girin
          </p>
        </div>

        {/* Instagram Access Token - Şimdilik gizli, gelecekte kullanılabilir */}
        <div className="space-y-2" style={{ display: 'none' }}>
          <Label htmlFor="instagram_access_token">Instagram Access Token</Label>
          <Input
            id="instagram_access_token"
            type="password"
            placeholder="IGQWRP..."
            value={settings.instagram_access_token}
            onChange={(e) => handleInputChange("instagram_access_token", e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Instagram Basic Display API access token'ınızı girin
          </p>
        </div>

        {/* Instagram Aktif/Pasif */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Instagram Akışını Göster</Label>
            <p className="text-sm text-muted-foreground">
              Anasayfada Instagram paylaşımlarını göster
            </p>
          </div>
          <Switch
            checked={settings.instagram_enabled}
            onCheckedChange={(checked) => handleInputChange("instagram_enabled", checked)}
          />
        </div>

        {/* Gösterilecek Post Sayısı */}
        <div className="space-y-2">
          <Label htmlFor="instagram_post_count">Gösterilecek Post Sayısı</Label>
          <Input
            id="instagram_post_count"
            type="number"
            min="1"
            max="20"
            value={settings.instagram_post_count}
            onChange={(e) => handleInputChange("instagram_post_count", parseInt(e.target.value) || 6)}
          />
          <p className="text-sm text-muted-foreground">
            Anasayfada gösterilecek maksimum post sayısı (1-20 arası)
          </p>
        </div>

        {/* Cache Süresi */}
        <div className="space-y-2">
          <Label htmlFor="instagram_cache_duration">Cache Süresi (saniye)</Label>
          <Input
            id="instagram_cache_duration"
            type="number"
            min="300"
            max="86400"
            value={settings.instagram_cache_duration}
            onChange={(e) => handleInputChange("instagram_cache_duration", parseInt(e.target.value) || 3600)}
          />
          <p className="text-sm text-muted-foreground">
            Instagram verilerinin cache'de tutulma süresi (5 dakika - 24 saat arası)
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testInstagramConnection}
            disabled={testing || !settings.instagram_username}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? "Test Ediliyor..." : "Bağlantıyı Test Et"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 