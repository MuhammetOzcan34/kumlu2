-- Yeni kullanıcı eklendiğinde admin rolü atama trigger'ı
-- GitHub referansı: 20230904120000_admin_trigger_on_user_insert.sql

-- Önce mevcut trigger ve fonksiyonu temizle
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Yeni kullanıcı oluşturulduğunda çalışacak fonksiyon
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Profiles tablosuna kullanıcı kaydı ekle
    INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'user', -- Varsayılan rol user
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();

    -- Kullanici_rolleri tablosuna rol kaydı ekle
    INSERT INTO public.kullanici_rolleri (email, role, created_at, updated_at)
    VALUES (
        NEW.email,
        'user', -- Varsayılan rol user
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        updated_at = NOW();

    -- Eğer bu ilk kullanıcıysa admin yap
    IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
        -- Profiles tablosunda admin yap
        UPDATE public.profiles 
        SET role = 'admin', updated_at = NOW()
        WHERE id = NEW.id;
        
        -- Kullanici_rolleri tablosunda admin yap
        UPDATE public.kullanici_rolleri 
        SET role = 'admin', is_super_admin = true, updated_at = NOW()
        WHERE email = NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonksiyona gerekli izinleri ver
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

COMMIT;