// Shared HTML shell for the static SEO pages (/porodi/, /statii/). These are plain HTML generated
// at build time so search engines index them without running the React app.
import { PHOTO_CREDITS } from './photoCredits';

export const SITE = 'https://edog.bg';

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export interface PageMeta {
  path: string;          // e.g. '/porodi/golden-retriever/'
  title: string;         // <title>, ~60 chars
  description: string;   // meta description, ~155 chars
  breadcrumbs: { name: string; path: string }[];
  image?: string;        // photo key for og:image, e.g. 'porodi/goldan-retrivar'
  jsonLd?: object[];
  ogType?: 'website' | 'article';
}

/** Responsive <img> for a photo in /img/<key>.jpg (+ -sm variant). */
export const img = (key: string, alt: string, opts: { cls?: string; eager?: boolean; sizes?: string } = {}) =>
  `<img class="${opts.cls || ''}" src="/img/${key}.jpg" srcset="/img/${key}-sm.jpg 480w, /img/${key}.jpg 1200w" ` +
  `sizes="${opts.sizes || '(max-width: 760px) 100vw, 760px'}" alt="${esc(alt)}" width="1200" height="800" ` +
  `${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

/** Licence credit for a photo — required by the CC licences of the Wikimedia Commons images. */
export const credit = (key: string) => {
  const c = PHOTO_CREDITS[key];
  if (!c) return '';
  return `<span class="credit">Снимка: ${esc(c.author)} · <a href="${esc(c.source)}" rel="nofollow noopener" target="_blank">${esc(c.license)}</a>, Wikimedia Commons</span>`;
};

export const crumbs = (items: { name: string; path: string }[]) =>
  `<nav class="crumbs" aria-label="Навигация">${items
    .map((b, i) => (i === items.length - 1 ? `<span>${esc(b.name)}</span>` : `<a href="${b.path}">${esc(b.name)}</a>`))
    .join('<span class="sep">›</span>')}</nav>`;

const CSS = `
:root{--blue:#005da7;--blue-dark:#00335f;--sky:#a4c9ff;--ink:#1b1c1b;--muted:#5b6170;--line:#e8e4df;--bg:#fbf9f8;--card:#fff;--sun:#ffd798;--sun-ink:#7a5208;--mint:#d7f3e6;--mint-ink:#0f6b45;--rose:#fde2e4;--rose-ink:#9b2335}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,-apple-system,sans-serif;line-height:1.7;font-size:16.5px;-webkit-font-smoothing:antialiased}
a{color:var(--blue)}
img{max-width:100%;height:auto;display:block}
.wrap{max-width:1120px;margin:0 auto;padding:0 16px}
.narrow{max-width:760px;margin:0 auto}
h1,h2,h3{font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:-.02em;line-height:1.2}
h1{font-size:clamp(30px,5.4vw,52px);margin:10px 0 14px}
h2{font-size:clamp(22px,3vw,28px);margin:0 0 12px}
h3{font-size:18px;margin:18px 0 6px}

/* Header / footer */
header.site{background:rgba(251,249,248,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;height:62px}
.brand{display:flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:21px;color:var(--blue);text-decoration:none}
.brand img{width:32px;height:32px;border-radius:9px}
nav.top{display:flex;align-items:center;gap:2px;font-size:14px}
nav.top a{padding:8px 11px;border-radius:10px;text-decoration:none;color:#414751;font-weight:600}
nav.top a:hover{background:#f0eeed}
nav.top a.on{color:var(--blue)}
nav.top a.cta{background:var(--blue);color:#fff;margin-left:4px}
nav.top a.cta:hover{background:var(--blue-dark)}
@media(max-width:600px){nav.top a.hide-sm{display:none}}
footer.site{background:#13203a;color:#c9d3e6;margin-top:72px;padding:40px 0;font-size:14px}
footer.site .wrap{display:flex;flex-wrap:wrap;gap:16px 32px;justify-content:space-between;align-items:center}
footer.site a{color:#fff;text-decoration:none;opacity:.85}
footer.site a:hover{opacity:1;text-decoration:underline}
footer.site .links{display:flex;flex-wrap:wrap;gap:8px 20px}

/* Breadcrumbs */
.crumbs{font-size:13px;color:var(--muted);display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--blue)}
.crumbs .sep{opacity:.5}
.hero-dark .crumbs,.hero-dark .crumbs a{color:#ffffffb3}

/* Heroes */
.hero{position:relative;overflow:hidden;background:linear-gradient(160deg,#eaf3ff 0%,#fbf9f8 55%,#fff6e6 100%);border-bottom:1px solid var(--line)}
.hero .wrap{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;padding-top:36px;padding-bottom:48px}
.hero .lead{font-size:clamp(17px,2vw,20px);color:#414751;margin:0 0 20px}
.hero figure{margin:0;position:relative}
.hero figure img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:28px;box-shadow:0 24px 60px -20px rgba(0,58,107,.45);transform:rotate(1.2deg)}
.hero figure::before{content:'';position:absolute;inset:-14px -14px auto auto;width:110px;height:110px;border-radius:50%;background:var(--sun);z-index:-1}
.hero figure .credit{margin-top:14px}
@media(max-width:860px){.hero .wrap{grid-template-columns:1fr;gap:24px;padding-top:24px}.hero figure{order:-1}.hero figure img{transform:none;border-radius:20px}}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 6px;padding:0;list-style:none}
.badges li{background:#fff;border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:600;font-size:14px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.hero-dark{position:relative;color:#fff;background:#0b2340}
.hero-dark>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}
.hero-dark::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,35,70,.92) 0%,rgba(0,35,70,.65) 55%,rgba(0,35,70,.2) 100%)}
.hero-dark .wrap{position:relative;z-index:1;padding-top:44px;padding-bottom:64px}
.hero-dark h1{color:#fff;max-width:680px}
.hero-dark .lead{color:#ffffffd9;max-width:620px;font-size:clamp(17px,2vw,20px);margin:0}
.hero-dark .credit{position:absolute;right:16px;bottom:10px;z-index:1;color:#ffffffa6}
.hero-dark .credit a{color:#ffffffcc}

.credit{display:block;font-size:11.5px;color:#8a8f9a;line-height:1.4}
.credit a{color:inherit}

/* Content blocks */
.section{margin-top:44px}
.card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:24px 26px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.icon-h{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.icon-h .ic{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;font-size:22px;background:#eaf3ff}
.icon-h h2{margin:0}
.ic.sun{background:#fff3d6}.ic.mint{background:var(--mint)}.ic.rose{background:var(--rose)}.ic.lav{background:#ece8ff}
.two{display:grid;grid-template-columns:1fr 1fr;gap:20px}
@media(max-width:760px){.two{grid-template-columns:1fr}}
.tags{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:8px 0 14px;list-style:none}
.tags li{border-radius:999px;padding:6px 14px;font-size:14.5px;font-weight:600}
.tags li:nth-child(4n+1){background:#e3efff;color:#0b4f8f}
.tags li:nth-child(4n+2){background:#fff1d1;color:#7a5208}
.tags li:nth-child(4n+3){background:var(--mint);color:var(--mint-ink)}
.tags li:nth-child(4n+4){background:#ece8ff;color:#4b3a9c}
ul.check{list-style:none;padding:0;margin:8px 0}
ul.check li{position:relative;padding-left:30px;margin:8px 0}
ul.check li::before{content:'';position:absolute;left:0;top:.45em;width:18px;height:18px;border-radius:50%;background:var(--mint) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%230f6b45'%3E%3Cpath d='M8 13.2 4.8 10l-1.1 1.1L8 15.4l8.3-8.3-1.1-1.1z'/%3E%3C/svg%3E") center/14px no-repeat}
ul.dot{list-style:none;padding:0;margin:8px 0}
ul.dot li{position:relative;padding-left:22px;margin:8px 0}
ul.dot li::before{content:'';position:absolute;left:4px;top:.65em;width:8px;height:8px;border-radius:50%;background:var(--rose-ink)}

/* Breed meters */
.meters{display:grid;gap:14px}
.meter{display:grid;grid-template-columns:170px 1fr auto;gap:14px;align-items:center;font-size:15px}
.meter b{font-weight:600}
.meter .bar{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.meter .bar i{height:10px;border-radius:6px;background:#ece9e4}
.meter .bar i.on{background:linear-gradient(90deg,#0a6cc0,#3b93e3)}
.meter small{color:var(--muted);font-size:13px;min-width:110px;text-align:right}
@media(max-width:560px){.meter{grid-template-columns:1fr auto}.meter .bar{grid-column:1/-1;grid-row:2}}

.weight{margin:14px 0 6px}
.weight .row{display:grid;grid-template-columns:90px 1fr;gap:12px;align-items:center;margin:10px 0;font-size:14px}
.weight .track{position:relative;height:14px;border-radius:8px;background:#ece9e4}
.weight .range{position:absolute;top:0;bottom:0;border-radius:8px;background:linear-gradient(90deg,#45b37b,#2e9a63)}
.weight .range span{position:absolute;top:18px;left:0;right:0;text-align:center;font-weight:700;color:var(--mint-ink);font-size:13px;white-space:nowrap}
.weight .row{margin-bottom:26px}

.fact-card{position:relative;background:linear-gradient(135deg,#fff3d6,#ffe7b3);border-radius:22px;padding:26px 28px 26px 76px;color:#4a3305}
.fact-card::before{content:'💡';position:absolute;left:24px;top:22px;font-size:32px}
.fact-card strong{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:4px;color:var(--sun-ink)}
.fact-card p{margin:0;font-size:18px;line-height:1.55}

.note{display:flex;gap:12px;background:#fff8e6;border:1px solid #f3dca2;border-radius:16px;padding:14px 18px;font-size:14.5px;color:#5b4a1a;margin:18px 0}
.note::before{content:'🩺';font-size:20px;line-height:1.3}
.tip{display:flex;gap:12px;background:#eaf3ff;border:1px solid #cfe2fb;border-radius:16px;padding:14px 18px;font-size:15px;color:#0d3a66;margin:18px 0}
.tip::before{content:'👉';font-size:20px;line-height:1.3}

/* CTA */
.cta-box{position:relative;overflow:hidden;margin:56px 0 0;border-radius:28px;padding:34px;background:linear-gradient(135deg,var(--blue),var(--blue-dark));color:#fff;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center}
.cta-box::after{content:'🐾';position:absolute;right:-10px;bottom:-30px;font-size:160px;opacity:.08;transform:rotate(-18deg)}
.cta-box h2{margin:0 0 8px;color:#fff}
.cta-box p{margin:0;color:#ffffffd1;max-width:560px}
.cta-box ul{display:flex;flex-wrap:wrap;gap:6px 16px;list-style:none;padding:0;margin:14px 0 0;font-size:14px;color:#ffffffe0}
.btn{display:inline-block;background:#fff;color:var(--blue);font-weight:800;padding:14px 24px;border-radius:14px;text-decoration:none;white-space:nowrap;box-shadow:0 10px 24px -10px rgba(0,0,0,.4);position:relative;z-index:1}
.btn:hover{transform:translateY(-1px)}
@media(max-width:700px){.cta-box{grid-template-columns:1fr;padding:26px}}

/* Cards grids */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px;margin:18px 0}
.pcard{display:flex;flex-direction:column;background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden;text-decoration:none;color:var(--ink);transition:transform .15s ease,box-shadow .15s ease}
.pcard:hover{transform:translateY(-3px);box-shadow:0 14px 30px -14px rgba(0,58,107,.35)}
.pcard img{width:100%;aspect-ratio:4/3;object-fit:cover}
.pcard .body{padding:14px 16px 16px}
.pcard strong{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:17px;line-height:1.3}
.pcard span{display:block;color:var(--muted);font-size:14px;margin-top:2px}
.pcard .pill{display:inline-block;margin-top:8px;background:#eaf3ff;color:#0b4f8f;border-radius:999px;padding:2px 10px;font-size:12.5px;font-weight:700}
@media(max-width:560px){.cards{grid-template-columns:1fr 1fr;gap:12px}.pcard .body{padding:10px 12px 12px}.pcard strong{font-size:15px}.pcard span{font-size:13px}}

/* Breed index filters */
.filters{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:28px 0 6px}
.filters input{flex:1 1 240px;min-width:0;padding:12px 16px;border-radius:14px;border:1px solid var(--line);font:inherit;background:#fff}
.chip{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;font:600 14px 'Inter',sans-serif;cursor:pointer;color:#414751}
.chip.on{background:var(--blue);border-color:var(--blue);color:#fff}
.empty{display:none;color:var(--muted);padding:20px 0}

/* Article */
.meta-line{display:flex;flex-wrap:wrap;gap:8px 16px;color:var(--muted);font-size:14px;margin-top:6px}
.article-figure{margin:-36px auto 0;max-width:960px;position:relative;z-index:2}
.article-figure img{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:28px;box-shadow:0 24px 60px -24px rgba(0,58,107,.5)}
.article-figure .credit{margin:10px 6px 0;text-align:right}
.tldr{background:#fff;border:2px solid #cfe2fb;border-radius:22px;padding:22px 26px;margin:36px 0}
.tldr strong{display:block;font-family:'Plus Jakarta Sans',sans-serif;color:var(--blue);margin-bottom:6px}
.prose h2{margin-top:40px;display:flex;align-items:center;gap:10px}
.prose h2 .ic{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:20px;background:#eaf3ff}
.prose ol.steps{list-style:none;counter-reset:s;padding:0;margin:14px 0}
.prose ol.steps li{counter-increment:s;position:relative;padding:14px 18px 14px 64px;margin:10px 0;background:#fff;border:1px solid var(--line);border-radius:16px}
.prose ol.steps li::before{content:counter(s);position:absolute;left:16px;top:12px;width:34px;height:34px;border-radius:50%;background:var(--blue);color:#fff;font-weight:800;display:grid;place-items:center;font-family:'Plus Jakarta Sans',sans-serif}
.prose table{width:100%;border-collapse:separate;border-spacing:0;margin:18px 0;font-size:15px;background:#fff;border:1px solid var(--line);border-radius:16px;overflow:hidden}
.prose th,.prose td{padding:12px 14px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}
.prose tr:last-child td{border-bottom:0}
.prose th{background:#eaf3ff;font-size:12.5px;text-transform:uppercase;letter-spacing:.05em;color:#0b4f8f}
.prose td:first-child{font-weight:700;white-space:nowrap;color:var(--blue)}
.prose .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0}
.prose .grid2>div{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px}
.prose .grid2 b{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;margin-bottom:4px}
@media(max-width:640px){.prose .grid2{grid-template-columns:1fr}}
`;

export const layout = (meta: PageMeta, body: string, active?: 'porodi' | 'statii') => {
  const url = SITE + meta.path;
  const ogImage = meta.image ? `${SITE}/img/${meta.image}.jpg` : `${SITE}/og-image.png`;
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: meta.breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, item: SITE + b.path })),
  };
  const ld = [breadcrumbLd, ...(meta.jsonLd || [])];

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
<meta property="og:image" content="${ogImage}">
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
    <a class="hide-sm${active === 'porodi' ? ' on' : ''}" href="/porodi/">Породи</a>
    <a class="hide-sm${active === 'statii' ? ' on' : ''}" href="/statii/">Статии</a>
    <a href="/login">Вход</a>
    <a class="cta" href="/register">Регистрация</a>
  </nav>
</div></header>
${body}
<footer class="site"><div class="wrap">
  <span>© ${new Date().getFullYear()} <b>eDog.bg</b> — дигитален паспорт и напомняния за здравето на кучето</span>
  <span class="links"><a href="/">Начало</a><a href="/porodi/">Породи кучета</a><a href="/statii/">Статии</a><a href="/privacy.html">Поверителност</a></span>
</div></footer>
</body>
</html>
`;
};

export const ctaBox = (title: string, text: string) => `
<section class="cta-box">
  <div>
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <ul><li>✓ Безплатно</li><li>✓ Без кредитна карта</li><li>✓ На български</li></ul>
  </div>
  <a class="btn" href="/register">Създай безплатен профил →</a>
</section>`;
