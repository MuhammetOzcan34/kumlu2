// Supabase istemci yapılandırması
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Ortam değişkenlerinden Supabase URL ve anon key'i al
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://kepfuptrmccexgyzhcti.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcGZ1cHRybWNjZXhneXpoY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwOTE0MDcsImV4cCI6MjA2OTY2NzQwN30.9FAlJYC5UVUKh3407eqag5PX90vaUtBreG5d4AcCVm0";

// Supabase istemcisini oluştur
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true // OAuth ve sosyal girişler için
  },
  global: {
    headers: {
      'X-Client-Info': 'kumlu-cam-kumlama' // API çağrılarında özel bilgi
    }
  }
});

// Base URL'yi dışa aktar (diğer dosyalarda kullanım için)
export const SUPABASE_BASE_URL = SUPABASE_URL;

// Supabase istemcisini şu şekilde import edin:
// import { supabase } from "@/integrations/supabase/client";