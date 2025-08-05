-- Basit hesaplama migration - sadece gerekli tabloları oluştur

-- Mevcut tabloları kontrol et ve gerekirse sil
DROP TABLE IF EXISTS hesaplama_fiyatlar CASCADE;
DROP TABLE IF EXISTS hesaplama_urunleri CASCADE;

-- Yeni hesaplama_urunleri tablosu
CREATE TABLE hesaplama_urunleri (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  kategori TEXT NOT NULL,
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hesaplama fiyatları tablosu
CREATE TABLE hesaplama_fiyatlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  urun_id UUID REFERENCES hesaplama_urunleri(id) ON DELETE CASCADE,
  metrekare_min DECIMAL(10,2) NOT NULL,
  metrekare_max DECIMAL(10,2) NOT NULL,
  malzeme_fiyat DECIMAL(10,2) NOT NULL,
  montaj_fiyat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX idx_hesaplama_urunleri_aktif ON hesaplama_urunleri(aktif);
CREATE INDEX idx_hesaplama_urunleri_sira ON hesaplama_urunleri(sira_no);
CREATE INDEX idx_hesaplama_fiyatlar_urun ON hesaplama_fiyatlar(urun_id);
CREATE INDEX idx_hesaplama_fiyatlar_metrekare ON hesaplama_fiyatlar(metrekare_min, metrekare_max);

-- RLS politikaları
ALTER TABLE hesaplama_urunleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE hesaplama_fiyatlar ENABLE ROW LEVEL SECURITY;

-- Hesaplama ürünleri için okuma politikası (herkes okuyabilir)
CREATE POLICY "Hesaplama urunleri okuma" ON hesaplama_urunleri
  FOR SELECT USING (true);

-- Hesaplama fiyatları için okuma politikası (herkes okuyabilir)
CREATE POLICY "Hesaplama fiyatlar okuma" ON hesaplama_fiyatlar
  FOR SELECT USING (true);

-- Admin kullanıcılar için yazma politikaları
CREATE POLICY "Hesaplama urunleri yazma" ON hesaplama_urunleri
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Hesaplama fiyatlar yazma" ON hesaplama_fiyatlar
  FOR ALL USING (auth.role() = 'authenticated');

-- Temel malzemeleri ekle
INSERT INTO hesaplama_urunleri (ad, aciklama, kategori, sira_no) VALUES
('Kumlu Folyo Düz', 'Standart kumlu folyo', 'Folyo', 1),
('Kumlu Motifli', 'Desenli kumlu folyo', 'Folyo', 2),
('Cam Filmi', 'Cam filmi uygulaması', 'Cam Filmi', 3),
('Folyo Düz', 'Düz folyo uygulaması', 'Folyo', 4);

-- Temel fiyatları ekle (10-20m²)
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  10,
  20,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 245
    WHEN urun.ad = 'Kumlu Motifli' THEN 410
    WHEN urun.ad = 'Cam Filmi' THEN 230
    WHEN urun.ad = 'Folyo Düz' THEN 330
    ELSE 300
  END,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 290
    WHEN urun.ad = 'Kumlu Motifli' THEN 290
    WHEN urun.ad = 'Cam Filmi' THEN 230
    WHEN urun.ad = 'Folyo Düz' THEN 290
    ELSE 290
  END
FROM hesaplama_urunleri urun;

-- Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
CREATE TRIGGER update_hesaplama_urunleri_updated_at 
    BEFORE UPDATE ON hesaplama_urunleri 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hesaplama_fiyatlar_updated_at 
    BEFORE UPDATE ON hesaplama_fiyatlar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 