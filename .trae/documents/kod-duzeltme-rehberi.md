# Kod Düzeltme Rehberi

## 1. AuthContext.tsx Düzeltmeleri

### 1.1 Mevcut Sorunlu Kod Analizi

**Sorunlar:**
- Karmaşık state yönetimi
- Gereksiz error handling
- Çoklu auth kontrol mekanizmaları
- Sonsuz döngü riski

### 1.2 Referans Projeden Alınan Basit Yapı

```typescript
// src/contexts/AuthContext.tsx - YENİ VERSİYON
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Çıkış fonksiyonu
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Hata",
          description: "Çıkış yapılırken bir hata oluştu.",
          variant: "destructive",
        });
      } else {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  useEffect(() => {
    // İlk session kontrolü
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session alma hatası:", error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Eğer kullanıcı giriş yapmışsa admin paneline yönlendir
          if (session?.user) {
            navigate("/admin");
          }
        }
      } catch (error) {
        console.error("Auth başlatma hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state değişti:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === "SIGNED_IN" && session?.user) {
          toast({
            title: "Başarılı",
            description: "Giriş yapıldı.",
          });
          navigate("/admin");
        } else if (event === "SIGNED_OUT") {
          toast({
            title: "Bilgi",
            description: "Çıkış yapıldı.",
          });
          navigate("/auth");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth hook'u AuthProvider içinde kullanılmalıdır");
  }
  return context;
};
```

## 2. Auth.tsx Düzeltmeleri

### 2.1 Basitleştirilmiş Giriş Komponenti

```typescript
// src/pages/Auth.tsx - YENİ VERSİYON
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Basit giriş fonksiyonu
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Hata",
        description: "E-posta ve şifre alanları zorunludur.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        toast({
          title: "Giriş Hatası",
          description: error.message === "Invalid login credentials" 
            ? "E-posta veya şifre hatalı." 
            : error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Başarılı",
          description: "Giriş yapıldı, yönlendiriliyorsunuz...",
        });
        // AuthContext otomatik olarak /admin'e yönlendirecek
      }
    } catch (error) {
      console.error("Giriş hatası:", error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Yönetim Paneli</CardTitle>
          <CardDescription>
            Giriş yaparak yönetim paneline erişebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@kumlu2.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>
          
          {/* Test bilgileri */}
          <div className="mt-6 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 font-medium">Test Bilgileri:</p>
            <p className="text-sm text-blue-600">E-posta: admin@kumlu2.com</p>
            <p className="text-sm text-blue-600">Şifre: 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
```

## 3. Admin.tsx Düzeltmeleri

### 3.1 Boş Sayfa Sorununun Çözümü

```typescript
// src/pages/Admin.tsx - DÜZELTME BÖLÜMÜ
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Tip tanımları
interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Kategori {
  id: string;
  ad: string;
  aciklama: string | null;
  aktif: boolean;
  sira: number;
  created_at: string;
  updated_at: string;
}

interface Fotograf {
  id: string;
  kategori_id: string | null;
  baslik: string;
  aciklama: string | null;
  dosya_yolu: string;
  dosya_adi: string;
  boyut: number | null;
  aktif: boolean;
  sira: number;
  created_at: string;
  updated_at: string;
}

interface Ayar {
  id: string;
  anahtar: string;
  deger: string;
  aciklama: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  // Auth context
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State tanımları
  const [profile, setProfile] = useState<Profile | null>(null);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [fotograflar, setFotograflar] = useState<Fotograf[]>([]);
  const [ayarlar, setAyarlar] = useState<Ayar[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ayarlar");

  // Basitleştirilmiş profil yükleme fonksiyonu
  const loadUserProfile = useCallback(async () => {
    if (!user) {
      console.log("Kullanıcı bulunamadı, auth sayfasına yönlendiriliyor");
      navigate("/auth");
      return;
    }

    try {
      console.log("Profil yükleniyor, kullanıcı ID:", user.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log("Profil hatası:", error.code, error.message);
        
        // Profil yoksa oluştur
        if (error.code === 'PGRST116') {
          console.log("Profil bulunamadı, yeni profil oluşturuluyor");
          
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              display_name: user.email?.split('@')[0] || 'Kullanıcı',
              role: user.email === 'admin@kumlu2.com' ? 'admin' : 'user'
            })
            .select()
            .single();

          if (createError) {
            console.error("Profil oluşturma hatası:", createError);
            toast({
              title: "Hata",
              description: "Profil oluşturulamadı: " + createError.message,
              variant: "destructive",
            });
            return;
          }

          console.log("Yeni profil oluşturuldu:", newProfile);
          setProfile(newProfile);
          
          // Admin ise veri yükle
          if (newProfile.role === "admin") {
            await loadAdminData();
          }
        } else {
          toast({
            title: "Hata",
            description: "Profil yüklenemedi: " + error.message,
            variant: "destructive",
          });
        }
        return;
      }

      console.log("Profil yüklendi:", data);
      setProfile(data);
      
      // Admin kontrolü
      if (data.role === "admin") {
        console.log("Admin kullanıcı, veri yükleniyor");
        await loadAdminData();
      } else {
        console.log("Admin olmayan kullanıcı:", data.role);
        toast({
          title: "Yetkisiz Erişim",
          description: "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    } catch (error) {
      console.error("Profil yükleme genel hatası:", error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  // Admin verilerini yükleme fonksiyonu
  const loadAdminData = async () => {
    try {
      console.log("Admin verileri yükleniyor");
      
      // Paralel veri yükleme
      const [kategoriResult, fotografResult, ayarResult] = await Promise.all([
        supabase.from("kategoriler").select("*").order("sira"),
        supabase.from("fotograflar").select("*").order("sira"),
        supabase.from("ayarlar").select("*").order("anahtar")
      ]);

      // Kategoriler
      if (kategoriResult.error) {
        console.error("Kategori yükleme hatası:", kategoriResult.error);
      } else {
        setKategoriler(kategoriResult.data || []);
        console.log("Kategoriler yüklendi:", kategoriResult.data?.length);
      }

      // Fotoğraflar
      if (fotografResult.error) {
        console.error("Fotoğraf yükleme hatası:", fotografResult.error);
      } else {
        setFotograflar(fotografResult.data || []);
        console.log("Fotoğraflar yüklendi:", fotografResult.data?.length);
      }

      // Ayarlar
      if (ayarResult.error) {
        console.error("Ayar yükleme hatası:", ayarResult.error);
      } else {
        setAyarlar(ayarResult.data || []);
        console.log("Ayarlar yüklendi:", ayarResult.data?.length);
      }

    } catch (error) {
      console.error("Admin veri yükleme genel hatası:", error);
      toast({
        title: "Hata",
        description: "Admin verileri yüklenirken hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // İlk yükleme effect'i
  useEffect(() => {
    const initializeAdmin = async () => {
      if (authLoading) {
        console.log("Auth yükleniyor, bekleniyor...");
        return;
      }

      if (!user || !session) {
        console.log("Kullanıcı oturumu yok, auth sayfasına yönlendiriliyor");
        navigate("/auth");
        return;
      }

      console.log("Admin sayfası başlatılıyor");
      await loadUserProfile();
      setLoading(false);
    };

    initializeAdmin();
  }, [user, session, authLoading, loadUserProfile, navigate]);

  // Yükleme durumu
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Profil yoksa
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Profil yüklenemedi</p>
          <button 
            onClick={() => navigate("/auth")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  // Admin değilse
  if (profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Bu sayfaya erişim yetkiniz bulunmamaktadır</p>
          <button 
            onClick={() => navigate("/auth")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  // Ana admin paneli render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yönetim Paneli</h1>
              <p className="text-sm text-gray-600">
                Hoş geldiniz, {profile.display_name || user?.email}
              </p>
            </div>
            <button
              onClick={() => {
                supabase.auth.signOut();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "ayarlar", label: "Ayarlar", count: ayarlar.length },
              { id: "kategoriler", label: "Kategoriler", count: kategoriler.length },
              { id: "fotograflar", label: "Fotoğraflar", count: fotograflar.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "ayarlar" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Ayarlar</h2>
              <div className="space-y-4">
                {ayarlar.map((ayar) => (
                  <div key={ayar.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{ayar.anahtar}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ayar.aciklama}</p>
                        <p className="text-sm text-gray-800 mt-2">{ayar.deger}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Düzenle
                      </button>
                    </div>
                  </div>
                ))}
                {ayarlar.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Henüz ayar bulunmamaktadır.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "kategoriler" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Kategoriler</h2>
              <div className="space-y-4">
                {kategoriler.map((kategori) => (
                  <div key={kategori.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{kategori.ad}</h3>
                        <p className="text-sm text-gray-600 mt-1">{kategori.aciklama}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            kategori.aktif 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {kategori.aktif ? "Aktif" : "Pasif"}
                          </span>
                          <span className="text-sm text-gray-500">Sıra: {kategori.sira}</span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Düzenle
                      </button>
                    </div>
                  </div>
                ))}
                {kategoriler.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Henüz kategori bulunmamaktadır.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "fotograflar" && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Fotoğraflar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fotograflar.map((fotograf) => (
                  <div key={fotograf.id} className="border rounded-lg p-4">
                    <div className="aspect-w-16 aspect-h-9 mb-3">
                      <img
                        src={fotograf.dosya_yolu}
                        alt={fotograf.baslik}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <h3 className="font-medium text-gray-900">{fotograf.baslik}</h3>
                    <p className="text-sm text-gray-600 mt-1">{fotograf.aciklama}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fotograf.aktif 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {fotograf.aktif ? "Aktif" : "Pasif"}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Düzenle
                      </button>
                    </div>
                  </div>
                ))}
                {fotograflar.length === 0 && (
                  <p className="text-gray-500 text-center py-8 col-span-full">Henüz fotoğraf bulunmamaktadır.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
```

## 4. Supabase Migration Düzeltmeleri

### 4.1 Temiz Migration Dosyası

```sql
-- supabase/migrations/20240101000000_clean_setup.sql
-- Temiz kurulum migration'ı

-- Mevcut karmaşık yapıları temizle
DROP TABLE IF EXISTS public.kullanici_rolleri CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Basit profiles tablosu oluştur
CREATE TABLE public.profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- İndeksler
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- RLS etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Temiz RLS politikaları
CREATE POLICY "Kullanıcılar kendi profilini görebilir" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi profilini oluşturabilir" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Adminler tüm profilleri yönetebilir"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Yeni kullanıcı için otomatik profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'admin@kumlu2.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ayarlar tablosu RLS
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Adminler ayarları yönetebilir" ON public.ayarlar;
DROP POLICY IF EXISTS "Herkes genel ayarları okuyabilir" ON public.ayarlar;

-- Yeni basit politikalar
CREATE POLICY "Adminler ayarları yönetebilir"
ON public.ayarlar FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Herkes ayarları okuyabilir"
ON public.ayarlar FOR SELECT
USING (true);

-- Kategoriler tablosu RLS
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Adminler kategorileri yönetebilir" ON public.kategoriler;
DROP POLICY IF EXISTS "Herkes kategorileri okuyabilir" ON public.kategoriler;

-- Yeni basit politikalar
CREATE POLICY "Adminler kategorileri yönetebilir"
ON public.kategoriler FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Herkes aktif kategorileri okuyabilir"
ON public.kategoriler FOR SELECT
USING (aktif = true OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Fotoğraflar tablosu RLS
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Adminler fotoğrafları yönetebilir" ON public.fotograflar;
DROP POLICY IF EXISTS "Herkes aktif fotoğrafları okuyabilir" ON public.fotograflar;

-- Yeni basit politikalar
CREATE POLICY "Adminler fotoğrafları yönetebilir"
ON public.fotograflar FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Herkes aktif fotoğrafları okuyabilir"
ON public.fotograflar FOR SELECT
USING (aktif = true OR EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'
));

-- Storage bucket politikaları
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotograflar', 'fotograflar', true)
ON CONFLICT (id) DO NOTHING;

-- Storage politikalarını temizle
DROP POLICY IF EXISTS "Adminler fotoğraf yükleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Adminler fotoğraf silebilir" ON storage.objects;
DROP POLICY IF EXISTS "Herkes fotoğrafları görebilir" ON storage.objects;

-- Yeni storage politikaları
CREATE POLICY "Adminler fotoğraf yükleyebilir"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'fotograflar' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Adminler fotoğraf silebilir"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'fotograflar' AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Herkes fotoğrafları görebilir"
ON storage.objects FOR SELECT
USING (bucket_id = 'fotograflar');

-- Test admin kullanıcısı oluştur
DO $$
BEGIN
  -- Eğer admin kullanıcısı yoksa oluştur
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kumlu2.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@kumlu2.com',
      crypt('123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Temel ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('site_baslik', 'Kumlu2 Yönetim Paneli', 'Site başlığı'),
('site_aciklama', 'Fotoğraf galerisi yönetim sistemi', 'Site açıklaması'),
('iletisim_email', 'info@kumlu2.com', 'İletişim e-posta adresi'),
('telefon', '+90 555 123 45 67', 'İletişim telefon numarası')
ON CONFLICT (anahtar) DO NOTHING;

-- Örnek kategori ekle
INSERT INTO public.kategoriler (ad, aciklama, aktif, sira) VALUES
('Genel', 'Genel fotoğraflar', true, 1),
('Etkinlikler', 'Etkinlik fotoğrafları', true, 2),
('Ürünler', 'Ürün fotoğrafları', true, 3)
ON CONFLICT DO NOTHING;

COMMIT;
```

## 5. Package.json Güncellemeleri

### 5.1 Gerekli Bağımlılıklar

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@radix-ui/react-toast": "^1.1.5",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

## 6. Uygulama Adımları

### 6.1 Kod Değişiklikleri Sırası

1. **AuthContext.tsx'i değiştir**
   ```bash
   # Mevcut dosyayı yedekle
   cp src/contexts/AuthContext.tsx src/contexts/AuthContext.tsx.backup
   
   # Yeni kodu uygula
   # (Yukarıdaki kodu kopyala)
   ```

2. **Auth.tsx'i değiştir**
   ```bash
   # Mevcut dosyayı yedekle
   cp src/pages/Auth.tsx src/pages/Auth.tsx.backup
   
   # Yeni kodu uygula
   # (Yukarıdaki kodu kopyala)
   ```

3. **Admin.tsx'i değiştir**
   ```bash
   # Mevcut dosyayı yedekle
   cp src/pages/Admin.tsx src/pages/Admin.tsx.backup
   
   # Yeni kodu uygula
   # (Yukarıdaki kodu kopyala)
   ```

4. **Migration'ı çalıştır**
   ```bash
   # Yeni migration dosyası oluştur
   supabase migration new clean_setup
   
   # Migration'ı uygula
   supabase db push
   ```

### 6.2 Test Adımları

1. **Geliştirme sunucusunu başlat**
   ```bash
   npm run dev
   ```

2. **Giriş testi**
   - http://localhost:5173/auth adresine git
   - admin@kumlu2.com / 123456 ile giriş yap
   - Admin paneline yönlendirildiğini kontrol et

3. **CRUD testleri**
   - Ayarlar sekmesinde verilerin göründüğünü kontrol et
   - Kategoriler sekmesinde verilerin göründüğünü kontrol et
   - Fotoğraflar sekmesinde verilerin göründüğünü kontrol et

4. **Yetki testleri**
   - Farklı bir kullanıcı oluştur
   - Admin olmayan kullanıcının admin paneline erişemediğini kontrol et

## 7. Hata Ayıklama

### 7.1 Yaygın Hatalar ve Çözümleri

**Hata: "PGRST116 - No rows found"**
```typescript
// Çözüm: Profil oluşturma mantığı eklendi
if (error.code === 'PGRST116') {
  // Yeni profil oluştur
}
```

**Hata: "RLS policy violation"**
```sql
-- Çözüm: Politikaları kontrol et
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Hata: "Auth session not found"**
```typescript
// Çözüm: Session kontrolü ekle
if (!user || !session) {
  navigate("/auth");
  return;
}
```

### 7.2 Debug Araçları

```typescript
// Console log'ları ekle
console.log("Auth state:", { user, session, loading });
console.log("Profile:", profile);
console.log("Admin data:", { kategoriler, fotograflar, ayarlar });

// Supabase debug
supabase.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event, session);
});
```

## 8. Performans Optimizasyonları

### 8.1 React Optimizasyonları

```typescript
// Memoization
const MemoizedAdminPanel = memo(AdminPanel);

// useCallback kullanımı
const loadData = useCallback(async () => {
  // Veri yükleme mantığı
}, [dependencies]);

// useMemo kullanımı
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

### 8.2 Supabase Optimizasyonları

```typescript
// Paralel veri yükleme
const [kategoriler, fotograflar] = await Promise.all([
  supabase.from("kategoriler").select("*"),
  supabase.from("fotograflar").select("*")
]);

// Seçici sorgular
const { data } = await supabase
  .from("fotograflar")
  .select("id, baslik, dosya_yolu")
  .eq("aktif", true)
  .limit(10);
```

## 9. Güvenlik Kontrolleri

### 9.1 Frontend Güvenlik

```typescript
// Input sanitization
const sanitizeInput = (input: string) => {
  return input.trim().replace(/[<>"']/g, "");
};

// XSS koruması
const SafeHTML = ({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />;
};
```

### 9.2 Backend Güvenlik

```sql
-- SQL injection koruması (RLS ile)
CREATE POLICY "Güvenli veri erişimi"
ON public.tablename FOR SELECT
USING (user_id = auth.uid());

-- Rate limiting
-- Supabase dashboard'dan ayarlanabilir
```

## 10. Deployment Hazırlığı

### 10.1 Production Ayarları

```typescript
// .env.production
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key

// Error handling
if (import.meta.env.PROD) {
  // Production error handling
} else {
  // Development error handling
}
```

### 10.2 Build ve Deploy

```bash
# Build
npm run build

# Deploy (örnek: Vercel)
vercel --prod

# Supabase migration
supabase db push --linked
```

Bu rehber, referans projedeki basit ve çalışan yapıyı temel alarak mevcut uygulamanın tüm sorunlarını çözecek adım adım kod değişikliklerini içermektedir. Her adım test edilmeli ve doğrulanmalıdır.