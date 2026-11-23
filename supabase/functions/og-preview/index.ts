// supabase/functions/og-preview/index.ts
// Supabase Edge Function: Serverless OG Metadata Provider with verify_jwt = false
// Governed strictly by AGENTS.md (Rule 12: Security) & plan.md (Section 9.2)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get("slug") || "").toLowerCase().trim();

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: "Configuration missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Uses anon key strictly — RLS guarantees only published places are readable
  const supabase = createClient(supabaseUrl, anonKey);

  const defaultMeta = {
    title: "Dakhlin — Discover Dakhla, Moroccan Sahara",
    description: "Discover hotels, kitesurfing camps, seafood restaurants, and regional infrastructure projects in Dakhla, Morocco.",
    image: `${url.origin}/og-default-dakhla.webp`,
    url: `${url.origin}/places/${slug}`,
    status: "published",
  };

  if (!slug || !/^[a-z0-9-]{3,100}$/.test(slug)) {
    return new Response(JSON.stringify(defaultMeta), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabase
    .from("places")
    .select(`
      id,
      slug,
      status,
      translations:place_translations(language_code, title, short_description),
      images:place_images(storage_path, is_primary)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify(defaultMeta), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const en = data.translations?.find((t: any) => t.language_code === "en");
  const fr = data.translations?.find((t: any) => t.language_code === "fr");
  const ar = data.translations?.find((t: any) => t.language_code === "ar");

  const title = en?.title || fr?.title || ar?.title || slug;
  const description = en?.short_description || fr?.short_description || ar?.short_description || defaultMeta.description;
  const primaryImg = data.images?.find((img: any) => img.is_primary) || data.images?.[0];
  const image = primaryImg
    ? `${supabaseUrl}/storage/v1/object/public/places-media/${primaryImg.storage_path}`
    : defaultMeta.image;

  return new Response(
    JSON.stringify({
      title: `${title} | Dakhlin`,
      description,
      image,
      url: `${url.origin}/places/${slug}`,
      status: "published",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
