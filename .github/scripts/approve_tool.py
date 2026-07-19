#!/usr/bin/env python3
"""解析被标记为 approved 的 Issue，入库到 external-tools.json 并累加 authors.json。
由 .github/workflows/approve-submission.yml 调用，Issue 正文通过环境变量 ISSUE_BODY 传入。
"""
import os
import re
import json
import datetime

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

    entry = {
        'name': name,
        'description': (description + (' ' + features if features else '')).strip(),
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
                if website:
                    a['url'] = website
                found = True
                break
        if not found:
            # Author URL: only set if explicitly provided
            author_url = website or ''
            author_name = github  # display name defaults to github username; could add a dedicated field later
            authors.append({
                'name': author_name,
                'github': github,
                'url': author_url,
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
