-- Kumlu2 Projesi için RLS Politikalarını Düzeltme Migration
-- Bu migration, "Yükleniyor..." ekranında kalma sorununu çözmek için gerekli RLS politikalarını ekler

-- AYARLAR tablosu için RLS politikaları
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS ayarlar_read_all ON public.ayarlar;
DROP POLICY IF EXISTS ayarlar_admin_all ON public.ayarlar;

-- Genel okuma politikası - tüm kullanıcılar ayarları okuyabilir
CREATE POLICY ayarlar_read_all ON public.ayarlar 
FOR SELECT 
USING (true);

-- Admin kullanıcılar için tam yetki
CREATE POLICY ayarlar_admin_all ON public.ayarlar 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- FOTOGRAFLAR tablosu için RLS politikaları
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS fotograflar_read_public ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_read_slider ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_admin_all ON public.fotograflar;

-- Aktif fotoğraflar için genel okuma politikası
CREATE POLICY fotograflar_read_public ON public.fotograflar 
FOR SELECT 
USING (
  aktif = true AND (
    gorsel_tipi = 'slider' OR 
    kullanim_alani @> ARRAY['ana-sayfa-slider'] OR
    kullanim_alani @> ARRAY['galeri'] OR
    kullanim_alani @> ARRAY['portfolio']
  )
);

-- Admin kullanıcılar için tam yetki
CREATE POLICY fotograflar_admin_all ON public.fotograflar 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- PROFILES tablosu için RLS politikaları
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;

-- Kullanıcılar kendi profillerini okuyabilir
CREATE POLICY profiles_read_own ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY profiles_update_own ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Yeni profil oluşturma (kayıt sırasında)
CREATE POLICY profiles_insert_own ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin kullanıcılar tüm profilleri yönetebilir
CREATE POLICY profiles_admin_all ON public.profiles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- KATEGORILER tablosu için RLS politikaları (varsa)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kategoriler' AND table_schema = 'public') THEN
    ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS kategoriler_read_all ON public.kategoriler;
    DROP POLICY IF EXISTS kategoriler_admin_all ON public.kategoriler;
    
    -- Genel okuma politikası
    CREATE POLICY kategoriler_read_all ON public.kategoriler 
    FOR SELECT 
    USING (aktif = true);
    
    -- Admin için tam yetki
    CREATE POLICY kategoriler_admin_all ON public.kategoriler 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
      )
    );
  END IF;
END $$;

-- KAMPANYALAR tablosu için RLS politikaları (varsa)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kampanyalar' AND table_schema = 'public') THEN
    ALTER TABLE public.kampanyalar ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS kampanyalar_read_active ON public.kampanyalar;
    DROP POLICY IF EXISTS kampanyalar_admin_all ON public.kampanyalar;
    
    -- Aktif kampanyalar için genel okuma
    CREATE POLICY kampanyalar_read_active ON public.kampanyalar 
    FOR SELECT 
    USING (aktif = true);
    
    -- Admin için tam yetki
    CREATE POLICY kampanyalar_admin_all ON public.kampanyalar 
    FOR ALL 
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role = 'admin'
      )
    );
  END IF;
END $$;

-- Anon ve authenticated rollere gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon, authenticated;
GRANT SELECT ON public.fotograflar TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.kategoriler TO anon, authenticated;
GRANT SELECT ON public.kampanyalar TO anon, authenticated;

-- Admin işlemleri için authenticated role'e tam yetki
GRANT ALL ON public.ayarlar TO authenticated;
GRANT ALL ON public.fotograflar TO authenticated;
GRANT ALL ON public.kategoriler TO authenticated;
GRANT ALL ON public.kampanyalar TO authenticated;

-- Sequence'lere de izin ver (ID otomatik artışı için)
DO $$ 
BEGIN
  -- ayarlar_id_seq
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'ayarlar_id_seq' AND sequence_schema = 'public') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.ayarlar_id_seq TO authenticated;
  END IF;
  
  -- fotograflar_id_seq
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'fotograflar_id_seq' AND sequence_schema = 'public') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.fotograflar_id_seq TO authenticated;
  END IF;
  
  -- kategoriler_id_seq
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'kategoriler_id_seq' AND sequence_schema = 'public') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.kategoriler_id_seq TO authenticated;
  END IF;
  
  -- kampanyalar_id_seq
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'kampanyalar_id_seq' AND sequence_schema = 'public') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.kampanyalar_id_seq TO authenticated;
  END IF;
END $$;

-- Migration tamamlandı
SELECT 'RLS politikaları başarıyla güncellendi!' as message;