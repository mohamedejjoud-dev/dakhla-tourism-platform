// supabase/functions/l7aj-chat/index.ts
// L7aj AI Concierge Edge Function
// Governed strictly by AGENTS.md (Rules 4, 10, 12) & plan.md (Section 8)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cf-connecting-ip, x-real-ip",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatRequestBody {
  query: string;
  lang?: "ar" | "fr" | "en";
  conversationHistory?: Array<{ role: "user" | "assistant" | "model"; text: string }>;
}

serve(async (req: Request) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service-role client for privileged rate limit and catalog queries
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 2. Client Identity Resolution & Anti-Spoofing Check
    let clientIdentifier: string;
    let maxPerMinute: number;
    let maxPerDay: number;

    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "").trim();
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await authClient.auth.getUser();

      if (user) {
        clientIdentifier = `user:${user.id}`;
        maxPerMinute = 20;
        maxPerDay = 120;
      } else {
        // Token invalid -> fall back to IP check
        clientIdentifier = "";
        maxPerMinute = 6;
        maxPerDay = 30;
      }
    } else {
      clientIdentifier = "";
      maxPerMinute = 6;
      maxPerDay = 30;
    }

    // If not authenticated, extract trusted IP (DISCARD X-Forwarded-For per plan.md 8.1)
    if (!clientIdentifier) {
      const cfConnectingIp = req.headers.get("cf-connecting-ip");
      const xRealIp = req.headers.get("x-real-ip");
      const trustedIp = cfConnectingIp || xRealIp;

      if (!trustedIp || trustedIp.trim() === "") {
        return new Response(
          JSON.stringify({
            error: "missing_client_identity",
            message: "Trusted client IP header (cf-connecting-ip or x-real-ip) is required for anonymous requests.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      clientIdentifier = `ip:${trustedIp.trim()}`;
    }

    // 3. Persistent Rate Limit Check via consume_ai_quota() RPC
    const { data: quota, error: quotaErr } = await supabaseAdmin.rpc("consume_ai_quota", {
      p_identifier: clientIdentifier,
      p_max_per_minute: maxPerMinute,
      p_max_per_day: maxPerDay,
    });

    if (quotaErr) {
      console.error("Quota check error:", quotaErr);
      return new Response(
        JSON.stringify({ error: "Failed to evaluate rate limit quota" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: "rate_limit_exceeded",
          reason: quota.reason,
          retry_after: quota.retry_after,
          message: quota.reason === "per_minute_exceeded"
            ? `Too many requests per minute. Please wait ${quota.retry_after} seconds.`
            : "Daily AI request limit reached. Please return tomorrow.",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(quota.retry_after || 60),
          },
        }
      );
    }

    // 4. Input Validation & Prompt Sanitization
    const body: ChatRequestBody = await req.json();
    const query = (body.query || "").trim();
    const lang = body.lang && ["ar", "fr", "en"].includes(body.lang) ? body.lang : "fr";

    if (!query || query.length === 0) {
      return new Response(
        JSON.stringify({ error: "Query cannot be empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (query.length > 400) {
      return new Response(
        JSON.stringify({ error: "Query exceeds maximum limit of 400 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Grounded Catalog Retrieval
    const { data: places } = await supabaseAdmin
      .from("places")
      .select(`
        id,
        slug,
        price_level,
        project_status,
        project_completion_date,
        avg_rating,
        translations:place_translations(language_code, title, description, tips)
      `)
      .eq("status", "published")
      .limit(20);

    const catalogSummary = (places || []).map((p: any) => {
      const trans = p.translations?.find((t: any) => t.language_code === lang) || p.translations?.[0];
      return `- ${trans?.title || p.slug} (Catégorie: ${p.slug}, Note: ${p.avg_rating}/5, Statut: ${p.project_status}${p.project_completion_date ? ', Fin: ' + p.project_completion_date : ''}): ${trans?.description?.slice(0, 150) || ''}`;
    }).join("\n");

    // 6. Build Grounded L7aj System Prompt
    const systemPrompt = `Tu es "L7aj" (الحاج), le concierge et ambassadeur touristique emblématique de Dakhla, au Sahara Marocain.
Tu es sage, accueillant, chaleureux et profondément attaché aux valeurs d'hospitalité marocaine et saharienne.
Langue de réponse : ${lang === "ar" ? "Arabe / Darija marocaine soignée" : lang === "en" ? "English" : "Français"}.
Directives impératives :
1. Tu ne recommandes que des faits réels et vérifiés sur Dakhla (lagune, kitesurf, sports de glisse, parcs ostréicoles, huîtres fraîches, Dune Blanche, Île du Dragon, etc.).
2. Tu es transparent sur les projets régionaux structurants : le Port Dakhla Atlantique est actuellement en cours de réalisation.
3. N'invente jamais de numéros de téléphone ni d'adresses fictives.
4. Reste concis, bienveillant, et encourage l'écotourisme et la préservation de la lagune (site Ramsar).

Catalogue de référence des lieux vérifiés :
${catalogSummary || "(Aucun lieu publié actuellement dans le catalogue - informe avec bienveillance que les audits GPS sont en cours mais partage les connaissances générales vérifiées de la ville et de la lagune)"}`;

    // 7. Invoke Gemini Flash API
    if (!geminiApiKey || geminiApiKey.trim() === "" || geminiApiKey.includes("your-google")) {
      // Fallback response when GEMINI_API_KEY is not configured
      const fallbackReply = lang === "ar"
        ? "أهلاً بك في الداخلة! أنا الحاج، مرشدك السياحي. أود إخبارك أن بحيرة الداخلة هي الوجهة العالمية الأولى لرياضات الكايت سيرف، وأن مشروع ميناء الداخلة الأطلسي في طور الإنجاز."
        : lang === "en"
        ? "Welcome to Dakhla! I am L7aj, your local host. The Dakhla lagoon is world-renowned for kitesurfing, fresh oysters, and pristine desert dunes. Note that the major Dakhla Atlantic Port is currently under construction."
        : "Marhaban bikoum à Dakhla ! Je suis L7aj, votre guide local. Dakhla offre une lagune exceptionnelle pour le kitesurf, des huîtres fraîches renommées et des paysages désertiques uniques. Le Port Dakhla Atlantique est actuellement en cours de réalisation.";

      return new Response(
        JSON.stringify({
          reply: fallbackReply,
          lang,
          quota_remaining: quota.minute_remaining,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contents = [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nQuestion du visiteur : ${query}` }],
      },
    ];

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI assistant service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiJson = await geminiRes.json();
    const candidateText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || "Bienvenue à Dakhla !";

    return new Response(
      JSON.stringify({
        reply: candidateText,
        lang,
        quota_remaining: quota.minute_remaining,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Unhandled Edge Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
