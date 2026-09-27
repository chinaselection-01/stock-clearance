# StockClearance — 原生 App（Expo / React Native）

这是 **stock-clearance.ai** 的真·商店原生 App（**不是** PWA——PWA 保持原样不动）。
和网站/PWA **共用同一套 Supabase 后端**：买家浏览/询盘、供应商发库存两条线完全一致。

> 仓库里这套源码是「可运行状态」。打包上架商店需要你自己的开发者账号（见下方「上架到商店」）。

## 功能
- **买家端**：首页（热门搜索 + 全部库存）、浏览（搜索/筛选）、详情（询盘表单 → 写入 `inquiries`）
- **供应商端**：发布库存（拍照/相册 + 数量 + 规格 + 联系方式，写 `listings` + 传图到 Storage）、查看本机发布库存收到的询盘
- **双语**：中 / EN 一键切换，记忆选择
- **底部 Tab**：Home / Browse / Post / Inquiries（和 PWA 一致的 App 手感）

## 与网站共用后端
`src/supabase.js` 里的 URL / anon key 与 PWA 完全一致：
- 读：`listings_public`（安全视图，**不含供应商手机号**，防爬 B 档）
- 写库存：`listings`
- 写询盘：`inquiries`
- 图片桶：`listing-images`

> anon key 是公开安全凭证（RLS 已保护数据）。**切勿**把 service_role key 放进本仓库。

## 本地跑起来（先看效果，不用上架）
```bash
cd native
npm install
npx expo start
```
手机装 **Expo Go**（iOS/安卓应用商店搜 Expo Go），扫码即可在真机预览；
或按提示在模拟器跑（`npx expo start --ios` / `--android`）。

## 打包（EAS Build，产出可安装的 .apk / .ipa）
```bash
npm install -g eas-cli        # 或 npx eas-cli
eas login                     # 用你的 Expo 账号登录
eas build --platform android --profile preview   # 出安卓 APK
eas build --platform ios --profile preview       # 出 iOS 模拟器包（真机发布需付费证书）
```
`eas.json` 已配好 preview / production 三种 profile。

## 上架到商店
需要你自行办理开发者账号（费用/流程）：

| 平台 | 账号 | 费用 | 步骤 |
|---|---|---|---|
| iOS App Store | Apple Developer | $99/年 | 1) 注册开发者；2) 在 App Store Connect 建 App（填名称/隐私/截图）；3) `eas build --platform ios --profile production`；4) `eas submit --platform ios` 上传；5) 提交审核（约 1–2 天） |
| Google Play | Google Play Console | $25 一次性 | 1) 注册并付 $25；2) 建应用、填商店资料与隐私政策；3) `eas build --platform android --profile production`（出 AAB）；4) `eas submit --platform android` 上传；5) 发布（审核约几小时～数天）|

> 包名已设：`ai.stockclearance.app`（安卓）/ bundleIdentifier 同（iOS），在 `app.json` 里改。
> 真机发布 iOS 需要 Apple 付费证书 + 真机 provisioning，EAS 会在 `eas build --profile production` 时引导。

## 暂未做（按需再加）
- **推送通知**：已装 `expo-notifications` 依赖并预留；需配 FCM/APNs 凭证后启用（例如新询盘实时提醒供应商）。
- **供应商登录/账号体系**：当前「我的询盘」按**本机发布记录**过滤（隐私安全）；要做多设备/跨设备需加 Supabase Auth。
- **商品 AI 识别**：网站端有 `SC_VISION` mock，原生端可后续接同一视觉识别 API。

## 目录
```
native/
  App.js                # 入口：导航 + 语言切换 + Tab
  app.json              # Expo 配置（包名/权限/图标）
  eas.json              # EAS 打包/上架 profile
  package.json
  src/
    supabase.js         # 后端客户端（共用）
    i18n.js             # 中英双语
    theme.js            # 主题色
    components/ListItem.js
    screens/
      HomeScreen.js     # 买家首页
      BrowseScreen.js   # 买家浏览
      DetailScreen.js   # 买家详情 + 询盘
      PostScreen.js     # 供应商发布
      InquiriesScreen.js# 供应商我的询盘
```
