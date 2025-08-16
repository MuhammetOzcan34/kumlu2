import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Save, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

interface InstagramSettings {
  instagram_enabled: boolean;
  instagram_widget_type: 'elfsight' | 'api';
  elfsight_widget_id: string;
  elfsight_widget_code: string;
  instagram_username: string;
  instagram_access_token: string;
  instagram_post_count: number;
  instagram_cache_duration: number;
}

export const InstagramSettingsManager = () => {
  const [settings, setSettings] = useState<InstagramSettings>({
    instagram_enabled: false,
    instagram_widget_type: 'elfsight',
    elfsight_widget_id: '',
    elfsight_widget_code: '',
    instagram_username: "",
    instagram_access_token: "",
    instagram_post_count: 6,
    instagram_cache_duration: 3600
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // localStorage'dan ayarları yükle
      const savedSettings = {
        instagram_enabled: localStorage.getItem("instagram_enabled") === "true",
        instagram_widget_type: (localStorage.getItem("instagram_widget_type") as 'elfsight' | 'api') || 'elfsight',
        elfsight_widget_id: localStorage.getItem("elfsight_widget_id") || "",
        elfsight_widget_code: localStorage.getItem("elfsight_widget_code") || "",
        instagram_username: localStorage.getItem("instagram_username") || "",
        instagram_access_token: localStorage.getItem("instagram_access_token") || "",
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
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      // localStorage'a ayarları kaydet
      localStorage.setItem("instagram_enabled", settings.instagram_enabled.toString());
      localStorage.setItem("instagram_widget_type", settings.instagram_widget_type);
      localStorage.setItem("elfsight_widget_id", settings.elfsight_widget_id);
      localStorage.setItem("elfsight_widget_code", settings.elfsight_widget_code);
      localStorage.setItem("instagram_username", settings.instagram_username);
      localStorage.setItem("instagram_access_token", settings.instagram_access_token);
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
      if (settings.instagram_widget_type === 'elfsight') {
        if (settings.elfsight_widget_id) {
          toast({
            title: "Başarılı",
            description: "Elfsight widget ID'si geçerli görünüyor.",
          });
        } else {
          toast({
            title: "Uyarı",
            description: "Elfsight widget ID'si boş.",
            variant: "destructive",
          });
        }
      } else {
        // Instagram Access Token'ı test et
        const { instagramAPI } = await import('@/api/instagram');
        const result = await instagramAPI.testConnection(settings.instagram_access_token);

        if (result.success) {
          toast({
            title: "Başarılı",
            description: "Instagram Access Token geçerli ve çalışıyor.",
          });
        } else {
          toast({
            title: "Uyarı",
            description: result.error || "Access Token geçersiz veya süresi dolmuş.",
            variant: "destructive",
          });
        }
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

  const extractWidgetIdFromCode = (code: string) => {
    const match = code.match(/elfsight-app-([a-f0-9-]+)/);
    return match ? match[1] : '';
  };

  const handleWidgetCodeChange = (code: string) => {
    setSettings(prev => ({
      ...prev,
      elfsight_widget_code: code,
      elfsight_widget_id: extractWidgetIdFromCode(code)
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

        {/* Widget Tipi Seçimi */}
        <div className="space-y-2">
          <Label>Instagram Widget Tipi</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="widget_type"
                value="elfsight"
                checked={settings.instagram_widget_type === 'elfsight'}
                onChange={(e) => handleInputChange("instagram_widget_type", e.target.value as 'elfsight' | 'api')}
              />
              <span>Elfsight Widget (Önerilen)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="widget_type"
                value="api"
                checked={settings.instagram_widget_type === 'api'}
                onChange={(e) => handleInputChange("instagram_widget_type", e.target.value as 'elfsight' | 'api')}
              />
              <span>Instagram API</span>
            </label>
          </div>
        </div>

        {/* Elfsight Widget Ayarları */}
        {settings.instagram_widget_type === 'elfsight' && (
          <>
            <Alert>
              <Instagram className="h-4 w-4" />
              <AlertDescription>
                Elfsight Instagram widget'ı kullanmak için önce 
                <a href="https://elfsight.com/instagram-feed-widget/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                  Elfsight'tan widget oluşturun <ExternalLink className="h-3 w-3 inline" />
                </a>
                , ardından widget kodunu aşağıya yapıştırın.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="elfsight_widget_code">Elfsight Widget Kodu</Label>
              <Textarea
                id="elfsight_widget_code"
                placeholder='<script src="https://elfsightcdn.com/platform.js" async></script>&#10;<div class="elfsight-app-ceb9bc2a-4498-4028-a58c-e80ff515a0b5" data-elfsight-app-lazy></div>'
                value={settings.elfsight_widget_code}
                onChange={(e) => handleWidgetCodeChange(e.target.value)}
                className="min-h-[100px] font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Elfsight'tan aldığınız tam widget kodunu buraya yapıştırın
              </p>
            </div>

            {settings.elfsight_widget_id && (
              <div className="space-y-2">
                <Label>Widget ID (Otomatik Algılandı)</Label>
                <Input
                  value={settings.elfsight_widget_id}
                  readOnly
                  className="bg-muted"
                />
              </div>
            )}
          </>
        )}

        {/* Instagram API Ayarları */}
        {settings.instagram_widget_type === 'api' && (
          <>
            <Alert>
              <Instagram className="h-4 w-4" />
              <AlertDescription>
                Instagram API entegrasyonu için kullanıcı adınızı girin. 
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

            {/* Instagram Access Token */}
            <div className="space-y-2">
              <Label htmlFor="instagram_access_token">Instagram Access Token</Label>
              <Input
                id="instagram_access_token"
                type="password"
                placeholder="IGQWRP..."
                value={settings.instagram_access_token}
                onChange={(e) => handleInputChange("instagram_access_token", e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Instagram Basic Display API access token'ınızı girin. 
                <a href="#" className="text-primary hover:underline ml-1" onClick={() => window.alert('Token alma adımları için talimatları takip edin.')}>
                  Token nasıl alınır?
                </a>
              </p>
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
          </>
        )}

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
            disabled={testing || (settings.instagram_widget_type === 'api' && !settings.instagram_access_token) || (settings.instagram_widget_type === 'elfsight' && !settings.elfsight_widget_id)}
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