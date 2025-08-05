-- Ayarlar tablosunu oluştur
CREATE TABLE IF NOT EXISTS ayarlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anahtar TEXT UNIQUE NOT NULL,
  deger TEXT NOT NULL DEFAULT '',
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_ayarlar_anahtar ON ayarlar(anahtar);

-- RLS politikaları
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Ayarlar okuma" ON ayarlar
  FOR SELECT USING (true);

-- Sadece admin kullanıcılar yazabilir
CREATE POLICY "Ayarlar yazma" ON ayarlar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Temel ayarları ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
('firma_adi', 'Cam Kumlama', 'Firma adı'),
('firma_website', 'https://camkumlama.com', 'Firma website adresi'),
('firma_telefon', '+90 555 123 45 67', 'Firma telefon numarası'),
('firma_email', 'info@camkumlama.com', 'Firma e-posta adresi'),
('firma_adres', 'İstanbul, Türkiye', 'Firma adresi'),
('firma_logo_url', '', 'Firma logo dosya yolu/URL'),
('firma_calisma_saatleri', 'Pazartesi - Cuma: 09:00 - 18:00', 'Firma çalışma saatleri'),
('telefon', '+90 555 123 45 67', 'Ana telefon numarası'),
('email', 'info@camkumlama.com', 'Ana e-posta adresi'),
('adres', 'İstanbul, Türkiye', 'Ana adres')
ON CONFLICT (anahtar) DO UPDATE SET
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = NOW();

-- Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı oluştur
CREATE TRIGGER update_ayarlar_updated_at
    BEFORE UPDATE ON ayarlar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 