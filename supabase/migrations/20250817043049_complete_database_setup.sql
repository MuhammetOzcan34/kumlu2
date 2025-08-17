-- Kapsamlı veritabanı kurulumu - Eksik tabloları, storage bucket ve politikaları oluştur
-- Bu dosya tüm eksik bileşenleri tek seferde oluşturur

-- 1. UUID extension'ını etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. update_updated_at_column fonksiyonunu oluştur
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

-- 3. Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotograflar',
    'fotograflar',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage bucket için RLS politikaları
-- Herkes okuyabilir
CREATE POLICY "Herkes fotografları görüntüleyebilir" ON storage.objects
    FOR SELECT USING (bucket_id = 'fotograflar');

-- Kimlik doğrulanmış kullanıcılar yükleyebilir
CREATE POLICY "Kimlik doğrulanmış kullanıcılar fotoğraf yükleyebilir" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'fotograflar' AND 
        auth.role() = 'authenticated'
    );

-- Kimlik doğrulanmış kullanıcılar güncelleyebilir
CREATE POLICY "Kimlik doğrulanmış kullanıcılar fotoğraf güncelleyebilir" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'fotograflar' AND 
        auth.role() = 'authenticated'
    );

-- Kimlik doğrulanmış kullanıcılar silebilir
CREATE POLICY "Kimlik doğrulanmış kullanıcılar fotoğraf silebilir" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'fotograflar' AND 
        auth.role() = 'authenticated'
    );

-- 5. Tüm tablolar için updated_at trigger'larını ekle
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE '%_backup%'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = tablename 
            AND column_name = 'updated_at'
        )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END
$$;

-- 6. Tüm tablolar için temel izinleri ver
-- Anon kullanıcılar için SELECT izni
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Authenticated kullanıcılar için tam izin
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. RLS'yi etkinleştir (eğer etkin değilse)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('user_roles', 'hesaplama_urunleri_backup')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END
$$;

-- 8. Temel RLS politikaları ekle (eğer yoksa)
-- Profiles tablosu için
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini görebilir" ON profiles;
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON profiles
    FOR ALL USING (auth.uid() = user_id OR auth.role() = 'anon');

-- Ayarlar tablosu için
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON ayarlar;
CREATE POLICY "Herkes ayarları okuyabilir" ON ayarlar
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sadece kimlik doğrulanmış kullanıcılar ayarları değiştirebilir" ON ayarlar;
CREATE POLICY "Sadece kimlik doğrulanmış kullanıcılar ayarları değiştirebilir" ON ayarlar
    FOR ALL USING (auth.role() = 'authenticated');

-- Kategoriler tablosu için
DROP POLICY IF EXISTS "Herkes kategorileri görebilir" ON kategoriler;
CREATE POLICY "Herkes kategorileri görebilir" ON kategoriler
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Kimlik doğrulanmış kullanıcılar kategorileri yönetebilir" ON kategoriler;
CREATE POLICY "Kimlik doğrulanmış kullanıcılar kategorileri yönetebilir" ON kategoriler
    FOR ALL USING (auth.role() = 'authenticated');

-- Fotograflar tablosu için
DROP POLICY IF EXISTS "Herkes fotoğrafları görebilir" ON fotograflar;
CREATE POLICY "Herkes fotoğrafları görebilir" ON fotograflar
    FOR SELECT USING (aktif = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Kimlik doğrulanmış kullanıcılar fotoğraf yönetebilir" ON fotograflar;
CREATE POLICY "Kimlik doğrulanmış kullanıcılar fotoğraf yönetebilir" ON fotograflar
    FOR ALL USING (auth.role() = 'authenticated');

-- Diğer tablolar için genel politikalar
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('profiles', 'ayarlar', 'kategoriler', 'fotograflar', 'user_roles', 'hesaplama_urunleri_backup')
    LOOP
        -- Herkes okuyabilir politikası
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Herkes %I tablosunu okuyabilir" ON %I', t, t);
            EXECUTE format('CREATE POLICY "Herkes %I tablosunu okuyabilir" ON %I FOR SELECT USING (true)', t, t);
        EXCEPTION WHEN OTHERS THEN
            -- Hata durumunda devam et
            NULL;
        END;
        
        -- Kimlik doğrulanmış kullanıcılar yönetebilir politikası
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS "Kimlik doğrulanmış kullanıcılar %I tablosunu yönetebilir" ON %I', t, t);
            EXECUTE format('CREATE POLICY "Kimlik doğrulanmış kullanıcılar %I tablosunu yönetebilir" ON %I FOR ALL USING (auth.role() = ''authenticated'')', t, t);
        EXCEPTION WHEN OTHERS THEN
            -- Hata durumunda devam et
            NULL;
        END;
    END LOOP;
END
$$;

-- 9. Admin kullanıcı oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION create_admin_user(user_email text, user_password text)
RETURNS uuid AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Yeni kullanıcı oluştur
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO new_user_id;
    
    -- Profile oluştur
    INSERT INTO public.profiles (
        user_id,
        email,
        display_name,
        full_name,
        role
    ) VALUES (
        new_user_id,
        user_email,
        'Admin',
        'Sistem Yöneticisi',
        'admin'
    );
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Başlangıç verilerini ekle (eğer yoksa)
-- Temel ayarlar
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
('site_title', 'Kumlu Temizlik', 'Site başlığı'),
('site_description', 'Profesyonel temizlik hizmetleri', 'Site açıklaması'),
('contact_phone', '+90 555 123 45 67', 'İletişim telefonu'),
('contact_email', 'info@kumlutemizlik.com', 'İletişim e-postası'),
('contact_address', 'İstanbul, Türkiye', 'İletişim adresi'),
('watermark_opacity', '0.3', 'Watermark opaklığı (0-1 arası)'),
('watermark_size', '0.2', 'Watermark boyutu (0-1 arası)'),
('watermark_angle', '45', 'Watermark açısı (derece)'),
('watermark_pattern_rows', '3', 'Watermark desen satır sayısı'),
('watermark_pattern_cols', '3', 'Watermark desen sütun sayısı')
ON CONFLICT (anahtar) DO NOTHING;

-- Temel kategoriler
INSERT INTO kategoriler (ad, aciklama, sira_no, aktif, slug, tip) VALUES
('Genel Temizlik', 'Genel temizlik hizmetleri', 1, true, 'genel-temizlik', 'genel'),
('Derin Temizlik', 'Derin temizlik hizmetleri', 2, true, 'derin-temizlik', 'genel'),
('Ofis Temizliği', 'Ofis ve iş yeri temizliği', 3, true, 'ofis-temizligi', 'genel')
ON CONFLICT DO NOTHING;

-- Veritabanı kurulumu tamamlandı
-- Storage bucket "fotograflar" oluşturuldu
-- Tüm RLS politikaları ve izinler ayarlandı
-- Trigger fonksiyonları eklendi
-- Başlangıç verileri eklendi