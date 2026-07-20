# Web Tools Hub (page-go-live)

🔧 A GitHub Pages–based collection of web tools, with **automatic tool indexing** and a **submission review & publish** flow.

Live site: <https://html.endril.com>

> 🌐 English documentation. [中文文档 →](README.md)

## 🎯 Goal

- Turn a local web tool into an online-accessible web tool with one step
- Tools appear on the homepage automatically after upload (no manual list maintenance)
- Open **submission entry**: anyone can submit a web tool; once approved, it goes live automatically and is recorded in the contributors list

## 🚀 Quick Start

### Deploy to GitHub Pages

1. Repository **Settings** → **Pages**
2. **Source**: select **Deploy from a branch**
3. Branch **main**, folder **/ (root)**
4. Custom domain is configured in `CNAME` as `html.endril.com`

### Add a tool (maintainer direct-push — fastest path)

The repo owner / a maintainer with write access can **directly push a tool folder into `tools/` to go live** — this is more direct than going through the Issue submission flow. `update-tools.yml` watches `tools/**`; after a push it auto-regenerates `tools.json` and triggers deployment, no review step needed.

1. Create a tool folder under `tools/`, with the entry HTML and its static assets:
   ```
   tools/my-tool/
   ├── index.html        ← entry (required)
   ├── style.css         ← referenceable static assets
   ├── app.js
   └── assets/           ← images / wasm / etc.
   ```
2. The entry is recommended to be named `index.html` (or any `.html`). If a folder has **multiple HTML files and no `index.html`**, the generator uses a heuristic — skip "redirecting" placeholder pages and pick the largest one — to auto-select the real tool page.
3. Write a clear `<title>` and `<meta name="description">` in `index.html` (these decide the card name and description; see "Tool Best Practices" below).
4. Push to the `main` branch → Actions auto-regenerates `tools.json` and goes live.

#### Supported languages / tech stack

This site is a **pure static site (GitHub Pages) with no server-side runtime**, so it only hosts tools that "open and run directly in the browser":

| ✅ Supported | ❌ Not supported |
|------|------|
| HTML / CSS / JavaScript (vanilla or build output of React/Vue/Svelte etc.) | Server-side Python / Node / PHP / Ruby / Java backends |
| TypeScript (after compiling to JS) | Databases / services that need a long-running process |
| WebAssembly (`.wasm` compiled from C/C++/Rust/Go/AssemblyScript) | Any tool depending on a backend API (unless you build a separate backend like a Cloudflare Worker for the frontend to call) |
| In-browser interpreted (e.g. Pyodide and other WASM approaches) | — |

> In short: **as long as the final result is an `index.html` that runs directly in the browser (with its referenced css/js/wasm/images), you can put it here.**

#### Results of directly pushing a folder

| Folder contents | Result |
|-----------|------|
| Contains `index.html` (+ same-dir static assets) | ✅ Perfect: card appears, clean URL `/tools/my-tool/` |
| Contains some `.html` (not index.html) | ⚠️ Usable: card points to `/tools/my-tool/<file>.html` |
| Contains HTML but no `<title>` | Card name falls back to "humanized folder name" (e.g. `my-tool` → `My Tool`) |
| Contains HTML but no `<meta name="description">` | Card description is empty |
| **No `.html` file at all** | ⊘ Silently skipped, no card generated (folder remains only in git) |
| Contains oversized binaries (video / models) | Can be hosted, but bloats the repo and slows clone |

> ⚠️ A pushed folder becomes a **public repo file** — source is visible to everyone; any secret written in frontend code is effectively public. Do not put keys / API Keys in tool code.

## 📥 Submit a tool (anyone)

1. Click the "Submit your web tool" card on the homepage → opens the Issue form
2. Fill in: tool name, URL, brief intro, your display name, your homepage (optional)
3. Maintainer adds the `approved` label to the Issue
4. Auto-executed: parse Issue → write to `external-tools.json` and `authors.json` → regenerate `tools.json` → commit and comment

> 🔒 Security: submitted "tool URL" and "author homepage" only allow `http/https`; dangerous links like `javascript:` are auto-discarded; the homepage HTML-escapes all displayed text.

## 📁 Directory Structure

```
.
├── index.html              # Homepage (search / EN-ZH switch / contributors panel / particle background)
├── tools.json              # Tool manifest (⚠️ auto-generated, do not edit by hand)
├── external-tools.json     # Approved external submission tools (auto-written)
├── authors.json            # Contributors list (auto-accumulated)
├── tools/                  # Tools directory (one subfolder per tool)
│   ├── example-tool/
│   └── .../
├── scripts/
│   └── generate-tools-json.js  # Tool manifest generation script
└── .github/
    ├── workflows/
    │   ├── update-tools.yml       # Watches tools/** and manifest changes, auto-regenerates tools.json
    │   └── approve-submission.yml # Watches the approved label, auto-publishes submissions
    ├── scripts/
    │   └── approve_tool.py        # Parses the Issue body and writes to the data files
    └── ISSUE_TEMPLATE/
        ├── tool-submission.yml    # Submission form template (中文)
        └── tool-submission-en.yml # Submission form template (English)
```

## 🔍 Tool Info Extraction Rules

The system auto-extracts the following info from the HTML file:

| Field | Source | Fallback |
|------|------|--------|
| Tool name | `<title>` tag | Folder name (humanized) |
| Tool description | `<meta name="description">` | Not shown |

## 🛠️ Homepage Features

- ✅ Auto-loads `tools.json` and `authors.json`
- ✅ Search tools (by name and description; contributor card hidden in search state)
- ✅ Tool count (**excluding** the submission-entry card)
- ✅ Bilingual EN / 中文 switch (preference remembered in `localStorage`, supports `?lang=` param)
- ✅ Contributors card + click-to-expand panel
- ✅ Responsive design + vector flow-field particle background (respects `prefers-reduced-motion`)
- ✅ Error handling, loading states, no-result hints

## 🔒 Security Notes

- Submission links (tool URL, author homepage) only accept `http/https`; dangerous schemes like `javascript:` are auto-blocked
- The homepage HTML-escapes tool name / description / contributor name to avoid XSS
- Submission links open in a new tab with `rel="noopener"`

## 📝 Tool Best Practices

### HTML file naming

`index.html` is recommended so the tool is directly accessible at `/tools/tool-name/`.

You can also use other names like `tool.html`, `app.html`, etc. (the generator records the exact file name automatically).

### Meta tag example

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Formatter</title>
    <meta name="description" content="Quickly format and validate JSON data">
</head>
```

### Asset file paths

Use relative paths when referencing assets in a tool:

```html
<!-- ✓ Correct -->
<link rel="stylesheet" href="./style.css">
<script src="./script.js"></script>
<img src="./assets/logo.png">

<!-- ✓ Absolute paths also work -->
<link rel="stylesheet" href="/tools/my-tool/style.css">
```

### Back-to-home link

Add a link back to the homepage in the tool:

```html
<a href="/">← Back to home</a>
```

## 🔄 Workflows

Two GitHub Actions are built into the repo:

1. **`update-tools.yml` (update tool manifest)**
   - Trigger: push to `main` branch, and changes hit `tools/**`, `scripts/generate-tools-json.js`, `external-tools.json`, or `authors.json`
   - Or manually triggered via `workflow_dispatch` on the Actions page
   - Action: run `node scripts/generate-tools-json.js` → if `tools.json` changed, auto-commit

2. **`approve-submission.yml` (approve a tool submission)**
   - Trigger: an Issue is labeled `approved`
   - Action: parse Issue body → write to `external-tools.json` and `authors.json` → regenerate `tools.json` → commit and comment together

> Tip: manually editing `external-tools.json` / `authors.json` and pushing also triggers `update-tools.yml` to regenerate `tools.json` (external submission tools thus merge into the homepage).

## 📖 Tool Example

### Example tool location

```
tools/example-tool/index.html
```

This example tool demonstrates:
- How to set meta tags
- Recommended HTML structure
- How to link back to home

### Copy the example to create a new tool

```bash
cp -r tools/example-tool tools/my-tool
# then edit tools/my-tool/index.html
```

## ⚙️ Run scripts manually

If you need to generate the tool manifest manually:

```bash
# Node.js 18+ required
node scripts/generate-tools-json.js
```

The script prints detailed logs:
```
✓ 收录工具: 示例工具
✓ 生成成功: tools.json
  共收录 1 个工具
```

## ❓ FAQ

### Tool not showing on the homepage?

1. Check the folder name and HTML file name
2. Make sure the HTML file is in a first-level subfolder under `tools/`
3. Check whether GitHub Actions ran successfully
4. Run the script manually to inspect output: `node scripts/generate-tools-json.js`

### Tool shows the wrong name?

Check whether the `<title>` tag in the HTML is set correctly. If there is no `<title>`, the folder name is used.

### Tool link won't open?

Check:
1. Whether the HTML file name and location are correct
2. Whether relative path references are correct
3. Whether the tool is deployed to GitHub Pages

### How to modify a published tool?

Directly edit the files under `tools/tool-name/` and push to the `main` branch — no re-registration needed.

## 📄 License

Free to use

## 🤝 Contributing

- **Regular users**: submit your web tool via the "Submit your web tool" card on the homepage
- **Maintainers**: add a tool folder directly under `tools/` and push to the `main` branch
