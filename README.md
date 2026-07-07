# 网页工具站

🔧 一个基于 GitHub Pages 的网页工具集合站。

## 🎯 目标

- 把本地网页工具转为在线可访问使用的网页工具
- 上传工具后自动出现在首页
- 零维护成本 - 无需手动维护工具列表

## 🚀 快速开始

### 部署到 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. 在 **Source** 中选择 **Deploy from a branch**
3. 选择分支为 **main**，文件夹为 **/ (root)**
4. 点击 **Save**
5. 几分钟后，访问 `https://yourusername.github.io/page-go-live` 即可看到首页

### 新增工具

1. 在 `tools/` 目录下创建新文件夹
   ```
   tools/my-tool/
   ```

2. 创建 HTML 文件（至少一个）
   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <meta charset="UTF-8">
       <title>我的工具</title>
       <meta name="description" content="这是我的工具描述">
   </head>
   <body>
       <!-- 你的工具内容 -->
   </body>
   </html>
   ```

3. 可以添加其他资源文件
   ```
   tools/my-tool/
   ├── index.html
   ├── style.css
   ├── script.js
   └── assets/
       └── ...
   ```

4. 提交并推送到 main 分支
   ```bash
   git add .
   git commit -m "feat: 新增我的工具"
   git push
   ```

5. GitHub Actions 自动执行，工具会自动出现在首页

## 📁 目录结构

```
.
├── index.html              # 首页
├── tools.json              # 工具清单（自动生成）
├── tools/                  # 工具目录
│   ├── example-tool/
│   │   └── index.html
│   └── my-tool/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── scripts/
│   └── generate-tools-json.js  # 工具清单生成脚本
└── .github/workflows/
    └── update-tools.yml        # 自动更新工作流
```

## 🔍 工具信息提取规则

系统会自动从 HTML 文件中提取以下信息：

| 字段 | 来源 | 回退方案 |
|------|------|--------|
| 工具名称 | `<title>` 标签 | 文件夹名（humanized） |
| 工具描述 | `<meta name="description">` | 不显示 |

## 🛠️ 工具卡片展示

首页会根据 `tools.json` 自动生成工具卡片，包含：

- 工具名称
- 工具描述
- 打开工具按钮（链接到 `/tools/工具名/`）

## 📝 工具最佳实践

### HTML 文件命名

推荐使用 `index.html`，这样可以直接访问 `/tools/工具名/`

也可以使用其他名字，如 `tool.html`, `app.html` 等

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

1. **监听推送事件**
   - 当 `main` 分支有推送时自动执行
   - 或者手动在 Actions 页面触发 `workflow_dispatch`

2. **生成工具清单**
   ```bash
   node scripts/generate-tools-json.js
   ```

3. **检查变化**
   - 如果 `tools.json` 有变化，自动提交

4. **推送回仓库**
   - 使用 `git push` 推送更新

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

## 🔗 首页功能

- ✅ 自动加载 `tools.json`
- ✅ 搜索工具（按名称和描述）
- ✅ 工具计数统计
- ✅ 响应式设计（移动端适配）
- ✅ 错误处理和加载状态
- ✅ 无搜索结果提示

## 🎨 首页样式

- 现代简洁的设计
- 渐变背景
- 流畅的交互动画
- 完全响应式布局
- 深色和浅色卡片对比

## 📱 移动端适配

首页和工具都应该支持移动设备访问：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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

直接修改 `tools/工具名/` 下的文件，推送到 main 分支即可，无需重新注册。

## 📄 许可证

自由使用

## 🤝 贡献

欢迎添加更多实用工具！

按照 [新增工具](#新增工具) 部分的步骤即可。
