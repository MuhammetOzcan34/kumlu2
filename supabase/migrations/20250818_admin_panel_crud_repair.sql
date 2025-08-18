-- Admin Panel CRUD Repair Migration
-- Bu migration dosyası admin panelindeki tüm CRUD işlemlerini düzeltir
-- Tarih: 2025-01-18
-- Amaç: RLS policy'leri, UNIQUE constraint'ler ve storage bucket policy'lerini düzelt

-- =====================================================
-- 1. AYARLAR TABLOSU DÜZELTMELERI
-- =====================================================

-- Ayarlar tablosu için UNIQUE constraint ekle (eğer yoksa)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'ayarlar' 
    AND constraint_type = 'UNIQUE' 
    AND constraint_name = 'ayarlar_anahtar_unique'
  ) THEN 
    ALTER TABLE public.ayarlar ADD CONSTRAINT ayarlar_anahtar_unique UNIQUE (anahtar); 
    RAISE NOTICE 'Ayarlar tablosuna UNIQUE constraint eklendi';
  ELSE
    RAISE NOTICE 'Ayarlar tablosunda UNIQUE constraint zaten mevcut';
  END IF; 
END $$;

-- Ayarlar tablosu için RLS etkinleştir
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Ayarlar tablosu için okuma policy'si (herkese açık)
DROP POLICY IF EXISTS ayarlar_read_all ON public.ayarlar;
CREATE POLICY ayarlar_read_all ON public.ayarlar 
  FOR SELECT 
  USING (true);

-- Ayarlar tablosu için admin CRUD policy'si
DROP POLICY IF EXISTS ayarlar_admin_crud ON public.ayarlar;
CREATE POLICY ayarlar_admin_crud ON public.ayarlar 
  FOR ALL 
  TO authenticated 
  USING (auth.role() = 'admin') 
  WITH CHECK (auth.role() = 'admin');

-- =====================================================
-- 2. FOTOGRAFLAR TABLOSU DÜZELTMELERI
-- =====================================================

-- Fotograflar tablosu için RLS etkinleştir
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

-- Fotograflar tablosu için okuma policy'si (herkese açık)
DROP POLICY IF EXISTS fotograflar_read_all ON public.fotograflar;
CREATE POLICY fotograflar_read_all ON public.fotograflar 
  FOR SELECT 
  USING (true);

-- Fotograflar tablosu için admin CRUD policy'si
DROP POLICY IF EXISTS fotograflar_admin_crud ON public.fotograflar;
CREATE POLICY fotograflar_admin_crud ON public.fotograflar 
  FOR ALL 
  TO authenticated 
  USING (auth.role() = 'admin') 
  WITH CHECK (auth.role() = 'admin');

-- =====================================================
-- 3. KATEGORILER TABLOSU DÜZELTMELERI
-- =====================================================

-- Kategoriler tablosu için RLS etkinleştir
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

-- Kategoriler tablosu için okuma policy'si (herkese açık)
DROP POLICY IF EXISTS kategoriler_read_all ON public.kategoriler;
CREATE POLICY kategoriler_read_all ON public.kategoriler 
  FOR SELECT 
  USING (true);

-- Kategoriler tablosu için admin CRUD policy'si
DROP POLICY IF EXISTS kategoriler_admin_crud ON public.kategoriler;
CREATE POLICY kategoriler_admin_crud ON public.kategoriler 
  FOR ALL 
  TO authenticated 
  USING (auth.role() = 'admin') 
  WITH CHECK (auth.role() = 'admin');

-- =====================================================
-- 4. STORAGE BUCKET POLICY'LERI
-- =====================================================

-- Storage objects için admin upload policy'si
DROP POLICY IF EXISTS allow_admin_uploads ON storage.objects;
CREATE POLICY allow_admin_uploads ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.role() = 'admin');

-- Storage objects için admin update policy'si
DROP POLICY IF EXISTS allow_admin_updates ON storage.objects;
CREATE POLICY allow_admin_updates ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (auth.role() = 'admin') 
  WITH CHECK (auth.role() = 'admin');

-- Storage objects için admin delete policy'si
DROP POLICY IF EXISTS allow_admin_deletes ON storage.objects;
CREATE POLICY allow_admin_deletes ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (auth.role() = 'admin');

-- Storage objects için public read policy'si
DROP POLICY IF EXISTS allow_public_reads ON storage.objects;
CREATE POLICY allow_public_reads ON storage.objects 
  FOR SELECT 
  USING (true);

-- =====================================================
-- 5. ANON VE AUTHENTICATED ROLE İZİNLERİ
-- =====================================================

-- Anon role için SELECT izinleri
GRANT SELECT ON public.ayarlar TO anon;
GRANT SELECT ON public.fotograflar TO anon;
GRANT SELECT ON public.kategoriler TO anon;

-- Authenticated role için tam izinler
GRANT ALL PRIVILEGES ON public.ayarlar TO authenticated;
GRANT ALL PRIVILEGES ON public.fotograflar TO authenticated;
GRANT ALL PRIVILEGES ON public.kategoriler TO authenticated;

-- =====================================================
-- 6. SEQUENCE İZİNLERİ (ID OTOMATIK ARTIRMA)
-- =====================================================

-- Fotograflar tablosu sequence izinleri
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'fotograflar_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.fotograflar_id_seq TO authenticated;
    RAISE NOTICE 'Fotograflar sequence izinleri verildi';
  END IF;
END $$;

-- Kategoriler tablosu sequence izinleri
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'kategoriler_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.kategoriler_id_seq TO authenticated;
    RAISE NOTICE 'Kategoriler sequence izinleri verildi';
  END IF;
END $$;

-- Ayarlar tablosu sequence izinleri
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'ayarlar_id_seq') THEN
    GRANT USAGE, SELECT ON SEQUENCE public.ayarlar_id_seq TO authenticated;
    RAISE NOTICE 'Ayarlar sequence izinleri verildi';
  END IF;
END $$;

-- =====================================================
-- 7. MIGRATION TAMAMLANDI
-- =====================================================

-- Migration başarı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Admin Panel CRUD Repair Migration tamamlandı!';
  RAISE NOTICE '📋 Düzeltilen tablolar: ayarlar, fotograflar, kategoriler';
  RAISE NOTICE '🔒 RLS policy''leri aktif edildi';
  RAISE NOTICE '📁 Storage bucket policy''leri güncellendi';
  RAISE NOTICE '👥 Anon ve authenticated role izinleri verildi';
END $$;