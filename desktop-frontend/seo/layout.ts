// Shared HTML shell for the static SEO pages (/porodi/, /statii/). These are plain HTML generated
// at build time so search engines index them without running the React app.

export const SITE = 'https://edog.bg';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface PageMeta {
  path: string;          // e.g. '/porodi/golden-retriever/'
  title: string;         // <title>, ~60 chars
  description: string;   // meta description, ~155 chars
  h1: string;
  breadcrumbs: { name: string; path: string }[];
  jsonLd?: object[];
  ogType?: 'website' | 'article';
}

const CSS = `
:root{--blue:#005da7;--blue-dark:#003a6b;--ink:#1b1c1b;--muted:#5b6170;--line:#e4e2e1;--bg:#fbf9f8;--card:#fff;--accent:#a4c9ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:var(--blue)}
.wrap{max-width:860px;margin:0 auto;padding:0 16px}
header.site{background:rgba(251,249,248,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:10}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;height:60px;max-width:1100px}
.brand{display:flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:20px;color:var(--blue);text-decoration:none}
.brand img{width:30px;height:30px;border-radius:8px}
nav.top{display:flex;align-items:center;gap:4px;font-size:14px}
nav.top a{padding:8px 10px;border-radius:8px;text-decoration:none;color:#414751;font-weight:600}
nav.top a:hover{background:#f0eeed}
nav.top a.cta{background:var(--blue);color:#fff}
@media(max-width:560px){nav.top a.hide-sm{display:none}}
.crumbs{font-size:13px;color:var(--muted);margin:24px 0 8px}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{text-decoration:underline}
h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(28px,5vw,40px);line-height:1.15;letter-spacing:-.02em;margin:0 0 12px}
h2{font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;line-height:1.3;margin:36px 0 10px}
h3{font-size:17px;margin:24px 0 6px}
.lead{font-size:18px;color:#414751;margin:0 0 24px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:20px 0}
.fact{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.fact b{display:block;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.fact span{font-weight:700;font-size:16px}
.tags{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}
.tags li{background:#005da71a;color:var(--blue);border-radius:999px;padding:4px 12px;font-size:14px;font-weight:600}
ul.clean{padding-left:20px}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:15px;background:var(--card);border-radius:12px;overflow:hidden}
th,td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
th{background:#f5f3f2;font-size:13px;text-transform:uppercase;letter-spacing:.03em;color:var(--muted)}
.note{background:#fff8e6;border:1px solid #f3dca2;border-radius:12px;padding:12px 16px;font-size:14px;color:#5b4a1a;margin:20px 0}
.cta-box{margin:40px 0;border-radius:20px;padding:28px;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff}
.cta-box h2{margin:0 0 8px;color:#fff}
.cta-box p{margin:0 0 18px;color:#ffffffcc}
.btn{display:inline-block;background:#fff;color:var(--blue);font-weight:700;padding:12px 22px;border-radius:12px;text-decoration:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin:20px 0}
.grid a{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;text-decoration:none;color:var(--ink)}
.grid a:hover{border-color:var(--blue)}
.grid a strong{display:block;font-size:16px}
.grid a span{font-size:14px;color:var(--muted)}
footer.site{border-top:1px solid var(--line);margin-top:48px;padding:28px 0;font-size:14px;color:var(--muted)}
footer.site .wrap{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between;max-width:1100px}
footer.site a{color:var(--muted)}
`;

export const layout = (meta: PageMeta, body: string) => {
  const url = SITE + meta.path;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: meta.breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE + b.path })),
  };
  const ld = [breadcrumbLd, ...(meta.jsonLd || [])];
  const crumbs = meta.breadcrumbs
    .map((b, i) => (i === meta.breadcrumbs.length - 1 ? esc(b.name) : `<a href="${b.path}">${esc(b.name)}</a>`))
    .join(' › ');

  return `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${meta.ogType || 'website'}">
<meta property="og:site_name" content="eDog.bg">
<meta property="og:locale" content="bg_BG">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:image" content="${SITE}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#005da7">
<link rel="icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body>
<header class="site"><div class="wrap">
  <a class="brand" href="/"><img src="/logo-header.png" alt="">eDog</a>
  <nav class="top">
    <a class="hide-sm" href="/porodi/">Породи</a>
    <a class="hide-sm" href="/statii/">Статии</a>
    <a href="/login">Вход</a>
    <a class="cta" href="/register">Регистрация</a>
  </nav>
</div></header>
<main class="wrap">
  <div class="crumbs">${crumbs}</div>
  <h1>${esc(meta.h1)}</h1>
  ${body}
</main>
<footer class="site"><div class="wrap">
  <span>© ${new Date().getFullYear()} eDog.bg — дигитален паспорт и напомняния за здравето на кучето</span>
  <span><a href="/">Начало</a> · <a href="/porodi/">Породи кучета</a> · <a href="/statii/">Статии</a> · <a href="/privacy.html">Поверителност</a></span>
</div></footer>
</body>
</html>
`;
};

export const ctaBox = (title: string, text: string) => `
<section class="cta-box">
  <h2>${esc(title)}</h2>
  <p>${esc(text)}</p>
  <a class="btn" href="/register">Създай безплатен профил →</a>
</section>`;
