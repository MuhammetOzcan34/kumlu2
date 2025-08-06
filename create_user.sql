-- Supabase'de kullanıcı oluşturma SQL komutu
-- Bu komutu Supabase SQL Editor'da çalıştırın

-- 1. Kullanıcıyı auth.users tablosuna ekle
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'ckumlama@gmail.com',
  crypt('CamKumlama25', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- 2. Kullanıcı için profil oluştur (eğer profiles tablosu varsa)
INSERT INTO public.profiles (
  user_id,
  display_name,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'ckumlama@gmail.com'),
  'Kumlu Folyo Admin',
  'admin',
  NOW(),
  NOW()
); 