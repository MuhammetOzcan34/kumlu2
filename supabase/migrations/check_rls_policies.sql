-- RLS politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Admin kullanıcısı için tüm tablolarda CRUD yetkisi ver
-- Önce mevcut admin politikalarını temizle
DROP POLICY IF EXISTS "Admin tam erişim" ON kategoriler;
DROP POLICY IF EXISTS "Admin tam erişim" ON ayarlar;
DROP POLICY IF EXISTS "Admin tam erişim" ON fotograflar;
DROP POLICY IF EXISTS "Admin tam erişim" ON video_galeri;
DROP POLICY IF EXISTS "Admin tam erişim" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "Admin tam erişim" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "Admin tam erişim" ON servis_bedelleri;
DROP POLICY IF EXISTS "Admin tam erişim" ON kampanyalar;
DROP POLICY IF EXISTS "Admin tam erişim" ON reklam_kampanyalari;
DROP POLICY IF EXISTS "Admin tam erişim" ON ek_ozellikler;
DROP POLICY IF EXISTS "Admin tam erişim" ON marka_logolari;
DROP POLICY IF EXISTS "Admin tam erişim" ON sayfa_icerikleri;
DROP POLICY IF EXISTS "Admin tam erişim" ON kullanici_rolleri;
DROP POLICY IF EXISTS "Admin tam erişim" ON user_roles;
DROP POLICY IF EXISTS "Admin tam erişim" ON settings;

-- Admin kullanıcıları için tam CRUD yetkisi ver
CREATE POLICY "Admin tam erişim" ON kategoriler
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON ayarlar
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON fotograflar
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON video_galeri
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON hesaplama_urunleri
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON hesaplama_fiyatlar
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON servis_bedelleri
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON kampanyalar
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON reklam_kampanyalari
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON ek_ozellikler
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON marka_logolari
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON sayfa_icerikleri
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON kullanici_rolleri
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON user_roles
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

CREATE POLICY "Admin tam erişim" ON settings
    FOR ALL
    TO authenticated
    USING ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    WITH CHECK ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin');

-- Tablolara gerekli izinleri ver
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Storage bucket politikalarını güncelle
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fotograflar', 'fotograflar', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage RLS politikalarını güncelle
DROP POLICY IF EXISTS "Admin fotograflar tam erişim" ON storage.objects;
DROP POLICY IF EXISTS "Public fotograflar okuma" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated fotograflar yükleme" ON storage.objects;

CREATE POLICY "Admin fotograflar tam erişim" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    )
    WITH CHECK (
        bucket_id = 'fotograflar' AND 
        ((auth.jwt() ->> 'role')::text = 'admin' OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin')
    );

CREATE POLICY "Public fotograflar okuma" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'fotograflar');

CREATE POLICY "Authenticated fotograflar yükleme" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'fotograflar');