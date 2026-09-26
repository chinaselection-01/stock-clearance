# 接入 Supabase（让数据真正跨用户共享）

本手册把 `stock-clearance.ai` 从"本地演示版"升级为"真撮合"：供应商发的尾货彼此可见、买家询盘实时进后台数据库。

> 为什么需要 Supabase：之前数据只存在各自浏览器（localStorage），别人看不到。接 Supabase 后，数据存到云端 Postgres，任何人访问网站看到的都是同一份库存，询盘也落库可查。

---

## 一、建 Supabase 项目（5 分钟，免费）

1. 打开 [supabase.com](https://supabase.com) → 注册 / 登录（可用 GitHub 登录）。
2. **New Project** → 填 Name：`stock-clearance` → 设一个数据库密码（记好）→ **Region 选 `Singapore (ap-southeast-1)`**（对亚洲买家延迟最低，免费区域里最优）。
3. 等 1–2 分钟项目建好。

## 二、建表 + 存储桶（一键执行）

1. 左侧菜单 **SQL Editor** → **New query**。
2. 把本仓库根目录的 **`schema.sql`** 全文粘贴进去 → 点 **Run**。
3. 它会自动创建：
   - `listings`（尾货表）、`inquiries`（询盘表）
   - `listing-images` 公开存储桶（图片上传用）
   - RLS 行级安全策略
   - 8 条示例种子数据（首屏不空）

> 验证：SQL Editor 跑完后，左侧 **Table Editor** 里能看到 `listings` 有 8 行。

## 三、拿到密钥

1. 左侧 **Project Settings → API**。
2. 复制两样：
   - **Project URL**（形如 `https://xxxx.supabase.co`）
   - **Project API keys → anon public**（公开 key，设计上可公开，靠 RLS 保护数据）

## 四、填配置（本地）

```bash
cp supabase-config.example.js supabase-config.js
```

打开 `supabase-config.js`，把 url / anon 填进去：

```js
window.SC_CONFIG = {
  url: "https://你的REF.supabase.co",
  anon: "你的anon-public-key"
};
```

> 说明：`anon` key 是**公开** key（任何前端都会下发），Supabase 靠 RLS 策略保证数据安全，提交到公开仓库无妨。请勿把 `service_role` key 放到前端。

## 五、本地验证

```bash
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

- 进 **Post Stock** 拍照 + 数量发一条 → 去 Supabase **Table Editor → listings** 看是否多出一行（图片在 Storage → listing-images）。
- 进任意商品 **Request a Quote** 提交询盘 → 去 **inquiries** 表看是否落库。
- 若失败：浏览器 F12 Console 看报错（多半是 RLS 策略没跑 / 桶没建）。

## 六、重新部署到 Vercel（让线上也用真数据）

1. 把改动提交并 push 到 GitHub（含 `supabase-config.js`）。
2. Vercel 会自动重新部署（连的是同一个仓库）。
3. 部署完，`stock-clearance.ai` 就是真共享数据版本了。

> 若你**不想把配置提交进仓库**：可在 Vercel 用环境变量 + 一次构建注入，或部署后手动在 Vercel 的 Source 里加这个文件。对 MVP 而言直接提交 `supabase-config.js`（anon key 公开安全）最省事。

---

## 安全收口（上线前必做）

当前 `schema.sql` 为 MVP 开放了**匿名写**：任何人都能发尾货、提询盘。上线前请按下面收紧：

1. **加 Supabase Auth**：供应商用邮箱/魔法链接登录后才能发帖 → 询盘查询按 `auth.uid()` 隔离（每供应商只看自己的询盘，买家 PII 不外泄）。
2. **写权限绑定登录**：把 `listings insert` 策略从 `using (true)` 改为 `with check (auth.uid() is not null)`，并记 `supplier_id`。
3. **仿牌审核**：保留品牌授权字段 + 后台审核流程，上传含大牌 logo 图拦截。
4. **限流 / 验证码**：匿名写接口易招垃圾帖，登录后配合 rate limit。

> 简言之：MVP 先"开放"验证流程，确认老外真来询盘后，再上 Auth + RLS 收紧，过渡到真多边市场。

---

## 数据模型速览

| 表 | 字段要点 | 谁写 | 谁读 |
|---|---|---|---|
| `listings` | 标题中/英、品类、产业带、数量、原价/清仓价、MOQ、成色、品牌、规格 jsonb、供应商信息、图片 URL | 供应商（MVP 匿名） | 所有人 |
| `inquiries` | 关联 lot_id、买家姓名/邮箱/WhatsApp、数量、留言、状态 | 买家（匿名） | 仅登录（默认 deny 匿名） |
| `storage.listing-images` | 商品图（公开读） | 发帖时上传 | 所有人 |

字段命名统一 snake_case（库内），前端 `app.js` 的 `rowToLot` / `lotToRow` 做映射。
