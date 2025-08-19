import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from "@supabase/supabase-js";
import { LogoDisplay } from "@/components/LogoDisplay";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { KampanyaForm } from "@/components/KampanyaForm";
import { HesaplamaUrunleriManager } from "@/components/HesaplamaUrunleriManager";
import { ServisBedelleriManager } from "@/components/ServisBedelleriManager";
import { PhotoUploadManager } from "@/components/PhotoUploadManager";
import { PhotoGalleryManager } from "@/components/PhotoGalleryManager";
import { CompanySettingsManager } from "@/components/CompanySettingsManager";
import { CategoryManager } from "@/components/CategoryManager";
import VideoGaleriManager from "@/components/VideoGaleriManager";
import { WhatsAppSettingsManager } from "@/components/WhatsAppSettingsManager";
import { BrandLogosSettingsManager } from "@/components/BrandLogosSettingsManager";
import { InstagramSettingsManager } from "@/components/InstagramSettingsManager";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { WatermarkSettingsManager } from '@/components/WatermarkSettingsManager';

function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Oturum kontrolü - ProtectedRoute tarafından yönetiliyor
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        loadUserProfile(session.user.id);
      }
    });

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Profil yükleme hatası:", error);
        setLoading(false);
        return;
      }

      setProfile(data);
      
      // ProtectedRoute zaten admin kontrolü yapıyor, doğrudan verileri yükle
      await loadAdminData();
      setLoading(false);
    } catch (error) {
      console.error("Profil yükleme hatası:", error);
      setLoading(false);
    }
  };
  
  // Tip tanımlamaları
  interface Kategori {
    id: string;
    ad: string;
    sira_no: number;
  }

  interface Fotograf {
    id: string;
    baslik: string | null;
    aciklama: string | null;
    dosya_yolu: string;
    kategori_id: string | null;
    kategori_adi: string | null;
    kullanim_alani: string[] | null;
    aktif: boolean | null;
    created_at: string;
    updated_at: string;
    boyut: number | null;
    gorsel_tipi: string | null;
    logo_eklendi: boolean | null;
    watermark_applied: boolean | null;
    sira_no: number | null;
    thumbnail_yolu: string | null;
    mime_type: string | null;
  }

  interface Ayar {
    id: string;
    anahtar: string;
    deger: string;
  }

  interface Kampanya {
    id: string;
    kampanya_adi: string;
    platform: string;
    durum: string;
    butce_gunluk: number;
    butce_toplam: number;
    kategori_id: string;
    baslangic_tarihi: string;
    bitis_tarihi: string;
    hedef_url: string;
    reklam_metni: string;
    kategoriler?: {
      ad: string;
    };
    created_at: string;
    updated_at?: string;
  }


  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [fotograflar, setFotograflar] = useState<Fotograf[]>([]);
  const [ayarlar, setAyarlar] = useState<Ayar[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  const [showKampanyaForm, setShowKampanyaForm] = useState(false);
  const [editingKampanya, setEditingKampanya] = useState<Kampanya | null>(null);
  const [activeTab, setActiveTab] = useState("kampanyalar");
  const { toast } = useToast();



  // Admin verileri profil yüklendiğinde loadUserProfile içinde yükleniyor

  const loadAdminData = async () => {
    try {
      // Kategorileri yükle
      const kategorilerRes = await supabase.from("kategoriler").select("*").order("sira_no");
      if (kategorilerRes.error) throw kategorilerRes.error;
      setKategoriler(kategorilerRes.data || []);
      
      // Fotoğrafları yükle
      const fotograflarRes = await supabase.from("fotograflar").select("*").order("sira_no");
      if (fotograflarRes.error) throw fotograflarRes.error;
      setFotograflar(fotograflarRes.data || []);
      
      // Ayarları yükle
      const ayarlarRes = await supabase.from("ayarlar").select("*").order("anahtar");
      if (ayarlarRes.error) throw ayarlarRes.error;
      setAyarlar(ayarlarRes.data || []);
      
      // Kampanyaları yükle
      const kampanyalarRes = await supabase.from("reklam_kampanyalari").select(`
        *,
        kategoriler(ad)
      `).order("created_at", { ascending: false });
      if (kampanyalarRes.error) throw kampanyalarRes.error;
      setKampanyalar(kampanyalarRes.data || []);
      
    } catch (error) {
      console.error("Admin verileri yükleme hatası:", error);
      toast({
        title: "Veri Yükleme Hatası",
        description: "Admin verileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleKampanyaSubmit = () => {
    loadAdminData();
    setEditingKampanya(null);
  };

  const handleKampanyaDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reklam_kampanyalari")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Kampanya silindi" });
      loadAdminData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getPlatformBadge = (platform: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      google_ads: "default",
      instagram: "secondary", 
      facebook: "destructive"
    };
    return variants[platform] || "default";
  };

  const getDurumBadge = (durum: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      aktif: "default",
      taslak: "secondary",
      duraklatildi: "destructive",
      tamamlandi: "secondary"
    };
    return variants[durum] || "secondary";
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
      
      navigate("/auth");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Çıkış sırasında bir hata oluştu';
      toast({
        title: "Çıkış hatası",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erişim Reddedildi</CardTitle>
            <CardDescription>
              Bu sayfaya erişim için giriş yapmanız gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Yetkisiz Erişim</CardTitle>
            <CardDescription>
              Bu sayfaya erişim için admin yetkisine sahip olmanız gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobil görünüm - Küçük ekranlar için tam layout */}
      <div className="lg:hidden">
        {/* Mobil Hamburger Menü */}
        <HamburgerMenu />
        
        <div className="p-2 sm:p-4 pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Mobil Başlık */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Yönetim Paneli</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Hoş geldiniz, {user.email}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => navigate("/")} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  Ana Sayfa
                </Button>
                <Button variant="outline" onClick={handleSignOut} className="flex-1 sm:flex-none text-xs sm:text-sm">
                  Çıkış Yap
                </Button>
              </div>
            </div>

            {/* Mobil Sekmeler */}
            <div className="mb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-1 gap-2 h-auto p-3 bg-muted/50">
                  <div className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="kampanyalar" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Kampanyalar</TabsTrigger>
                    <TabsTrigger value="kategoriler" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Kategoriler</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="fotograflar" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Fotoğraflar</TabsTrigger>
                    <TabsTrigger value="video-galeri" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Videolar</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="ayarlar" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Ayarlar</TabsTrigger>
                    <TabsTrigger value="hesaplama" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Hesaplama</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="whatsapp" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">WhatsApp</TabsTrigger>
                    <TabsTrigger value="servis-bedelleri" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Servis Bedelleri</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <TabsTrigger value="instagram" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Instagram</TabsTrigger>
                    <TabsTrigger value="marka-logolari" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Marka Logoları</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-2 gap-2">

                    <TabsTrigger value="watermark" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Watermark</TabsTrigger>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <TabsTrigger value="profil" className="text-sm px-4 py-3 h-12 font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">Profil Bilgileri</TabsTrigger>
                  </div>
                </TabsList>
              </Tabs>
            </div>

            {/* Mobil İçerik */}
            <div className="space-y-6">
              {activeTab === "kampanyalar" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Reklam Kampanyaları</CardTitle>
                      <CardDescription>
                        Google Ads ve Instagram reklamlarınızı yönetin.
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowKampanyaForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {kampanyalar.map((kampanya, index) => (
                        <div key={`kampanya-${kampanya.id}-${index}`} className="border rounded-lg p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{kampanya.kampanya_adi}</h4>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingKampanya(kampanya);
                                  setShowKampanyaForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Kampanyayı Sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu kampanyayı silmek istediğinizden emin misiniz?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>İptal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleKampanyaDelete(kampanya.id)}
                                    >
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant={getPlatformBadge(kampanya.platform)}>
                              {kampanya.platform === "google_ads" ? "Google Ads" : 
                               kampanya.platform === "instagram" ? "Instagram" : "Facebook"}
                            </Badge>
                            <Badge variant={getDurumBadge(kampanya.durum)}>
                              {kampanya.durum}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bütçe: {kampanya.butce_gunluk ? `₺${kampanya.butce_gunluk}` : "-"} | 
                            Kategori: {kampanya.kategoriler?.ad || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {activeTab === "kategoriler" && (
                <div className="space-y-6">
                  <CategoryManager />
                  <Card>
                    <CardHeader>
                      <CardTitle>Kategori Yönetimi Bilgileri</CardTitle>
                      <CardDescription>Kategori yönetimi ile ilgili debug bilgileri</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p>Kategori yönetimi sayfasında herhangi bir sorun yaşarsanız, lütfen aşağıdaki adımları izleyin:</p>
                        <ol className="list-decimal pl-5 space-y-1 mt-2">
                          <li>Sayfayı yenileyin</li>
                          <li>Tarayıcı önbelleğini temizleyin</li>
                          <li>Farklı bir tarayıcı deneyin</li>
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {activeTab === "fotograflar" && (
                <div className="space-y-6">
                  <PhotoUploadManager onPhotoUploaded={loadAdminData} />
                  <PhotoGalleryManager />
                </div>
              )}

              {activeTab === "video-galeri" && <VideoGaleriManager />}
              {activeTab === "ayarlar" && <CompanySettingsManager />}
              {activeTab === "hesaplama" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hesaplama Ürünleri</CardTitle>
                    <CardDescription>
                      Hesaplama sayfasında kullanılan ürünleri ve fiyatları yönetin
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HesaplamaUrunleriManager />
                  </CardContent>
                </Card>
              )}
              {activeTab === "whatsapp" && <WhatsAppSettingsManager />}
              {activeTab === "instagram" && <InstagramSettingsManager />}
              {activeTab === "marka-logolari" && <BrandLogosSettingsManager />}
              {activeTab === "servis-bedelleri" && <ServisBedelleriManager />}

              {activeTab === "watermark" && <WatermarkSettingsManager />}
              {activeTab === "profil" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <CardDescription>
                      Hesap bilgilerinizi görüntüleyin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">E-posta:</p>
                      <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">İsim:</p>
                      <p className="text-muted-foreground">Admin</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rol:</p>
                      <p className="text-muted-foreground">admin</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobil Navigasyon */}
        <MobileNavigation />
      </div>

      {/* Desktop görünüm - Büyük ekranlar için sidebar layout */}
      <div className="hidden lg:block">
        <SidebarProvider>
          <div className="min-h-screen bg-background w-full">
            <div className="flex w-full">
              <AdminSidebar 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userEmail={user.email || ""}
                displayName="Admin"
              />
              <main className="flex-1 p-8">
                {/* Logo Gösterimi */}
                <div className="mb-6">
                  <LogoDisplay />
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Yönetim Paneli</h1>
                    <p className="text-muted-foreground">
                      Hoş geldiniz, {user.email}
                    </p>
                  </div>

                  {/* Aktif sekmeye göre içerik */}
                  <div className="space-y-6">
                    {activeTab === "kampanyalar" && (
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Reklam Kampanyaları</CardTitle>
                            <CardDescription>
                              Google Ads ve Instagram reklamlarınızı yönetin.
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => setShowKampanyaForm(true)}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Yeni Kampanya
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Kampanya Adı</TableHead>
                                  <TableHead>Platform</TableHead>
                                  <TableHead>Durum</TableHead>
                                  <TableHead>Günlük Bütçe</TableHead>
                                  <TableHead>Kategori</TableHead>
                                  <TableHead>İşlemler</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {kampanyalar.map((kampanya) => (
                                  <TableRow key={kampanya.id}>
                                    <TableCell className="font-medium">
                                      {kampanya.kampanya_adi}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={getPlatformBadge(kampanya.platform)}>
                                        {kampanya.platform === "google_ads" ? "Google Ads" : 
                                         kampanya.platform === "instagram" ? "Instagram" : "Facebook"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={getDurumBadge(kampanya.durum)}>
                                        {kampanya.durum}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {kampanya.butce_gunluk ? `₺${kampanya.butce_gunluk}` : "-"}
                                    </TableCell>
                                    <TableCell>
                                      {kampanya.kategoriler?.ad || "-"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingKampanya(kampanya);
                                            setShowKampanyaForm(true);
                                          }}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Kampanyayı Sil</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                Bu kampanyayı silmek istediğinizden emin misiniz?
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>İptal</AlertDialogCancel>
                                              <AlertDialogAction
                                                onClick={() => handleKampanyaDelete(kampanya.id)}
                                              >
                                                Sil
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {activeTab === "kategoriler" && (
                      <div className="space-y-6">
                        <CategoryManager />
                      </div>
                    )}
                    
                    {activeTab === "fotograflar" && (
                      <div className="space-y-6">
                        <PhotoUploadManager onPhotoUploaded={loadAdminData} />
                        <PhotoGalleryManager />
                      </div>
                    )}

                    {activeTab === "video-galeri" && <VideoGaleriManager />}
                    {activeTab === "ayarlar" && <CompanySettingsManager />}
                    {activeTab === "hesaplama" && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Hesaplama Ürünleri</CardTitle>
                          <CardDescription>
                            Hesaplama sayfasında kullanılan ürünleri ve fiyatları yönetin
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <HesaplamaUrunleriManager />
                        </CardContent>
                      </Card>
                    )}
                    {activeTab === "whatsapp" && <WhatsAppSettingsManager />}
                    {activeTab === "instagram" && <InstagramSettingsManager />}
                    {activeTab === "marka-logolari" && <BrandLogosSettingsManager />}
                    {activeTab === "servis-bedelleri" && <ServisBedelleriManager />}

                    {activeTab === "watermark" && <WatermarkSettingsManager />}
                    {activeTab === "profil" && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Profil Bilgileri</CardTitle>
                          <CardDescription>
                            Hesap bilgilerinizi görüntüleyin ve güncelleyin.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Mevcut Profil Bilgileri */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">E-posta:</p>
                              <p className="text-muted-foreground">{user.email}</p>
                            </div>
                            <div>
                          <p className="text-sm font-medium">İsim:</p>
                          <p className="text-muted-foreground">Admin</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Rol:</p>
                          <p className="text-muted-foreground">admin</p>
                        </div>
                          </div>

                          {/* Profil Güncelleme Formu */}
                          <div className="border-t pt-6">
                            <h3 className="text-lg font-medium mb-4">Profil Güncelle</h3>
                            <form 
                              id="profileUpdateForm" 
                              className="space-y-4"
                              onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const displayName = formData.get('profile_display_name') as string;
                                const fullName = formData.get('profile_full_name') as string;
                                
                                // Form validasyonu
                                if (!displayName.trim()) {
                                  toast({
                                    title: "Validasyon Hatası",
                                    description: "Görünen ad boş olamaz.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                try {
                                  // Güncel kullanıcı bilgisini al
                                  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                                  if (userError || !currentUser) {
                                    console.error('❌ Kullanıcı bilgisi alınamadı:', userError);
                                    toast({
                                      title: "Kimlik Doğrulama Hatası",
                                      description: "Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.",
                                      variant: "destructive",
                                    });
                                    navigate("/auth");
                                    return;
                                  }
                                  
                                  console.log('🔄 Profil güncelleniyor:', { displayName, fullName, userId: currentUser.id });
                                  
                                  const { data, error } = await supabase
                                    .from('profiles')
                                    .update({ 
                                      display_name: displayName.trim(),
                                      full_name: fullName.trim(),
                                      updated_at: new Date().toISOString()
                                    })
                                    .eq('user_id', currentUser.id)
                                    .select()
                                    .single();
                                  
                                  if (error) {
                                    console.error('❌ Profil güncelleme hatası:', error);
                                    
                                    // Spesifik hata mesajları
                                    if (error.code === '42501' || error.message?.includes('permission denied')) {
                                      toast({
                                        title: "Yetki Hatası",
                                        description: "Profil güncelleme izniniz yok. RLS politikaları kontrol edilmelidir.",
                                        variant: "destructive",
                                      });
                                    } else if (error.code === 'PGRST116') {
                                      toast({
                                        title: "Profil Bulunamadı",
                                        description: "Güncellenecek profil bulunamadı. Sayfayı yenilemeyi deneyin.",
                                        variant: "destructive",
                                      });
                                    } else {
                                      toast({
                                        title: "Güncelleme Hatası",
                                        description: `Profil güncellenirken hata oluştu: ${error.message}`,
                                        variant: "destructive",
                                      });
                                    }
                                  } else {
                                    console.log('✅ Profil başarıyla güncellendi:', data);
                                    toast({
                                      title: "Başarılı",
                                      description: "Profil bilgileriniz başarıyla güncellendi.",
                                    });
                                    
                                    // Başarılı güncelleme
                                  }
                                } catch (err) {
                                  console.error('❌ Beklenmeyen profil güncelleme hatası:', err);
                                  const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu';
                                  toast({
                                    title: "Beklenmeyen Hata",
                                    description: `Bir hata oluştu: ${errorMessage}`,
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor="profile_display_name" className="block text-sm font-medium mb-2">
                                    Görünen Ad
                                  </label>
                                  <input
                                    type="text"
                                    id="profile_display_name"
                                    name="profile_display_name"
                                    defaultValue="Admin"
                                    autoComplete="name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Görünen adınızı girin"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="profile_full_name" className="block text-sm font-medium mb-2">
                                    Tam Ad
                                  </label>
                                  <input
                                    type="text"
                                    id="profile_full_name"
                                    name="profile_full_name"
                                    defaultValue="Admin"
                                    autoComplete="name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tam adınızı girin"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button type="submit" className="px-6">
                                  Profili Güncelle
                                </Button>
                              </div>
                            </form>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </Tabs>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>

      {/* Kampanya Formu Modal */}
      {showKampanyaForm && (
        <KampanyaForm
          isOpen={showKampanyaForm}
          onClose={() => {
            setShowKampanyaForm(false);
            setEditingKampanya(null);
          }}
          kampanya={editingKampanya}
          kategoriler={kategoriler}
          onSuccess={handleKampanyaSubmit}
        />
      )}
    </div>
  );
};

export default Admin;