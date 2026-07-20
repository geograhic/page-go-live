// 机制增强：为每个「拥有自身图标」的工具，在其文件夹内自动生成 favicon.ico。
// 这样「按路径取 favicon」的链接抓取 / 预览服务（如 /tools/[x]/favicon.ico）
// 能拿到该工具自身的图标，而不是回退到站点根 /favicon.ico。
// 无自身图标的工具不生成，继续回退站点图标。
// 运行：node scripts/gen-tool-favicons.mjs  （依赖 sharp + png-to-ico）
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const TOOLS_DIR = 'tools';
const SIZES = [16, 32, 48, 64];
const KNOWN_ICON_FILES = ['favicon.svg', 'favicon.png', 'icon.png', 'apple-touch-icon.png'];

function findHtmlFile(dir) {
  const entries = fs.readdirSync(dir);
  if (entries.includes('index.html')) return 'index.html';
  return entries.find((e) => e.endsWith('.html')) || null;
}

// 返回该工具「自身图标」的本地文件路径；没有则返回 null
function findIconSource(dir, htmlFile) {
  // 1. 解析 <link rel="icon" href="...">
  if (htmlFile) {
    const html = fs.readFileSync(path.join(dir, htmlFile), 'utf8');
    const links = html.match(/<link\b[^>]*>/gi) || [];
    for (const tag of links) {
      if (/rel\s*=\s*["'][^"']*\bicon\b[^"']*["']/i.test(tag) && !/apple-touch-icon/i.test(tag)) {
        const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
        if (m) {
          const href = m[1].trim();
          if (/^https?:/i.test(href)) return null;   // 外链图标，无法打包
          if (href.startsWith('/')) return null;      // 站点根相对 = 站点图标，不算工具自身
          const candidate = path.join(dir, href);
          if (fs.existsSync(candidate)) return candidate;
        }
      }
    }
  }
  // 2. 已知图标文件
  for (const f of KNOWN_ICON_FILES) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(TOOLS_DIR)) {
    console.log('（无 tools 目录，跳过）');
    return;
  }
  const dirs = fs
    .readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let generated = 0;
  let skipped = 0;
  for (const name of dirs) {
    const dir = path.join(TOOLS_DIR, name);
    const htmlFile = findHtmlFile(dir);
    const src = findIconSource(dir, htmlFile);
    const outPath = path.join(dir, 'favicon.ico');

    if (!src) {
      console.log(`⚪ ${name}: 无自身图标 → 回退站点 /favicon.ico`);
      skipped++;
      continue;
    }
    if (fs.existsSync(outPath)) {
      console.log(`• ${name}: favicon.ico 已存在，跳过（刷新请删除后重跑）`);
      skipped++;
      continue;
    }
    try {
      const buf = fs.readFileSync(src);
      const opts = src.toLowerCase().endsWith('.svg') ? { density: 384 } : {};
      const pngs = await Promise.all(
        SIZES.map((s) => sharp(buf, opts).resize(s, s).png().toBuffer())
      );
      const ico = await pngToIco(pngs);
      fs.writeFileSync(outPath, ico);
      console.log(`✓ ${name}: 由 ${path.basename(src)} 生成 favicon.ico（${ico.length} 字节）`);
      generated++;
    } catch (e) {
      console.log(`✗ ${name}: 生成失败 - ${e.message}`);
      skipped++;
    }
  }
  console.log(`\n完成：生成 ${generated} 个，跳过 ${skipped} 个`);
}

main();
