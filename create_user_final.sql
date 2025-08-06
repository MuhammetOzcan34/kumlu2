-- 1. Önce profiles tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Kullanıcıyı oluştur (Supabase'in built-in fonksiyonu ile)
SELECT auth.create_user(
  'ckumlama@gmail.com',
  'CamKumlama25',
  'Kumlu Folyo Admin'
);

-- 3. Kullanıcıya admin rolü ver
UPDATE public.profiles 
SET role = 'admin', display_name = 'Kumlu Folyo Admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'ckumlama@gmail.com');

-- 4. Kullanıcının email'ini doğrula
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'ckumlama@gmail.com'; 