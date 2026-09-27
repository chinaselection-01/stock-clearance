// ============================================================
//  B 档增强：读代理 + 简易限频（Deno / Supabase Edge Function）
//  作用：把前端“直连 Supabase 读”改为“经本函数读”，
//        用 service_role 在服务端读白名单视图，并做按 IP 的简易限频，
//        防止有人拿 anon key 高频刷接口拖数据 / 耗免费行读额度。
//
//  部署（无需本地 CLI，纯控制台）：
//   1. Supabase 控制台 → Edge Functions → New function
//   2. 函数名填 listings-read，把本文件内容粘贴进去
//   3. Function details → Environment variables 添加：
//        SUPABASE_URL = https://qraplgjkmtyhxymgtpvw.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY = （你的 service_role key，设置页可见）
//      ⚠️ service_role key 拥有完全权限，切勿提交到前端或仓库
//   4. 点 Deploy
//   5. 记下函数 URL：https://qraplgjkmtyhxymgtpvw.supabase.co/functions/v1/listings-read
//
//  启用（前端切换，部署成功后再做）：
//   把 app.js 顶部常量改为：
//     const READ_FN = "https://qraplgjkmtyhxymgtpvw.supabase.co/functions/v1/listings-read";
//   并在 ensureLots() 里优先 fetch(READ_FN)（见 EDGE_FUNCTION_README.md）。
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

// 简易内存限频：单 IP 60 秒内最多 40 次（多实例部署下不完美，但能拦懒人爬虫）
const WINDOW = 60_000;
const LIMIT = 40;
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > LIMIT;
}

serve(async (req) => {
  const ip = (req.headers.get("x-forwarded-for") || "0.0.0.0").split(",")[0].trim();
  if (limited(ip)) {
    return new Response("Too Many Requests", { status: 429 });
  }
  const { data, error } = await sb
    .from("listings_public")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ data }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=15",
      "access-control-allow-origin": "*",
    },
  });
});
