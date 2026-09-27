// IndexNow 自动收录推送脚本
// 用法: node submit-indexnow.js
// 密钥文件: <key>.txt（站点根目录），内容为该 key
const fs = require('fs');
const https = require('https');

const keyFile = fs.readdirSync('.').find(f => /^[0-9a-f]{8}-[0-9a-f-]+\.txt$/.test(f));
if (!keyFile) { console.error('未找到 IndexNow 密钥文件 (<uuid>.txt)'); process.exit(1); }
const key = fs.readFileSync(keyFile, 'utf8').trim();

const HOST = 'www.stock-clearance.ai';
const KEY_LOCATION = `https://${HOST}/${keyFile}`;

// 待收录 URL 列表（与 sitemap.xml 保持一致）
const urlList = [
  'https://www.stock-clearance.ai/',
  'https://www.stock-clearance.ai/landing/overstock.html',
  'https://www.stock-clearance.ai/landing/liquidation.html',
  'https://www.stock-clearance.ai/landing/closeout.html',
  'https://www.stock-clearance.ai/landing/clearance.html',
  'https://www.stock-clearance.ai/landing/stock-lots.html',
  'https://www.stock-clearance.ai/landing/surplus.html',
  'https://www.stock-clearance.ai/landing/bulk-clearance.html',
  'https://www.stock-clearance.ai/landing/last-stock-discount.html',
  'https://www.stock-clearance.ai/landing/clothing-overstock.html',
  'https://www.stock-clearance.ai/landing/electronics-overstock.html',
  'https://www.stock-clearance.ai/landing/home-clearance.html',
  'https://www.stock-clearance.ai/landing/pet-overstock.html',
  'https://www.stock-clearance.ai/landing/toy-closeout.html',
  'https://www.stock-clearance.ai/landing/shoes-socks-stocklot.html',
];

const payload = JSON.stringify({ host: HOST, key, keyLocation: KEY_LOCATION, urlList });

const options = {
  hostname: 'api.indexnow.org',
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (c) => (data += c));
  res.on('end', () => {
    console.log(`IndexNow 响应: HTTP ${res.statusCode}`);
    console.log(data || '(无响应体)');
    if (res.statusCode === 200) console.log('✅ 收录推送成功');
    else if (res.statusCode === 202) console.log('✅ 已接受，正在处理');
    else console.log('⚠️ 非成功状态码，请检查');
  });
});
req.on('error', (e) => console.error('请求失败:', e.message));
req.write(payload);
req.end();
