/* ============================================================
   stock-clearance.ai — landing page shared client logic
   - loads real listings from Supabase (filtered by window.LANDING.cat)
   - renders product cards
   - en/中文 switch (updates data-i18n elements)
   - demo fallback when unconfigured
   ============================================================ */
(function () {
  var L = window.LANDING || { cat: "*" };
  var cfg = window.SC_CONFIG;
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function money(n) { return "$" + (Number(n || 0)).toFixed(2); }
  function off(now, was) { return (!was || was <= now) ? 0 : Math.round((1 - now / was) * 100); }
  function catLabel(v) { return { app: "Apparel", home: "Home", pet: "Pet", toy: "Toy", ele: "Electronics", oth: "Other" }[v] || v; }
  function beltLabel(v) { return { yw: "Yiwu", gd: "Guangdong", zj: "Zhejiang", fj: "Fujian", js: "Jiangsu", sd: "Shandong" }[v] || v; }
  function titleEn(l) { return l.title_en || l.title_cn || "Stock lot"; }

  var SEED = [
    { title_en: "Cotton T-shirt Overstock, 5 colors, 8,000 pcs", cat: "app", belt: "yw", qty: 8000, unit: "pcs", price_was: 3.20, price_now: 0.85, moq: 500 },
    { title_en: "Cat Tree Mixed Lot, 800 sets", cat: "pet", belt: "zj", qty: 800, unit: "sets", price_was: 18.0, price_now: 6.40, moq: 200 },
    { title_en: "Stainless Tumblers 12oz, 3,000 pcs", cat: "home", belt: "zj", qty: 3000, unit: "pcs", price_was: 4.50, price_now: 1.10, moq: 1000 },
    { title_en: "Plush Toys Returns Lot, 1,200 pcs", cat: "toy", belt: "gd", qty: 1200, unit: "pcs", price_was: 2.80, price_now: 0.60, moq: 300 },
    { title_en: "Denim Jeans Mixed Lot, 600 pcs", cat: "app", belt: "gd", qty: 600, unit: "pcs", price_was: 9.00, price_now: 2.30, moq: 300 },
    { title_en: "LED Bulbs Overstock, 5,000 pcs", cat: "ele", belt: "gd", qty: 5000, unit: "pcs", price_was: 0.90, price_now: 0.22, moq: 500 }
  ];

  function card(l) {
    var o = off(l.price_now, l.price_was);
    var img = l.img
      ? '<img src="' + esc(l.img) + '" alt="' + esc(titleEn(l)) + '" loading="lazy">'
      : '<div class="ph">STOCK LOT</div>';
    return '<a class="lot" href="../index.html#/browse">' +
      '<div class="img">' + img + (o ? '<span class="off">' + o + '% OFF</span>' : '') + '</div>' +
      '<div class="body"><div class="t">' + esc(titleEn(l)) + '</div>' +
      '<div class="price"><span class="now">' + money(l.price_now) + '</span><span class="was">' + money(l.price_was) + '</span></div>' +
      '<div class="meta"><span>MOQ ' + (l.moq || '—') + ' ' + esc(l.unit || 'pcs') + '</span><span>' + beltLabel(l.belt) + '</span></div>' +
      '</div></a>';
  }

  function render(list) {
    var el = $("#lots"); if (!el) return;
    el.innerHTML = (list && list.length)
      ? list.map(card).join("")
      : '<p class="empty">No lots listed yet — <a href="../index.html#/post">post your stock</a>.</p>';
    var c = $("#count"); if (c) c.textContent = (list || []).length;
  }

  async function load() {
    if (!cfg || !cfg.url || !window.supabase) { render(SEED.filter(function (s) { return L.cat === "*" || s.cat === L.cat; })); return; }
    try {
      var sb = window.supabase.createClient(cfg.url, cfg.anon);
      var q = sb.from("listings").select("*").order("created_at", { ascending: false }).limit(60);
      if (L.cat && L.cat !== "*") q = q.eq("cat", L.cat);
      var r = await q;
      if (r.error || !r.data || !r.data.length) { render(SEED.filter(function (s) { return L.cat === "*" || s.cat === L.cat; })); return; }
      render(r.data);
    } catch (e) { render(SEED.filter(function (s) { return L.cat === "*" || s.cat === L.cat; })); }
  }

  /* ---- language switch ---- */
  function applyLang(lang) {
    document.documentElement.lang = (lang === "zh") ? "zh-CN" : "en";
    var t = (lang === "zh") ? L.zh : L.en;
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var k = n.getAttribute("data-i18n");
      if (t && t[k] != null) n.innerHTML = t[k];
    });
    var btn = $("#langBtn"); if (btn) btn.textContent = (lang === "zh") ? "EN" : "中文";
    try { localStorage.setItem("sc_lang", lang); } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var saved = "en";
    try { saved = localStorage.getItem("sc_lang") || "en"; } catch (e) {}
    applyLang(saved);
    var btn = $("#langBtn");
    if (btn) btn.addEventListener("click", function () {
      var cur = (document.documentElement.lang === "zh-CN") ? "zh" : "en";
      applyLang(cur === "zh" ? "en" : "zh");
    });
    load();
  });
})();
