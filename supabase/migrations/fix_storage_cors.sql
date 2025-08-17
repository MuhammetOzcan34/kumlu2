-- Storage CORS ayarlarını düzelt
-- Önce mevcut CORS ayarlarını kontrol et ve güncelle

-- Fotograflar bucket'ını güncelle
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
WHERE id = 'fotograflar';

-- Eğer bucket yoksa oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fotograflar', 'fotograflar', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO NOTHING;

-- Storage objects tablosunda RLS'yi etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Mevcut storage politikalarını temizle
DROP POLICY IF EXISTS "Admin fotograflar tam erişim" ON storage.objects;
DROP POLICY IF EXISTS "Public fotograflar okuma" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated fotograflar yükleme" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin full access" ON storage.objects;

-- Yeni storage politikalarını oluştur
-- 1. Herkese okuma izni
CREATE POLICY "Public fotograflar okuma" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'fotograflar');

-- 2. Kimliği doğrulanmış kullanıcılara yükleme izni
CREATE POLICY "Authenticated fotograflar yükleme" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'fotograflar');

-- 3. Admin kullanıcılarına tam erişim
CREATE POLICY "Admin fotograflar tam erişim" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        (
            (auth.jwt() ->> 'role')::text = 'admin' OR 
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' OR
            (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
        )
    )
    WITH CHECK (
        bucket_id = 'fotograflar' AND 
        (
            (auth.jwt() ->> 'role')::text = 'admin' OR 
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin' OR
            (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
        )
    );

-- 4. Kimliği doğrulanmış kullanıcılara güncelleme izni (kendi dosyaları)
CREATE POLICY "Authenticated fotograflar güncelleme" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        (
            auth.uid()::text = (metadata->>'uploader')::text OR
            (auth.jwt() ->> 'role')::text = 'admin' OR 
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
        )
    )
    WITH CHECK (
        bucket_id = 'fotograflar' AND 
        (
            auth.uid()::text = (metadata->>'uploader')::text OR
            (auth.jwt() ->> 'role')::text = 'admin' OR 
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
        )
    );

-- 5. Silme izni (admin veya dosya sahibi)
CREATE POLICY "Authenticated fotograflar silme" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        (
            auth.uid()::text = (metadata->>'uploader')::text OR
            (auth.jwt() ->> 'role')::text = 'admin' OR 
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
        )
    );

-- Storage buckets tablosuna da RLS politikaları ekle
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
CREATE POLICY "Public bucket access" ON storage.buckets
    FOR SELECT
    TO public
    USING (true);

-- Gerekli izinleri ver
GRANT SELECT ON storage.buckets TO public;
GRANT SELECT ON storage.objects TO public;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- CORS ayarları için gerekli fonksiyonları oluştur (eğer yoksa)
CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN split_part(name, '.', -1);
END;
$$;

CREATE OR REPLACE FUNCTION storage.filename(name text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN split_part(name, '/', -1);
END;
$$;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN string_to_array(replace(name, storage.filename(name), ''), '/');
END;
$$;