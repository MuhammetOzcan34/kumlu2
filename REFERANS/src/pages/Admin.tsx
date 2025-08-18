import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";
import { PhoneButton } from "@/components/PhoneButton";
import { KampanyaForm } from "@/components/KampanyaForm";
import { HesaplamaUrunleriManager } from "@/components/HesaplamaUrunleriManager";
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

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [kategoriler, setKategoriler] = useState<any[]>([]);
  const [fotograflar, setFotograflar] = useState<any[]>([]);
  const [ayarlar, setAyarlar] = useState<any[]>([]);
  const [kampanyalar, setKampanyalar] = useState<any[]>([]);
  const [showKampanyaForm, setShowKampanyaForm] = useState(false);
  const [editingKampanya, setEditingKampanya] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/auth");
        } else {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/auth");
      } else {
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
        console.error("Profile load error:", error);
        return;
      }

      setProfile(data);
      
      // Load data only if user is admin
      if (data?.role === "admin") {
        await loadAdminData();
      }
    } catch (error) {
      console.error("Profile load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [kategorilerRes, fotograflarRes, ayarlarRes, kampanyalarRes] = await Promise.all([
        supabase.from("kategoriler").select("*").order("sira_no"),
        supabase.from("fotograflar").select("*").order("sira_no"),
        supabase.from("ayarlar").select("*").order("anahtar"),
        supabase.from("reklam_kampanyalari").select(`
          *,
          kategoriler(ad)
        `).order("created_at", { ascending: false })
      ]);

      if (kategorilerRes.data) setKategoriler(kategorilerRes.data);
      if (fotograflarRes.data) setFotograflar(fotograflarRes.data);
      if (ayarlarRes.data) setAyarlar(ayarlarRes.data);
      if (kampanyalarRes.data) setKampanyalar(kampanyalarRes.data);
    } catch (error) {
      console.error("Data load error:", error);
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
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: "Çıkış hatası",
        description: error.message,
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
    <div className="min-h-screen bg-background p-4">
      <PhoneButton phoneNumber="+90 555 123 45 67" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Yönetim Paneli</h1>
            <p className="text-muted-foreground">
              Hoş geldiniz, {profile.display_name || user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Ana Sayfa
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Çıkış Yap
            </Button>
          </div>
        </div>

        <Tabs defaultValue="kampanyalar" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="kampanyalar">Kampanyalar</TabsTrigger>
              <TabsTrigger value="kategoriler">Kategoriler</TabsTrigger>
              <TabsTrigger value="fotograflar">Fotoğraflar</TabsTrigger>
              <TabsTrigger value="ayarlar">Ayarlar</TabsTrigger>
              <TabsTrigger value="hesaplama">Hesaplama</TabsTrigger>
              <TabsTrigger value="profil">Profil</TabsTrigger>
            </TabsList>
          
          <TabsContent value="kampanyalar" className="space-y-4">
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
                                      Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
          </TabsContent>
          
          <TabsContent value="kategoriler" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kategoriler</CardTitle>
                <CardDescription>
                  Kategori listesini yönetin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {kategoriler.map((kategori) => (
                    <div key={kategori.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{kategori.ad}</p>
                        <p className="text-sm text-muted-foreground">{kategori.tip}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sıra: {kategori.sira_no}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fotograflar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fotoğraflar</CardTitle>
                <CardDescription>
                  Fotoğraf galerisini yönetin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {fotograflar.map((foto) => (
                    <div key={foto.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{foto.baslik || "Başlıksız"}</p>
                        <p className="text-sm text-muted-foreground">{foto.dosya_yolu}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sıra: {foto.sira_no}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ayarlar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ayarlar</CardTitle>
                <CardDescription>
                  Sistem ayarlarını yönetin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ayarlar.map((ayar) => (
                    <div key={ayar.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{ayar.anahtar}</p>
                        <p className="text-sm text-muted-foreground">{ayar.aciklama}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ayar.deger}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hesaplama" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="profil" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>
      
      <KampanyaForm
        isOpen={showKampanyaForm}
        onOpenChange={(open) => {
          setShowKampanyaForm(open);
          if (!open) setEditingKampanya(null);
        }}
        kampanya={editingKampanya}
        kategoriler={kategoriler}
        onSuccess={handleKampanyaSubmit}
      />
    </div>
  );
}