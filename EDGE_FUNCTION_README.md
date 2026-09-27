# B 档防爬：部署与验证指南

## 已交付的代码改动（已推送 Vercel）
- `security-view.sql`：新建 `public.listings_public` 安全视图（过滤 `supplier_whatsapp`）+ 撤销 anon 对基表的直接 `select`。
- `app.js`：`loadLots()` 改为读 `listings_public`，并保留“视图不存在时回退基表”的健壮逻辑，过渡期首页不会空白。
- `revealSupplierContact()`：询盘后不再渲染供应商个人 WhatsApp，改为“平台转接”提示（B2B 撮合语义，号码不外泄）。
- `supabase/functions/listings-read/index.ts`：限频读代理（可选增强）。

## 你必须做的一步：执行 security-view.sql
前端已经切到 `listings_public`，**但该视图需要你在 Supabase 控制台创建**，否则前端会走回退、B 档不生效。

1. 打开 Supabase 控制台 → 你的项目 `qraplgjkmtyhxymgtpvw` → **SQL Editor**
2. 把仓库里的 `security-view.sql` 全文粘贴进去 → **Run**
3. 看到 `Success` 即生效

执行后：
- 匿名用户 `from('listings').select('*')` 会被拒（无 select 权限）→ 整表拖号失效
- 匿名用户只能经 `listings_public` 读，且结果**不含 `supplier_whatsapp`**

## 验证（让 AI 用 anon key 实测）
执行 SQL 后，告诉 AI，它会用公开 anon key 做两条 curl：
- `…/rest/v1/listings?select=*` → 应返回 **401/403**（被拒）
- `…/rest/v1/listings_public?select=*` → 应返回 **200** 且 JSON 里**没有** `supplier_whatsapp`

## 可选增强：限频（防高频刷接口）
当前前端直连 Supabase 读（anon key），视图已挡住手机号；若想进一步防高频滥用/省免费行读额度，部署 `supabase/functions/listings-read/index.ts`：

1. Supabase 控制台 → **Edge Functions** → New function
2. 名称 `listings-read`，粘贴 `index.ts` 内容
3. Environment variables 添加：
   - `SUPABASE_URL` = `https://qraplgjkmtyhxymgtpvw.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = 你的 service_role key（Project Settings → API 可见）
   - ⚠️ service_role key 拥有完全权限，**切勿提交到前端或仓库**
4. Deploy，记下函数 URL
5. 在 `app.js` 顶部加 `const READ_FN="<函数URL>"`，并把 `ensureLots()` 改为优先 `fetch(READ_FN)` 解析 `{data}`

> 限频为内存计数，多实例部署下不绝对精确，但足以拦住懒人爬虫与明显滥用。
