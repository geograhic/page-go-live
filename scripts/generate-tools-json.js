#!/usr/bin/env node

/**
 * 自动生成工具清单脚本
 * 扫描 tools/ 目录下的所有工具，提取元信息，生成 tools.json
 * 支持任意名字的 HTML 文件，自动检测并在清单中记录具体的 HTML 文件路径
 *
 * 额外逻辑：
 *  - 始终在清单头部注入「提交你的网页工具」投稿入口卡片
 *  - 跳过 tools/example-tool/ 示例目录
 *  - 合并 external-tools.json（经审核通过的外部投稿工具）
 */

const fs = require('fs');
const path = require('path');

// 配置
const TOOLS_DIR = path.join(__dirname, '../tools');
const OUTPUT_FILE = path.join(__dirname, '../tools.json');
const EXTERNAL_FILE = path.join(__dirname, '../external-tools.json');

// 固定在头部的投稿入口
const SUBMISSION_ENTRY = {
    name: '提交你的网页工具',
    description: '你有好的网页工具？点击下方按钮提交，审核通过后将在本站上线展示。',
    path: 'https://github.com/geograhic/page-go-live/issues/new?template=tool-submission.yml',
    htmlFile: '',
    buttonText: '我要上线',
    isExternal: true,
    isSubmission: true
};

/**
 * 将文件夹名转换为可读的名称
 */
function humanizeToolName(folderName) {
    return folderName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
        .trim();
}

/**
 * 查找 HTML 文件
 */
function findHtmlFile(toolDir) {
    const files = fs.readdirSync(toolDir);
    if (files.includes('index.html')) {
        return { fileName: 'index.html', fullPath: path.join(toolDir, 'index.html') };
    }
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) {
        return null;
    }
    if (htmlFiles.length === 1) {
        const f = htmlFiles[0];
        return { fileName: f, fullPath: path.join(toolDir, f) };
    }
    // 多个 HTML 且无 index.html：启发式选「真正的工具页」，避免选中「正在跳转」类占位页
    const scored = htmlFiles.map(f => {
        const full = path.join(toolDir, f);
        let size = 0;
        let isStub = false;
        try {
            size = fs.statSync(full).size;
            const fd = fs.openSync(full, 'r');
            const buf = Buffer.alloc(2048);
            const n = fs.readSync(fd, buf, 0, 2048, 0);
            fs.closeSync(fd);
            const head = buf.slice(0, n).toString('utf-8');
            isStub = /正在跳转|跳转至|redirect|window\.location\s*=/.test(head);
        } catch (e) { /* ignore */ }
        return { f, size, isStub };
    });
    // 优先非占位页；若全是占位页，退回文件最大的
    const pool = scored.filter(s => !s.isStub);
    const chosenPool = pool.length ? pool : scored;
    chosenPool.sort((a, b) => b.size - a.size);
    const chosen = chosenPool[0].f;
    if (scored.length !== chosenPool.length) {
        console.warn(`⚠ 目录含多个 HTML 且无 index.html，已跳过 ${scored.length - chosenPool.length} 个疑似占位页，选择: ${chosen}`);
    } else {
        console.warn(`⚠ 目录含多个 HTML 且无 index.html，已选择体积最大的: ${chosen}（其余: ${htmlFiles.filter(f => f !== chosen).join(', ')}）`);
    }
    return { fileName: chosen, fullPath: path.join(toolDir, chosen) };
}

function extractTitle(htmlContent) {
    const m = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    return m ? m[1].trim() : null;
}

function extractDescription(htmlContent) {
    const m = htmlContent.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (m) return m[1].trim();
    const m2 = htmlContent.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    return m2 ? m2[1].trim() : null;
}

/**
 * 检测工具的网页图标，返回站点根相对路径（或绝对 URL）。
 * 优先级：
 *   1. <link rel="icon"/"shortcut icon" href="...">（排除 apple-touch-icon）
 *   2. <link rel="apple-touch-icon" href="...">
 *   3. 文件夹内标准文件：favicon.svg / .png / .ico / apple-touch-icon.png / icon.png
 * 找不到则返回空字符串（渲染时回退到站点图标）。
 */
function extractIcon(htmlContent, folderName, toolDir) {
    const linkTags = htmlContent.match(/<link\b[^>]*>/gi) || [];
    let href = null;
    // 第 1 遍：rel="icon" 或 "shortcut icon"（不要 apple-touch-icon）
    for (const tag of linkTags) {
        if (/rel\s*=\s*["'][^"']*\bicon\b[^"']*["']/i.test(tag) && !/apple-touch-icon/i.test(tag)) {
            const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
            if (m) { href = m[1].trim(); break; }
        }
    }
    // 第 2 遍：apple-touch-icon
    if (!href) {
        for (const tag of linkTags) {
            if (/apple-touch-icon/i.test(tag)) {
                const m = tag.match(/href\s*=\s*["']([^"']+)["']/i);
                if (m) { href = m[1].trim(); break; }
            }
        }
    }
    // 第 3 遍：标准文件
    if (!href) {
        const candidates = ['favicon.svg', 'favicon.png', 'favicon.ico', 'apple-touch-icon.png', 'icon.png'];
        for (const c of candidates) {
            if (fs.existsSync(path.join(toolDir, c))) { href = c; break; }
        }
    }
    if (!href) return '';
    if (/^https?:\/\//i.test(href)) return href;          // 绝对外部 URL
    if (href.startsWith('/')) return href;                // 站点根相对
    return `/tools/${folderName}/${href.replace(/^\.\//, '')}`; // 工具内相对
}

/**
 * 为外部投稿工具尽力推导图标：取其域名 favicon.ico（渲染失败会回退站点图标）
 */
function deriveExternalIcon(url) {
    try {
        return new URL(url).origin + '/favicon.ico';
    } catch (_) {
        return '';
    }
}

/**
 * 规范化路径用于去重比较：去掉域名前缀、统一尾部斜杠、转小写
 */
function normalizePath(p) {
    if (!p) return '';
    return p
        .replace(/^https?:\/\/[^/]+/, '')   // 去掉域名
        .replace(/\/index\.html$/, '/')     // 统一 index.html 结尾
        .replace(/\/+$/, '')                // 去掉尾部斜杠
        .toLowerCase();
}

// 读取经审核通过的外部投稿
function loadExternalTools() {
    if (!fs.existsSync(EXTERNAL_FILE)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(EXTERNAL_FILE, 'utf-8'));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('✗ 读取 external-tools.json 失败:', e.message);
        return [];
    }
}

function generateToolsJson() {
    const scanned = [];

    if (!fs.existsSync(TOOLS_DIR)) {
        console.log('tools/ 目录不存在，创建空的 tools.json');
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify([SUBMISSION_ENTRY], null, 2));
        return;
    }

    const entries = fs.readdirSync(TOOLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        // 跳过示例工具目录
        if (entry.name === 'example-tool') {
            console.log(`⊘ 跳过示例目录: ${entry.name}`);
            continue;
        }

        const toolDir = path.join(TOOLS_DIR, entry.name);
        const htmlFileInfo = findHtmlFile(toolDir);

        if (!htmlFileInfo) {
            console.log(`⊘ 跳过: ${entry.name} (没有找到 HTML 文件)`);
            continue;
        }

        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(htmlFileInfo.fullPath, 'utf-8');
        } catch (error) {
            console.error(`✗ 读取文件失败: ${htmlFileInfo.fileName}`, error.message);
            continue;
        }

        let name = extractTitle(htmlContent);
        const description = extractDescription(htmlContent);

        if (!name) {
            name = humanizeToolName(entry.name);
            console.log(`ℹ 使用文件夹名作为工具名: ${entry.name} -> ${name}`);
        } else {
            console.log(`✓ 收录工具: ${name} (文件: ${htmlFileInfo.fileName})`);
        }

        const toolPath = htmlFileInfo.fileName === 'index.html'
            ? `/tools/${entry.name}/`
            : `/tools/${entry.name}/${htmlFileInfo.fileName}`;

        const icon = extractIcon(htmlContent, entry.name, toolDir);

        scanned.push({
            name: name,
            description: description || '',
            path: toolPath,
            htmlFile: htmlFileInfo.fileName,
            icon: icon
        });
    }

    // 外部投稿
    const external = loadExternalTools().map(e => {
        if (!e.icon && e.path && /^https?:\/\//i.test(e.path) && !e.isSubmission) {
            const derived = deriveExternalIcon(e.path);
            if (derived) e.icon = derived;
        }
        return e;
    });
    if (external.length) {
        console.log(`✓ 合并 ${external.length} 个外部投稿工具`);
    }

    // 去重：外部投稿若指向已存在的 tools/ 文件夹，跳过（避免重复卡片）
    const scannedPaths = new Set(scanned.map(s => normalizePath(s.path)));
    const dedupedExternal = external.filter(e => {
        const np = normalizePath(e.path);
        if (np && scannedPaths.has(np)) {
            console.log(`⚠ 跳过重复: "${e.name}" → 路径 ${np} 已存在于 tools/ 目录`);
            return false;
        }
        return true;
    });

    // 其余工具按名称排序，投稿入口始终置顶
    const rest = [...scanned, ...dedupedExternal].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    const allTools = [SUBMISSION_ENTRY, ...rest];

    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allTools, null, 2));
        console.log(`\n✓ 生成成功: ${OUTPUT_FILE}`);
        console.log(`  共收录 ${allTools.length} 个条目（含投稿入口）`);
    } catch (error) {
        console.error(`✗ 写入文件失败: ${OUTPUT_FILE}`, error.message);
        process.exit(1);
    }
}

generateToolsJson();
