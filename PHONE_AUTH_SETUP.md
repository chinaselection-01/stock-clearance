# 手机号短信验证码登录 — 开通步骤（约 10 分钟）

网站登录已改为：**手机号 + 短信验证码**（登录即注册、无需密码、忘了密码也走这条）。
姓名、地址等资料全部**选填**。邮箱密码登录保留为备用入口。

短信验证码需要 Supabase 接一个短信服务商才能发出去，步骤如下：

## 1. 注册 Twilio（短信服务商）

- 打开 https://www.twilio.com/try-twilio 注册（有免费试用额度）
- 注册后在控制台拿到三样东西：
  - **Account SID**（AC 开头）
  - **Auth Token**
  - **Messaging Service SID**（在 Messaging → Services 里创建一个，选 SMS）

## 2. 在 Supabase 开启手机号登录

Supabase 控制台 → 你的项目 → **Authentication → Sign In / Providers → Phone**：

1. 打开开关（Enable Phone provider）
2. 填入 Twilio 的：
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Message Service SID
3. **OTP Expiry** 建议 600 秒（10 分钟）
4. 保存

## 3. 确认 Edge Function 密钥（AI 识图用）

Supabase 控制台 → **Edge Functions → vision-tag → Secrets**（或项目 Settings → Edge Function Secrets）：

```
DEEPSEEK_API_KEY = sk-你的DeepSeek密钥（此处不写真实密钥，密钥只放 Supabase Secrets，不进代码仓库）
```

（DeepSeek 视觉模型 `deepseek-v4-flash-vision-exp` 已实测可用，约 ¥0.01/次识别，很便宜。）

同时把 `supabase/functions/vision-tag/index.ts` 的完整内容粘贴到
**Edge Functions → Create a new function → vision-tag** 里部署。

## 4. 跑一次数据库修复（如果还没跑）

Supabase 控制台 → **SQL Editor** → 粘贴 `fix_accounts.sql` 全部内容 → Run。
（建 avatars 头像桶 + profiles 加城市/简介字段。没跑也能用，只是头像上传和这两个字段无效。）

## 5. 手机号格式说明

- 输入框支持任意国家：`+8613800138000`（中国）、`+48600100200`（波兰）等
- 用户只输数字（如 `13800138000`）时，网站自动按 `+86` 处理

## 6. 费用参考

- Twilio 发一条验证码短信：中国约 ¥0.3/条、欧美约 $0.05/条（试用额度先用完）
- 量大了可换国内短信服务商（阿里云短信 ¥0.045/条），但需改 Supabase 的 Twilio 配置为自定义 HTTP —— 需要时再说
