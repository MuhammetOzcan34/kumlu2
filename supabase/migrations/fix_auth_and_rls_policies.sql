-- 1. Kullanıcı metadata: admin role ekle
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{role}',
  '"admin"',
  true
)
WHERE email = 'admin@kumlu2.com';

-- 2. Eksik user_id kolonları
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sayfa_icerikleri' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.sayfa_icerikleri ADD COLUMN user_id uuid;
  END IF;
END $$;

-- 3. RLS ve policy tanımları
ALTER TABLE public.sayfa_icerikleri ENABLE ROW LEVEL SECURITY;

-- Policy: kullanıcı kendi içeriklerini görebilir
DROP POLICY IF EXISTS read_own ON public.sayfa_icerikleri;
CREATE POLICY read_own ON public.sayfa_icerikleri
FOR SELECT USING (auth.uid() = user_id);

-- Policy: admin her şeyi görebilir
DROP POLICY IF EXISTS admin_read_all ON public.sayfa_icerikleri;
CREATE POLICY admin_read_all ON public.sayfa_icerikleri
FOR SELECT USING (auth.role() = 'admin');

-- 4. kullanici_rolleri tablosu tamiri
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kullanici_rolleri' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.kullanici_rolleri ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kullanici_rolleri' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.kullanici_rolleri ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- role için CHECK constraint
ALTER TABLE public.kullanici_rolleri
DROP CONSTRAINT IF EXISTS role_check;

ALTER TABLE public.kullanici_rolleri
ADD CONSTRAINT role_check CHECK (role IN ('user', 'admin', 'moderator'));