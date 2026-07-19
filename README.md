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

### 新增工具（维护者）

1. 在 `tools/` 下创建工具文件夹
   ```
   tools/my-tool/
   ```
2. 至少放一个 `index.html`（或任意 `.html`）
   - 若目录内有**多个 html 且无 `index.html`**，生成器会**自动选择真正的工具页**（跳过“正在跳转”类的占位页），不再依赖目录顺序
3. 推送到 `main` 分支 → GitHub Actions 自动重新生成 `tools.json` 并上线

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
