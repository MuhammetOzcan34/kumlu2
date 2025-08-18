import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Tip tanımlamaları
  interface Profile {
    id: string;
    user_id: string;
    display_name?: string;
    role: string;
    created_at: string;
  }

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
    butce_gunluk?: number;
    kategoriler?: {
      ad: string;
    };
    created_at: string;
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [fotograflar, setFotograflar] = useState<Fotograf[]>([]);
  const [ayarlar, setAyarlar] = useState<Ayar[]>([]);
  const [kampanyalar, setKampanyalar] = useState<Kampanya[]>([]);
  const [showKampanyaForm, setShowKampanyaForm] = useState(false);
  const [editingKampanya, setEditingKampanya] = useState<Kampanya | null>(null);
  const [activeTab, setActiveTab] = useState("kampanyalar");
  const navigate = useNavigate();
  const { toast } = useToast();



  const loadUserProfile = useCallback(async (userId?: string, currentSession?: Session | null) => {
    // Eğer zaten yükleme devam ediyorsa, tekrar istek yapma
    if (loading) {
      console.log('⏳ Admin - Zaten yükleme devam ediyor, tekrar istek yapılmıyor');
      return;
    }
    
    try {
      console.log('🔍 Admin - Kullanıcı profili yükleniyor:', userId);
      setLoading(true);
      
      // JWT token kontrolü ve kullanıcı bilgisi alma - daha güvenilir yöntem
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.error('❌ Admin - JWT token alınamadı veya kullanıcı bulunamadı:', userError);
        navigate("/auth");
        return;
      }
      
      console.log('✅ Admin - JWT token başarıyla alındı, user_id:', currentUser.id);
      const actualUserId = currentUser.id;
      
      // Önce profiles tablosundan kullanıcı bilgilerini al
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", actualUserId)
        .single();

      if (profileError) {
        console.error("❌ Admin - Profil yükleme hatası:", profileError);
        
        // Eğer profil bulunamazsa (PGRST116: no rows returned), otomatik olarak oluşturmaya çalış
        if (profileError.code === 'PGRST116') {
          console.log('🔧 Admin - Profil bulunamadı, oluşturuluyor...');
          
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              user_id: actualUserId,
              display_name: currentUser?.email?.split('@')[0] || 'Kullanıcı',
              full_name: currentUser?.user_metadata?.full_name || '',
              email: currentUser?.email || '',
              role: 'user', // Varsayılan rol user
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) {
            console.error('❌ Admin - Profil oluşturma hatası:', createError);
            toast({
              title: "Profil Hatası",
              description: `Kullanıcı profili oluşturulamadı: ${createError.message}`,
              variant: "destructive",
            });
            navigate("/auth");
            return;
          }
          
          console.log('✅ Admin - Yeni profil oluşturuldu:', newProfile);
          setProfile(newProfile);
          return; // Yeni profil oluşturulduysa, rol kontrolüne gerek yok
        } 
        // Diğer hatalar için (403 Forbidden, RLS policy hatası vb.)
        else if (profileError.code === '42501' || profileError.message?.includes('permission denied')) {
          toast({
            title: "Yetki Hatası",
            description: "Profil bilgilerine erişim izniniz yok. RLS politikaları kontrol edilmelidir.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Profil Yükleme Hatası",
            description: `Kullanıcı profili yüklenemedi: ${profileError.message}`,
            variant: "destructive",
          });
        }
        return; // Hata durumunda erken çık, finally bloğu loading'i false yapacak
      }

      console.log('✅ Admin - Kullanıcı profili yüklendi:', profileData);
      
      // Rol bilgisini belirle (öncelik sırası: profiles.role > app_metadata.role > user_metadata.role > kullanici_rolleri)
      let userRole = profileData.role || 'user'; // Varsayılan rol user
      
      // 1. Öncelik: profiles tablosundaki role kolonu
      if (profileData.role) {
        userRole = profileData.role;
        console.log('✅ Admin - Kullanıcı rolü profiles tablosundan alındı:', userRole);
      }
      // 2. İkinci öncelik: app_metadata.role (JWT token'dan gelen)
      else if (currentUser?.app_metadata?.role) {
        userRole = currentUser.app_metadata.role;
        console.log('✅ Admin - Kullanıcı rolü JWT token\'dan (app_metadata) alındı:', userRole);
        
        // Profiles tablosunu güncelle
        try {
          await supabase
            .from('profiles')
            .update({ role: userRole, updated_at: new Date().toISOString() })
            .eq('user_id', actualUserId);
        } catch (updateError) {
          console.warn('⚠️ Admin - Profil rol güncelleme hatası (devam ediliyor):', updateError);
        }
      } 
      // 3. Üçüncü öncelik: user_metadata.role (fallback)
      else if (currentUser?.user_metadata?.role) {
        userRole = currentUser.user_metadata.role;
        console.log('✅ Admin - Kullanıcı rolü user_metadata\'dan alındı:', userRole);
        
        // Profiles tablosunu güncelle
        try {
          await supabase
            .from('profiles')
            .update({ role: userRole, updated_at: new Date().toISOString() })
            .eq('user_id', actualUserId);
        } catch (updateError) {
          console.warn('⚠️ Admin - Profil rol güncelleme hatası (devam ediliyor):', updateError);
        }
      }
      // 4. Son çare: kullanici_rolleri tablosundan kontrol et
      else {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("kullanici_rolleri")
            .select("role, is_super_admin")
            .eq("email", currentUser?.email)
            .single();

          if (!roleError && roleData) {
            userRole = roleData.role;
            console.log('✅ Admin - Kullanıcı rolü kullanici_rolleri tablosundan alındı:', userRole);
            
            // Profiles tablosunu güncelle
            try {
              await supabase
                .from('profiles')
                .update({ role: userRole, updated_at: new Date().toISOString() })
                .eq('user_id', actualUserId);
            } catch (updateError) {
              console.warn('⚠️ Admin - Profil rol güncelleme hatası (devam ediliyor):', updateError);
            }
          } else {
            console.log('⚠️ Admin - Hiçbir yerden rol bulunamadı, varsayılan rol kullanılıyor:', userRole);
          }
        } catch (roleQueryError) {
          console.warn('⚠️ Admin - Kullanıcı rolleri sorgusu hatası (devam ediliyor):', roleQueryError);
        }
      }
      
      // Profile nesnesine güncel rol bilgisini ekle
      const profileWithRole = {
        ...profileData,
        role: userRole
      };
      
      setProfile(profileWithRole);
      
      if (userRole === "admin") {
        console.log('🔑 Admin - Kullanıcı admin rolüne sahip, yönetim verileri yükleniyor');
        try {
          await loadAdminData();
        } catch (adminDataError) {
          console.warn('⚠️ Admin - Yönetim verileri yükleme hatası (devam ediliyor):', adminDataError);
          // Yönetim verileri yüklenemese bile kullanıcıyı admin paneline al
        }
      } else {
        console.warn('⚠️ Admin - Kullanıcı admin rolüne sahip değil:', userRole);
      }
    } catch (error) {
      console.error("❌ Admin - Profil yükleme hatası:", error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      toast({
        title: "Beklenmeyen Hata",
        description: `Bir hata oluştu: ${errorMessage}`,
        variant: "destructive",
      });
      // Hata durumunda auth sayfasına yönlendir
      navigate("/auth");
    } finally {
      setLoading(false);
      console.log('✅ Admin - Profil yükleme tamamlandı, loading durumu false yapıldı');
    }
  }, [navigate, toast, loading]);

  useEffect(() => {
    console.log('🔄 Admin - Auth durumu takibi başlatılıyor...');
    let timeoutId: NodeJS.Timeout;
    let mounted = true; // Component mount durumu takibi
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔄 Admin - Auth durumu değişti:', event, session ? 'Oturum var' : 'Oturum yok');
          
          if (!mounted) {
            console.log('⚠️ Admin - Component unmount olmuş, işlem iptal ediliyor');
            return;
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (!session?.user) {
            console.log('⚠️ Admin - Kullanıcı oturumu yok, auth sayfasına yönlendiriliyor');
            if (mounted) {
              setLoading(false);
              navigate("/auth");
            }
          } else {
            console.log('✅ Admin - Kullanıcı oturumu var, profil yükleniyor:', session.user.id);
            // Debounce ile aşırı istek önleme ve sonsuz döngü engelleme
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              if (mounted) {
                try {
                  await loadUserProfile(session.user.id, session);
                } catch (profileError) {
                  console.error('❌ Admin - Auth state change profil yükleme hatası:', profileError);
                  if (mounted) {
                    setLoading(false);
                    toast({
                      title: "Profil Yükleme Hatası",
                      description: "Profil bilgileri yüklenirken bir hata oluştu.",
                      variant: "destructive",
                    });
                  }
                }
              }
            }, 300);
          }
        } catch (error) {
          console.error('❌ Admin - Auth state change hatası:', error);
          if (mounted) {
            setLoading(false);
            toast({
              title: "Oturum Hatası",
              description: "Oturum durumu kontrol edilirken bir hata oluştu.",
              variant: "destructive",
            });
          }
        }
      }
    );

    // Mevcut oturum kontrolü - sadece ilk yüklemede
    const checkInitialSession = async () => {
      try {
        console.log('🔍 Admin - Mevcut oturum kontrol ediliyor...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Admin - Oturum kontrolü hatası:', error);
          if (mounted) {
            setLoading(false);
            toast({
              title: "Oturum Kontrolü Hatası",
              description: `Oturum kontrol edilemedi: ${error.message}`,
              variant: "destructive",
            });
            navigate("/auth");
          }
          return;
        }
        
        console.log('🔍 Admin - Oturum durumu:', session ? 'Oturum var' : 'Oturum yok');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          console.log('⚠️ Admin - Kullanıcı oturumu yok, auth sayfasına yönlendiriliyor');
          setLoading(false);
          navigate("/auth");
        } else {
          console.log('✅ Admin - Kullanıcı oturumu var, profil yükleniyor:', session.user.id);
          try {
            await loadUserProfile(session.user.id, session);
          } catch (profileError) {
            console.error('❌ Admin - İlk profil yükleme hatası:', profileError);
            if (mounted) {
              setLoading(false);
              toast({
                title: "Profil Yükleme Hatası",
                description: "Profil bilgileri yüklenirken bir hata oluştu.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Admin - Oturum kontrolü sırasında beklenmeyen hata:', error);
        if (mounted) {
          setLoading(false);
          toast({
            title: "Beklenmeyen Hata",
            description: "Oturum kontrol edilirken beklenmeyen bir hata oluştu.",
            variant: "destructive",
          });
          navigate("/auth");
        }
      }
    };
    
    checkInitialSession();

    return () => {
      console.log('🔄 Admin - Sayfa temizleniyor, abonelikler iptal ediliyor');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [navigate]); // loadUserProfile dependency'sini kaldırdık - sonsuz döngü önleme

  const loadAdminData = async () => {
    console.log('🔄 Admin - Yönetim verileri yükleniyor...');
    
    // Kategorileri yükle
    try {
      console.log('📋 Admin - Kategoriler yükleniyor...');
      const kategorilerRes = await supabase.from("kategoriler").select("*").order("sira_no");
      if (kategorilerRes.error) {
        console.error('❌ Admin - Kategoriler yüklenirken hata:', kategorilerRes.error);
        toast({
          title: "Kategoriler Yükleme Hatası",
          description: `Kategoriler yüklenemedi: ${kategorilerRes.error.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Admin - ${kategorilerRes.data?.length || 0} kategori yüklendi`);
        setKategoriler(kategorilerRes.data || []);
      }
    } catch (error) {
      console.error('❌ Admin - Kategoriler sorgusu hatası:', error);
      toast({
        title: "Kategoriler Hatası",
        description: "Kategoriler sorgulanırken beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    // Fotoğrafları yükle
    try {
      console.log('🖼️ Admin - Fotoğraflar yükleniyor...');
      const fotograflarRes = await supabase.from("fotograflar").select("*").order("sira_no");
      if (fotograflarRes.error) {
        console.error('❌ Admin - Fotoğraflar yüklenirken hata:', fotograflarRes.error);
        toast({
          title: "Fotoğraflar Yükleme Hatası",
          description: `Fotoğraflar yüklenemedi: ${fotograflarRes.error.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Admin - ${fotograflarRes.data?.length || 0} fotoğraf yüklendi`);
        setFotograflar(fotograflarRes.data || []);
      }
    } catch (error) {
      console.error('❌ Admin - Fotoğraflar sorgusu hatası:', error);
      toast({
        title: "Fotoğraflar Hatası",
        description: "Fotoğraflar sorgulanırken beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    // Ayarları yükle
    try {
      console.log('⚙️ Admin - Ayarlar yükleniyor...');
      const ayarlarRes = await supabase.from("ayarlar").select("*").order("anahtar");
      if (ayarlarRes.error) {
        console.error('❌ Admin - Ayarlar yüklenirken hata:', ayarlarRes.error);
        toast({
          title: "Ayarlar Yükleme Hatası",
          description: `Ayarlar yüklenemedi: ${ayarlarRes.error.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Admin - ${ayarlarRes.data?.length || 0} ayar yüklendi`);
        setAyarlar(ayarlarRes.data || []);
      }
    } catch (error) {
      console.error('❌ Admin - Ayarlar sorgusu hatası:', error);
      toast({
        title: "Ayarlar Hatası",
        description: "Ayarlar sorgulanırken beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    // Kampanyaları yükle
    try {
      console.log('📢 Admin - Kampanyalar yükleniyor...');
      const kampanyalarRes = await supabase.from("reklam_kampanyalari").select(`
        *,
        kategoriler(ad)
      `).order("created_at", { ascending: false });
      
      if (kampanyalarRes.error) {
        console.error('❌ Admin - Kampanyalar yüklenirken hata:', kampanyalarRes.error);
        toast({
          title: "Kampanyalar Yükleme Hatası",
          description: `Kampanyalar yüklenemedi: ${kampanyalarRes.error.message}`,
          variant: "destructive",
        });
      } else {
        console.log(`✅ Admin - ${kampanyalarRes.data?.length || 0} kampanya yüklendi`);
        setKampanyalar(kampanyalarRes.data || []);
      }
    } catch (error) {
      console.error('❌ Admin - Kampanyalar sorgusu hatası:', error);
      toast({
        title: "Kampanyalar Hatası",
        description: "Kampanyalar sorgulanırken beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    console.log('✅ Admin - Yönetim verileri yükleme işlemi tamamlandı');
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
                  Hoş geldiniz, {profile.display_name || user.email}
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
                      <p className="text-sm font-medium">Görünen Ad:</p>
                      <p className="text-muted-foreground">{profile.display_name || "Belirtilmemiş"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Rol:</p>
                      <p className="text-muted-foreground">{profile.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Kayıt Tarihi:</p>
                      <p className="text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString("tr-TR")}
                      </p>
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
                displayName={profile.display_name}
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
                      Hoş geldiniz, {profile.display_name || user.email}
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
                              <p className="text-sm font-medium">Görünen Ad:</p>
                              <p className="text-muted-foreground">{profile.display_name || "Belirtilmemiş"}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Rol:</p>
                              <p className="text-muted-foreground">{profile.role}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Kayıt Tarihi:</p>
                              <p className="text-muted-foreground">
                                {new Date(profile.created_at).toLocaleDateString("tr-TR")}
                              </p>
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
                                    
                                    // Profili yeniden yükle
                                    await loadUserProfile(currentUser.id);
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
                                    defaultValue={profile.display_name || ''}
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
                                    defaultValue={profile.full_name || ''}
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
}