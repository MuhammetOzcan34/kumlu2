-- Ayarlar tablosu için RLS politikaları
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Ayarlar tablosu için RLS'yi etkinleştir
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- 2. Tüm kullanıcılar ayarları okuyabilir (anon ve authenticated)
CREATE POLICY "Allow public read access to settings" ON public.ayarlar
  FOR SELECT USING (true);

-- 3. Sadece admin kullanıcılar ayarları güncelleyebilir
CREATE POLICY "Allow admin update settings" ON public.ayarlar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Sadece admin kullanıcılar yeni ayar ekleyebilir
CREATE POLICY "Allow admin insert settings" ON public.ayarlar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Sadece admin kullanıcılar ayar silebilir
CREATE POLICY "Allow admin delete settings" ON public.ayarlar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 