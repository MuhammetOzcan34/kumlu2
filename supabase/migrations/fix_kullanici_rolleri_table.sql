-- kullanici_rolleri tablosunu düzelt
-- updated_at kolonu ve user_id kolonu ekle
-- Role constraint'ini güncelle

-- updated_at kolonu ekle
ALTER TABLE public.kullanici_rolleri 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- user_id kolonu ekle (auth.users tablosu ile ilişki için)
ALTER TABLE public.kullanici_rolleri 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- updated_at otomatik güncelleme trigger'ı oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı kullanici_rolleri tablosuna ekle
DROP TRIGGER IF EXISTS update_kullanici_rolleri_updated_at ON public.kullanici_rolleri;
CREATE TRIGGER update_kullanici_rolleri_updated_at
    BEFORE UPDATE ON public.kullanici_rolleri
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Role constraint'ini güncelle (moderator ekle)
ALTER TABLE public.kullanici_rolleri 
DROP CONSTRAINT IF EXISTS kullanici_rolleri_role_check;

ALTER TABLE public.kullanici_rolleri 
ADD CONSTRAINT kullanici_rolleri_role_check 
CHECK (role IN ('user', 'admin', 'manager', 'moderator'));

-- Mevcut kayıtlar için user_id'leri güncelle (eğer auth.users'da eşleşen email varsa)
UPDATE public.kullanici_rolleri 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE kullanici_rolleri.email = auth_users.email
AND kullanici_rolleri.user_id IS NULL;

-- Email ve user_id için unique constraint ekle
CREATE UNIQUE INDEX IF NOT EXISTS kullanici_rolleri_user_id_unique 
ON public.kullanici_rolleri(user_id) 
WHERE user_id IS NOT NULL;

-- Yorum ekle
COMMENT ON TABLE public.kullanici_rolleri IS 'Kullanıcı rolleri ve yetkileri tablosu';
COMMENT ON COLUMN public.kullanici_rolleri.user_id IS 'auth.users tablosuna referans';
COMMENT ON COLUMN public.kullanici_rolleri.updated_at IS 'Son güncelleme zamanı (otomatik)';
COMMENT ON COLUMN public.kullanici_rolleri.role IS 'Kullanıcı rolü: user, admin, manager, moderator';