/* ============================================================
   stock-clearance.ai — MVP (browse + post + inquiry)
   Vanilla JS. Data layer: Supabase (Postgres + Storage) when
   configured, otherwise falls back to localStorage demo mode.
   Bilingual EN / 中文. No payment.
   ============================================================ */

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    nav_home:"Home", nav_browse:"Browse", nav_post:"Post Stock", nav_inq:"Inquiries",
    hero_t:"Global Stock Lots, Clearance Prices",
    hero_s:"Source excess inventory & overstock directly from Yiwu Wuyuai and China's manufacturing belts. No middlemen, lot by lot.",
    search_ph:"Search stock lots, categories, belts…", search_btn:"Search",
    cat_title:"Browse by category", feat_title:"Featured stock lots",
    sup_cta_h:"Are you a Chinese supplier?", sup_cta_p:"Fill in Chinese, we auto-generate English. Post your stock free.",
    sup_cta_btn:"List your stock →",
    belt_title:"Shop by manufacturing belt",
    browse_title:"All stock lots", found:"stock lots found",
    sort_price_asc:"Price low → high", sort_price_desc:"Price high → low",
    sort_new:"Newest", sort_moq:"MOQ low",
    cat_all:"All categories", belt_all:"All belts", cond_all:"Any condition",
    moq:"MOQ", stock_qty:"Stock qty", condition:"Condition", origin:"Origin belt",
    brand:"Brand", cert:"Certification", tiered:"Tiered price", inspect:"Inspection available in belt by appointment.",
    verified:"Verified", unverified:"New supplier",
    req_quote:"Request a Quote", req_sub:"Send an inquiry — supplier will contact you directly",
    send:"Send inquiry", wa:"Chat on WhatsApp", sent:"✅ Inquiry sent! The supplier will contact you shortly.",
    post_title:"Post your stock lot", post_sub:"Fill in Chinese, system generates English. * required",
    f_title:"Product name (Chinese) *", f_cat:"Category *", f_belt:"Location / belt *",
    f_qty:"Quantity *", f_unit:"Unit", f_was:"Original price (unit) *", f_now:"Clearance price (unit) *",
    f_moq:"MOQ *", f_cond:"Condition *", f_brand:"Brand authorization *", f_desc:"Description (Chinese)",
    f_img:"Images / video", f_img_h:"Image & video upload lands in production. Demo uses placeholder.",
    publish:"Publish / 发布", published:"✅ Published! Your lot is now live in Browse.",
    inq_title:"Inquiries (supplier view)", inq_empty:"No inquiries yet. When buyers send a quote request, it shows here.",
    inq_from:"Buyer", inq_qty:"Qty", inq_msg:"Message", inq_mark:"Mark handled", inq_new:"New", inq_done:"Handled",
    back:"← Back", loading:"Loading…", none:"None",
    brand_un:"Unbranded", brand_own:"Own brand", brand_auth:"Authorized",
    cond_new:"Brand-new overstock", cond_ret:"Customer returns", cond_mix:"Mixed / ungraded",
    cat_app:"Apparel", cat_home:"Home", cat_toy:"Toys", cat_ele:"Electronics", cat_pet:"Pet", cat_shoe:"Shoes", cat_bag:"Bags", cat_oth:"Others",
    belt_yw:"Yiwu", belt_gd:"Guangdong", belt_zj:"Zhejiang", belt_fj:"Fujian", belt_js:"Jiangsu",     belt_sd:"Shandong",
    post_simple_t:"Post stock in 3 steps", post_simple_s:"① Photo  ② Quantity  ③ Publish — AI fills the rest.",
    step1:"① Photo / upload *", pick_photo:"📷 Tap to take photo or pick image",
    ai_btn:"✨ AI auto-tag (after photo)", ai_loading:"🔍 AI is recognizing product, selling points & category…",
    ai_done:"✨ AI filled category / belt / condition and suggested an EN title & selling points (demo). A real vision API in production identifies YOUR actual product.",
    more_opts:"More spec options (optional — builds buyer trust)",
    f_title2:"Product name (Chinese — leave blank for AI)",
    f_dim:"Dimensions (L×W×H)", f_size:"Size / spec", f_cap:"Capacity", f_weight:"Weight", f_material:"Material", f_color:"Color",
    sup_banner:"Suppliers wanted — post free, photo-only", sup_banner_p:"We are filling inventory first. Free listing now. You take the photo, we do the rest.",
    how_join:"How to bring suppliers on board", join1:"Walk Yiwu Wuyuai & belt markets, invite booth owners directly", join2:"Post for them — you/assistant shoot photos, they just confirm", join3:"Share the invite link in WeChat stock-lot groups",
    time:"Time"
  },
  zh: {
    nav_home:"首页", nav_browse:"浏览", nav_post:"发布尾货", nav_inq:"询盘",
    hero_t:"全球尾货，清仓价直供",
    hero_s:"直接从义乌五爱及全国各地产业带采购尾货与库存。没有中间商，按批撮合。",
    search_ph:"搜索尾货、品类、产业带…", search_btn:"搜索",
    cat_title:"按品类浏览", feat_title:"精选尾货",
    sup_cta_h:"您是国内的供应商吗？", sup_cta_p:"用中文填写，系统自动生成英文。免费发布尾货。",
    sup_cta_btn:"免费发布尾货 →",
    belt_title:"按产业带选购",
    browse_title:"全部尾货", found:"条尾货",
    sort_price_asc:"价格从低到高", sort_price_desc:"价格从高到低",
    sort_new:"最新发布", sort_moq:"起订量从低到高",
    cat_all:"全部品类", belt_all:"全部产业带", cond_all:"任意成色",
    moq:"起订量", stock_qty:"库存数量", condition:"成色", origin:"所在产业带",
    brand:"品牌", cert:"认证", tiered:"阶梯价", inspect:"可约在产业地带看验货。",
    verified:"已认证", unverified:"新供应商",
    req_quote:"发起询盘", req_sub:"提交询盘，供应商会直接联系您",
    send:"发送询盘", wa:"用 WhatsApp 联系", sent:"✅ 询盘已发送！供应商会尽快联系您。",
    post_title:"发布尾货", post_sub:"用中文填写，系统生成英文。带 * 为必填",
    f_title:"商品名称（中文）*", f_cat:"品类 *", f_belt:"所在地 / 产业带 *",
    f_qty:"数量 *", f_unit:"单位", f_was:"原价（单价）*", f_now:"清仓价（单价）*",
    f_moq:"最小起订量 MOQ *", f_cond:"成色 *", f_brand:"品牌授权 *", f_desc:"描述（中文）",
    f_img:"图片 / 视频", f_img_h:"图片视频上传在正式版上线，演示用占位图。",
    publish:"发布 / Publish", published:"✅ 已发布！您的尾货已出现在浏览页。",
    inq_title:"询盘管理（供应商视角）", inq_empty:"还没有询盘。买家发起询盘后会显示在这里。",
    inq_from:"买家", inq_qty:"数量", inq_msg:"留言", inq_mark:"标记已处理", inq_new:"新", inq_done:"已处理",
    back:"← 返回", loading:"加载中…", none:"无",
    brand_un:"无品牌", brand_own:"自有品牌", brand_auth:"已授权",
    cond_new:"全新尾货", cond_ret:"退货", cond_mix:"杂款 / 未分级",
    cat_app:"服装", cat_home:"家居", cat_toy:"玩具", cat_ele:"电子", cat_pet:"宠物", cat_shoe:"鞋帽", cat_bag:"箱包", cat_oth:"其他",
    belt_yw:"义乌", belt_gd:"广东", belt_zj:"浙江", belt_fj:"福建", belt_js:"江苏",     belt_sd:"山东",
    post_simple_t:"极简发布尾货", post_simple_s:"① 拍照  ② 填数量  ③ 发布（其余 AI 帮你填）",
    step1:"① 拍照或上传图片 *", pick_photo:"📷 点此拍照 / 选图（手机可直接调用摄像头）",
    ai_btn:"✨ AI 一键识别（上传图片后可用）", ai_loading:"🔍 AI 正在识别商品、卖点、品类…",
    ai_done:"✨ AI 已自动填好品类 / 产业带 / 成色，并建议英文标题与卖点（演示模拟）。正式版接入视觉模型后，将真实识别你的商品。",
    more_opts:"更多规格选项（可选，让买家更放心）",
    f_title2:"商品名称（中文，留空则 AI 识别）",
    f_dim:"尺寸（长×宽×高）", f_size:"规格 / 大小", f_cap:"容量", f_weight:"重量", f_material:"材质", f_color:"颜色",
    sup_banner:"正在招募供应商 · 免费发布 · 拍照即可发", sup_banner_p:"我们优先把库存填满。现在免费上架，你只管拍照，其余交给我们。",
    how_join:"如何把供应商拉进来", join1:"扫义乌五爱及各地产业带市场，直接邀请档口老板", join2:"代运营发帖——你/帮手拍照，老板只确认", join3:"在尾货微信群发邀请链接，老客户转介绍",
    time:"时间"
  }
};

/* option maps (value -> i18n key suffix) */
const CATS = [["app","cat_app"],["home","cat_home"],["toy","cat_toy"],["ele","cat_ele"],["pet","cat_pet"],["shoe","cat_shoe"],["bag","cat_bag"],["oth","cat_oth"]];
const BELTS = [["yw","belt_yw"],["gd","belt_gd"],["zj","belt_zj"],["fj","belt_fj"],["js","belt_js"],["sd","belt_sd"]];
const CONDS = [["new","cond_new"],["ret","cond_ret"],["mix","cond_mix"]];
const BRANDS = [["un","brand_un"],["own","brand_own"],["auth","brand_auth"]];

/* ---------------- Supabase config & client ---------------- */
/* supabase-config.js sets: window.SC_CONFIG = {url, anon}.
   (anon key is public-safe; data protected by RLS)
   If not configured, the app falls back to localStorage demo mode. */
const SC_CFG = window.SC_CONFIG || {};
const SC_URL = SC_CFG.url || "";
const SC_ANON = SC_CFG.anon || "";
const USE_SUPABASE = !!(SC_URL && SC_ANON && window.supabase);
const sb = USE_SUPABASE ? window.supabase.createClient(SC_URL, SC_ANON) : null;

/* ---------------- state ---------------- */
const LS_LOTS="sc_lots_v1", LS_INQ="sc_inquiries_v1", LS_LANG="sc_lang";
let lang = localStorage.getItem(LS_LANG) || "en";
let view="home", param=null;
let draftImg=null;
let filters={cat:"",belt:"",cond:"",q:"",sort:"price_asc"};
let LOTS=[];            // cached listings
let INQ=[];             // cached inquiries
let lotsLoaded=false;

/* ---------------- helpers ---------------- */
const $ = (s,r=document)=>r.querySelector(s);
const app = ()=>$("#app");
function t(k){ return (I18N[lang]&&I18N[lang][k]!=null)?I18N[lang][k]:(I18N.en[k]||k); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function money(n){ return "$"+Number(n).toFixed(2); }
function offPct(now,was){ if(!was||was<=now) return 0; return Math.round((1-now/was)*100); }
function ts(){ return new Date().toISOString(); }
function fmtTime(iso){ try{ return new Date(iso).toLocaleString(lang==="zh"?"zh-CN":"en-US"); }catch(e){ return iso; } }
function dataUrlToBlob(dataUrl){
  const parts=dataUrl.split(","); const mime=(parts[0].match(/:(.*?);/)||[])[1]||"image/jpeg";
  const bin=atob(parts[1]); const arr=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
  return new Blob([arr],{type:mime});
}

/* ---------------- seed data (demo fallback only) ---------------- */
function seedLots(){
  const now=Date.now();
  return [
    {id:"L1001",titleCn:"纯棉 T 恤尾单 5 色 8000 件",titleEn:"Cotton T-shirt Overstock, 5 colors, 8,000 pcs",cat:"app",belt:"yw",qty:8000,unit:"pcs",priceWas:3.20,priceNow:0.85,moq:500,cond:"new",brand:"un",descCn:"混码 S–XL，180–220g 精梳棉，剪标尾单。",descEn:"Mixed size S–XL, 180–220gsm combed cotton. Single order cancellation lot, tags removed.",supplier:{name:"Yiwu Likang Stock Co.",verified:true,whatsapp:"8613800000001",resp:"< 6h"},createdAt:now-1000*60*60*24*3,featured:true},
    {id:"L1002",titleCn:"猫爬架杂款 800 套",titleEn:"Cat Tree Mixed Lot, 800 sets",cat:"pet",belt:"zj",qty:800,unit:"sets",priceWas:18.0,priceNow:6.40,moq:200,cond:"new",brand:"un",descCn:"多种款式混装，库存新品。",descEn:"Assorted styles, brand-new stock.",supplier:{name:"Zhejiang PetMfg",verified:true,whatsapp:"8613800000002",resp:"< 12h"},createdAt:now-1000*60*60*24*2,featured:true},
    {id:"L1003",titleCn:"不锈钢保温杯 12oz 3000 个",titleEn:"Stainless Tumblers 12oz, 3,000 pcs",cat:"home",belt:"zj",qty:3000,unit:"pcs",priceWas:4.50,priceNow:1.10,moq:1000,cond:"new",brand:"own",descCn:"304 不锈钢，自有品牌可贴牌。",descEn:"304 stainless, own brand / OEM available.",supplier:{name:"Yongkang STWADD",verified:true,whatsapp:"8613800000003",resp:"< 6h"},createdAt:now-1000*60*60*24*1,featured:true},
    {id:"L1004",titleCn:"毛绒玩具退货 1200 件",titleEn:"Plush Toys Returns Lot, 1,200 pcs",cat:"toy",belt:"gd",qty:1200,unit:"pcs",priceWas:2.80,priceNow:0.60,moq:300,cond:"ret",brand:"un",descCn:"电商退货，未分级，按斤走。",descEn:"E-commerce customer returns, ungraded, sold by weight.",supplier:{name:"Guangzhou ToyOut",verified:false,whatsapp:"8613800000004",resp:"< 24h"},createdAt:now-1000*60*60*12,featured:false},
    {id:"L1005",titleCn:"牛仔裤杂款 600 条",titleEn:"Denim Jeans Mixed Lot, 600 pcs",cat:"app",belt:"gd",qty:600,unit:"pcs",priceWas:9.00,priceNow:2.30,moq:300,cond:"mix",brand:"un",descCn:"多版型混装，部分剪标。",descEn:"Assorted fits, some tags removed.",supplier:{name:"Guangzhou DenimHub",verified:true,whatsapp:"8613800000005",resp:"< 12h"},createdAt:now-1000*60*60*5,featured:false},
    {id:"L1006",titleCn:"宠物垫 1500 张",titleEn:"Pet Beds Lot, 1,500 pcs",cat:"pet",belt:"zj",qty:1500,unit:"pcs",priceWas:4.00,priceNow:1.20,moq:200,cond:"new",brand:"un",descCn:"珊瑚绒，库存新品。",descEn:"Coral fleece, brand-new stock.",supplier:{name:"Zhejiang PetMfg",verified:true,whatsapp:"8613800000002",resp:"< 12h"},createdAt:now-1000*60*30,featured:false},
    {id:"L1007",titleCn:"袜子 12000 双",titleEn:"Socks Lot, 12,000 pairs",cat:"app",belt:"zj",qty:12000,unit:"pr",priceWas:0.70,priceNow:0.18,moq:1000,cond:"new",brand:"un",descCn:"运动袜混色，整箱。",descEn:"Sport socks assorted colors, carton.",supplier:{name:"Zhejiang SockCo",verified:false,whatsapp:"8613800000006",resp:"< 24h"},createdAt:now-1000*60*10,featured:false},
    {id:"L1008",titleCn:"LED 灯泡尾单 5000 个",titleEn:"LED Bulbs Overstock, 5,000 pcs",cat:"ele",belt:"gd",qty:5000,unit:"pcs",priceWas:0.90,priceNow:0.22,moq:500,cond:"new",brand:"own",descCn:"9W 暖白，自有品牌。",descEn:"9W warm white, own brand.",supplier:{name:"Shenzhen LEDPro",verified:true,whatsapp:"8613800000007",resp:"< 6h"},createdAt:now-1000*60*2,featured:false}
  ];
}

/* ---------------- data layer ---------------- */
function title(l){ return lang==="zh" ? (l.titleCn||l.titleEn) : (l.titleEn||l.titleCn); }
function catLabel(v){ const m=CATS.find(c=>c[0]===v); return m?t(m[1]):v; }
function beltLabel(v){ const m=BELTS.find(c=>c[0]===v); return m?t(m[1]):v; }
function condLabel(v){ const m=CONDS.find(c=>c[0]===v); return m?t(m[1]):v; }
function brandLabel(v){ const m=BRANDS.find(c=>c[0]===v); return m?t(m[1]):v; }

function getLotsLocal(){
  let ls=localStorage.getItem(LS_LOTS);
  if(!ls){ const s=seedLots(); localStorage.setItem(LS_LOTS,JSON.stringify(s)); return s; }
  try{ return JSON.parse(ls); }catch(e){ const s=seedLots(); localStorage.setItem(LS_LOTS,JSON.stringify(s)); return s; }
}
function saveLotsLocal(arr){ localStorage.setItem(LS_LOTS,JSON.stringify(arr)); }
function getInquiriesLocal(){ try{ return JSON.parse(localStorage.getItem(LS_INQ)||"[]"); }catch(e){ return []; } }
function saveInquiriesLocal(arr){ localStorage.setItem(LS_INQ,JSON.stringify(arr)); }
function getLot(id){ return LOTS.find(l=>l.id===id); }

/* map DB row <-> app lot object */
function rowToLot(r){
  return {
    id:r.id, titleCn:r.title_cn, titleEn:r.title_en, cat:r.cat, belt:r.belt,
    qty:r.qty, unit:r.unit, priceWas:Number(r.price_was), priceNow:Number(r.price_now),
    moq:r.moq, cond:r.cond, brand:r.brand, descCn:r.desc_cn, descEn:r.desc_en,
    img:r.img, specs:r.specs||{},
    supplier:{name:r.supplier_name, verified:r.supplier_verified, whatsapp:r.supplier_whatsapp, resp:r.supplier_resp},
    createdAt: r.created_at? new Date(r.created_at).getTime() : Date.now(),
    featured: r.featured
  };
}
function lotToRow(l){
  return {
    id:l.id, title_cn:l.titleCn, title_en:l.titleEn, cat:l.cat, belt:l.belt,
    qty:l.qty, unit:l.unit, price_was:l.priceWas, price_now:l.priceNow,
    moq:l.moq, cond:l.cond, brand:l.brand, desc_cn:l.descCn, desc_en:l.descEn,
    img:l.img, specs:l.specs||{},
    supplier_name:l.supplier&&l.supplier.name, supplier_whatsapp:l.supplier&&l.supplier.whatsapp,
    supplier_verified:l.supplier?!!l.supplier.verified:false, supplier_resp:l.supplier&&l.supplier.resp,
    featured: !!l.featured, created_at: new Date(l.createdAt||Date.now()).toISOString()
  };
}

async function ensureLots(){
  if(lotsLoaded) return;
  if(USE_SUPABASE){
    const {data,error}=await sb.from("listings").select("*").order("created_at",{ascending:false});
    if(error){ console.error("load listings failed",error); LOTS=[]; }
    else LOTS=(data||[]).map(rowToLot);
  } else { LOTS=getLotsLocal(); }
  lotsLoaded=true;
}
async function ensureInquiries(){
  if(USE_SUPABASE){
    const {data,error}=await sb.from("inquiries").select("*").order("created_at",{ascending:false});
    if(error){ console.error("load inquiries failed",error); INQ=[]; }
    else INQ=(data||[]).map(r=>({
      id:r.id, lotId:r.lot_id, lotTitle:r.lot_title, name:r.name, email:r.email,
      whatsapp:r.whatsapp, qty:r.qty, message:r.message, status:r.status||"new",
      createdAt: r.created_at? new Date(r.created_at).getTime():Date.now()
    }));
  } else { INQ=getInquiriesLocal(); }
}

/* ---------------- card ---------------- */
function lotCard(l){
  const off=offPct(l.priceNow,l.priceWas);
  const verified = l.supplier && l.supplier.verified;
  const bg = l.img?` style="background-image:url('${l.img}');background-size:cover;background-position:center"`:"";
  return `<div class="lot" onclick="go('detail','${l.id}')">
    <div class="img"${bg}>${off?`<span class="off">${off}% OFF</span>`:(l.img?"":"IMG")}</div>
    <div class="body">
      <div class="t">${esc(title(l))}</div>
      <div class="price"><span class="now">${money(l.priceNow)}</span><span class="was">${money(l.priceWas)}</span></div>
      <div class="meta"><span>${t("moq")} ${l.moq} ${esc(l.unit)}</span><span>${beltLabel(l.belt)}</span></div>
      <span class="vbadge">${verified?t("verified"):t("unverified")}</span>
    </div></div>`;
}

/* ---------------- views ---------------- */
function render(){
  // nav lang state
  $("#lang-en").classList.toggle("on",lang==="en");
  $("#lang-zh").classList.toggle("on",lang==="zh");
  $("#nav-home").textContent=t("nav_home");
  $("#nav-browse").textContent=t("nav_browse");
  $("#nav-post").textContent=t("nav_post");
  const inq=INQ.filter(i=>i.status!=="done").length;
  $("#nav-inq").innerHTML = t("nav_inq") + (inq?`<span class="badge-count">${inq}</span>`:"");
  if(view==="home") return renderHome();
  if(view==="browse") return renderBrowse();
  if(view==="detail") return renderDetail();
  if(view==="post") return renderPost();
  if(view==="inquiries") return renderInquiries();
}

function renderHome(){
  const lots=LOTS;
  const POPULAR_SEARCHES=[{slug:"overstock",label:"Overstock lots"},{slug:"liquidation",label:"Liquidation stock"},{slug:"closeout",label:"Closeout deals"},{slug:"clearance",label:"Clearance sale"},{slug:"stock-lots",label:"Stock lots"},{slug:"clothing-overstock",label:"Clothing overstock"},{slug:"electronics-overstock",label:"Electronics overstock"},{slug:"pet-overstock",label:"Pet overstock"}];
  const feat = lots.filter(l=>l.featured).slice(0,4);
  const cats = CATS.map(([v,k])=>`<div class="cat" onclick="goBeltCat('cat','${v}')">${t(k)}<span>${v.toUpperCase()}</span></div>`).join("");
  const belts = BELTS.map(([v,k])=>`<span class="belt" onclick="goBeltCat('belt','${v}')">${beltLabel(v)}</span>`).join("");
  app().innerHTML = `
    <div class="banner">
      <div><b>📦 ${esc(t("sup_banner"))}</b><div class="bp">${esc(t("sup_banner_p"))}</div></div>
      <button class="btn prime" onclick="go('post')">${esc(t("nav_post"))} →</button>
    </div>
    <div class="hero">
      <h1>${esc(t("hero_t"))}</h1>
      <p>${esc(t("hero_s"))}</p>
      <div class="search"><input id="q" placeholder="${esc(t("search_ph"))}" value="${esc(filters.q)}"><button onclick="doSearch()">${esc(t("search_btn"))}</button></div>
      <div class="belts">${belts}</div>
    </div>
    <div class="wrap">
      <div class="sec-title">Popular searches</div>
      <div class="sec-sub">What buyers search — clearance &amp; overstock keywords</div>
      <div class="pops">${POPULAR_SEARCHES.map(p=>`<a class="pop" href="landing/${p.slug}.html">${esc(p.label)}</a>`).join("")}</div>
    </div>
    <div class="wrap">
      <div class="sec-title">${esc(t("cat_title"))}</div>
      <div class="sec-sub">B2B · clearance lots</div>
      <div class="cats">${cats}</div>
    </div>
    <div class="wrap" style="padding-top:8px">
      <div class="sec-title">${esc(t("feat_title"))}</div>
      <div class="sec-sub">${esc(t("inspect"))}</div>
      <div class="grid">${feat.map(lotCard).join("")}</div>
      <div class="cta">
        <div><h3>${esc(t("sup_cta_h"))}</h3><p>${esc(t("sup_cta_p"))}</p></div>
        <button class="btn prime" onclick="go('post')">${esc(t("sup_cta_btn"))}</button>
      </div>
      <details class="join">
        <summary>${esc(t("how_join"))}</summary>
        <ol><li>${esc(t("join1"))}</li><li>${esc(t("join2"))}</li><li>${esc(t("join3"))}</li></ol>
      </details>
    </div>`;
  const q=$("#q"); if(q) q.addEventListener("keydown",e=>{ if(e.key==="Enter") doSearch(); });
}

function renderBrowse(){
  const all=LOTS;
  let list=all.slice();
  if(filters.cat) list=list.filter(l=>l.cat===filters.cat);
  if(filters.belt) list=list.filter(l=>l.belt===filters.belt);
  if(filters.cond) list=list.filter(l=>l.cond===filters.cond);
  if(filters.q){ const q=filters.q.toLowerCase(); list=list.filter(l=>(title(l)+" "+catLabel(l.cat)+" "+beltLabel(l.belt)).toLowerCase().includes(q)); }
  if(filters.sort==="price_asc") list.sort((a,b)=>a.priceNow-b.priceNow);
  else if(filters.sort==="price_desc") list.sort((a,b)=>b.priceNow-a.priceNow);
  else if(filters.sort==="moq") list.sort((a,b)=>a.moq-b.moq);
  else if(filters.sort==="new") list.sort((a,b)=>b.createdAt-a.createdAt);

  const catOpts = `<option value="">${esc(t("cat_all"))}</option>`+CATS.map(([v,k])=>`<option value="${v}" ${filters.cat===v?"selected":""}>${t(k)}</option>`).join("");
  const beltOpts = `<option value="">${esc(t("belt_all"))}</option>`+BELTS.map(([v,k])=>`<option value="${v}" ${filters.belt===v?"selected":""}>${beltLabel(v)}</option>`).join("");
  const condOpts = `<option value="">${esc(t("cond_all"))}</option>`+CONDS.map(([v,k])=>`<option value="${v}" ${filters.cond===v?"selected":""}>${t(k)}</option>`).join("");
  const sortOpts = `<option value="price_asc" ${filters.sort==="price_asc"?"selected":""}>${esc(t("sort_price_asc"))}</option>
    <option value="price_desc" ${filters.sort==="price_desc"?"selected":""}>${esc(t("sort_price_desc"))}</option>
    <option value="new" ${filters.sort==="new"?"selected":""}>${esc(t("sort_new"))}</option>
    <option value="moq" ${filters.sort==="moq"?"selected":""}>${esc(t("sort_moq"))}</option>`;

  app().innerHTML = `
    <div class="wrap browse">
      <aside class="filters">
        <h4>${esc(t("cat_title"))}</h4>
        <select onchange="filters.cat=this.value;render()">${catOpts}</select>
        <h4>${esc(t("belt_title"))}</h4>
        <select onchange="filters.belt=this.value;render()">${beltOpts}</select>
        <h4>${esc(t("condition"))}</h4>
        <select onchange="filters.cond=this.value;render()">${condOpts}</select>
        <h4>${esc(t("sort_price_asc"))}</h4>
        <select onchange="filters.sort=this.value;render()">${sortOpts}</select>
      </aside>
      <section>
        <div class="top">
          <div class="count"><b>${list.length}</b> ${esc(t("found"))}</div>
        </div>
        <div class="grid">${list.length?list.map(lotCard).join(""):`<div class="empty">—</div>`}</div>
      </section>
    </div>`;
}

function renderDetail(){
  const l=getLot(param);
  if(!l){ go("browse"); return; }
  const off=offPct(l.priceNow,l.priceWas);
  const qtyTiers = l.moq + "–1999 " + money(l.priceNow) + " · 2000–4999 " + money((l.priceNow*0.92).toFixed(2)) + " · ≥5000 " + money((l.priceNow*0.85).toFixed(2));
  const waNum = (l.supplier&&l.supplier.whatsapp)||"8613800000000";
  const waText = encodeURIComponent("Hi, I'm interested in: "+title(l)+" (stock-clearance.ai)");
  const verified = l.supplier && l.supplier.verified;
  const s=l.specs||{};
  const specRows = [
    [t("f_dim"), s.dim], [t("f_size"), s.size], [t("f_cap"), s.cap],
    [t("f_weight"), s.weight], [t("f_material"), s.material], [t("f_color"), s.color]
  ].filter(r=>r[1]).map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("");
  const mainBg = l.img?` style="background-image:url('${l.img}');background-size:cover;background-position:center"`:"";
  app().innerHTML = `
    <div class="crumb"><a href="#" onclick="go('home');return false">Home</a> / ${esc(catLabel(l.cat))} / <b>${esc(title(l))}</b></div>
    <div class="wrap detail">
      <div>
        <div class="gallery">
          <div class="main"${mainBg}>${l.img?"":off?`<span class=\"off\">${off}% OFF</span>`:"MAIN IMAGE"}</div>
          <div class="thumbs"><div></div><div></div><div></div><div></div></div>
        </div>
        <div class="info">
          <h1>${esc(title(l))}</h1>
          <div class="pricerow"><span class="now">${money(l.priceNow)}</span><span class="was">${money(l.priceWas)}</span>${off?`<span class="disc">${off}% OFF</span>`:""}</div>
          <table class="spec">
            <tr><td>${esc(t("moq"))}</td><td>${l.moq} ${esc(l.unit)}</td></tr>
            <tr><td>${esc(t("stock_qty"))}</td><td>${l.qty.toLocaleString()} ${esc(l.unit)}</td></tr>
            <tr><td>${esc(t("condition"))}</td><td>${condLabel(l.cond)}</td></tr>
            <tr><td>${esc(t("origin"))}</td><td>${beltLabel(l.belt)}</td></tr>
            <tr><td>${esc(t("brand"))}</td><td>${brandLabel(l.brand)}</td></tr>
            ${specRows}
            <tr><td>${esc(t("cert"))}</td><td>—</td></tr>
          </table>
          <div class="tier"><b>${esc(t("tiered"))}:</b> ${qtyTiers}</div>
          <div class="desc">${esc(lang==="zh"?(l.descCn||l.descEn):(l.descEn||l.descCn))}</div>
          <div class="supplier">
            <div class="row"><div class="av">${esc((l.supplier.name||"S")[0])}</div>
              <div><div>${esc(l.supplier.name||"Supplier")} ${verified?`<span class="vbadge">${esc(t("verified"))}</span>`:`<span class="vbadge" style="background:#F1EEE8;color:#6B6A66">${esc(t("unverified"))}</span>`}</div>
              <div class="meta">${esc(l.supplier.resp||"")}</div></div></div>
          </div>
        </div>
      </div>
      <div>
        <div class="quote">
          <h3>${esc(t("req_quote"))}</h3>
          <p>${esc(t("req_sub"))}</p>
          <input id="iq-name" placeholder="${esc(t("inq_from"))} *">
          <input id="iq-email" placeholder="Email *">
          <input id="iq-wa" placeholder="WhatsApp">
          <input id="iq-qty" placeholder="${esc(t("inq_qty"))} *" type="number">
          <textarea id="iq-msg" placeholder="${esc(t("inq_msg"))}"></textarea>
          <button onclick="submitInquiry('${l.id}')">${esc(t("send"))}</button>
          <button class="wa" onclick="window.open('https://wa.me/${waNum}?text=${waText}','_blank')">${esc(t("wa"))}</button>
          <div id="iq-result"></div>
        </div>
      </div>
    </div>`;
}

function renderPost(){
  draftImg=null;
  const catOpts = CATS.map(([v,k])=>`<option value="${v}">${t(k)}</option>`).join("");
  const beltOpts = BELTS.map(([v,k])=>`<option value="${v}">${beltLabel(v)}</option>`).join("");
  const condOpts = CONDS.map(([v,k])=>`<option value="${v}">${t(k)}</option>`).join("");
  const brandOpts = BRANDS.map(([v,k])=>`<option value="${v}">${t(k)}</option>`).join("");
  app().innerHTML = `
    <div class="wrap">
      <div class="sec-title">${esc(t("post_simple_t"))}</div>
      <div class="sec-sub">${esc(t("post_simple_s"))}</div>
      <div class="post">
        <div class="form">
          <label>${esc(t("step1"))}</label>
          <label class="drop" for="p-img">
            <input type="file" accept="image/*" capture="environment" id="p-img" onchange="onPickImg(this)" hidden>
            <span class="pick">${esc(t("pick_photo"))}</span>
          </label>
          <div class="img-prev" id="p-imgprev" style="display:none">
            <img id="p-imgel" alt="preview"><button type="button" onclick="clearImg()">×</button>
          </div>

          <div class="row2">
            <div><label>${esc(t("f_qty"))} *</label><input id="p-qty" type="number" oninput="previewPost()" placeholder="8000"></div>
            <div><label>${esc(t("unit"))}</label><input id="p-unit" oninput="previewPost()" placeholder="pcs"></div>
          </div>

          <button type="button" class="ai-btn" id="p-ai" onclick="aiRecognize()" disabled>${esc(t("ai_btn"))}</button>
          <div id="p-ai-status"></div>

          <details class="more">
            <summary>${esc(t("more_opts"))}</summary>
            <label>${esc(t("f_title2"))}</label><input id="p-title" oninput="previewPost()" placeholder="如：纯棉 T 恤尾单">
            <div class="row2">
              <div><label>${esc(t("f_cat"))}</label><select id="p-cat" onchange="previewPost()">${catOpts}</select></div>
              <div><label>${esc(t("f_belt"))}</label><select id="p-belt" onchange="previewPost()">${beltOpts}</select></div>
            </div>
            <div class="row2">
              <div><label>${esc(t("f_was"))}</label><input id="p-was" type="number" step="0.01" oninput="previewPost()" placeholder="3.20"></div>
              <div><label>${esc(t("f_now"))}</label><input id="p-now" type="number" step="0.01" oninput="previewPost()" placeholder="0.85"></div>
            </div>
            <label>${esc(t("f_moq"))}</label><input id="p-moq" type="number" oninput="previewPost()" placeholder="500">
            <div class="row2">
              <div><label>${esc(t("f_cond"))}</label><select id="p-cond" onchange="previewPost()">${condOpts}</select></div>
              <div><label>${esc(t("f_brand"))}</label><select id="p-brand" onchange="previewPost()">${brandOpts}</select></div>
            </div>
            <div class="row2">
              <div><label>${esc(t("f_dim"))}</label><input id="p-dim" oninput="previewPost()" placeholder="40×30×25 cm"></div>
              <div><label>${esc(t("f_size"))}</label><input id="p-size" oninput="previewPost()" placeholder="M / L / 均码"></div>
            </div>
            <div class="row2">
              <div><label>${esc(t("f_cap"))}</label><input id="p-cap" oninput="previewPost()" placeholder="500 ml"></div>
              <div><label>${esc(t("f_weight"))}</label><input id="p-weight" oninput="previewPost()" placeholder="1.2 kg"></div>
            </div>
            <div class="row2">
              <div><label>${esc(t("f_material"))}</label><input id="p-material" oninput="previewPost()" placeholder="304 不锈钢"></div>
              <div><label>${esc(t("f_color"))}</label><input id="p-color" oninput="previewPost()" placeholder="混色"></div>
            </div>
            <label>${esc(t("f_desc"))}</label><textarea id="p-desc" oninput="previewPost()" placeholder="是否剪标、是否可验货、包装方式…"></textarea>
            <label>${esc(t("f_supplier"))}</label><input id="p-supplier" oninput="previewPost()" placeholder="如：义乌 XX 库存商">
            <label>${esc(t("f_wa_sup"))}</label><input id="p-wa-sup" oninput="previewPost()" placeholder="8613800000000">
          </details>

          <button class="btn prime" style="width:100%;margin-top:16px" onclick="publishLot()">${esc(t("publish"))}</button>
          <div id="p-result"></div>
        </div>
        <div class="preview">
          <span class="tag2">EN · ${esc(lang==="zh"?"买家看到的英文效果":"Buyer view (EN)")}</span>
          <div class="img" id="pv-img" style="height:180px;margin-bottom:12px"></div>
          <h2 id="pv-title">—</h2>
          <div class="pricerow"><span class="now" id="pv-now">$0.00</span><span class="was" id="pv-was"></span></div>
          <table><tr><td>${esc(t("stock_qty"))}</td><td id="pv-qty">—</td></tr>
            <tr><td>${esc(t("moq"))}</td><td id="pv-moq">—</td></tr>
            <tr><td>${esc(t("condition"))}</td><td id="pv-cond">—</td></tr>
            <tr><td>${esc(t("origin"))}</td><td id="pv-belt">—</td></tr>
            <tr><td>${esc(t("brand"))}</td><td id="pv-brand">—</td></tr>
            <tr id="pv-specs-row" style="display:none"><td>${esc(t("more_opts"))}</td><td id="pv-specs"></td></tr></table>
          <div class="note">* 英文品类/产业带/成色由系统自动映射；标题与描述的中文→英文翻译将在正式版自动生成。品牌授权字段用于合规审核，仿牌将被拒。</div>
        </div>
      </div>
    </div>`;
  previewPost();
}

/* ---- image handling ---- */
function onPickImg(input){
  const file=input.files&&input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>downscale(e.target.result,900,dataUrl=>{
    draftImg=dataUrl;
    $("#p-imgprev").style.display="block";
    $("#p-imgel").src=dataUrl;
    $("#p-ai").disabled=false;
    previewPost();
  });
  reader.readAsDataURL(file);
}
function downscale(dataUrl,maxDim,cb){
  const img=new Image();
  img.onload=()=>{
    const r=Math.min(1,maxDim/Math.max(img.width,img.height));
    const w=Math.round(img.width*r), h=Math.round(img.height*r);
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    c.getContext("2d").drawImage(img,0,0,w,h);
    cb(c.toDataURL("image/jpeg",0.72));
  };
  img.src=dataUrl;
}
function clearImg(){ draftImg=null; $("#p-imgprev").style.display="none"; $("#p-imgel").src=""; $("#p-ai").disabled=true; previewPost(); }

/* ---- AI one-click tagging (demo; real vision API hook below) ---- */
function aiRecognize(){
  if(!draftImg){ return; }
  const btn=$("#p-ai"), status=$("#p-ai-status");
  btn.disabled=true; status.innerHTML=`<div class="ai-loading">${esc(t("ai_loading"))}</div>`;
  setTimeout(()=>{
    // ---- REAL API HOOK ----
    // If you set window.SC_VISION = {endpoint, key} the production build calls it here.
    // Demo simulation returns a plausible category + EN title + selling points.
    const DEMO=[
      {cat:"app", titleEn:"Cotton T-shirt Overstock (AI suggested)", pts:["Brand-new, mixed sizes S–XL","Ready to ship from belt","Low MOQ, lot price"]},
      {cat:"home", titleEn:"Stainless Tumblers Lot (AI suggested)", pts:["304 stainless, food-grade","OEM / own brand ok","Mixed colors available"]},
      {cat:"pet", titleEn:"Pet Supplies Mixed Lot (AI suggested)", pts:["Brand-new stock","Assorted styles","Export-ready packaging"]},
      {cat:"toy", titleEn:"Plush & Toy Returns Lot (AI suggested)", pts:["Assorted SKUs","Customer returns, ungraded","Sold by weight"]},
      {cat:"ele", titleEn:"Electronics Overstock (AI suggested)", pts:["Own brand, CE ready","Hot-selling category","Small MOQ"]}
    ];
    const d=DEMO[Math.floor(Math.random()*DEMO.length)];
    $("#p-cat").value=d.cat;
    if(!$("#p-title").value) $("#p-title").value=d.titleEn;
    status.innerHTML=`<div class="ai-done">${esc(t("ai_done"))}<ul>${d.pts.map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div>`;
    btn.disabled=false;
    previewPost();
  },1400);
}

function previewPost(){
  const g=id=>$("#"+id);
  const src=draftImg;
  const pv=$("#pv-img"); if(pv) pv.style.backgroundImage = src?`url(${src})`:"none";
  const titleCn=(g("p-title").value||"").trim();
  const cat=g("p-cat").value, belt=g("p-belt").value, cond=g("p-cond").value, brand=g("p-brand").value;
  const now=parseFloat(g("p-now").value), was=parseFloat(g("p-was").value);
  const qty=g("p-qty").value, unit=g("p-unit").value||"pcs", moq=g("p-moq").value;
  $("#pv-title").textContent = titleCn || (src?"AI 待识别 / pending":"—");
  $("#pv-now").textContent = isNaN(now)?"$0.00":money(now);
  $("#pv-was").textContent = isNaN(was)?"":money(was);
  $("#pv-qty").textContent = (qty||"—")+" "+(unit||"pcs");
  $("#pv-moq").textContent = (moq||"—")+" "+(unit||"pcs");
  $("#pv-cond").textContent = condLabel(cond);
  $("#pv-belt").textContent = beltLabel(belt);
  $("#pv-brand").textContent = brandLabel(brand);
  const specs=[];
  const add=(v,k)=>{ if(v) specs.push(`${k}: ${v}`); };
  add((g("p-dim").value||"").trim(), t("f_dim"));
  add((g("p-size").value||"").trim(), t("f_size"));
  add((g("p-cap").value||"").trim(), t("f_cap"));
  add((g("p-weight").value||"").trim(), t("f_weight"));
  add((g("p-material").value||"").trim(), t("f_material"));
  add((g("p-color").value||"").trim(), t("f_color"));
  const row=$("#pv-specs-row");
  if(row){ row.style.display = specs.length?"":"none"; $("#pv-specs").textContent = specs.join(" · "); }
}

async function publishLot(){
  const g=id=>$("#"+id);
  const qty=parseInt(g("p-qty").value);
  if(!draftImg||isNaN(qty)){ g("p-result").innerHTML=`<div class="ok-msg" style="background:#FBE9DF;color:#cf3f0a;border-color:#F3C9B5">* ${esc(lang==="zh"?"请先拍照/上传图片，并填写数量":"Please add a photo and quantity")}</div>`; return; }
  const cat=g("p-cat").value||"oth", belt=g("p-belt").value||"yw", cond=g("p-cond").value||"mix", brand=g("p-brand").value||"un";
  const now=parseFloat(g("p-now").value)||0, was=parseFloat(g("p-was").value)||0, moq=parseInt(g("p-moq").value)||0;
  const unit=g("p-unit").value.trim()||"pcs", titleCn=g("p-title").value.trim();
  const descCn=g("p-desc").value.trim();
  const supName=g("p-supplier").value.trim()||"StockClearance.ai";
  const supWa=g("p-wa-sup").value.trim()||"";
  const s={dim:(g("p-dim").value||"").trim(),size:(g("p-size").value||"").trim(),cap:(g("p-cap").value||"").trim(),weight:(g("p-weight").value||"").trim(),material:(g("p-material").value||"").trim(),color:(g("p-color").value||"").trim()};
  const id="U"+(Date.now()).toString().slice(-8);
  let imgUrl=draftImg;
  const lot={id,titleCn,titleEn:titleCn||"Stock lot",cat,belt,qty,unit,priceWas:was,priceNow:now,moq,cond,brand,descCn,descEn:descCn,
    img:imgUrl, specs:s,
    supplier:{name:supName,verified:false,whatsapp:supWa,resp:"—"},createdAt:Date.now(),featured:false};
  if(USE_SUPABASE){
    try{
      const blob=dataUrlToBlob(draftImg);
      const path=id+".jpg";
      const {error:upErr}=await sb.storage.from("listing-images").upload(path, blob, {contentType:"image/jpeg", upsert:true});
      if(!upErr){ const {data:u}=sb.storage.from("listing-images").getPublicUrl(path); imgUrl=u.publicUrl; lot.img=imgUrl; }
      else console.warn("image upload failed, storing dataURL", upErr);
    }catch(e){ console.warn("image upload error", e); }
    const {error}=await sb.from("listings").insert(lotToRow(lot));
    if(error){ g("p-result").innerHTML=`<div class="ok-msg" style="background:#FBE9DF;color:#cf3f0a;border-color:#F3C9B5">* Publish failed: ${esc(error.message)}</div>`; return; }
    lotsLoaded=false; await ensureLots();
  } else {
    const lots=getLotsLocal(); lots.unshift(lot); saveLotsLocal(lots); LOTS=lots;
  }
  draftImg=null;
  g("p-result").innerHTML=`<div class="ok-msg">${esc(t("published"))}</div>`;
  setTimeout(()=>go("browse"),700);
}

async function submitInquiry(lotId){
  const g=id=>$("#"+id);
  const name=g("iq-name").value.trim(), email=g("iq-email").value.trim(), wa=g("iq-wa").value.trim(), qty=g("iq-qty").value.trim(), msg=g("iq-msg").value.trim();
  if(!name||!email||!qty){ g("iq-result").innerHTML=`<div class="ok-msg" style="background:#FBE9DF;color:#cf3f0a;border-color:#F3C9B5">* ${esc(lang==="zh"?"请填写 姓名 / 邮箱 / 数量":"Name / Email / Qty required")}</div>`; return; }
  const l=getLot(lotId); if(!l){ return; }
  const inq={id:"I"+Date.now(),lotId,lotTitle:title(l),name,email,whatsapp:wa,qty,message:msg,status:"new",createdAt:Date.now()};
  if(USE_SUPABASE){
    const {error}=await sb.from("inquiries").insert({id:inq.id,lot_id:lotId,lot_title:inq.lotTitle,name,email,whatsapp:wa,qty,message:msg,status:"new",created_at:new Date(inq.createdAt).toISOString()});
    if(error){ g("iq-result").innerHTML=`<div class="ok-msg" style="background:#FBE9DF;color:#cf3f0a;border-color:#F3C9B5">* Failed: ${esc(error.message)}</div>`; return; }
    await ensureInquiries();
  } else {
    const arr=getInquiriesLocal(); arr.unshift(inq); saveInquiriesLocal(arr); INQ=arr;
  }
  g("iq-result").innerHTML=`<div class="ok-msg">${esc(t("sent"))}</div>`;
  setTimeout(render,300);
}

async function renderInquiries(){
  if(!INQ.length && USE_SUPABASE) await ensureInquiries();
  const inq=INQ;
  const rows = inq.length ? inq.map(i=>`
    <div class="inq">
      <div class="h"><span class="lot">${esc(i.lotTitle)}</span>
        <span class="st ${i.status==="done"?"done":"new"}">${i.status==="done"?esc(t("inq_done")):esc(t("inq_new"))}</span></div>
      <div class="grid2">
        <div><b>${esc(t("inq_from"))}:</b> ${esc(i.name)}</div>
        <div><b>Email:</b> ${esc(i.email)}</div>
        <div><b>${esc(t("inq_qty"))}:</b> ${esc(i.qty)}</div>
        <div><b>WhatsApp:</b> ${esc(i.whatsapp||t("none"))}</div>
        <div style="grid-column:1/3"><b>${esc(t("time"))}:</b> ${fmtTime(i.createdAt)}</div>
      </div>
      <div class="msg">${esc(i.message||t("none"))}</div>
      ${i.status!=="done"?`<button class="btn" style="margin-top:10px" onclick="markHandled('${i.id}')">${esc(t("inq_mark"))}</button>`:""}
    </div>`).join("") : `<div class="empty">${esc(t("inq_empty"))}</div>`;
  const note = USE_SUPABASE ? `<div class="sec-sub" style="color:#cf3f0a">${esc(lang==="zh"?"询盘已实时存入后台数据库，可在 Supabase 控制台查看；上线前接入登录后此处仅显示你的询盘。":"Inquiries are stored in the backend DB — view them in the Supabase dashboard. After adding auth, this page shows only your own inquiries.")}</div>` : "";
  app().innerHTML = `
    <div class="wrap"><div class="sec-title">${esc(t("inq_title"))}</div>
    <div class="sec-sub">${esc(t("inspect"))}</div>
    ${note}
    <div class="inq-list">${rows}</div></div>`;
}
async function markHandled(id){
  const x=INQ.find(i=>i.id===id); if(x)x.status="done";
  if(USE_SUPABASE){ try{ await sb.from("inquiries").update({status:"done"}).eq("id",id); }catch(e){ console.error(e); } }
  else { saveInquiriesLocal(INQ); }
  render();
}

/* ---------------- nav actions ---------------- */
async function go(v,p){ view=v; param=p||null; window.scrollTo(0,0); await ensureLots(); render(); }
function setLang(l){ lang=l; localStorage.setItem(LS_LANG,l); render(); }
function doSearch(){ const q=$("#q"); if(q) filters.q=q.value.trim(); go("browse"); }
function goBeltCat(type,v){ if(type==="cat") filters.cat=v; else filters.belt=v; filters.q=""; go("browse"); }

/* ---------------- boot ---------------- */
(async ()=>{
  await ensureLots();
  await ensureInquiries();
  render();
  const mb=$("#mode-banner");
  if(mb && !USE_SUPABASE){
    mb.style.display="block";
    mb.innerHTML = `<b>Demo mode</b> · 数据仅存于本地浏览器。配置 Supabase 后供应商发帖将彼此可见、询盘入后台共享。参见 SUPABASE_SETUP.md。`;
  }
})();
