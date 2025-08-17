-- Marka logoları tablosunu oluştur
CREATE TABLE IF NOT EXISTS marka_logolari (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  resim TEXT,
  aciklama TEXT,
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS politikalarını etkinleştir
ALTER TABLE marka_logolari ENABLE ROW LEVEL SECURITY;

-- Herkesin okuyabilmesi için politika ekle
CREATE POLICY "Herkes marka logolarını görebilir" ON marka_logolari
  FOR SELECT USING (true);

-- Sadece authenticated kullanıcılar ekleyebilir/güncelleyebilir
CREATE POLICY "Authenticated kullanıcılar marka logoları ekleyebilir" ON marka_logolari
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanıcılar marka logoları güncelleyebilir" ON marka_logolari
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanıcılar marka logoları silebilir" ON marka_logolari
  FOR DELETE USING (auth.role() = 'authenticated');

-- İzinleri ver
GRANT SELECT ON marka_logolari TO anon;
GRANT ALL PRIVILEGES ON marka_logolari TO authenticated;

-- Örnek marka logoları ekle
INSERT INTO marka_logolari (ad, resim, aciklama, aktif, sira_no) VALUES
('Bosch', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Bosch%20logo%20professional%20blue%20and%20red%20corporate%20brand%20identity&image_size=square', 'Bosch marka logosu', true, 1),
('Makita', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Makita%20logo%20professional%20teal%20blue%20power%20tools%20brand&image_size=square', 'Makita marka logosu', true, 2),
('DeWalt', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=DeWalt%20logo%20professional%20yellow%20and%20black%20power%20tools%20brand&image_size=square', 'DeWalt marka logosu', true, 3),
('Hilti', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Hilti%20logo%20professional%20red%20construction%20tools%20brand&image_size=square', 'Hilti marka logosu', true, 4);

-- Kontrol et
SELECT * FROM marka_logolari ORDER BY sira_no;