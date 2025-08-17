-- Mevcut tablolar için RLS politikalarını düzelt
-- Döngüsel referansları önlemek için kullanici_rolleri tablosunu kullan

-- Servis bedelleri tablosu politikaları
DROP POLICY IF EXISTS "servis_bedelleri_select" ON servis_bedelleri;
DROP POLICY IF EXISTS "servis_bedelleri_admin" ON servis_bedelleri;
DROP POLICY IF EXISTS "servis_bedelleri_insert" ON servis_bedelleri;
DROP POLICY IF EXISTS "servis_bedelleri_update" ON servis_bedelleri;
DROP POLICY IF EXISTS "servis_bedelleri_delete" ON servis_bedelleri;

CREATE POLICY "servis_bedelleri_select" ON servis_bedelleri
    FOR SELECT USING (true);

CREATE POLICY "servis_bedelleri_admin" ON servis_bedelleri
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Hesaplama ürünleri tablosu politikaları
DROP POLICY IF EXISTS "hesaplama_urunleri_select" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "hesaplama_urunleri_admin" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "hesaplama_urunleri_insert" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "hesaplama_urunleri_update" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "hesaplama_urunleri_delete" ON hesaplama_urunleri;

CREATE POLICY "hesaplama_urunleri_select" ON hesaplama_urunleri
    FOR SELECT USING (true);

CREATE POLICY "hesaplama_urunleri_admin" ON hesaplama_urunleri
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Video galeri tablosu politikaları
DROP POLICY IF EXISTS "video_galeri_select" ON video_galeri;
DROP POLICY IF EXISTS "video_galeri_admin" ON video_galeri;
DROP POLICY IF EXISTS "video_galeri_insert" ON video_galeri;
DROP POLICY IF EXISTS "video_galeri_update" ON video_galeri;
DROP POLICY IF EXISTS "video_galeri_delete" ON video_galeri;

CREATE POLICY "video_galeri_select" ON video_galeri
    FOR SELECT USING (true);

CREATE POLICY "video_galeri_admin" ON video_galeri
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Settings tablosu politikaları
DROP POLICY IF EXISTS "settings_select" ON settings;
DROP POLICY IF EXISTS "settings_admin" ON settings;
DROP POLICY IF EXISTS "settings_insert" ON settings;
DROP POLICY IF EXISTS "settings_update" ON settings;
DROP POLICY IF EXISTS "settings_delete" ON settings;

CREATE POLICY "settings_select" ON settings
    FOR SELECT USING (true);

CREATE POLICY "settings_admin" ON settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Hesaplama fiyatlar tablosu politikaları
DROP POLICY IF EXISTS "hesaplama_fiyatlar_select" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "hesaplama_fiyatlar_admin" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "hesaplama_fiyatlar_insert" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "hesaplama_fiyatlar_update" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "hesaplama_fiyatlar_delete" ON hesaplama_fiyatlar;

CREATE POLICY "hesaplama_fiyatlar_select" ON hesaplama_fiyatlar
    FOR SELECT USING (true);

CREATE POLICY "hesaplama_fiyatlar_admin" ON hesaplama_fiyatlar
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Ek özellikler tablosu politikaları
DROP POLICY IF EXISTS "ek_ozellikler_select" ON ek_ozellikler;
DROP POLICY IF EXISTS "ek_ozellikler_admin" ON ek_ozellikler;
DROP POLICY IF EXISTS "ek_ozellikler_insert" ON ek_ozellikler;
DROP POLICY IF EXISTS "ek_ozellikler_update" ON ek_ozellikler;
DROP POLICY IF EXISTS "ek_ozellikler_delete" ON ek_ozellikler;

CREATE POLICY "ek_ozellikler_select" ON ek_ozellikler
    FOR SELECT USING (true);

CREATE POLICY "ek_ozellikler_admin" ON ek_ozellikler
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Marka logoları tablosu politikaları
DROP POLICY IF EXISTS "marka_logolari_select" ON marka_logolari;
DROP POLICY IF EXISTS "marka_logolari_admin" ON marka_logolari;
DROP POLICY IF EXISTS "marka_logolari_insert" ON marka_logolari;
DROP POLICY IF EXISTS "marka_logolari_update" ON marka_logolari;
DROP POLICY IF EXISTS "marka_logolari_delete" ON marka_logolari;

CREATE POLICY "marka_logolari_select" ON marka_logolari
    FOR SELECT USING (true);

CREATE POLICY "marka_logolari_admin" ON marka_logolari
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Kategoriler tablosu politikaları
DROP POLICY IF EXISTS "kategoriler_select" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_admin" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_insert" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_update" ON kategoriler;
DROP POLICY IF EXISTS "kategoriler_delete" ON kategoriler;

CREATE POLICY "kategoriler_select" ON kategoriler
    FOR SELECT USING (true);

CREATE POLICY "kategoriler_admin" ON kategoriler
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Kampanyalar tablosu politikaları
DROP POLICY IF EXISTS "kampanyalar_select" ON kampanyalar;
DROP POLICY IF EXISTS "kampanyalar_admin" ON kampanyalar;
DROP POLICY IF EXISTS "kampanyalar_insert" ON kampanyalar;
DROP POLICY IF EXISTS "kampanyalar_update" ON kampanyalar;
DROP POLICY IF EXISTS "kampanyalar_delete" ON kampanyalar;

CREATE POLICY "kampanyalar_select" ON kampanyalar
    FOR SELECT USING (true);

CREATE POLICY "kampanyalar_admin" ON kampanyalar
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Reklam kampanyaları tablosu politikaları
DROP POLICY IF EXISTS "reklam_kampanyalari_select" ON reklam_kampanyalari;
DROP POLICY IF EXISTS "reklam_kampanyalari_admin" ON reklam_kampanyalari;
DROP POLICY IF EXISTS "reklam_kampanyalari_insert" ON reklam_kampanyalari;
DROP POLICY IF EXISTS "reklam_kampanyalari_update" ON reklam_kampanyalari;
DROP POLICY IF EXISTS "reklam_kampanyalari_delete" ON reklam_kampanyalari;

CREATE POLICY "reklam_kampanyalari_select" ON reklam_kampanyalari
    FOR SELECT USING (true);

CREATE POLICY "reklam_kampanyalari_admin" ON reklam_kampanyalari
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- User roles tablosu politikaları
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin" ON user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;

CREATE POLICY "user_roles_select" ON user_roles
    FOR SELECT USING (true);

CREATE POLICY "user_roles_admin" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM kullanici_rolleri kr 
            WHERE kr.email = auth.jwt() ->> 'email' 
            AND kr.role IN ('admin', 'manager')
        )
    );

-- Tüm tablolara izinler ver
GRANT SELECT ON ayarlar TO anon, authenticated;
GRANT SELECT ON fotograflar TO anon, authenticated;
GRANT SELECT ON servis_bedelleri TO anon, authenticated;
GRANT SELECT ON hesaplama_urunleri TO anon, authenticated;
GRANT SELECT ON hesaplama_fiyatlar TO anon, authenticated;
GRANT SELECT ON video_galeri TO anon, authenticated;
GRANT SELECT ON ek_ozellikler TO anon, authenticated;
GRANT SELECT ON marka_logolari TO anon, authenticated;
GRANT SELECT ON kategoriler TO anon, authenticated;
GRANT SELECT ON kampanyalar TO anon, authenticated;
GRANT SELECT ON reklam_kampanyalari TO anon, authenticated;
GRANT SELECT ON user_roles TO anon, authenticated;
GRANT SELECT ON settings TO anon, authenticated;
GRANT SELECT ON kullanici_rolleri TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;

-- Admin işlemleri için tam yetki
GRANT ALL PRIVILEGES ON ayarlar TO authenticated;
GRANT ALL PRIVILEGES ON fotograflar TO authenticated;
GRANT ALL PRIVILEGES ON servis_bedelleri TO authenticated;
GRANT ALL PRIVILEGES ON hesaplama_urunleri TO authenticated;
GRANT ALL PRIVILEGES ON hesaplama_fiyatlar TO authenticated;
GRANT ALL PRIVILEGES ON video_galeri TO authenticated;
GRANT ALL PRIVILEGES ON ek_ozellikler TO authenticated;
GRANT ALL PRIVILEGES ON marka_logolari TO authenticated;
GRANT ALL PRIVILEGES ON kategoriler TO authenticated;
GRANT ALL PRIVILEGES ON kampanyalar TO authenticated;
GRANT ALL PRIVILEGES ON reklam_kampanyalari TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON settings TO authenticated;
GRANT ALL PRIVILEGES ON kullanici_rolleri TO authenticated;
GRANT ALL PRIVILEGES ON profiles TO authenticated;