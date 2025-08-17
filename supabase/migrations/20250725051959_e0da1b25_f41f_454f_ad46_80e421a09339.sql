-- Servis bedelleri tablosu
CREATE TABLE public.servis_bedelleri (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori TEXT NOT NULL,
  hizmet_adi TEXT NOT NULL,
  birim TEXT NOT NULL DEFAULT 'm²',
  birim_fiyat NUMERIC NOT NULL DEFAULT 0,
  aciklama TEXT,
  sira_no INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Video galeri tablosu
CREATE TABLE public.video_galeri (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baslik TEXT NOT NULL,
  aciklama TEXT,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT, -- YouTube video ID'si (URL'den çıkarılacak)
  thumbnail_url TEXT, -- YouTube thumbnail URL'si
  kategori TEXT,
  sira_no INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.servis_bedelleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_galeri ENABLE ROW LEVEL SECURITY;

-- Servis bedelleri için RLS politikaları
CREATE POLICY "Servis bedelleri herkese görünür" 
ON public.servis_bedelleri 
FOR SELECT 
USING (aktif = true);

CREATE POLICY "Admins can insert servis bedelleri" 
ON public.servis_bedelleri 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update servis bedelleri" 
ON public.servis_bedelleri 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete servis bedelleri" 
ON public.servis_bedelleri 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Video galeri için RLS politikaları
CREATE POLICY "Video galeri herkese görünür" 
ON public.video_galeri 
FOR SELECT 
USING (aktif = true);

CREATE POLICY "Admins can insert video galeri" 
ON public.video_galeri 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can update video galeri" 
ON public.video_galeri 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete video galeri" 
ON public.video_galeri 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Updated_at trigger'larını ekle
CREATE TRIGGER update_servis_bedelleri_updated_at
  BEFORE UPDATE ON public.servis_bedelleri
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_galeri_updated_at
  BEFORE UPDATE ON public.video_galeri
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- YouTube ID çıkarma fonksiyonu
CREATE OR REPLACE FUNCTION extract_youtube_id(youtube_url TEXT)
RETURNS TEXT AS $$
DECLARE
  video_id TEXT;
BEGIN
  -- YouTube URL formatlarından video ID'yi çıkar
  -- https://www.youtube.com/watch?v=VIDEO_ID
  -- https://youtu.be/VIDEO_ID
  -- https://youtube.com/embed/VIDEO_ID
  
  IF youtube_url ~ 'youtube\.com/watch\?v=' THEN
    video_id := substring(youtube_url from 'v=([a-zA-Z0-9_-]+)');
  ELSIF youtube_url ~ 'youtu\.be/' THEN
    video_id := substring(youtube_url from 'youtu\.be/([a-zA-Z0-9_-]+)');
  ELSIF youtube_url ~ 'youtube\.com/embed/' THEN
    video_id := substring(youtube_url from 'embed/([a-zA-Z0-9_-]+)');
  END IF;
  
  RETURN video_id;
END;
$$ LANGUAGE plpgsql;

-- Video galeri trigger'ı - YouTube URL'den ID ve thumbnail çıkar
CREATE OR REPLACE FUNCTION update_youtube_info()
RETURNS TRIGGER AS $$
BEGIN
  -- YouTube ID'yi çıkar
  NEW.youtube_id := extract_youtube_id(NEW.youtube_url);
  
  -- Thumbnail URL'yi oluştur
  IF NEW.youtube_id IS NOT NULL THEN
    NEW.thumbnail_url := 'https://img.youtube.com/vi/' || NEW.youtube_id || '/mqdefault.jpg';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER youtube_info_trigger
  BEFORE INSERT OR UPDATE ON public.video_galeri
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_info();