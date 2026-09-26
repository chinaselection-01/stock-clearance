# stock-clearance.ai

> Global B2B stock-lot / clearance marketplace — the "B2B Xianyu" for Yiwu Wuyuai & China's industrial belts.

**stock-clearance.ai** 是一个面向全球买家的**尾货 / 清仓 B2B 撮合平台**（B2B 版闲鱼）。把义乌五爱市场以及全国各地产业带的工厂尾货，用结构化英文（图 + 参数 + MOQ + 清仓价）摆出来，方便老外下单。

---

## 当前状态：MVP（静态验证版）

这是第一版**纯前端** MVP，用于快速验证"供应商愿意发帖 / 老外愿意询盘"的流程闭环：

- ✅ 中英双语一键切换（EN / 中文），偏好记忆
- ✅ 极简发帖：拍照 + 数量即可发布，其余字段（价格 / 品类 / MOQ / 规格）全部可选
- ✅ AI 一键识别（demo）：上传图片后模拟识别品类 / 产业带 / 成色 + 建议英文标题与卖点（已预留真实视觉 API 接入位 `window.SC_VISION`）
- ✅ 浏览 / 筛选 / 搜索 / 排序（按品类、产业带、成色、价格、MOQ）
- ✅ 商品详情 + 询盘表单（姓名 / 邮箱 / WhatsApp / 数量 / 留言），WhatsApp 直聊按钮
- ✅ 询盘管理页（供应商视角，未处理红点提示）
- ✅ 供应商招募横幅 + "如何把供应商拉进来"引导

### ⚠️ 重要局限（上线前必须了解）

- **数据仅存于访问者本地浏览器（localStorage）**：你在这台设备发的尾货，别人打开看不到。这是流程验证版，不是生产环境。
- **真正撮合需要下一步接 Supabase / Postgres**，让供应商发帖彼此可见、询盘入后台共享。

---

## 技术栈

纯静态三件套，**零构建、零后端、零依赖**：

- `index.html` — 入口（含视图路由）
- `styles.css` — 视觉样式
- `app.js` — 全部逻辑（i18n、发帖、浏览、详情、询盘、AI 识别 demo）

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
| 🔜 共享数据 | 前端 + Supabase / Postgres：供应商发帖彼此可见、询盘入后台 |
| 🔜 真实 AI | 接入视觉 API：拍照识商品 + 中文→英/西/阿/俄自动翻译 + 仿牌/侵权检测 |
| 🔜 上线 | 绑定 stock-clearance.ai、SEO（覆盖 stock lot / overstock / liquidation 等高意图词）、内容引流（TikTok / FB 群组） |
| 🔜 变现 | 供方付费（会员 / 认证 / 置顶）优先于成交抽佣 |

---

## 合规红线

尾货头号风险是**仿牌 / 知识产权侵权**。平台已设"无品牌 / 自有 / 已授权"品牌声明字段，正式版需加审核 + 免责声明，上传含大牌 logo 的图片应被拦截。

---

© stock-clearance.ai
