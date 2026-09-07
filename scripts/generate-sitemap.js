#!/usr/bin/env node
/**
 * 生成 sitemap.xml —— 随工具清单自动更新。
 * 数据源：tools.json（由 scripts/generate-tools-json.js 维护）
 * 基准域名：CNAME 文件（如 html.endril.com），缺省回退 https://html.endril.com
 *
 * 规则：
 *  - 首页 https://<base>/ 始终收录（priority 1.0, weekly）
 *  - 每个本地工具（path 以 / 开头）收录为 https://<base><path>（去掉 index.html）
 *  - 站点固定页面（关于/隐私/联系）显式收录（priority 0.3, yearly）
 *  - 跳过外部提交入口（isSubmission）与站外工具（isExternal 且 http(s) 路径）
 *
 * lastmod 规则（2026-09-08 改）：
 *  - 取该 URL 对应路径在 git 里的**最后一次真实提交日期**（git log -1 -- <path>）
 *  - 首页取全仓最后一次提交（首页卡片随工具清单变动，任何提交都可能影响它）
 *  - 拿不到 git 信息（浅克隆 / 非 git 环境 / 路径无提交）时回退到「生成当天」
 *  - 不用文件 mtime：CI checkout 出来的 mtime 全等于检出时刻，没有意义
 *  - 需要完整历史：workflow 的 actions/checkout 必须带 fetch-depth: 0
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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

// 站点固定页面：不随工具清单变化，新增静态页时在这里补一行
const STATIC_PAGES = [
  { path: '/about.html', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacy.html', changefreq: 'yearly', priority: '0.3' },
  { path: '/contact.html', changefreq: 'yearly', priority: '0.3' }
];

function escapeLoc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 取某路径最后一次提交的日期（YYYY-MM-DD）；拿不到返回 null
// target 为 null 时取全仓最后一次提交
function gitLastMod(target) {
  const args = ['log', '-1', '--format=%cd', '--date=short'];
  if (target) args.push('--', target);
  try {
    const out = execFileSync('git', args, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 15000,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const d = out.trim().split('\n')[0].trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  } catch (e) {
    return null;
  }
}

// target 为 null 表示跟随全仓最后一次提交（首页）
const toolEntries = [];

const seen = new Set([BASE + '/']);
for (const t of tools) {
  if (!t || typeof t.path !== 'string') continue;
  if (t.isSubmission) continue;                       // 跳过 GitHub 提交入口
  const p = t.path.trim();
  if (/^https?:\/\//i.test(p)) continue;              // 站外工具不收录
  if (!p.startsWith('/')) continue;                   // 仅收录本站相对路径
  let u = BASE + p;
  if (u.endsWith('/index.html')) u = u.slice(0, -'index.html'.length); // 规范为目录 URL
  if (seen.has(u)) continue;
  seen.add(u);
  toolEntries.push({ loc: u, target: p.replace(/^\//, ''), changefreq: 'monthly', priority: '0.8' });
}

toolEntries.sort((a, b) => a.loc.localeCompare(b.loc));

const entries = [
  { loc: BASE + '/', target: null, changefreq: 'weekly', priority: '1.0' },
  ...toolEntries,
  ...STATIC_PAGES.map(sp => ({
    loc: BASE + sp.path,
    target: sp.path.replace(/^\//, ''),
    changefreq: sp.changefreq,
    priority: sp.priority
  }))
];

const urlItems = entries.map(e => {
  const lastmod = gitLastMod(e.target) || today;
  return `    <url>\n      <loc>${escapeLoc(e.loc)}</loc>\n      <lastmod>${lastmod}</lastmod>\n      <changefreq>${e.changefreq}</changefreq>\n      <priority>${e.priority}</priority>\n    </url>`;
});

const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlItems.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml 已生成：${entries.length} 条 URL，lastmod 取自各路径 git 真实提交日期`);
