// functions/places/[slug].ts
// Cloudflare Pages Function: Social Crawler User-Agent routing & Dynamic OpenGraph Card generator
// Governed strictly by AGENTS.md (Rule 12: Security & Performance) & plan.md (Section 9)

interface Env {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

const CRAWLER_USER_AGENTS =
  /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|applebot|bingbot|googlebot/i;

const SLUG_REGEX = /^[a-z0-9-]{3,100}$/;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, params, env, next } = context;
  const userAgent = request.headers.get('user-agent') || '';

  // 1. If human user (non-bot), proceed directly to client-side React 18 SPA
  if (!CRAWLER_USER_AGENTS.test(userAgent)) {
    return next();
  }

  // 2. Validate and sanitize slug
  const rawSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug = (rawSlug || '').toLowerCase().trim();

  const siteUrl = 'https://dakhlin.com';
  const defaultTitle = 'Dakhlin — Discover Dakhla, Moroccan Sahara';
  const defaultDesc =
    'Discover hotels, kitesurfing camps, seafood restaurants, and regional infrastructure projects in Dakhla, Morocco.';
  const defaultImage = `${siteUrl}/og-default-dakhla.webp`;

  if (!SLUG_REGEX.test(slug)) {
    return renderOgHtml({
      title: defaultTitle,
      description: defaultDesc,
      image: defaultImage,
      url: `${siteUrl}/places/${escapeHtml(slug)}`,
    });
  }

  const supabaseUrl = env.VITE_SUPABASE_URL || 'https://yrcxhyevjfqbbimzzmro.supabase.co';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || '';

  try {
    // 3. Query PostgreSQL under anon role (RLS strictly guarantees status = published)
    const endpoint = `${supabaseUrl}/rest/v1/places?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=id,slug,translations:place_translations(language_code,title,short_description),images:place_images(storage_path,is_primary)&limit=1`;

    const res = await fetch(endpoint, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });

    if (!res.ok) {
      return renderOgHtml({
        title: defaultTitle,
        description: defaultDesc,
        image: defaultImage,
        url: `${siteUrl}/places/${escapeHtml(slug)}`,
      });
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      // Place not found or is draft -> Return safe default regional OG card
      return renderOgHtml({
        title: defaultTitle,
        description: defaultDesc,
        image: defaultImage,
        url: `${siteUrl}/places/${escapeHtml(slug)}`,
      });
    }

    const place = data[0];
    const enTr = (place.translations || []).find((t: any) => t.language_code === 'en');
    const frTr = (place.translations || []).find((t: any) => t.language_code === 'fr');
    const arTr = (place.translations || []).find((t: any) => t.language_code === 'ar');

    const title = enTr?.title || frTr?.title || arTr?.title || slug;
    const desc =
      enTr?.short_description ||
      frTr?.short_description ||
      arTr?.short_description ||
      defaultDesc;

    const primaryImg = (place.images || []).find((img: any) => img.is_primary) || place.images?.[0];
    const image = primaryImg
      ? `${supabaseUrl}/storage/v1/object/public/places-media/${primaryImg.storage_path}`
      : defaultImage;

    return renderOgHtml({
      title: `${title} | Dakhlin`,
      description: desc,
      image,
      url: `${siteUrl}/places/${slug}`,
    });
  } catch {
    return renderOgHtml({
      title: defaultTitle,
      description: defaultDesc,
      image: defaultImage,
      url: `${siteUrl}/places/${escapeHtml(slug)}`,
    });
  }
};

function renderOgHtml(meta: { title: string; description: string; image: string; url: string }): Response {
  const safeTitle = escapeHtml(meta.title);
  const safeDesc = escapeHtml(meta.description);
  const safeImage = escapeHtml(meta.image);
  const safeUrl = escapeHtml(meta.url);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <meta property="og:site_name" content="Dakhlin — Dakhla Tourism Platform" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:url" content="${safeUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <img src="${safeImage}" alt="${safeTitle}" />
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
