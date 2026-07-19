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
    const htmlFile = files.find(file => file.endsWith('.html'));
    if (htmlFile) {
        return { fileName: htmlFile, fullPath: path.join(toolDir, htmlFile) };
    }
    return null;
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

        scanned.push({
            name: name,
            description: description || '',
            path: toolPath,
            htmlFile: htmlFileInfo.fileName
        });
    }

    // 外部投稿
    const external = loadExternalTools();
    if (external.length) {
        console.log(`✓ 合并 ${external.length} 个外部投稿工具`);
    }

    // 其余工具按名称排序，投稿入口始终置顶
    const rest = [...scanned, ...external].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
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
