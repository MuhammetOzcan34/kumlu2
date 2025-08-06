-- Eksik tabloları ve hatalarını düzeltme

-- 1. Reklam kampanyaları tablosu (404 hatası) - kategori_id'yi integer yap
CREATE TABLE IF NOT EXISTS reklam_kampanyalari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  baslangic_tarihi DATE,
  bitis_tarihi DATE,
  butce DECIMAL(10,2),
  durum TEXT DEFAULT 'aktif',
  kategori_id INTEGER REFERENCES kategoriler(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Kategoriler tablosu RLS düzeltme
DROP POLICY IF EXISTS "Allow public read access to categories" ON kategoriler;
CREATE POLICY "Allow public read access to categories" ON kategoriler
  FOR SELECT USING (true);

-- 3. Fotograflar tablosu RLS düzeltme  
DROP POLICY IF EXISTS "Allow public read access to photos" ON fotograflar;
CREATE POLICY "Allow public read access to photos" ON fotograflar
  FOR SELECT USING (true);

-- 4. Reklam kampanyaları RLS
ALTER TABLE reklam_kampanyalari ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to campaigns" ON reklam_kampanyalari
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage campaigns" ON reklam_kampanyalari
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- 5. Storage bucket'ları kontrol et ve düzelt
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotograflar', 'fotograflar', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS politikaları (IF NOT EXISTS kullanmadan)
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotograflar');

DROP POLICY IF EXISTS "Admin upload access" ON storage.objects;
CREATE POLICY "Admin upload access" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotograflar' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Eksik trigger'ları ekle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları ekle (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_reklam_kampanyalari_updated_at') THEN
        CREATE TRIGGER update_reklam_kampanyalari_updated_at
            BEFORE UPDATE ON reklam_kampanyalari
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$; 