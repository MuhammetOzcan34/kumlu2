-- 1. Reklam kampanyaları tablosu (varsa oluşturma)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'reklam_kampanyalari'
  ) THEN
    CREATE TABLE public.reklam_kampanyalari (
      id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      kampanya_adi text NOT NULL,
      platform text NOT NULL CHECK (platform IN ('google_ads', 'instagram', 'facebook')),
      durum text NOT NULL DEFAULT 'taslak' CHECK (durum IN ('taslak', 'aktif', 'duraklatildi', 'tamamlandi')),
      hedef_kitle text,
      butce_gunluk numeric(10,2),
      butce_toplam numeric(10,2),
      baslangic_tarihi date,
      bitis_tarihi date,
      reklam_metni text,
      hedef_url text,
      kategori_id uuid REFERENCES public.kategoriler(id),
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now(),
      aktif boolean DEFAULT true
    );
  END IF;
END $$;

-- 2. RLS aktif et
ALTER TABLE public.reklam_kampanyalari ENABLE ROW LEVEL SECURITY;

-- 3. Admin policy'leri (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.reklam_kampanyalari;
CREATE POLICY "Admins can view all campaigns"
ON public.reklam_kampanyalari
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can insert campaigns" ON public.reklam_kampanyalari;
CREATE POLICY "Admins can insert campaigns"
ON public.reklam_kampanyalari
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update campaigns" ON public.reklam_kampanyalari;
CREATE POLICY "Admins can update campaigns"
ON public.reklam_kampanyalari
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.reklam_kampanyalari;
CREATE POLICY "Admins can delete campaigns"
ON public.reklam_kampanyalari
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger tanımı
DROP TRIGGER IF EXISTS update_reklam_kampanyalari_updated_at ON public.reklam_kampanyalari;
CREATE TRIGGER update_reklam_kampanyalari_updated_at
BEFORE UPDATE ON public.reklam_kampanyalari
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 6. CRUD policy'leri: kategoriler
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert categories" ON public.kategoriler;
CREATE POLICY "Admins can insert categories"
ON public.kategoriler
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update categories" ON public.kategoriler;
CREATE POLICY "Admins can update categories"
ON public.kategoriler
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete categories" ON public.kategoriler;
CREATE POLICY "Admins can delete categories"
ON public.kategoriler
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. CRUD policy'leri: fotograflar
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert photos" ON public.fotograflar;
CREATE POLICY "Admins can insert photos"
ON public.fotograflar
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update photos" ON public.fotograflar;
CREATE POLICY "Admins can update photos"
ON public.fotograflar
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete photos" ON public.fotograflar;
CREATE POLICY "Admins can delete photos"
ON public.fotograflar
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 8. CRUD policy'leri: ayarlar
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert settings" ON public.ayarlar;
CREATE POLICY "Admins can insert settings"
ON public.ayarlar
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can update settings" ON public.ayarlar;
CREATE POLICY "Admins can update settings"
ON public.ayarlar
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can delete settings" ON public.ayarlar;
CREATE POLICY "Admins can delete settings"
ON public.ayarlar
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
