export const config = { matcher: '/((?!_next|api|favicon|public|og-default).*)' };

const SUPABASE_URL = 'https://tfyodjqusfwqmbjgwikf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeW9kanF1c2Z3cW1iamd3aWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzg3MDEsImV4cCI6MjA4OTYxNDcwMX0.Ff4AvqCcfqTGhMqRqdK9K_I98oAk-osLK71MORUTJXQ';

const CRAWLERS = /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|applebot|googlebot|bingbot/i;

// Known app routes that are never card slugs
const APP_ROUTES = new Set(['', 'builder', 'dashboard', 'admin', 'pro', 'login', 'signup']);

export default async function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  if (!CRAWLERS.test(ua)) return; // real user → pass through to SPA

  const url = new URL(request.url);
  const parts = url.pathname.replace(/^\//, '').replace(/\/$/, '').split('/');

  // Extract slug: /skishare → "skishare", /c/skishare → "skishare"
  let slug = parts[0] === 'c' ? parts[1] : parts[0];
  if (!slug || APP_ROUTES.has(slug)) return;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/cards?slug=eq.${encodeURIComponent(slug)}&select=business_name,description,avatar_url&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    const cards = await res.json();
    const card = cards?.[0];
    if (!card) return;

    const title = card.business_name || 'Vizzit';
    const description = card.description || 'כרטיס ביקור דיגיטלי';
    const image = card.avatar_url || 'https://www.vizzit.online/og-default.jpg';
    const pageUrl = `https://www.vizzit.online/c/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="he">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="800" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${pageUrl}" />
</head>
<body>
  <a href="${pageUrl}">${title}</a>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return; // on error, pass through
  }
}
