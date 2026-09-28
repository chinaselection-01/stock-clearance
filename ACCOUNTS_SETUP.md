# 账号系统部署说明（Accounts）

本目录已实现**网站（PWA）账号系统**，对应代码：`accounts.sql` + `app.js`（auth 区块）+ `index.html`（账号按钮 / 弹窗）+ `styles.css`（弹窗样式）。

## 这个账号系统做了什么

1. **拍照发即生成账号**：访客打开站点时自动用 Supabase「匿名登录」建一个临时账号；首次发尾货（`Post Stock`）时这条货自动归属到该账号。
2. **升级为正式账号**：在账号弹窗里填邮箱 → 点「发送验证邮件」→ 点击邮件里的链接，同一账号被绑定邮箱（不会丢数据）。
3. **改名字 / 改资料**：账号弹窗里可改「显示名称 / WhatsApp / 公司 / 头像」，全部存进 `profiles` 表。
4. **我的发布**：账号弹窗 →「我的发布」，列出你发过的尾货，可删除。
5. **询盘归属与隐私**：询盘带 `user_id`；询盘列表只显示「我发出的」+「别人对我发布的尾货发的」，不再对所有人公开。

---

## 上线前必须在 Supabase 控制台做的 3 件事

> 位置：Supabase 控制台 → **Authentication** → **Providers**（以及 **URL Configuration**）

1. **开启 Email 提供方**（默认已开，确认一下）。
2. **开启 Anonymous 提供方**（Authentication → Providers → Anonymous → 启用）。这是「拍照发即建号」的前提。
3. **配置 Redirect URLs**（Authentication → URL Configuration）：
   - Site URL：`https://www.stock-clearance.ai`
   - Redirect URLs 加入：`https://www.stock-clearance.ai/`

## 执行 SQL

在 Supabase 控制台 → **SQL Editor** 里，**全选执行 `accounts.sql`**（依赖已执行过的 `schema.sql`）。它会：

- 建 `profiles` 表 + 触发器（新用户自动建资料）；
- 给 `listings` / `inquiries` 加 `user_id` 列；
- 重写 RLS：发帖 / 询盘需登录且归属自己；询盘仅买家本人和对应供应商可见；
- 建 `avatars` 头像存储桶并授权。

## 行为说明

- 未配置 Supabase（本地 demo 模式）：账号按钮点击会提示「需配置 Supabase 后端」，发布仍走本地 localStorage。
- 匿名账号若未升级：资料 / 发布都正常，只是身份是临时的；清浏览器或换设备会丢，所以引导用户绑定邮箱。
- 绑定邮箱的验证邮件由 Supabase 发送，邮箱模板可在 Authentication → Email Templates 里改成中英双语。

## 下一步（待做，本次未含）

- 原生 App（Expo）接入同一套账号（复用 `native/src/supabase.js` 的 anon key + 上述 `profiles` / RLS）。
- 站内 IM 聊天（在询盘下挂 `messages` 表 + Realtime）。
- 平台担保交易（接支付 / 托管方）。
