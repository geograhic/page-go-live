# 网页工具站 (page-go-live)

🔧 一个基于 GitHub Pages 的网页工具集合站，支持**自动收录工具**与**投稿审核上线**。

线上地址：<https://html.endril.com>

## 🎯 目标

- 把本地网页工具一键转为在线可访问的网页工具
- 上传工具后自动出现在首页（无需手动维护工具列表）
- 开放**投稿入口**：任何人可提交网页工具，审核通过后自动上线并记入贡献者名单

## 🚀 快速开始

### 部署到 GitHub Pages

1. 仓库 **Settings** → **Pages**
2. **Source** 选择 **Deploy from a branch**
3. 分支 **main**，文件夹 **/ (root)**
4. 自定义域名已在 `CNAME` 中配置为 `html.endril.com`

### 新增工具（维护者直传，最快路径）

仓库 owner / 有写权限的维护者，**直接把工具文件夹推到 `tools/` 即可自动上线**——这比走 Issue 投稿更直接。`update-tools.yml` 监听 `tools/**`，推送后会自动重生成 `tools.json` 并触发部署，无需经过审核流。

1. 在 `tools/` 下创建工具文件夹，放入入口 HTML 及其静态资源：
   ```
   tools/my-tool/
   ├── index.html        ← 入口（必须有）
   ├── style.css         ← 可引用的静态资源
   ├── app.js
   └── assets/           ← 图片 / wasm 等
   ```
2. 入口建议命名为 `index.html`（或任意 `.html`）。若目录内**多个 html 且无 `index.html`**，生成器会按「跳过『正在跳转』类占位页 + 选体积最大者」的启发式自动选真正的工具页。
3. 在 `index.html` 写清 `<title>` 与 `<meta name="description">`（决定卡片名与描述，写法见下方「工具最佳实践」）。
4. 推送 `main` 分支 → Actions 自动重新生成 `tools.json` 并上线。

#### 支持的语言 / 技术栈

本站是**纯静态站点（GitHub Pages），无服务器端运行时**，因此只承载「浏览器里能直接打开运行」的工具：

| ✅ 支持 | ❌ 不支持 |
|------|------|
| HTML / CSS / JavaScript（原生或 React/Vue/Svelte 等构建产物） | 服务端 Python / Node / PHP / Ruby / Java 后端 |
| TypeScript（编译为 JS 后） | 数据库 / 需要常驻进程的服务 |
| WebAssembly（C/C++/Rust/Go/AssemblyScript 编译的 `.wasm`） | 任何依赖后端 API 的工具（除非另建后端如 Cloudflare Worker 让前端调用） |
| 浏览器内解释型（如 Pyodide 等 WASM 方案） | — |

> 一句话：**只要最终是一个能在浏览器直接运行的 `index.html`（含其引用的 css/js/wasm/图片），就能放。**

#### 直接传文件夹的各种结果

| 文件夹内容 | 结果 |
|-----------|------|
| 含 `index.html`（+ 同目录静态资源） | ✅ 完美：卡片出现，干净 URL `/tools/my-tool/` |
| 含某个 `.html`（非 index.html） | ⚠️ 可用：卡片指向 `/tools/my-tool/<文件>.html` |
| 含 HTML 但无 `<title>` | 卡片名退化为「文件夹名 Humanize」（如 `my-tool` → `My Tool`） |
| 含 HTML 但无 `<meta name="description">` | 卡片描述为空 |
| **没有任何 `.html` 文件** | ⊘ 被静默跳过，不生成卡片（文件夹仅留在 git 中） |
| 含超大二进制（视频 / 模型） | 能托管，但会撑大仓库、拖慢 clone |

> ⚠️ 文件夹 push 后即成为**公开仓库文件**，源码人人可见；任何写在前端的密钥都等于公开，请勿在工具代码中放入密钥 / API Key。

## 📥 投稿上线（任何人）

1. 点击首页「提交你的网页工具」卡片 → 打开 Issue 表单
2. 填写：工具名称、地址、简介、作者署名、你的主页（可选）
3. 维护者给 Issue 打 `approved` 标签
4. 自动执行：解析 Issue → 写入 `external-tools.json` 与 `authors.json` → 重新生成 `tools.json` → 提交并留言

> 🔒 安全：投稿的「工具地址」与「作者主页」仅允许 `http/https`，`javascript:` 等危险链接会被自动丢弃；首页对所有展示文本做 HTML 转义。

## 📁 目录结构

```
.
├── index.html              # 首页（搜索 / 中英切换 / 贡献者面板 / 粒子背景）
├── tools.json              # 工具清单（⚠️ 自动生成，勿手改）
├── external-tools.json     # 审核通过的外部投稿工具（自动写入）
├── authors.json            # 贡献者名单（自动累加）
├── tools/                  # 工具目录（每个子目录一个工具）
│   ├── example-tool/
│   └── .../
├── scripts/
│   └── generate-tools-json.js  # 工具清单生成脚本
└── .github/
    ├── workflows/
    │   ├── update-tools.yml       # 监听 tools/** 与清单文件变更，自动重生成 tools.json
    │   └── approve-submission.yml # 监听 approved 标签，自动上线投稿
    ├── scripts/
    │   └── approve_tool.py        # 解析 Issue 正文并入库
    └── ISSUE_TEMPLATE/
        └── tool-submission.yml    # 投稿表单模板
```

## 🔍 工具信息提取规则

系统会自动从 HTML 文件中提取以下信息：

| 字段 | 来源 | 回退方案 |
|------|------|--------|
| 工具名称 | `<title>` 标签 | 文件夹名（humanized） |
| 工具描述 | `<meta name="description">` | 不显示 |

## 🛠️ 首页功能

- ✅ 自动加载 `tools.json` 与 `authors.json`
- ✅ 搜索工具（按名称和描述，搜索态不展示贡献者卡片）
- ✅ 工具计数（**不含**投稿入口卡片）
- ✅ 中英双语切换（EN / 中文，偏好记忆到 `localStorage`，支持 `?lang=` 参数）
- ✅ 贡献者名单卡片 + 点击展开面板
- ✅ 响应式设计 + 向量流场粒子背景（尊重 `prefers-reduced-motion`）
- ✅ 错误处理、加载状态、无结果提示

## 🔒 安全说明

- 投稿链接（工具地址、作者主页）仅接受 `http/https`，自动拦截 `javascript:` 等危险协议
- 首页对工具名 / 描述 / 贡献者名做 HTML 转义，避免 XSS
- 投稿链接在新标签页打开并带 `rel="noopener"`

## 📝 工具最佳实践

### HTML 文件命名

推荐使用 `index.html`，这样可以直接访问 `/tools/工具名/`。

也可以使用其他名字，如 `tool.html`, `app.html` 等（生成器会自动记录具体文件名）。

### 元标签示例

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON 格式化工具</title>
    <meta name="description" content="快速格式化和验证 JSON 数据">
</head>
```

### 资源文件路径

在工具中引用资源时，使用相对路径：

```html
<!-- ✓ 正确 -->
<link rel="stylesheet" href="./style.css">
<script src="./script.js"></script>
<img src="./assets/logo.png">

<!-- ✓ 也可以使用绝对路径 -->
<link rel="stylesheet" href="/tools/my-tool/style.css">
```

### 返回首页链接

在工具中添加返回首页的链接：

```html
<a href="/">← 返回首页</a>
```

## 🔄 工作流说明

仓库内置两条 GitHub Actions：

1. **`update-tools.yml`（更新工具清单）**
   - 触发：`main` 分支推送，且变更命中 `tools/**`、`scripts/generate-tools-json.js`、`external-tools.json`、`authors.json`
   - 或手动在 Actions 页面触发 `workflow_dispatch`
   - 动作：运行 `node scripts/generate-tools-json.js` → 若 `tools.json` 有变化则自动提交

2. **`approve-submission.yml`（审核通过工具投稿）**
   - 触发：Issue 被打上 `approved` 标签
   - 动作：解析 Issue 正文 → 写入 `external-tools.json` 与 `authors.json` → 重新生成 `tools.json` → 一并提交并留言

> 提示：手动修改 `external-tools.json` / `authors.json` 后直接 push，也会触发 `update-tools.yml` 重新生成 `tools.json`（外部投稿工具会因此合并进首页）。

## 📖 工具示例

### 示例工具位置

```
tools/example-tool/index.html
```

这个示例工具展示了：
- 如何设置元标签
- 推荐的 HTML 结构
- 如何返回首页

### 复制示例创建新工具

```bash
cp -r tools/example-tool tools/my-tool
# 然后编辑 tools/my-tool/index.html
```

## ⚙️ 手动运行脚本

如果需要手动生成工具清单：

```bash
# 需要 Node.js 18+
node scripts/generate-tools-json.js
```

脚本会输出详细日志：
```
✓ 收录工具: 示例工具
✓ 生成成功: tools.json
  共收录 1 个工具
```

## ❓ 常见问题

### 工具没有出现在首页？

1. 检查文件夹名和 HTML 文件名
2. 确保 HTML 文件存在于 `tools/` 下的一级子目录
3. 检查 GitHub Actions 是否执行成功
4. 手动运行脚本检查输出：`node scripts/generate-tools-json.js`

### 工具显示错误的名称？

检查 HTML 中的 `<title>` 标签是否正确设置。如果没有 `<title>`，会使用文件夹名。

### 工具链接打不开？

检查：
1. HTML 文件名和位置是否正确
2. 相对路径引用是否正确
3. 工具是否已部署到 GitHub Pages

### 如何修改已发布的工具？

直接修改 `tools/工具名/` 下的文件，推送到 `main` 分支即可，无需重新注册。

## 📄 许可证

自由使用

## 🤝 贡献

- **普通用户**：通过首页「提交你的网页工具」卡片提交你的网页工具
- **维护者**：直接在 `tools/` 下新增工具目录并推送 `main` 分支
