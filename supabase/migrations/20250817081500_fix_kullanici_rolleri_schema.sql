-- Enum tipi tanımı (varsa atla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
  END IF;
END $$;

-- Kolonları ekle (varsa atla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kullanici_rolleri' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.kullanici_rolleri
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kullanici_rolleri' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.kullanici_rolleri
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Email için UNIQUE constraint (varsa atla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'kullanici_rolleri' AND indexname = 'kullanici_rolleri_email_key'
  ) THEN
    ALTER TABLE public.kullanici_rolleri
    ADD CONSTRAINT kullanici_rolleri_email_key UNIQUE (email);
  END IF;
END $$;

-- Role alanını enum'a çevir (varsa atla)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kullanici_rolleri' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.kullanici_rolleri
    ALTER COLUMN role TYPE user_role USING role::user_role;
  END IF;
END $$;

-- Varsayılan değerleri tanımla
ALTER TABLE public.kullanici_rolleri
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE public.kullanici_rolleri
ALTER COLUMN updated_at SET DEFAULT NOW();

-- NOT NULL zorunluluğu (varsa uygula)
ALTER TABLE public.kullanici_rolleri
ALTER COLUMN email SET NOT NULL;

ALTER TABLE public.kullanici_rolleri
ALTER COLUMN role SET NOT NULL;

ALTER TABLE public.kullanici_rolleri
ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.kullanici_rolleri
ALTER COLUMN updated_at SET NOT NULL;
