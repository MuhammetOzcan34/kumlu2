import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

/**
 * Logo görüntülerini proxy üzerinden sunan Edge Function
 * CORS sorunlarını çözer ve güvenli erişim sağlar
 */
Deno.serve(async (req) => {
  // OPTIONS request için CORS headers döndür
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imagePath = url.searchParams.get('path');
    
    if (!imagePath) {
      return new Response(
        JSON.stringify({ error: 'Görüntü yolu belirtilmedi' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🖼️ Görüntü proxy isteği:', { imagePath });

    // Supabase client oluştur
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Görüntüyü storage'dan al
    const { data, error } = await supabase.storage
      .from('fotograflar')
      .download(imagePath);

    if (error) {
      console.error('❌ Storage hatası:', error);
      return new Response(
        JSON.stringify({ error: 'Görüntü yüklenemedi: ' + error.message }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Görüntü bulunamadı' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Görüntü başarıyla alındı:', { size: data.size });

    // Görüntüyü döndür
    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': data.type || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600', // 1 saat cache
      },
    });

  } catch (error) {
    console.error('❌ Image proxy hatası:', error);
    return new Response(
      JSON.stringify({ error: 'Sunucu hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata') }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});