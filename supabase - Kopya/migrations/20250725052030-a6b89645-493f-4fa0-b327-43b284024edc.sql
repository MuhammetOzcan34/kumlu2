-- Güvenlik uyarılarını düzelt - fonksiyonlara search_path ekle
CREATE OR REPLACE FUNCTION extract_youtube_id(youtube_url TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Video galeri trigger fonksiyonu güvenlik ayarı
CREATE OR REPLACE FUNCTION update_youtube_info()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- YouTube ID'yi çıkar
  NEW.youtube_id := public.extract_youtube_id(NEW.youtube_url);
  
  -- Thumbnail URL'yi oluştur
  IF NEW.youtube_id IS NOT NULL THEN
    NEW.thumbnail_url := 'https://img.youtube.com/vi/' || NEW.youtube_id || '/mqdefault.jpg';
  END IF;
  
  RETURN NEW;
END;
$$;