# 1688 采集中心（Import）部署说明

站点顶部/底部新增 **Import** 入口，进入「采集中心」。两种采集方式：

| 方式 | 依赖 | 现在能用吗 |
|---|---|---|
| **单链接导入** | 无（纯前端，无 token 时填字段） | ✅ 现在就能用 |
| **手动批量粘贴** | 无（纯前端） | ✅ 现在就能用 |
| **自动采集（Apify）** | 需 `APIFY_TOKEN` + 部署 Edge Function | ⏳ 配好即生效 |

---

## 0. 单链接导入（最常用，今天即可用）

在采集中心切到 **Single link** 标签：

1. 从 1688 商品页复制**单个**商品链接，粘贴进输入框
2. 点 **Parse & import**：
   - **已配 Apify token（且部署了 Edge Function）**：自动解析该链接的标题 / 主图 / 价格 / MOQ / 供应商，生成预填卡片 → 确认后一键导入
   - **未配 token**：自动降级为单条预填表单，你填标题 / 价格 / 数量，粘贴图片地址则点「Import」后自动转存到平台 Storage
3. 导入后归属当前登录账号（未登录会先建/登录）

> 这是「看到一个好货 → 贴一个链接直接发」最高频的玩法，比批量粘贴少一步多行文本。

---

## 1. 手动批量粘贴（今天即可用，无需任何配置）

在采集中心切到 **Manual paste** 标签：

1. 从 1688 商品页复制链接，**每行一个**粘贴进文本框
2. 点 **Parse links**，自动生成每条记录
3. 为每条填入 **图片URL**（可右键 1688 图片→「复制图片地址」）、**商品名称**、**清仓价**、**数量**
4. 点 **Import these** → 作为你的发布导入（归属当前登录账号）

图片说明：未部署 Edge Function 时，图片走 **1688 直链 + `referrerpolicy="no-referrer"`** 显示（绕过防盗链）；
部署 Edge Function 后，导入会自动把图片**转存到 Supabase Storage**（`saveImage` 模式，无需 Apify token），永久托管、不怕 1688 改链接。

---

## 2. 自动采集（Apify，按关键词/offer ID 批量）

需要两样东西：① 部署 Edge Function（代理，隐藏 key）；② 配置 Apify token。

### 2.1 拿到 Apify token
- 注册 https://apify.com → 控制台 **API & Integrations** → 复制 API token
- 用到的 actor：`zen-studio/1688-wholesale-scraper`（免登录，支持关键词 / offer ID，50+ 字段，JSON 输出）

### 2.2 部署 Edge Function
```bash
# 安装并登录 Supabase CLI（一次）
npm i -g supabase
supabase login

# 关联项目（ref 见 supabase-config.js）
supabase link --project-ref qraplgjkmtyhxymgtpvw

# 设置密钥（自动采集必需；saveImage 转存图片不需要）
supabase secrets set APIFY_TOKEN=你的_apify_token

# 部署采集代理
supabase functions deploy collect1688
```

部署后函数地址：`https://qraplgjkmtyhxymgtpvw.supabase.co/functions/v1/collect1688`

### 2.3 使用
采集中心 **Auto collect** 标签 → 选「关键词」或「offer ID / 链接」→ 输入 → **Collect** →
候选列表（图、标题、价格、MOQ、供应商）→ 勾选 → **Import selected**。

---

## 3. 代码位置
- 采集代理：`supabase/functions/collect1688/index.ts`
  - `mode=collect`：调 Apify → 归一化商品数组（未配 token 返回 `{error:"NO_APIFY_KEY"}`）
  - `mode=single`：单链接导入，有 token 走 Apify 解析该 offerId，无 token 降级返回 `{mode:"manual", url, sourceId}`
  - `mode=saveImage`：服务端下载 1688 图（带 referer）→ 上传 Storage → 返回公开 URL
- 前端：`app.js` 的 `renderCollect / runCollect / parseSingleLink / renderSingleResult / importSingle / importCollected / parseManualLinks / importManual`
- 入口：顶部 `Import` 按钮 + 底部导航 `Import`

## 4. 注意事项
- **key 绝不放前端**：Edapi token 只存在 Supabase secret 里，经 Edge Function 代理调用。
- **合规**：采集公开商品信息用于自身货源展示，遵守 1688 服务条款；不要高频刷接口。
- 整店批量：当前 Apify 该 actor 主要支持关键词 / offer ID；整店链接支持待验证，可据 actor 文档扩展 `input`。
