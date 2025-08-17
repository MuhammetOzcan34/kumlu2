-- Hesaplama tablolarını yeni yapıya göre güncelleme

-- 1. Eski tabloyu yedekle
CREATE TABLE IF NOT EXISTS hesaplama_urunleri_backup AS 
SELECT * FROM hesaplama_urunleri;

-- 2. Eski tabloyu sil
DROP TABLE IF EXISTS hesaplama_urunleri CASCADE;
DROP TABLE IF EXISTS hesaplama_fiyatlar CASCADE;

-- 3. Yeni hesaplama_urunleri tablosu
CREATE TABLE IF NOT EXISTS hesaplama_urunleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  kategori TEXT NOT NULL,
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Yeni hesaplama_fiyatlar tablosu
CREATE TABLE IF NOT EXISTS hesaplama_fiyatlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  urun_id UUID REFERENCES hesaplama_urunleri(id) ON DELETE CASCADE,
  metrekare_min DECIMAL(10,2) NOT NULL,
  metrekare_max DECIMAL(10,2) NOT NULL,
  malzeme_fiyat DECIMAL(10,2) NOT NULL,
  montaj_fiyat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_hesaplama_urunleri_aktif ON hesaplama_urunleri(aktif);
CREATE INDEX IF NOT EXISTS idx_hesaplama_urunleri_sira ON hesaplama_urunleri(sira_no);
CREATE INDEX IF NOT EXISTS idx_hesaplama_fiyatlar_urun ON hesaplama_fiyatlar(urun_id);
CREATE INDEX IF NOT EXISTS idx_hesaplama_fiyatlar_metrekare ON hesaplama_fiyatlar(metrekare_min, metrekare_max);

-- 6. RLS politikaları
ALTER TABLE hesaplama_urunleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE hesaplama_fiyatlar ENABLE ROW LEVEL SECURITY;

-- 7. Okuma politikaları (herkes okuyabilir)
DROP POLICY IF EXISTS "Hesaplama urunleri okuma" ON hesaplama_urunleri;
CREATE POLICY "Hesaplama urunleri okuma" ON hesaplama_urunleri
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Hesaplama fiyatlar okuma" ON hesaplama_fiyatlar;
CREATE POLICY "Hesaplama fiyatlar okuma" ON hesaplama_fiyatlar
  FOR SELECT USING (true);

-- 8. Yazma politikaları (authenticated kullanıcılar)
DROP POLICY IF EXISTS "Hesaplama urunleri yazma" ON hesaplama_urunleri;
CREATE POLICY "Hesaplama urunleri yazma" ON hesaplama_urunleri
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Hesaplama fiyatlar yazma" ON hesaplama_fiyatlar;
CREATE POLICY "Hesaplama fiyatlar yazma" ON hesaplama_fiyatlar
  FOR ALL USING (auth.role() = 'authenticated');

-- 9. Örnek ürün verileri
INSERT INTO hesaplama_urunleri (ad, aciklama, kategori, sira_no)
VALUES
  ('Kumlu Folyo Düz', 'Standart kumlu folyo', 'Folyo', 1),
  ('Kumlu Motifli', 'Desenli kumlu folyo', 'Folyo', 2),
  ('Cam Filmi', 'Cam filmi uygulaması', 'Cam Filmi', 3),
  ('Folyo Düz', 'Düz folyo uygulaması', 'Folyo', 4)
ON CONFLICT (ad) DO NOTHING;

-- 10. Örnek fiyatlar (10–20 m²)
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  10,
  20,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 245
    WHEN 'Kumlu Motifli' THEN 410
    WHEN 'Cam Filmi' THEN 230
    WHEN 'Folyo Düz' THEN 330
  END,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 290
    WHEN 'Kumlu Motifli' THEN 290
    WHEN 'Cam Filmi' THEN 230
    WHEN 'Folyo Düz' THEN 290
  END
FROM hesaplama_urunleri urun
WHERE urun.ad IN ('Kumlu Folyo Düz', 'Kumlu Motifli', 'Cam Filmi', 'Folyo Düz');

-- 11. Fiyatlar (21–35 m²)
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  21,
  35,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 235
    WHEN 'Kumlu Motifli' THEN 400
    WHEN 'Cam Filmi' THEN 220
    WHEN 'Folyo Düz' THEN 320
  END,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 280
    WHEN 'Kumlu Motifli' THEN 280
    WHEN 'Cam Filmi' THEN 220
    WHEN 'Folyo Düz' THEN 280
  END
FROM hesaplama_urunleri urun
WHERE urun.ad IN ('Kumlu Folyo Düz', 'Kumlu Motifli', 'Cam Filmi', 'Folyo Düz');

-- 12. Fiyatlar (36 m²+)
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  36,
  999999,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 225
    WHEN 'Kumlu Motifli' THEN 390
    WHEN 'Cam Filmi' THEN 210
    WHEN 'Folyo Düz' THEN 310
  END,
  CASE urun.ad
    WHEN 'Kumlu Folyo Düz' THEN 270
    WHEN 'Kumlu Motifli' THEN 270
    WHEN 'Cam Filmi' THEN 210
    WHEN 'Folyo Düz' THEN 270
  END
FROM hesaplama_urunleri urun
WHERE urun.ad IN ('Kumlu Folyo Düz', 'Kumlu Motifli', 'Cam Filmi', 'Folyo Düz');

-- 13. Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Trigger'ları oluştur
DROP TRIGGER IF EXISTS update_hesaplama_urunleri_updated_at ON hesaplama_urunleri;
CREATE TRIGGER update_hesaplama_urunleri_updated_at 
    BEFORE UPDATE ON hesaplama_urunleri 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hesaplama_fiyatlar_updated_at ON hesaplama_fiyatlar;
CREATE TRIGGER update_hesaplama_fiyatlar_updated_at 
    BEFORE UPDATE ON hesaplama_fiyatlar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
