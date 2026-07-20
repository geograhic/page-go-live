// 由 favicon.svg 重新栅格化生成多尺寸 favicon.ico（站点级兜底图标）。
// 运行：node scripts/gen-favicon.mjs
// 依赖：sharp + png-to-ico（CI 中 npm install --no-save 安装；本地测试放在含这两个包的目录运行）
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';

const SRC = 'favicon.svg';
const OUT = 'favicon.ico';
const SIZES = [16, 32, 48, 64];

const svg = readFileSync(SRC);
const pngs = await Promise.all(
  SIZES.map((s) => sharp(svg, { density: 384 }).resize(s, s).png().toBuffer())
);
const ico = await pngToIco(pngs);
writeFileSync(OUT, ico);
console.log(`✓ ${OUT} 已重新生成（${ico.length} 字节，尺寸 ${SIZES.join('/')}）`);
