# stock-clearance.ai

> Global B2B stock-lot / clearance marketplace — the "B2B Xianyu" for Yiwu Wuyuai & China's industrial belts.

**stock-clearance.ai** 是一个面向全球买家的**尾货 / 清仓 B2B 撮合平台**（B2B 版闲鱼）。把义乌五爱市场以及全国各地产业带的工厂尾货，用结构化英文（图 + 参数 + MOQ + 清仓价）摆出来，方便老外下单。

---

## 当前状态：MVP（已内置 Supabase 数据层）

纯前端 MVP，用于验证"供应商愿意发帖 / 老外愿意询盘"的流程闭环。**数据层已支持 Supabase（Postgres + Storage）**：配置好密钥后即变"真撮合"（供应商发帖彼此可见、询盘入后台）；未配置时自动降级为 localStorage 演示模式，网站照常可跑。

- ✅ 中英双语一键切换（EN / 中文），偏好记忆
- ✅ 极简发帖：拍照 + 数量即可发布，其余字段（价格 / 品类 / MOQ / 规格）全部可选
- ✅ AI 一键识别（demo）：上传图片后模拟识别品类 / 产业带 / 成色 + 建议英文标题与卖点（已预留真实视觉 API 接入位 `window.SC_VISION`）
- ✅ 浏览 / 筛选 / 搜索 / 排序（按品类、产业带、成色、价格、MOQ）
- ✅ 商品详情 + 询盘表单（姓名 / 邮箱 / WhatsApp / 数量 / 留言），WhatsApp 直聊按钮
- ✅ 询盘实时落库（Supabase 模式）
- ✅ 供应商招募横幅 + "如何把供应商拉进来"引导

### ⚠️ 上线前必须了解

- **未配置 Supabase 时是演示模式**：数据仅存本地浏览器，别人看不到。配置见 `SUPABASE_SETUP.md`。
- MVP 为低门槛开放了**匿名写**（任何人可发尾货 / 提询盘）。上线前需加 Supabase Auth + RLS 收紧写权限，并把询盘查询隔离到登录供应商，避免买家 PII 泄露。详见 `SUPABASE_SETUP.md` 的"安全收口"。

---

## 技术栈

纯静态前端，**零构建**：

- `index.html` — 入口（含视图路由、引 Supabase CDN）
- `styles.css` — 视觉样式
- `app.js` — 全部逻辑（i18n、发帖、浏览、详情、询盘、AI 识别 demo、Supabase 数据层）
- `supabase-config.js`（由 `supabase-config.example.js` 复制而来）— 你的 Supabase 密钥，**已提交到仓库**（anon key 公开安全，靠 RLS 保护）
- `schema.sql` — 数据库表结构 + RLS + 种子数据，Supabase SQL Editor 一键执行

`docs/` 目录存放商业方案、页面设计稿、部署手册（非运行所需）。

---

## 本地运行

直接用浏览器打开 `index.html` 即可。或起一个静态服务：

```bash
# Python
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

---

## 部署（推荐 Vercel，连接本仓库）

1. 在 [vercel.com](https://vercel.com) 用 GitHub 登录
2. Add New Project → 选择本仓库 `stock-clearance`
3. Framework Preset 选 **Other**（纯静态），默认配置直接 Deploy
4. 部署后得到 `xxx.vercel.app` 临时链接，先验证
5. Project Settings → Domains 输入 `stock-clearance.ai`，按提示去域名注册商加 DNS 记录（Cloudflare / Porkbun 后台加一条 CNAME，值 `cname.vercel-dns.com`）
6. 详见 `docs/部署手册-stock-clearance.html`

---

## 路线图（Roadmap）

| 阶段 | 内容 |
|---|---|
| ✅ MVP | 静态版：浏览 / 发帖 / 询盘 / AI 识别 demo（当前） |
| ✅ 共享数据(配置即启用) | 前端已接 Supabase：配置密钥后供应商发帖彼此可见、询盘入后台（详见 SUPABASE_SETUP.md） |
| 🔜 真实 AI | 接入视觉 API：拍照识商品 + 中文→英/西/阿/俄自动翻译 + 仿牌/侵权检测 |
| 🔜 上线 | 绑定 stock-clearance.ai、SEO（覆盖 stock lot / overstock / liquidation 等高意图词）、内容引流（TikTok / FB 群组） |
| 🔜 变现 | 供方付费（会员 / 认证 / 置顶）优先于成交抽佣 |

---

## 合规红线

尾货头号风险是**仿牌 / 知识产权侵权**。平台已设"无品牌 / 自有 / 已授权"品牌声明字段，正式版需加审核 + 免责声明，上传含大牌 logo 的图片应被拦截。

---

© stock-clearance.ai
