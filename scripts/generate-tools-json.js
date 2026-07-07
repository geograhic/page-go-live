#!/usr/bin/env node

/**
 * 自动生成工具清单脚本
 * 扫描 tools/ 目录下的所有工具，提取元信息，生成 tools.json
 */

const fs = require('fs');
const path = require('path');

// 配置
const TOOLS_DIR = path.join(__dirname, '../tools');
const OUTPUT_FILE = path.join(__dirname, '../tools.json');

/**
 * 将文件夹名转换为可读的名称
 * 例如: json-format -> json format
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
    return files.find(file => file.endsWith('.html'));
}

/**
 * 从 HTML 内容中提取 title
 */
function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title[^>]*>([^<]*)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * 从 HTML 内容中提取 meta description
 */
function extractDescription(htmlContent) {
    const descMatch = htmlContent.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    if (descMatch) {
        return descMatch[1].trim();
    }
    // 尝试另一种顺序
    const descMatch2 = htmlContent.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    return descMatch2 ? descMatch2[1].trim() : null;
}

/**
 * 扫描工具目录并生成工具清单
 */
function generateToolsJson() {
    const tools = [];

    // 检查 tools 目录是否存在
    if (!fs.existsSync(TOOLS_DIR)) {
        console.log('tools/ 目录不存在，创建空的 tools.json');
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify([], null, 2));
        return;
    }

    // 读取 tools 目录下的所有子目录
    const entries = fs.readdirSync(TOOLS_DIR, { withFileTypes: true });

    for (const entry of entries) {
        // 只处理目录
        if (!entry.isDirectory()) {
            continue;
        }

        const toolDir = path.join(TOOLS_DIR, entry.name);
        const htmlFile = findHtmlFile(toolDir);

        // 跳过没有 HTML 文件的目录
        if (!htmlFile) {
            console.log(`⊘ 跳过: ${entry.name} (没有找到 HTML 文件)`);
            continue;
        }

        // 读取 HTML 文件
        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(path.join(toolDir, htmlFile), 'utf-8');
        } catch (error) {
            console.error(`✗ 读取文件失败: ${htmlFile}`, error.message);
            continue;
        }

        // 提取信息
        let name = extractTitle(htmlContent);
        const description = extractDescription(htmlContent);

        // 如果没有 title，则使用文件夹名
        if (!name) {
            name = humanizeToolName(entry.name);
            console.log(`ℹ 使用文件夹名作为工具名: ${entry.name} -> ${name}`);
        } else {
            console.log(`✓ 收录工具: ${name}`);
        }

        // 构建工具对象
        const tool = {
            name: name,
            description: description || '',
            path: `/tools/${entry.name}/`,
        };

        tools.push(tool);
    }

    // 按名称排序
    tools.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

    // 写入文件
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tools, null, 2));
        console.log(`\n✓ 生成成功: ${OUTPUT_FILE}`);
        console.log(`  共收录 ${tools.length} 个工具`);
    } catch (error) {
        console.error(`✗ 写入文件失败: ${OUTPUT_FILE}`, error.message);
        process.exit(1);
    }
}

// 运行脚本
generateToolsJson();
