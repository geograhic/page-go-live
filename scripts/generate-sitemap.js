#!/usr/bin/env node
/**
 * 生成 sitemap.xml —— 随工具清单自动更新。
 * 数据源：tools.json（由 scripts/generate-tools-json.js 维护）
 * 基准域名：CNAME 文件（如 html.endril.com），缺省回退 https://html.endril.com
 *
 * 规则：
 *  - 首页 https://<base>/ 始终收录（priority 1.0, weekly）
 *  - 每个本地工具（path 以 / 开头）收录为 https://<base><path>（去掉 index.html）
 *  - 跳过外部提交入口（isSubmission）与站外工具（isExternal 且 http(s) 路径）
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname.replace(/[\\/]scripts$/, '');
const read = (p) => fs.readFileSync(p, 'utf8');

// 基准域名
let base = 'html.endril.com';
try {
  const cname = read(path.join(ROOT, 'CNAME')).trim();
  if (cname) base = cname;
} catch (e) { /* 用默认值 */ }
const BASE = 'https://' + base.replace(/\/+$/, '');

// 读取工具清单
let tools = [];
try {
  tools = JSON.parse(read(path.join(ROOT, 'tools.json')));
} catch (e) {
  console.warn('tools.json 读取失败，仅生成首页 sitemap:', e.message);
  tools = [];
}
if (!Array.isArray(tools)) tools = [];

const today = new Date().toISOString().slice(0, 10);

function escapeLoc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 收集 URL
const urls = new Set();
urls.add(BASE + '/');

for (const t of tools) {
  if (!t || typeof t.path !== 'string') continue;
  if (t.isSubmission) continue;                       // 跳过 GitHub 提交入口
  const p = t.path.trim();
  if (/^https?:\/\//i.test(p)) continue;              // 站外工具不收录
  if (!p.startsWith('/')) continue;                   // 仅收录本站相对路径
  let u = BASE + p;
  if (u.endsWith('/index.html')) u = u.slice(0, -'index.html'.length); // 规范为目录 URL
  urls.add(u);
}

const urlItems = [
  `    <url>\n      <loc>${escapeLoc(BASE + '/')}</loc>\n      <lastmod>${today}</lastmod>\n      <changefreq>weekly</changefreq>\n      <priority>1.0</priority>\n    </url>`,
  ...[...urls].filter(u => u !== BASE + '/').sort().map(u =>
    `    <url>\n      <loc>${escapeLoc(u)}</loc>\n      <lastmod>${today}</lastmod>\n      <changefreq>monthly</changefreq>\n      <priority>0.8</priority>\n    </url>`
  )
];

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlItems.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml + '\n', 'utf8');
console.log(`sitemap.xml 已生成：${urls.size} 个 URL`);
