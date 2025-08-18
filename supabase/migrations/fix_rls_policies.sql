-- RLS Policy'lerini düzelt ve eksik izinleri ekle
-- Bu migration "Yükleniyor..." ekranında kalma sorununu çözer

-- AYARLAR tablosu için read policy
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ayarlar_read_all ON public.ayarlar;
CREATE POLICY ayarlar_read_all ON public.ayarlar 
FOR SELECT USING (true);

-- FOTOGRAFLAR tablosu için slider read policy
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fotograflar_read_slider ON public.fotograflar;
CREATE POLICY fotograflar_read_slider ON public.fotograflar 
FOR SELECT USING (
  aktif = true AND (
    gorsel_tipi = 'slider' OR 
    kullanim_alani @> ARRAY['ana-sayfa-slider'] OR
    kullanim_alani @> ARRAY['slider']
  )
);

-- FOTOGRAFLAR tablosu için genel galeri read policy
DROP POLICY IF EXISTS fotograflar_read_galeri ON public.fotograflar;
CREATE POLICY fotograflar_read_galeri ON public.fotograflar 
FOR SELECT USING (
  aktif = true AND gorsel_tipi = 'galeri'
);

-- PROFILES tablosu için user read policy
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles 
FOR SELECT USING (auth.uid() = user_id);

-- KATEGORILER tablosu için read policy
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kategoriler_read_all ON public.kategoriler;
CREATE POLICY kategoriler_read_all ON public.kategoriler 
FOR SELECT USING (aktif = true);

-- SERVIS_BEDELLERI tablosu için read policy
ALTER TABLE public.servis_bedelleri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS servis_bedelleri_read_all ON public.servis_bedelleri;
CREATE POLICY servis_bedelleri_read_all ON public.servis_bedelleri 
FOR SELECT USING (aktif = true);

-- HESAPLAMA_URUNLERI tablosu için read policy
ALTER TABLE public.hesaplama_urunleri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hesaplama_urunleri_read_all ON public.hesaplama_urunleri;
CREATE POLICY hesaplama_urunleri_read_all ON public.hesaplama_urunleri 
FOR SELECT USING (aktif = true);

-- HESAPLAMA_FIYATLAR tablosu için read policy
ALTER TABLE public.hesaplama_fiyatlar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hesaplama_fiyatlar_read_all ON public.hesaplama_fiyatlar;
CREATE POLICY hesaplama_fiyatlar_read_all ON public.hesaplama_fiyatlar 
FOR SELECT USING (true);

-- EK_OZELLIKLER tablosu için read policy
ALTER TABLE public.ek_ozellikler ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ek_ozellikler_read_all ON public.ek_ozellikler;
CREATE POLICY ek_ozellikler_read_all ON public.ek_ozellikler 
FOR SELECT USING (aktif = true);

-- MARKA_LOGOLARI tablosu için read policy
ALTER TABLE public.marka_logolari ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS marka_logolari_read_all ON public.marka_logolari;
CREATE POLICY marka_logolari_read_all ON public.marka_logolari 
FOR SELECT USING (aktif = true);

-- KULLANICI_ROLLERI tablosu için read policy
ALTER TABLE public.kullanici_rolleri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kullanici_rolleri_read_own ON public.kullanici_rolleri;
CREATE POLICY kullanici_rolleri_read_own ON public.kullanici_rolleri 
FOR SELECT USING (auth.uid() = user_id);

-- SETTINGS tablosu için read policy
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS settings_read_all ON public.settings;
CREATE POLICY settings_read_all ON public.settings 
FOR SELECT USING (true);

-- Anon ve authenticated rollere gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon, authenticated;
GRANT SELECT ON public.fotograflar TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.kategoriler TO anon, authenticated;
GRANT SELECT ON public.servis_bedelleri TO anon, authenticated;
GRANT SELECT ON public.hesaplama_urunleri TO anon, authenticated;
GRANT SELECT ON public.hesaplama_fiyatlar TO anon, authenticated;
GRANT SELECT ON public.ek_ozellikler TO anon, authenticated;
GRANT SELECT ON public.marka_logolari TO anon, authenticated;
GRANT SELECT ON public.kullanici_rolleri TO authenticated;
GRANT SELECT ON public.settings TO anon, authenticated;

-- Video galeri için de policy ekle
ALTER TABLE public.video_galeri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS video_galeri_read_all ON public.video_galeri;
CREATE POLICY video_galeri_read_all ON public.video_galeri 
FOR SELECT USING (aktif = true);
GRANT SELECT ON public.video_galeri TO anon, authenticated;