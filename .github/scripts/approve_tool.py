#!/usr/bin/env python3
"""解析被标记为 approved 的 Issue，入库到 external-tools.json 并累加 authors.json。
由 .github/workflows/approve-submission.yml 调用，Issue 正文通过环境变量 ISSUE_BODY 传入。
"""
import os
import re
import json
import datetime
from urllib.parse import urlparse

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ISSUE_BODY = os.environ.get('ISSUE_BODY', '')
ISSUE_NUMBER = os.environ.get('ISSUE_NUMBER', 'unknown')


def parse_fields(body):
    """将 GitHub Issue 表单正文解析为 {字段标签: 值} 字典。"""
    fields = {}
    current = None
    for line in body.split('\n'):
        m = re.match(r'^#+\s*(.+?)\s*$', line.strip())
        if m:
            current = m.group(1).strip()
            fields.setdefault(current, '')
        elif current:
            if line.strip():
                fields[current] = (fields[current] + ' ' + line.strip()).strip()
    return fields


def get(fields, *keys):
    for key in keys:
        for label, val in fields.items():
            if key in label:
                return val.strip()
    return ''


def safe_url(value):
    """仅允许 http/https 协议，拦截 javascript: 等危险 scheme。"""
    v = (value or '').strip()
    if re.match(r'^https?://', v, re.IGNORECASE):
        return v
    return ''


def find_html_file(tool_dir):
    """在工具目录中挑选入口 HTML（与生成器 generate-tools-json.js 逻辑一致）。"""
    try:
        files = os.listdir(tool_dir)
    except OSError:
        return None
    if 'index.html' in files:
        return os.path.join(tool_dir, 'index.html')
    html_files = [f for f in files if f.endswith('.html')]
    if not html_files:
        return None
    if len(html_files) == 1:
        return os.path.join(tool_dir, html_files[0])
    # 多个 HTML 且无 index.html：跳过「正在跳转」类占位页，选体积最大者
    scored = []
    for f in html_files:
        full = os.path.join(tool_dir, f)
        try:
            size = os.path.getsize(full)
            with open(full, 'r', encoding='utf-8', errors='ignore') as fh:
                head = fh.read(2048)
            is_stub = bool(re.search(r'正在跳转|跳转至|redirect|window\.location\s*=', head))
        except OSError:
            size, is_stub = 0, False
        scored.append((f, size, is_stub))
    pool = [s for s in scored if not s[2]] or scored
    pool.sort(key=lambda s: s[1], reverse=True)
    return os.path.join(tool_dir, pool[0][0])


def extract_meta_description(html_content):
    """提取 <meta name="description" content="..."> 的内容。"""
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', html_content, re.I)
    if m:
        return m.group(1).strip()
    m2 = re.search(r'<meta\s+content=["\']([^"\']*)["\']\s+name=["\']description["\']', html_content, re.I)
    return m2.group(1).strip() if m2 else ''


def resolve_local_description(url):
    """若投稿 URL 指向本站 tools/ 下已存在的工具，返回其 <meta name="description">。

    用于：投稿未填写简介/功能描述时，自动回退到工具本身的简介，避免卡片描述留空。
    仅当 URL 路径形如 /tools/<folder>/... 才尝试匹配本地目录；其余（GitHub、CodePen 等）直接返回空。
    """
    if not url:
        return ''
    path = urlparse(url).path.rstrip('/')
    m = re.search(r'/tools/([^/]+)(?:/[^/]+)?$', path)
    if not m:
        return ''
    folder = m.group(1)
    tool_dir = os.path.join(REPO_ROOT, 'tools', folder)
    if not os.path.isdir(tool_dir):
        return ''
    html_path = find_html_file(tool_dir)
    if not html_path:
        return ''
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as fh:
            content = fh.read()
    except OSError:
        return ''
    return extract_meta_description(content)


def main():
    fields = parse_fields(ISSUE_BODY)
    name = get(fields, '工具名称')
    description = get(fields, '简介')
    url = safe_url(get(fields, '地址', 'URL'))
    features = get(fields, '功能描述')
    github = get(fields, 'GitHub', '作者', '署名')
    website = safe_url(get(fields, '主页', 'Website'))

    if not name or not url:
        print('✗ 缺少工具名称或地址/URL，跳过入库')
        return

    # ── external-tools.json ──
    ext_path = os.path.join(REPO_ROOT, 'external-tools.json')
    external = []
    if os.path.exists(ext_path):
        with open(ext_path, encoding='utf-8') as f:
            external = json.load(f)
    # 防止重复（同一 Issue 多次打标签）
    for t in external:
        if str(t.get('fromIssue')) == str(ISSUE_NUMBER):
            print('ℹ 该 Issue 已入库，跳过')
            return

    # 提交者填写的描述（简介 + 功能描述）优先；若都留空，则回退到工具本身的 <meta name="description">
    submission_desc = (description + (' ' + features if features else '')).strip()
    final_description = submission_desc or resolve_local_description(url)
    if not submission_desc and final_description:
        print(f'ℹ 投稿未填简介，已自动采用工具本身的简介: {final_description[:40]}...')

    entry = {
        'name': name,
        'description': final_description,
        'path': url,
        'htmlFile': '',
        'isExternal': True,
        'author': github or '',
        'fromIssue': ISSUE_NUMBER
    }
    external.append(entry)
    with open(ext_path, 'w', encoding='utf-8') as f:
        json.dump(external, f, ensure_ascii=False, indent=2)
    print(f'✓ external-tools.json 新增: {name}')

    # ── authors.json ──
    if github:
        authors_path = os.path.join(REPO_ROOT, 'authors.json')
        authors = []
        if os.path.exists(authors_path):
            with open(authors_path, encoding='utf-8') as f:
                authors = json.load(f)
        found = False
        for a in authors:
            if a.get('github', '').lower() == github.lower():
                if name not in a.get('tools', []):
                    a['tools'].append(name)
                    a['count'] = len(a['tools'])
                # 多主页：追加并去重，不再覆盖
                urls = a.get('urls')
                if not isinstance(urls, list):
                    urls = [a['url']] if a.get('url') else []
                if website and website not in urls:
                    urls.append(website)
                a['urls'] = urls
                a['url'] = urls[0] if urls else ''
                found = True
                break
        if not found:
            # Author URL: only set if explicitly provided
            author_url = website or ''
            author_urls = [website] if website else []
            author_name = github  # display name defaults to github username; could add a dedicated field later
            authors.append({
                'name': author_name,
                'github': github,
                'url': author_url,
                'urls': author_urls,
                'tools': [name],
                'count': 1,
                'joinedAt': datetime.date.today().isoformat()
            })
        with open(authors_path, 'w', encoding='utf-8') as f:
            json.dump(authors, f, ensure_ascii=False, indent=2)
        print(f'✓ authors.json 更新: {github} 贡献 {name}')
    else:
        print('ℹ 未提供 GitHub 用户名，不记入贡献者名单')


if __name__ == '__main__':
    main()
