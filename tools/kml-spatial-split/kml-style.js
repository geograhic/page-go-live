/**
 * kml-style.js — KML <Style> 解析与 CSS/Leaflet 样式互转
 * 纯函数，浏览器（window）与 Node（module.exports）共用，便于单测。
 *
 * 关键点：
 *  - KML 颜色为 AABBGGRR（小端：alpha 在前，BGR 非 RGB），需反转。
 *  - 样式通过 styleUrl="#id" 引用，StyleMap 用 <Pair><key>normal|highlight</key><styleUrl> 解析。
 *  - 内联 <Style>（无 id）优先于 styleUrl 引用。
 */
(function (root) {
  'use strict';

  // KML 颜色 aabbggrr → { color:'#RRGGBB', opacity:0..1 }
  function kmlColorToCss(kml) {
    if (!kml) return null;
    let s = String(kml).trim().replace(/^#/, '');
    if (s.length === 6) s = 'ff' + s;          // 无 alpha → 不透明
    if (s.length !== 8) return null;
    const a = parseInt(s.slice(0, 2), 16) / 255;
    const b = s.slice(2, 4);
    const g = s.slice(4, 6);
    const r = s.slice(6, 8);
    return { color: '#' + r + g + b, opacity: a };
  }

  // { color:'#RRGGBB', opacity:0..1 } → KML aabbggrr
  function cssToKmlColor(css, opacity) {
    let s = String(css || '#000000').replace(/^#/, '');
    if (s.length === 3) s = s.split('').map(c => c + c).join('');
    const r = s.slice(0, 2), g = s.slice(2, 4), b = s.slice(4, 6);
    let a = Math.round((opacity == null ? 1 : opacity) * 255).toString(16);
    if (a.length < 2) a = '0' + a;
    return (a + b + g + r).toUpperCase();
  }

  function num(v, d) {
    const n = parseFloat(v);
    return isNaN(n) ? d : n;
  }

  function txtOf(el, tag) {
    const c = el.getElementsByTagName(tag)[0];
    return c ? c.textContent.trim() : '';
  }

  // 解析单个 <Style> 元素为归一化样式对象
  function parseKmlStyle(styleEl) {
    const out = {};
    const ls = styleEl.getElementsByTagName('LineStyle')[0];
    if (ls) {
      const c = txtOf(ls, 'color');
      if (c) { const o = kmlColorToCss(c); if (o) { out.lineColor = o.color; out.lineOpacity = o.opacity; } }
      const w = txtOf(ls, 'width');
      if (w) out.lineWidth = num(w, 1);
    }
    const ps = styleEl.getElementsByTagName('PolyStyle')[0];
    if (ps) {
      const c = txtOf(ps, 'color');
      if (c) { const o = kmlColorToCss(c); if (o) { out.fillColor = o.color; out.fillOpacity = o.opacity; } }
      const f = txtOf(ps, 'fill');
      if (f) out.fill = f !== '0';
      const ol = txtOf(ps, 'outline');
      if (ol) out.outline = ol !== '0';
    }
    const is = styleEl.getElementsByTagName('IconStyle')[0];
    if (is) {
      const h = txtOf(is, 'href');
      if (h) out.iconHref = h;
      const sc = txtOf(is, 'scale');
      if (sc) out.iconScale = num(sc, 1);
      const c = txtOf(is, 'color');
      if (c) { const o = kmlColorToCss(c); if (o) out.iconColor = o.color; }
    }
    const lbs = styleEl.getElementsByTagName('LabelStyle')[0];
    if (lbs) {
      const c = txtOf(lbs, 'color');
      if (c) { const o = kmlColorToCss(c); if (o) out.labelColor = o.color; }
      const sc = txtOf(lbs, 'scale');
      if (sc) out.labelScale = num(sc, 1);
    }
    return out;
  }

  function mergeStyles(base, override) {
    if (!base) return Object.assign({}, override || {});
    if (!override) return Object.assign({}, base);
    return Object.assign({}, base, override);
  }

  // 从 Document 扫描所有 <Style id> 与 <StyleMap id>，建立 id→styleObj
  function buildStyleMap(xmlDoc) {
    const map = new Map();
    const allStyles = xmlDoc.getElementsByTagName('Style');
    for (let i = 0; i < allStyles.length; i++) {
      const el = allStyles[i];
      const id = el.getAttribute('id');
      if (id) map.set(id, parseKmlStyle(el));
    }
    const styleMaps = xmlDoc.getElementsByTagName('StyleMap');
    for (let i = 0; i < styleMaps.length; i++) {
      const sm = styleMaps[i];
      const id = sm.getAttribute('id');
      if (!id) continue;
      const pairs = sm.getElementsByTagName('Pair');
      let normal = null, highlight = null;
      for (let p = 0; p < pairs.length; p++) {
        const key = txtOf(pairs[p], 'key');
        const ref = txtOf(pairs[p], 'styleUrl').replace(/^#/, '');
        const resolved = ref ? (map.get(ref) || null) : null;
        if (key === 'normal') normal = resolved;
        else if (key === 'highlight') highlight = resolved;
      }
      map.set(id, normal || highlight || {});
      if (highlight) map.set(id + '__hl', highlight);
    }
    return map;
  }

  // 解析单个 Placemark 的最终样式（内联 <Style> 优先于 styleUrl 引用）
  function resolvePlacemarkStyle(pm, styleMap) {
    let style = null;
    const inline = pm.getElementsByTagName('Style');
    for (let i = 0; i < inline.length; i++) {
      const id = inline[i].getAttribute('id');
      if (!id || !styleMap.has(id)) {
        style = mergeStyles(style, parseKmlStyle(inline[i]));
      }
    }
    const su = pm.getElementsByTagName('styleUrl');
    if (su.length > 0) {
      const ref = su[0].textContent.trim().replace(/^#/, '');
      if (ref && styleMap.has(ref)) style = mergeStyles(styleMap.get(ref), style);
    }
    return style;
  }

  const api = {
    kmlColorToCss,
    cssToKmlColor,
    parseKmlStyle,
    mergeStyles,
    buildStyleMap,
    resolvePlacemarkStyle,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (typeof window !== 'undefined') {
    Object.assign(window, api);
  }
  if (root && (typeof window === 'undefined' || root !== window)) {
    Object.assign(root, api);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
