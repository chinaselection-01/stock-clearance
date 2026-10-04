// ============================================================
//  stock-clearance.ai — 1688 采集代理 (Supabase Edge Function)
//  deploy: supabase functions deploy collect1688
//  配置密钥: supabase secrets set APIFY_TOKEN=xxx
//
//  两个模式:
//   mode=collect   : 调 Apify 1688 Wholesale Scraper，返回归一化商品数组
//                   需要 APIFY_TOKEN（未配置返回 {error:"NO_APIFY_KEY"}）
//   mode=saveImage : 服务端下载 1688 图片(带 referer) → 上传 Storage → 返回公开 URL
//                   绕过浏览器 CORS/防盗链，用于把外链图永久托管
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_H = { ...cors, "Content-Type": "application/json" };

// Apify 上真实的 1688 采集 actor（免登录，支持关键词/offer ID）
const APIFY_ACTOR = "zen-studio/1688-wholesale-scraper";

interface ReqBody {
  mode?: "collect" | "saveImage";
  type?: "keyword" | "offerIds";
  query?: string;
  imageUrl?: string;
}

function normalize(it: any) {
  const img =
    it.imageUrl ||
    it.image ||
    (Array.isArray(it.images) ? it.images[0] : "") ||
    (Array.isArray(it.picUrls) ? it.picUrls[0] : "");
  const price = it.price || {};
  return {
    sourceId: String(it.id || it.offerId || it.num_iid || it.productId || ""),
    url: it.url || "",
    title: it.title || it.name || "",
    titleEn: it.titleEn || it.titleEnUs || "",
    priceMin: it.priceMin ?? price.min ?? it.minPrice ?? 0,
    priceMax: it.priceMax ?? price.max ?? null,
    currency: it.currency || "CNY",
    moq: it.moq ?? it.minOrder ?? it.minBatchPrice ?? null,
    qty: it.quantity ?? it.stock ?? it.saleCount ?? null,
    unit: it.unit || "pcs",
    cat: it.category || it.catName || "",
    belt: it.belt || it.city || it.province || "",
    img,
    supplier: it.sellerName || it.supplier || it.shopName || "",
    supplierUrl: it.sellerUrl || it.shopUrl || "",
  };
}

async function collect(body: ReqBody) {
  const token = Deno.env.get("APIFY_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "NO_APIFY_KEY" }), { headers: JSON_H });
  }
  const type = body.type || "keyword";
  const query = (body.query || "").trim();
  if (!query) {
    return new Response(JSON.stringify({ error: "EMPTY_QUERY" }), { headers: JSON_H });
  }
  const input: any = { maxResults: 50 };
  if (type === "keyword") input.keywords = [query];
  else if (type === "offerIds")
    input.offerIds = query.split(/[\s,，、]+/).filter(Boolean);

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
  if (!runRes.ok) {
    const t = await runRes.text();
    return new Response(
      JSON.stringify({ error: "APIFY_RUN_FAILED", detail: t.slice(0, 300) }),
      { headers: JSON_H }
    );
  }
  const run = await runRes.json();
  const runId = run?.data?.id;
  if (!runId)
    return new Response(JSON.stringify({ error: "APIFY_NO_RUN" }), { headers: JSON_H });

  // 轮询直到完成（最多 ~90s）
  let datasetId: string | null = null;
  for (let i = 0; i < 30; i++) {
    const s = await (
      await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`)
    ).json();
    const st = s?.data?.status;
    if (st === "SUCCEEDED") {
      datasetId = s.data.defaultDatasetId;
      break;
    }
    if (st === "FAILED" || st === "ABORTED")
      return new Response(JSON.stringify({ error: "APIFY_FAILED", status: st }), {
        headers: JSON_H,
      });
    await new Promise((r) => setTimeout(r, 3000));
  }
  if (!datasetId)
    return new Response(JSON.stringify({ error: "APIFY_TIMEOUT" }), { headers: JSON_H });

  const items = await (
    await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`)
  ).json();
  return new Response(
    JSON.stringify({ ok: true, count: (items || []).length, items: (items || []).map(normalize) }),
    { headers: JSON_H }
  );
}

async function saveImage(imageUrl: string) {
  if (!imageUrl)
    return new Response(JSON.stringify({ error: "NO_URL" }), { headers: JSON_H });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const res = await fetch(imageUrl, {
    headers: {
      "Referer": "https://www.1688.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
  });
  if (!res.ok)
    return new Response(
      JSON.stringify({ error: "IMG_FETCH_FAILED", status: res.status }),
      { headers: JSON_H }
    );
  const buf = new Uint8Array(await res.arrayBuffer());
  const path =
    "collect-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2, 8) +
    ".jpg";
  const { error } = await supabase.storage
    .from("listing-images")
    .upload(path, buf, { contentType: "image/jpeg", upsert: true });
  if (error)
    return new Response(JSON.stringify({ error: error.message }), { headers: JSON_H });
  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return new Response(JSON.stringify({ ok: true, url: data.publicUrl }), {
    headers: JSON_H,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  let body: ReqBody = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  if (body.mode === "saveImage") return await saveImage(body.imageUrl || "");
  return await collect(body);
});
