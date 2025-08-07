import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS başlıkları (kritik)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

// İzin verilen dosya uzantıları ve maksimum dosya boyutu
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

serve(async (req) => {
  // Preflight OPTIONS isteği için handler
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const objectPath = url.searchParams.get('path');

    // Path parametresi zorunlu
    if (!objectPath) {
      return new Response(JSON.stringify({ error: 'Dosya yolu gerekli' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Path validation (directory traversal ve güvenlik)
    if (objectPath.includes('..') || objectPath.includes('//') || objectPath.startsWith('/')) {
      return new Response(JSON.stringify({ error: 'Geçersiz dosya yolu' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Dosya uzantısı kontrolü
    const fileExtension = objectPath.toLowerCase().substring(objectPath.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return new Response(JSON.stringify({ error: 'Desteklenmeyen dosya tipi' }), {
        status: 415,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Supabase client oluştur
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    // Dosya indirme (retry mekanizması ile)
    let data, error;
    let retryCount = 0;
    const maxRetries = 3;
    while (retryCount < maxRetries) {
      try {
        const result = await supabaseAdmin.storage
          .from('fotograflar')
          .download(objectPath);
        data = result.data;
        error = result.error;
        break;
      } catch (retryError) {
        retryCount++;
        if (retryCount >= maxRetries) {
          error = retryError;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }

    if (error) {
      if (error.message?.includes('not found')) {
        return new Response(JSON.stringify({ error: 'Dosya bulunamadı' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw error;
    }
    if (!data) {
      return new Response(JSON.stringify({ error: 'Dosya bulunamadı' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Dosya boyutu kontrolü
    if (data.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'Dosya çok büyük' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Content-Type belirleme
    let contentType = 'application/octet-stream';
    if (fileExtension === '.jpg' || fileExtension === '.jpeg') contentType = 'image/jpeg';
    else if (fileExtension === '.png') contentType = 'image/png';
    else if (fileExtension === '.gif') contentType = 'image/gif';
    else if (fileExtension === '.webp') contentType = 'image/webp';
    else if (fileExtension === '.svg') contentType = 'image/svg+xml';

    // Response headers (cache, CORS, content-type)
    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', data.size.toString());
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('ETag', `"${objectPath}-${Date.now()}"`);
    headers.set('Last-Modified', new Date().toUTCString());

    // Streaming ile dosya gönderimi
    return new Response(data.stream(), {
      status: 200,
      headers,
    });
  } catch (error) {
    // Hata durumunda CORS header'ları ile JSON dön
    return new Response(JSON.stringify({ error: error.message || 'Bilinmeyen hata oluştu', timestamp: new Date().toISOString() }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});