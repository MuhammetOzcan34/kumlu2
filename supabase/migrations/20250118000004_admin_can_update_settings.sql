-- Ayarlar tablosuna admin erişim policy'si ekleme
-- GitHub referansı: 20230906123000_admin_can_update_settings.sql

-- Ayarlar tablosu için RLS'yi etkinleştir
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut ayarlar tablosu policy'lerini temizle
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON public.ayarlar;
DROP POLICY IF EXISTS "Sadece admin ayarları güncelleyebilir" ON public.ayarlar;
DROP POLICY IF EXISTS "Admin ayarları yönetebilir" ON public.ayarlar;

-- Herkes ayarları okuyabilir
CREATE POLICY "Herkes ayarları okuyabilir" ON public.ayarlar
    FOR SELECT
    USING (true);

-- Sadece admin ayarları güncelleyebilir
CREATE POLICY "Sadece admin ayarları güncelleyebilir" ON public.ayarlar
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.kullanici_rolleri kr
            WHERE kr.email = auth.email()
            AND kr.role = 'admin'
        )
    );

-- Sadece admin ayarları ekleyebilir
CREATE POLICY "Sadece admin ayarları ekleyebilir" ON public.ayarlar
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.kullanici_rolleri kr
            WHERE kr.email = auth.email()
            AND kr.role = 'admin'
        )
    );

-- Sadece admin ayarları silebilir
CREATE POLICY "Sadece admin ayarları silebilir" ON public.ayarlar
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.kullanici_rolleri kr
            WHERE kr.email = auth.email()
            AND kr.role = 'admin'
        )
    );

-- Ayarlar tablosuna gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ayarlar TO authenticated;

COMMIT;