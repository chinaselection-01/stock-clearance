// ============================================================
//  stock-clearance.ai — 视觉识别 (Supabase Edge Function)
//  deploy: supabase functions deploy vision-tag
//  配置密钥: supabase secrets set OPENAI_API_KEY=sk-xxx
//
//  接收前端传来的已压缩图片 base64，调用 OpenAI 视觉模型(GPT-4o-mini)，
//  返回结构化 JSON，用于自动填写发布表单：
//    { title_cn, title_en, cat, condition, specs{}, selling_points_en[], moq_suggestion }
//
//  注意：API 密钥只在服务端读取(Deno.env)，绝不下发到前端。
// ============================================================
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const JSON_H = { ...cors, "Content-Type": "application/json" };

const MODEL = Deno.env.get("VISION_MODEL") || "gpt-4o-mini";

const SYSTEM = `You are a B2B stock-lot listing assistant for a Chinese clearance/overstock marketplace (stock-clearance.ai). The user uploads a photo of a product. Identify it and return ONLY valid JSON (no markdown, no commentary) with exactly these fields:
{
  "title_cn": string,        // concise Chinese product name, e.g. "304不锈钢保温杯 12oz"
  "title_en": string,        // concise English product name, e.g. "304 Stainless Tumbler 12oz"
  "cat": string,             // one of: app, home, toy, ele, pet, shoe, bag, oth
  "condition": string,       // one of: new, ret, mix  (new=brand-new overstock, ret=customer returns, mix=ungraded/mixed)
  "specs": {                 // only fill fields you can confidently see; omit unknowns
    "material": string,
    "size": string,
    "color": string,
    "capacity": string,
    "weight": string
  },
  "selling_points_en": string[],  // 3 short English bullet points a buyer cares about (e.g. "Food-grade 304 stainless")
  "moq_suggestion": number|null   // plausible minimum order qty in pcs, or null
}
If the image is unclear or not a physical product, return cat:"oth", title_cn:"未识别商品", title_en:"Unrecognized item", specs:{}, selling_points_en:[], moq_suggestion:null.`;

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return new Response(JSON.stringify({ error: "NO_OPENAI_KEY" }), { status: 200, headers: JSON_H });

    const body = await req.json().catch(() => ({}));
    const b64 = body.imageBase64;
    const mime = body.mime || "image/jpeg";
    if (!b64) return new Response(JSON.stringify({ error: "NO_IMAGE" }), { status: 200, headers: JSON_H });

    const dataUrl = `data:${mime};base64,${b64}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Identify this product from the photo and return the JSON." },
              { type: "image_url", image_url: { url: dataUrl, detail: "auto" } },
            ],
          },
        ],
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: "OPENAI_ERR", detail: txt.slice(0, 500) }), { status: 200, headers: JSON_H });
    }
    const j = await resp.json();
    let parsed: any = null;
    try { parsed = JSON.parse(j.choices?.[0]?.message?.content || "{}"); } catch (_e) {}
    return new Response(JSON.stringify({ ok: true, result: parsed }), { status: 200, headers: JSON_H });
  } catch (e) {
    return new Response(JSON.stringify({ error: "FN_ERR", detail: String(e).slice(0, 300) }), { status: 200, headers: JSON_H });
  }
}

serve(handle);
