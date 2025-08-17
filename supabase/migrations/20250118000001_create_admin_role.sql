-- Admin rolü tanımlama migrasyonu
-- GitHub referansı: 20230829094756_create_admin_role.sql
-- Bu migrasyon admin rolünü tanımlar ve gerekli yapıları oluşturur

-- Admin rolü enum'unu genişlet (eğer yoksa)
DO $$
BEGIN
    -- Profiles tablosundaki role sütununu kontrol et ve admin rolünü ekle
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%profiles_role_check%' 
        AND check_clause LIKE '%admin%'
    ) THEN
        -- Role constraint'ini güncelle
        ALTER TABLE public.profiles 
        DROP CONSTRAINT IF EXISTS profiles_role_check;
        
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'manager'));
        
        RAISE NOTICE 'Admin rolü profiles tablosuna eklendi.';
    ELSE
        RAISE NOTICE 'Admin rolü zaten mevcut.';
    END IF;
END
$$;

-- Kullanici_rolleri tablosundaki role sütununu da güncelle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%kullanici_rolleri_role_check%' 
        AND check_clause LIKE '%admin%'
    ) THEN
        -- Role constraint'ini güncelle
        ALTER TABLE public.kullanici_rolleri 
        DROP CONSTRAINT IF EXISTS kullanici_rolleri_role_check;
        
        ALTER TABLE public.kullanici_rolleri 
        ADD CONSTRAINT kullanici_rolleri_role_check 
        CHECK (role IN ('user', 'admin', 'manager'));
        
        RAISE NOTICE 'Admin rolü kullanici_rolleri tablosuna eklendi.';
    ELSE
        RAISE NOTICE 'Admin rolü kullanici_rolleri tablosunda zaten mevcut.';
    END IF;
END
$$;

-- Admin rolü için gerekli izinleri tanımla
-- Bu aşamada sadece rol tanımlaması yapılır, politikalar sonraki migrasyonlarda eklenecek

-- Başarı mesajı
-- Admin rolü başarıyla tanımlandı. Sonraki migrasyonlarda admin politikaları eklenecek.