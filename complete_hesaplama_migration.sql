-- Tam hesaplama migration - Google Sheets'teki tüm verileri içerir

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

-- Google Sheets'teki tüm malzemeleri ekle
INSERT INTO hesaplama_urunleri (ad, aciklama, kategori, sira_no) VALUES
('Kumlu Folyo Düz', 'Standart kumlu folyo uygulaması', 'Folyo', 1),
('Kumlu Folyo Motifli', 'Desenli kumlu folyo uygulaması', 'Folyo', 2),
('Cam Filmi Düz', 'Standart cam filmi uygulaması', 'Cam Filmi', 3),
('Cam Filmi Yansıtıcı', 'Yansıtıcı cam filmi uygulaması', 'Cam Filmi', 4),
('Cam Filmi UV Korumalı', 'UV korumalı cam filmi uygulaması', 'Cam Filmi', 5),
('Folyo Düz', 'Standart folyo uygulaması', 'Folyo', 6),
('Folyo Motifli', 'Desenli folyo uygulaması', 'Folyo', 7),
('Folyo UV Korumalı', 'UV korumalı folyo uygulaması', 'Folyo', 8),
('Folyo Yansıtıcı', 'Yansıtıcı folyo uygulaması', 'Folyo', 9),
('Özel Kesim Folyo', 'Özel kesim folyo uygulaması', 'Folyo', 10),
('Hızlı Teslimat Folyo', 'Hızlı teslimat folyo uygulaması', 'Folyo', 11),
('Premium Folyo', 'Premium kalite folyo uygulaması', 'Folyo', 12);

-- Google Sheets'teki fiyatları ekle (3 metrekare aralığı için)
-- 10-20m² aralığı
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  10,
  20,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 245
    WHEN urun.ad = 'Kumlu Folyo Motifli' THEN 410
    WHEN urun.ad = 'Cam Filmi Düz' THEN 230
    WHEN urun.ad = 'Cam Filmi Yansıtıcı' THEN 280
    WHEN urun.ad = 'Cam Filmi UV Korumalı' THEN 320
    WHEN urun.ad = 'Folyo Düz' THEN 330
    WHEN urun.ad = 'Folyo Motifli' THEN 450
    WHEN urun.ad = 'Folyo UV Korumalı' THEN 380
    WHEN urun.ad = 'Folyo Yansıtıcı' THEN 420
    WHEN urun.ad = 'Özel Kesim Folyo' THEN 550
    WHEN urun.ad = 'Hızlı Teslimat Folyo' THEN 480
    WHEN urun.ad = 'Premium Folyo' THEN 600
    ELSE 300
  END,
  CASE 
    WHEN urun.ad LIKE '%Cam Filmi%' THEN 230
    ELSE 290
  END
FROM hesaplama_urunleri urun;

-- 21-35m² aralığı
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  21,
  35,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 235
    WHEN urun.ad = 'Kumlu Folyo Motifli' THEN 395
    WHEN urun.ad = 'Cam Filmi Düz' THEN 220
    WHEN urun.ad = 'Cam Filmi Yansıtıcı' THEN 270
    WHEN urun.ad = 'Cam Filmi UV Korumalı' THEN 310
    WHEN urun.ad = 'Folyo Düz' THEN 320
    WHEN urun.ad = 'Folyo Motifli' THEN 435
    WHEN urun.ad = 'Folyo UV Korumalı' THEN 370
    WHEN urun.ad = 'Folyo Yansıtıcı' THEN 410
    WHEN urun.ad = 'Özel Kesim Folyo' THEN 535
    WHEN urun.ad = 'Hızlı Teslimat Folyo' THEN 465
    WHEN urun.ad = 'Premium Folyo' THEN 580
    ELSE 290
  END,
  CASE 
    WHEN urun.ad LIKE '%Cam Filmi%' THEN 220
    ELSE 280
  END
FROM hesaplama_urunleri urun;

-- 36m²+ aralığı
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  36,
  999999,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 225
    WHEN urun.ad = 'Kumlu Folyo Motifli' THEN 380
    WHEN urun.ad = 'Cam Filmi Düz' THEN 210
    WHEN urun.ad = 'Cam Filmi Yansıtıcı' THEN 260
    WHEN urun.ad = 'Cam Filmi UV Korumalı' THEN 300
    WHEN urun.ad = 'Folyo Düz' THEN 310
    WHEN urun.ad = 'Folyo Motifli' THEN 420
    WHEN urun.ad = 'Folyo UV Korumalı' THEN 360
    WHEN urun.ad = 'Folyo Yansıtıcı' THEN 400
    WHEN urun.ad = 'Özel Kesim Folyo' THEN 520
    WHEN urun.ad = 'Hızlı Teslimat Folyo' THEN 450
    WHEN urun.ad = 'Premium Folyo' THEN 560
    ELSE 280
  END,
  CASE 
    WHEN urun.ad LIKE '%Cam Filmi%' THEN 210
    ELSE 270
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