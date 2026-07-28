# 坐标数据可视化地图工作室

> 面向维护者 / 未来 AI 助手的架构与维护指南。

## 项目简介
一个纯浏览器静态运行的**坐标数据可视化**工具：导入 Excel / CSV / TXT / 手动坐标，
支持度分秒解析、WGS-84 / GCJ-02 / BD-09 坐标系转换、多种在线地图图源、点样式自定义，
以及 GeoJSON / KML / Shapefile 矢量导出。无后端、无构建步骤。

线上地址：`https://html.endril.com/tools/20250920_坐标数据可视化/`

## 目录结构
```
tools/20250920_坐标数据可视化/
├── index.html          # 入口页（结构 + CDN 引用 + 元信息）
├── app.js              # 全部业务逻辑（单文件脚本，非 ES Module）
├── style.css           # 全部样式
├── assets/             # 图标等静态资源（被 index.html 用相对路径 ./assets/* 引用）
│   ├── favicon.png
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   └── icon-blue.png
├── samples/            # 示例数据（仅作参考素材，代码不依赖；代码内示例由内存生成）
│   ├── 坐标导入数据示例.csv
│   ├── 坐标导入数据示例.txt
│   ├── 坐标导入数据示例.xlsx
│   └── 坐标格式示例.csv  # 多格式示例：十进制 / 度分秒 / 度分 / 冒号分隔的同城多列
├── fallback/           # 单文件兜底版本（模块化版异常时的备用，自含 CDN 引用）
│   └── Excel坐标数据可视化地图_单文件版.html
└── README.md           # 本文件
```

## 各文件职责
- **index.html**：DOM 骨架、`<head>` 元信息（title/description/canonical/og/twitter）、
  通过 CDN 引入 Leaflet / leaflet.markercluster / xlsx / jszip，最后用
  `<script src="./app.js">` 与 `<link href="./style.css">` 加载本地资源。
  图标用 `./assets/favicon.png` 等相对路径引用。
- **app.js**：所有交互逻辑（导入解析、坐标系转换、地图渲染、样式、导出、i18n、离线 HTML 生成）。
  约 1800 行，历史累积未拆分模块。**示例数据由内存常量 `SAMPLE_DATA` 生成，不读取仓库内 samples/ 文件**；
  “下载示例文件包”按钮在内存中生成 CSV/TXT 下载。
- **style.css**：界面样式。
- **assets/**：图标。当前仅被 index.html 的 `<link rel=icon>` 引用；`icon-blue.png` 暂未被代码引用（保留备用）。
- **samples/**：示例数据文件，供用户/测试参考，运行时不依赖。
- **fallback/**：单文件 HTML 版本（所有逻辑内联），作为模块化版出问题时的人工兜底。

## 如何修改 / 扩展
1. 编辑 `app.js` / `style.css` / `index.html`（本地或在本仓库直接改）。
2. 提交到 `main` 分支。GitHub Pages 会从 `main` 根目录自动重建并上线，**无需构建**。
3. 新增图标/资源：放入 `assets/`，在 index.html 用 `./assets/xxx` 引用。
4. 新增示例：放入 `samples/`（仅素材，不影响运行）。

## 部署与 tools.json 关键约定
- 站点由 GitHub Pages 从 `main` 分支根目录直接托管。
- 门户首页 `index.html`（仓库根）读取 `tools.json` 自动生成工具卡片。
- **重要**：本仓库的 `更新工具清单` GitHub Action 当前持续失败（conclusion=failure），
  因此 `tools.json` **不会自动重生成**。若改动工具入口或目录名，必须**手动**编辑 `tools.json`
  中对应条目的 `path` 与 `htmlFile`（参考：`"path": "/tools/20250920_坐标数据可视化/index.html"`, `"htmlFile": "index.html"`）。
- 推送后若页面未更新，可主动触发 Pages 重建：`POST /repos/geograhic/page-go-live/pages/builds`。

## 关键技术与约定
- **坐标系**：WGS-84（GPS 原生）、GCJ-02（高德/火星）、BD-09（百度）。导入时可选坐标系，
  地图底图多为 GCJ-02/BD-09，需做偏移匹配，否则点位偏移。
- **i18n**：界面文案用 `data-i18n` / `data-i18n-title` 属性 + `app.js` 内字典；新增语种在 `<select id="ui-lang">` 与字典同步。
- **坐标格式解析**：`parseCoord()` 支持十进制（含千分位逗号）、度分秒（`116°24'26.6"E`）、度分（`116°24.4433'E`）、
  纯度数 + 半球字母（`39.9°N` / `N39.9°` / `39.9N`）、冒号分隔（`116:24:26.6E`）等；半球字母 N/S/E/W 可在开头或结尾。
  UI 提供“下载多格式示例”按钮（`downloadMultiFormatSample()`，内容由内存常量 `MULTI_FORMAT_SAMPLE_ROWS` 生成）。
- **手动选择经纬度列**：导入文件后不再由机器猜测经纬度列，而是列出全部列字段，由用户在
  `#column-selector` 面板的四个下拉框（`#col-lng` / `#col-lat` / `#col-name` / `#col-crs`）中手动指定，
  点击“应用列选择”（`applyColumnSelection()`）后按所选列解析；下拉框默认值由 `detectColumns` / `fallbackNumericColumns` 预填。
- **图源**：在线瓦片来自 jsdelivr CDN 的 Leaflet；自定义图源支持 `{x}{y}{z}{s}` 占位符。
- **相对路径原则**：工具内一律用相对路径（`./app.js`、`./assets/...`），请勿硬编码绝对 URL（曾因硬编码旧目录名导致 canonical/og 链接失效，已在 2026-07-28 修正）。

## 历史与回滚
- 工具目录原名 `20250920_APPS_坐标数据可视化`，于 2026-07-28 重命名为 `20250920_坐标数据可视化`（去掉 `APPS_`，与本地项目文件夹一致）。
- 所有变更均提交到 git 历史，可随时回滚到任意提交。

## 给未来 AI 助手的建议
- 改动前先用 `gh`/API 拉取最新 `main`，避免覆盖。
- 修改 `index.html` 时注意：`<head>` 内的 canonical/og/twitter 链接必须与当前目录名一致。
- 不要拆分 `app.js` 为 ES Module 除非同时改造 index.html 的加载方式（保持纯静态、无构建）。
- 验证：部署后用真实浏览器（经代理 `127.0.0.1:7890`）打开线上地址，加载示例数据，
  确认无 console error、在线底图与标记正常渲染。
