import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Geliştirme için tüm kaynaklara izin ver
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const objectPath = url.searchParams.get('path');

    if (!objectPath) {
      throw new Error('File path is required.');
    }

    // Supabase client'ı doğrudan anahtarlarla oluşturun
    // Bu anahtarları ortam değişkenlerinden almak en iyisidir
    const supabaseAdmin = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseAdmin.storage
      .from('fotograflar')
      .download(objectPath);

    if (error) {
      console.error('Storage Error:', error);
      throw error;
    }

    if (!data) {
      return new Response('File not found', { status: 404, headers: corsHeaders });
    }

    const headers = new Headers(corsHeaders);
    headers.set('Content-Type', data.type || 'application/octet-stream');
    headers.set('Content-Length', data.size.toString());

    return new Response(data.stream(), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});