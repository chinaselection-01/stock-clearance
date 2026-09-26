/* ============================================================
   gen-landing.js — batch-generate SEO landing pages
   Output: landing/<slug>.html  (one independent URL per keyword)
   Run: node gen-landing.js
   ============================================================ */
const fs = require("fs");
const path = require("path");
const KW = require("./landing-keywords.js");

const DOMAIN = "https://stock-clearance.ai";
const OUT = path.join(__dirname, "landing");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function spreadIntro(o) {
  // intro array -> intro0/intro1... so landing.js can map data-i18n
  const out = { title: o.title, desc: o.desc, h1: o.h1, sub: o.sub };
  (o.intro || []).forEach((p, i) => { out["intro" + i] = p; });
  return out;
}

function breadcrumb(slug, name) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: DOMAIN + "/" },
      { "@type": "ListItem", position: 2, name: name, item: DOMAIN + "/landing/" + slug + ".html" }
    ]
  };
}
function collection(slug, en) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": en.title,
    "description": en.desc,
    "url": DOMAIN + "/landing/" + slug + ".html",
    "isPartOf": { "@type": "WebSite", "name": "stock-clearance.ai", "url": DOMAIN + "/" }
  };
}

function relatedLinks(currentSlug) {
  return KW.filter(k => k.slug !== currentSlug).map(k =>
    `<a class="rel" href="${k.slug}.html">${k.en.h1}</a>`
  ).join("");
}

function page(k) {
  const en = spreadIntro(k.en), zh = spreadIntro(k.zh);
  const L = { cat: k.cat, en, zh };
  const canonical = DOMAIN + "/landing/" + k.slug + ".html";
  const jsonld = JSON.stringify([breadcrumb(k.slug, k.en.h1), collection(k.slug, k.en)]);

  // intro paragraphs (English default for SEO crawlers)
  const introEn = k.en.intro.map((p, i) => `<p data-i18n="intro${i}">${p}</p>`).join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${k.en.title}</title>
  <meta name="description" content="${k.en.desc}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${k.en.title}">
  <meta property="og:description" content="${k.en.desc}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="stylesheet" href="../styles.css">
  <script type="application/ld+json">${jsonld}</script>
</head>
<body>
  <header class="nav">
    <a class="logo" href="../index.html">stock-clearance<span>.ai</span></a>
    <nav class="links">
      <a href="../index.html">Home</a>
      <a href="../index.html#/browse">Browse</a>
      <a href="../index.html#/post">Post Stock</a>
      <button id="langBtn" class="lang">中文</button>
    </nav>
  </header>

  <section class="hero">
    <h1 data-i18n="h1">${k.en.h1}</h1>
    <p class="hero-sub" data-i18n="sub">${k.en.sub}</p>
  </section>

  <div class="wrap">
    <div class="sec-title">${k.cat === "*" ? "Live clearance inventory" : k.en.h1 + " — live lots"}</div>
    <div class="sec-sub" data-i18n="desc">${k.en.desc}</div>

    <article class="lede">
      ${introEn}
      <p><a class="btn prime" href="../index.html#/browse" data-i18n="cta">Browse all lots &amp; request a quote</a></p>
    </article>

    <div class="countbar">Showing <b id="count">—</b> live lots · updated in real time from suppliers</div>
    <div id="lots" class="lots"></div>

    <div class="relbox">
      <div class="sec-title small">Related searches</div>
      <div class="rels">${relatedLinks(k.slug)}</div>
    </div>
  </div>

  <footer class="foot">
    stock-clearance.ai · Global B2B stock-lot &amp; clearance marketplace · Yiwu Wuyuai &amp; China industrial belts
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../supabase-config.js"></script>
  <script>window.LANDING = ${JSON.stringify(L)};</script>
  <script src="../landing.js"></script>
</body>
</html>`;
}

let n = 0;
KW.forEach(k => {
  fs.writeFileSync(path.join(OUT, k.slug + ".html"), page(k), "utf8");
  n++;
});
console.log("Generated " + n + " landing pages in ./landing/");
