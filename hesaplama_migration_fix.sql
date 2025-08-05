-- Hesaplama tablolarını güvenli şekilde güncelleme

-- Önce mevcut tabloları kontrol et ve gerekirse sil
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
('Kumlu Folyo Düz', 'Standart kumlu folyo', 'Folyo', 1),
('Kumlu Motifli', 'Desenli kumlu folyo', 'Folyo', 2),
('Cam Filmi', 'Cam filmi uygulaması', 'Cam Filmi', 3),
('Folyo Düz', 'Düz folyo uygulaması', 'Folyo', 4),
('Folyo Motifli', 'Desenli folyo uygulaması', 'Folyo', 5),
('Buzlu Cam Filmi', 'Buzlu cam filmi uygulaması', 'Cam Filmi', 6),
('Aynalı Folyo', 'Aynalı folyo uygulaması', 'Folyo', 7),
('Metalik Folyo', 'Metalik folyo uygulaması', 'Folyo', 8),
('Hologram Folyo', 'Hologram folyo uygulaması', 'Folyo', 9),
('Karbon Folyo', 'Karbon desenli folyo', 'Folyo', 10),
('Mat Folyo', 'Mat folyo uygulaması', 'Folyo', 11),
('Şeffaf Koruma Filmi', 'Şeffaf koruma filmi', 'Koruma Filmi', 12);

-- 10-20m² aralığı için fiyatlar (Google Sheets'ten)
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
    WHEN urun.ad = 'Folyo Motifli' THEN 450
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 280
    WHEN urun.ad = 'Aynalı Folyo' THEN 520
    WHEN urun.ad = 'Metalik Folyo' THEN 480
    WHEN urun.ad = 'Hologram Folyo' THEN 650
    WHEN urun.ad = 'Karbon Folyo' THEN 580
    WHEN urun.ad = 'Mat Folyo' THEN 380
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 320
    ELSE 300
  END,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 290
    WHEN urun.ad = 'Kumlu Motifli' THEN 290
    WHEN urun.ad = 'Cam Filmi' THEN 230
    WHEN urun.ad = 'Folyo Düz' THEN 290
    WHEN urun.ad = 'Folyo Motifli' THEN 320
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 250
    WHEN urun.ad = 'Aynalı Folyo' THEN 350
    WHEN urun.ad = 'Metalik Folyo' THEN 330
    WHEN urun.ad = 'Hologram Folyo' THEN 380
    WHEN urun.ad = 'Karbon Folyo' THEN 360
    WHEN urun.ad = 'Mat Folyo' THEN 310
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 280
    ELSE 290
  END
FROM hesaplama_urunleri urun;

-- 21-35m² aralığı için fiyatlar
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  21,
  35,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 235
    WHEN urun.ad = 'Kumlu Motifli' THEN 400
    WHEN urun.ad = 'Cam Filmi' THEN 220
    WHEN urun.ad = 'Folyo Düz' THEN 320
    WHEN urun.ad = 'Folyo Motifli' THEN 440
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 270
    WHEN urun.ad = 'Aynalı Folyo' THEN 510
    WHEN urun.ad = 'Metalik Folyo' THEN 470
    WHEN urun.ad = 'Hologram Folyo' THEN 640
    WHEN urun.ad = 'Karbon Folyo' THEN 570
    WHEN urun.ad = 'Mat Folyo' THEN 370
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 310
    ELSE 290
  END,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 280
    WHEN urun.ad = 'Kumlu Motifli' THEN 280
    WHEN urun.ad = 'Cam Filmi' THEN 220
    WHEN urun.ad = 'Folyo Düz' THEN 280
    WHEN urun.ad = 'Folyo Motifli' THEN 310
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 240
    WHEN urun.ad = 'Aynalı Folyo' THEN 340
    WHEN urun.ad = 'Metalik Folyo' THEN 320
    WHEN urun.ad = 'Hologram Folyo' THEN 370
    WHEN urun.ad = 'Karbon Folyo' THEN 350
    WHEN urun.ad = 'Mat Folyo' THEN 300
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 270
    ELSE 280
  END
FROM hesaplama_urunleri urun;

-- 36m²+ aralığı için fiyatlar
INSERT INTO hesaplama_fiyatlar (urun_id, metrekare_min, metrekare_max, malzeme_fiyat, montaj_fiyat)
SELECT 
  urun.id,
  36,
  999999,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 225
    WHEN urun.ad = 'Kumlu Motifli' THEN 390
    WHEN urun.ad = 'Cam Filmi' THEN 210
    WHEN urun.ad = 'Folyo Düz' THEN 310
    WHEN urun.ad = 'Folyo Motifli' THEN 430
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 260
    WHEN urun.ad = 'Aynalı Folyo' THEN 500
    WHEN urun.ad = 'Metalik Folyo' THEN 460
    WHEN urun.ad = 'Hologram Folyo' THEN 630
    WHEN urun.ad = 'Karbon Folyo' THEN 560
    WHEN urun.ad = 'Mat Folyo' THEN 360
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 300
    ELSE 280
  END,
  CASE 
    WHEN urun.ad = 'Kumlu Folyo Düz' THEN 270
    WHEN urun.ad = 'Kumlu Motifli' THEN 270
    WHEN urun.ad = 'Cam Filmi' THEN 210
    WHEN urun.ad = 'Folyo Düz' THEN 270
    WHEN urun.ad = 'Folyo Motifli' THEN 300
    WHEN urun.ad = 'Buzlu Cam Filmi' THEN 230
    WHEN urun.ad = 'Aynalı Folyo' THEN 330
    WHEN urun.ad = 'Metalik Folyo' THEN 310
    WHEN urun.ad = 'Hologram Folyo' THEN 360
    WHEN urun.ad = 'Karbon Folyo' THEN 340
    WHEN urun.ad = 'Mat Folyo' THEN 290
    WHEN urun.ad = 'Şeffaf Koruma Filmi' THEN 260
    ELSE 270
  END
FROM hesaplama_urunleri urun;

-- Trigger fonksiyonları
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