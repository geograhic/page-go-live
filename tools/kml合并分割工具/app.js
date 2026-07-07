/* ============================================================
 * KML 合并/分割工具
 * 纯浏览器端：DOMParser + JSZip + Leaflet
 * ============================================================ */

// ============ CONFIG ============

const TILE_SOURCES = {
  amap_map: { name: '高德地图', url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', sub: '1234', attr: '© 高德' },
  amap_sat: { name: '高德卫星', url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', sub: '1234', attr: '© 高德' },
  osm: { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', sub: 'abc', attr: '© OpenStreetMap' },
  google_map: { name: 'Google 地图', url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', sub: '0123', attr: '© Google' },
  google_sat: { name: 'Google 卫星', url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', sub: '0123', attr: '© Google' },
};

// ============ STATE ============

const state = {
  kmlFiles: [],        // [{ name, text, doc, placemarks, styles, stats }]
  boundaryDoc: null,   // boundary KML for region split
  boundaryCoords: null,
  map: null,
  tileLayer: null,
  dataLayer: null,
  boundaryLayer: null,
  operation: 'merge',  // 'merge' | 'split'
  splitMode: 'attr',
  settings: { showMap: true, defaultTile: 'amap_map' },
  results: [],         // generated output files
};

// ============ GCJ02 ============

const GCJ02 = {
  a: 6378245.0, ee: 0.00669342162296594323,
  transformLat(x, y) {
    let r = -100 + 2*x + 3*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x));
    r += (20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
    r += (20*Math.sin(y*Math.PI)+40*Math.sin(y/3*Math.PI))*2/3;
    r += (160*Math.sin(y/12*Math.PI)+320*Math.sin(y*Math.PI/30))*2/3;
    return r;
  },
  transformLng(x, y) {
    let r = 300 + x + 2*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x));
    r += (20*Math.sin(6*x*Math.PI)+20*Math.sin(2*x*Math.PI))*2/3;
    r += (20*Math.sin(x*Math.PI)+40*Math.sin(x/3*Math.PI))*2/3;
    r += (150*Math.sin(x/12*Math.PI)+66*Math.sin(x/30*Math.PI))*2/3;
    return r;
  },
  wgs2gcj(lng, lat) {
    let dLat = this.transformLat(lng-105, lat-35);
    let dLng = this.transformLng(lng-105, lat-35);
    const radLat = lat*Math.PI/180;
    let magic = Math.sin(radLat); magic = 1 - this.ee*magic*magic;
    const sm = Math.sqrt(magic);
    dLat = dLat*180/((this.a*(1-this.ee))/(magic*sm)*Math.PI);
    dLng = dLng*180/(this.a/sm*Math.cos(radLat)*Math.PI);
    return [lng+dLng, lat+dLat];
  },
  gcj2wgs(lng, lat) {
    let [g,g2] = [lng, lat];
    for (let i=0; i<30; i++) {
      const [tx,ty] = this.wgs2gcj(g,g2);
      const dLng = lng-tx, dLat = lat-ty;
      g += dLng; g2 += dLat;
      if (Math.abs(dLng)<1e-9 && Math.abs(dLat)<1e-9) break;
    }
    return [g, g2];
  },
};

// ============ KML PARSING ============

async function handleFiles(fileList) {
  const files = Array.from(fileList);
  for (const f of files) {
    if (f.name.toLowerCase().endsWith('.kmz')) {
      const buf = await f.arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      for (const name in zip.files) {
        if (name.toLowerCase().endsWith('.kml')) {
          const text = await zip.files[name].async('text');
          addKmlFile(f.name.replace(/\.kmz$/i, '.kml'), text);
        }
      }
    } else if (f.name.toLowerCase().endsWith('.kml')) {
      const text = await f.text();
      addKmlFile(f.name, text);
    }
  }
  updateFileList();
  updateStats();
  showSections();
  renderMapData();
  if (state.settings.autoFit) setTimeout(fitBounds, 200);
}

function addKmlFile(name, text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  // Check for parse errors
  if (doc.querySelector('parsererror')) {
    console.error('XML parse error in', name);
    updateStatus(`⚠ ${name} XML 解析错误`, 'error');
    return;
  }

  const placemarks = [];
  const pmElements = doc.getElementsByTagName('Placemark');
  for (let i = 0; i < pmElements.length; i++) {
    placemarks.push(parsePlacemark(pmElements[i]));
  }

  const styles = [];
  const styleElements = doc.getElementsByTagName('Style');
  for (let i = 0; i < styleElements.length; i++) {
    const el = styleElements[i];
    const id = el.getAttribute('id');
    if (id) styles.push({ id, element: el.cloneNode(true) });
  }

  const stats = computeStats(placemarks);

  state.kmlFiles.push({ name, text, doc, placemarks, styles, stats });
}

function parsePlacemark(pmEl) {
  const nameEl = pmEl.getElementsByTagName('name')[0];
  const name = nameEl ? nameEl.textContent : '';

  // ExtendedData - <Data name="x"><value>y</value></Data> (inline form)
  const extData = {};
  const dataEls = pmEl.getElementsByTagName('Data');
  for (let i = 0; i < dataEls.length; i++) {
    const el = dataEls[i];
    const fieldName = el.getAttribute('name');
    const valueEl = el.getElementsByTagName('value')[0];
    if (fieldName && valueEl) extData[fieldName] = valueEl.textContent;
  }

  // SchemaData - <SimpleData name="x">y</SimpleData> (ArcGIS/QGIS exported form)
  const simpleDataEls = pmEl.getElementsByTagName('SimpleData');
  for (let i = 0; i < simpleDataEls.length; i++) {
    const el = simpleDataEls[i];
    const fieldName = el.getAttribute('name');
    if (fieldName && !extData[fieldName]) extData[fieldName] = el.textContent.trim();
  }

  // Style URL
  const styleUrlEl = pmEl.getElementsByTagName('styleUrl')[0];
  const styleUrl = styleUrlEl ? styleUrlEl.textContent : '';

  // Geometry
  const geom = parseGeometry(pmEl);

  // Folder path (parent folders)
  let folderPath = '';
  let parent = pmEl.parentNode;
  while (parent && parent.nodeName !== 'Document' && parent.nodeName !== 'kml') {
    if (parent.nodeName === 'Folder') {
      const folderNameEl = parent.getElementsByTagName('name')[0];
      const folderName = folderNameEl ? folderNameEl.textContent : 'unnamed';
      folderPath = folderPath ? folderName + '/' + folderPath : folderName;
    }
    parent = parent.parentNode;
  }

  return { element: pmEl.cloneNode(true), name, extData, styleUrl, geom, folderPath };
}

function parseGeometry(pmEl) {
  const point = pmEl.getElementsByTagName('Point')[0];
  const line = pmEl.getElementsByTagName('LineString')[0];
  const multi = pmEl.getElementsByTagName('MultiGeometry')[0];
  // Check MultiGeometry BEFORE Polygon/Point/LineString because getElementsByTagName
  // is recursive and would otherwise return descendants of the MultiGeometry first.
  if (multi) {
    const geoms = [];
    for (let i = 0; i < multi.childNodes.length; i++) {
      const child = multi.childNodes[i];
      if (child.nodeType !== 1) continue;
      const childName = child.nodeName;
      if (childName === 'Point' || childName === 'LineString' || childName === 'Polygon') {
        const fakePm = document.createElement('Placemark');
        fakePm.appendChild(child.cloneNode(true));
        geoms.push(parseGeometry(fakePm));
      }
    }
    return { type: 'MultiGeometry', geometries: geoms };
  }

  const polygon = pmEl.getElementsByTagName('Polygon')[0];

  if (point) {
    const coords = parseCoords(point.getElementsByTagName('coordinates')[0]?.textContent);
    return { type: 'Point', coordinates: coords[0] || [], styleUrl: getStyleUrl(point) };
  }
  if (line) {
    const coords = parseCoords(line.getElementsByTagName('coordinates')[0]?.textContent);
    return { type: 'LineString', coordinates: coords, styleUrl: getStyleUrl(line) };
  }
  if (polygon) {
    const outer = parseCoords(polygon.getElementsByTagName('outerBoundaryIs')[0]
      ?.getElementsByTagName('coordinates')[0]?.textContent);
    const inner = [];
    const innerEls = polygon.getElementsByTagName('innerBoundaryIs');
    for (let i = 0; i < innerEls.length; i++) {
      const c = parseCoords(innerEls[i].getElementsByTagName('coordinates')[0]?.textContent);
      inner.push(c);
    }
    return { type: 'Polygon', coordinates: { outer, inner }, styleUrl: getStyleUrl(polygon) };
  }
  return null;
}

function getStyleUrl(el) {
  if (!el) return '';
  const styleUrlEl = el.getElementsByTagName('styleUrl')[0];
  return styleUrlEl ? styleUrlEl.textContent.trim() : '';
}

function parseCoords(text) {
  if (!text) return [];
  return text.trim().split(/\s+/).map(p => {
    const parts = p.split(',');
    return [parseFloat(parts[0]), parseFloat(parts[1])];
  });
}

function getGeomTypeName(geom) {
  if (!geom) return 'Unknown';
  if (geom.type === 'MultiGeometry') {
    const types = (geom.geometries || []).map(g => g.type);
    if (types.every(t => t === 'Point')) return 'MultiPoint';
    if (types.every(t => t === 'LineString')) return 'MultiLineString';
    if (types.every(t => t === 'Polygon')) return 'MultiPolygon';
    return 'MultiGeometry';
  }
  return geom.type;
}

function computeStats(placemarks) {
  let pointCount = 0, lineCount = 0, polyCount = 0, multiCount = 0;
  const fieldSet = new Set();

  for (const pm of placemarks) {
    const t = getGeomTypeName(pm.geom);
    if (t === 'Point' || t === 'MultiPoint') pointCount++;
    else if (t === 'LineString' || t === 'MultiLineString') lineCount++;
    else if (t === 'Polygon' || t === 'MultiPolygon') polyCount++;
    else multiCount++;

    for (const k of Object.keys(pm.extData)) fieldSet.add(k);
  }

  return {
    total: placemarks.length,
    points: pointCount, lines: lineCount, polygons: polyCount, other: multiCount,
    fields: Array.from(fieldSet),
  };
}

// ============ STATISTICS DISPLAY ============

function updateFileList() {
  const el = document.getElementById('file-list');
  el.innerHTML = state.kmlFiles.map((f, i) => `
    <div class="file-item">
      <span class="file-name">${f.name}</span>
      <span class="file-meta">${f.stats.total} 要素</span>
      <span class="file-remove" onclick="removeFile(${i})">✕</span>
    </div>
  `).join('');
}

function removeFile(index) {
  state.kmlFiles.splice(index, 1);
  updateFileList();
  updateStats();
  if (state.kmlFiles.length === 0) {
    ['op-section', 'coord-section', 'output-section'].forEach(id =>
      document.getElementById(id).style.display = 'none');
  }
  renderMapData();
}

function updateStats() {
  const el = document.getElementById('stats');
  if (state.kmlFiles.length === 0) { el.style.display = 'none'; return; }

  const totalPm = state.kmlFiles.reduce((s, f) => s + f.stats.total, 0);
  const totalPt = state.kmlFiles.reduce((s, f) => s + f.stats.points, 0);
  const totalLn = state.kmlFiles.reduce((s, f) => s + f.stats.lines, 0);
  const totalPy = state.kmlFiles.reduce((s, f) => s + f.stats.polygons, 0);
  const allFields = new Set();
  state.kmlFiles.forEach(f => f.stats.fields.forEach(field => allFields.add(field)));

  el.style.display = 'block';
  el.innerHTML = `
    <div class="info-row"><span class="info-label">文件数</span><span class="info-value">${state.kmlFiles.length}</span></div>
    <div class="info-row"><span class="info-label">要素总数</span><span class="info-value">${totalPm}</span></div>
    <div class="info-row"><span class="info-label">几何类型</span><span class="info-value">
      ${totalPt ? `<span class="info-tag tag-point">点 ${totalPt}</span>` : ''}
      ${totalLn ? `<span class="info-tag tag-line">线 ${totalLn}</span>` : ''}
      ${totalPy ? `<span class="info-tag tag-poly">面 ${totalPy}</span>` : ''}
    </span></div>
    <div class="info-row"><span class="info-label">属性字段</span><span class="info-value">${allFields.size} 个</span></div>
    <div style="margin-top:6px;font-size:11px;color:var(--text-dim);">
      ${Array.from(allFields).map(f => `<span class="info-tag tag-point">${f}</span>`).join('')}
    </div>
  `;

  // Populate attribute field selector
  const attrSelect = document.getElementById('attr-field');
  const currentVal = attrSelect.value;
  attrSelect.innerHTML = Array.from(allFields).map(f => `<option value="${f}">${f}</option>`).join('');
  if (allFields.has(currentVal)) attrSelect.value = currentVal;

  updateCountPreview();
}

function updateCountPreview() {
  const total = state.kmlFiles.reduce((s, f) => s + f.stats.total, 0);
  const per = parseInt(document.getElementById('count-per-file')?.value) || 100;
  const files = Math.ceil(total / per);
  const el = document.getElementById('count-preview');
  if (el) el.textContent = `将分成 ${files} 个文件，每文件最多 ${per} 个要素`;
}

function showSections() {
  ['op-section', 'coord-section', 'output-section'].forEach(id =>
    document.getElementById(id).style.display = 'block');
  document.getElementById('btn-execute').disabled = false;
}

// ============ MERGE ============

function executeMerge() {
  const mode = document.getElementById('merge-mode').value;
  const styleMode = document.getElementById('merge-style').value;
  const coordMode = document.getElementById('coord-mode').value;

  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
  parts.push('<Document>');
  const prefix = document.getElementById('output-prefix').value || 'merged';
  parts.push(`<name>${escapeXml(prefix)}</name>`);

  // Styles
  if (styleMode === 'unify') {
    const lineColor = document.getElementById('merge-line-color').value;
    const lineWidth = document.getElementById('merge-line-width').value;
    const fillColor = document.getElementById('merge-fill-color').value;
    const fillOpacity = parseInt(document.getElementById('merge-fill-opacity').value);
    parts.push(`<Style id="unified"><LineStyle><color>${colorToKml(lineColor, 100)}</color><width>${lineWidth}</width></LineStyle><PolyStyle><color>${colorToKml(fillColor, fillOpacity)}</color><fill>1</fill><outline>1</outline></PolyStyle></Style>`);
  } else if (styleMode === 'color') {
    const colors = ['#ff4444', '#4a9eff', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4', '#ff5722', '#8bc34a'];
    state.kmlFiles.forEach((f, i) => {
      const c = colors[i % colors.length];
      parts.push(`<Style id="file${i}"><LineStyle><color>${colorToKml(c, 100)}</color><width>1.5</width></LineStyle><PolyStyle><color>${colorToKml(c, 20)}</color><fill>1</fill><outline>1</outline></PolyStyle></Style>`);
    });
  } else {
    // Keep original styles
    state.kmlFiles.forEach((f, i) => {
      f.styles.forEach(s => {
        const newEl = s.element.cloneNode(true);
        newEl.setAttribute('id', `${f.name}_${s.id}`);
        parts.push(new XMLSerializer().serializeToString(newEl));
      });
    });
  }

  // Placemarks
  state.kmlFiles.forEach((file, fileIdx) => {
    if (mode === 'folder') {
      parts.push(`<Folder><name>${escapeXml(file.name)}</name>`);
    }

    for (const pm of file.placemarks) {
      let pmEl = pm.element.cloneNode(true);

      // Apply style
      if (styleMode === 'unify') {
        const styleUrlEls = pmEl.getElementsByTagName('styleUrl');
        for (let i = styleUrlEls.length - 1; i >= 0; i--) styleUrlEls[i].remove();
        // Add inline styleUrl
        const styleUrl = document.createElement('styleUrl');
        styleUrl.textContent = '#unified';
        pmEl.insertBefore(styleUrl, pmEl.firstChild);
      } else if (styleMode === 'color') {
        const styleUrlEls = pmEl.getElementsByTagName('styleUrl');
        for (let i = styleUrlEls.length - 1; i >= 0; i--) styleUrlEls[i].remove();
        const styleUrl = document.createElement('styleUrl');
        styleUrl.textContent = `#file${fileIdx}`;
        pmEl.insertBefore(styleUrl, pmEl.firstChild);
      } else if (styleMode === 'keep') {
        // Fix styleUrl references
        const styleUrlEls = pmEl.getElementsByTagName('styleUrl');
        for (let i = 0; i < styleUrlEls.length; i++) {
          const old = styleUrlEls[i].textContent.replace('#', '');
          styleUrlEls[i].textContent = `#${file.name}_${old}`;
        }
      }

      // Apply coordinate conversion
      if (coordMode !== 'none') {
        applyCoordConversion(pmEl, coordMode);
      }

      parts.push(new XMLSerializer().serializeToString(pmEl));
    }

    if (mode === 'folder') parts.push('</Folder>');
  });

  parts.push('</Document>');
  parts.push('</kml>');

  const content = parts.join('\n');
  return [{ filename: `${prefix}.kml`, content }];
}

// ============ SPLIT ============

function executeSplit() {
  const splitMode = state.splitMode;
  const coordMode = document.getElementById('coord-mode').value;
  const prefix = document.getElementById('output-prefix').value || 'split';

  // Combine all placemarks from all files
  const allPm = state.kmlFiles.flatMap(f => f.placemarks.map(pm => ({ ...pm, sourceFile: f.name, sourceStyles: f.styles })));

  let groups = []; // [{ key, placemarks }]

  switch (splitMode) {
    case 'attr': {
      const field = document.getElementById('attr-field').value;
      const groupMap = new Map();
      for (const pm of allPm) {
        const val = String(pm.extData[field] ?? '无属性');
        if (!groupMap.has(val)) groupMap.set(val, []);
        groupMap.get(val).push(pm);
      }
      groups = Array.from(groupMap.entries()).map(([key, pms]) => ({ key, placemarks: pms }));
      break;
    }

    case 'name': {
      const nameMode = document.getElementById('name-mode').value;
      const groupMap = new Map();
      for (const pm of allPm) {
        let key = pm.name || '无名称';
        if (nameMode === 'prefix') key = key.split(/[\s_-]/)[0] || key;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(pm);
      }
      groups = Array.from(groupMap.entries()).map(([key, pms]) => ({ key, placemarks: pms }));
      break;
    }

    case 'folder': {
      const groupMap = new Map();
      for (const pm of allPm) {
        const key = pm.folderPath || '根目录';
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(pm);
      }
      groups = Array.from(groupMap.entries()).map(([key, pms]) => ({ key, placemarks: pms }));
      break;
    }

    case 'geom': {
      const typeMap = { Point: '点要素', LineString: '线要素', Polygon: '面要素', MultiPoint: '多点', MultiLineString: '多线', MultiPolygon: '多面', MultiGeometry: '复合', Unknown: '未知' };
      const groupMap = new Map();
      for (const pm of allPm) {
        const t = getGeomTypeName(pm.geom);
        const key = typeMap[t] || t;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key).push(pm);
      }
      groups = Array.from(groupMap.entries()).map(([key, pms]) => ({ key, placemarks: pms }));
      break;
    }

    case 'region': {
      if (!state.boundaryCoords) {
        updateStatus('⚠ 请先上传边界 KML', 'error');
        return null;
      }
      const clipMode = document.getElementById('clip-mode').value;
      const filterBasis = document.getElementById('filter-basis').value;
      const inside = allPm.filter(pm => isPlacemarkInRegion(pm, filterBasis));

      if (clipMode === 'clip') {
        // Attempt clipping (only for polygons)
        const clipped = inside.map(pm => clipPlacemarkToBoundary(pm));
        groups = [{ key: '裁剪结果', placemarks: clipped }];
      } else {
        groups = [{ key: '范围内要素', placemarks: inside }];
      }
      break;
    }

    case 'count': {
      const per = parseInt(document.getElementById('count-per-file').value) || 100;
      const chunks = [];
      for (let i = 0; i < allPm.length; i += per) {
        chunks.push({ key: `${i+1}-${Math.min(i+per, allPm.length)}`, placemarks: allPm.slice(i, i + per) });
      }
      groups = chunks;
      break;
    }
  }

  // Generate KML for each group
  const results = [];
  for (const group of groups) {
    const safeKey = String(group.key).replace(/[<>:"/\\|?*]/g, '_');
    const content = buildSplitKml(group, prefix, coordMode);
    results.push({ filename: `${safeKey}.kml`, content });
  }
  return results;
}

function buildSplitKml(group, prefix, coordMode) {
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
  parts.push('<Document>');
  parts.push(`<name>${escapeXml(String(group.key))}</name>`);

  // Copy styles from source files
  const styleIds = new Set();
  for (const pm of group.placemarks) {
    if (pm.styleUrl) styleIds.add(pm.styleUrl.replace('#', ''));
  }
  // Include all styles from source files (simple approach)
  state.kmlFiles.forEach(f => {
    f.styles.forEach(s => {
      parts.push(new XMLSerializer().serializeToString(s.element));
    });
  });

  for (const pm of group.placemarks) {
    let pmEl = pm.element.cloneNode(true);
    if (coordMode !== 'none') applyCoordConversion(pmEl, coordMode);
    parts.push(new XMLSerializer().serializeToString(pmEl));
  }

  parts.push('</Document>');
  parts.push('</kml>');
  return parts.join('\n');
}

// ============ REGION CLIPPING ============

function isPlacemarkInRegion(pm, basis) {
  if (!pm.geom || !state.boundaryCoords) return false;

  const polys = state.boundaryCoords; // array of polygon coordinate arrays

  switch (pm.geom.type) {
    case 'Point': {
      const [x, y] = pm.geom.coordinates;
      return polys.some(poly => pointInPolygon([x, y], poly));
    }
    case 'MultiGeometry': {
      return pm.geom.geometries.some(g => {
        const fakePm = { geom: g };
        return isPlacemarkInRegion(fakePm, basis);
      });
    }
    case 'LineString': {
      if (basis === 'center') {
        const coords = pm.geom.coordinates;
        const cx = coords.reduce((s, c) => s + c[0], 0) / coords.length;
        const cy = coords.reduce((s, c) => s + c[1], 0) / coords.length;
        return polys.some(poly => pointInPolygon([cx, cy], poly));
      } else {
        return pm.geom.coordinates.some(c => polys.some(poly => pointInPolygon(c, poly)));
      }
    }
    case 'Polygon': {
      const outer = pm.geom.coordinates.outer;
      if (basis === 'center') {
        const cx = outer.reduce((s, c) => s + c[0], 0) / outer.length;
        const cy = outer.reduce((s, c) => s + c[1], 0) / outer.length;
        return polys.some(poly => pointInPolygon([cx, cy], poly));
      } else {
        return outer.some(c => polys.some(poly => pointInPolygon(c, poly)));
      }
    }
    default:
      return false;
  }
}

function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function clipPlacemarkToBoundary(pm) {
  // For polygons: use Sutherland-Hodgman clipping
  // For lines/points: keep as-is (already filtered)
  if (!pm.geom) return pm;

  if (pm.geom.type === 'Polygon' && state.boundaryCoords.length > 0) {
    const clipPoly = state.boundaryCoords[0]; // use first boundary polygon
    const clippedOuter = sutherlandHodgman(pm.geom.coordinates.outer, clipPoly);
    if (clippedOuter.length < 3) return pm; // skip if too small

    // Rebuild KML element
    let pmEl = pm.element.cloneNode(true);
    const coordEls = pmEl.getElementsByTagName('coordinates');
    if (coordEls[0]) {
      coordEls[0].textContent = clippedOuter.map(c => `${c[0]},${c[1]},0`).join(' ');
    }
    // Remove inner boundaries (holes) for simplicity
    const innerEls = pmEl.getElementsByTagName('innerBoundaryIs');
    for (let i = innerEls.length - 1; i >= 0; i--) innerEls[i].remove();

    return { ...pm, element: pmEl };
  }

  return pm;
}

function sutherlandHodgman(subject, clip) {
  // clip must be a closed polygon (first point = last point)
  let clipRing = clip;
  if (clipRing[0][0] !== clipRing[clipRing.length - 1][0] || clipRing[0][1] !== clipRing[clipRing.length - 1][1]) {
    clipRing = [...clipRing, clipRing[0]];
  }

  let output = subject.slice();
  if (output[0][0] !== output[output.length - 1][0] || output[0][1] !== output[output.length - 1][1]) {
    output = [...output, output[0]];
  }

  for (let i = 0; i < clipRing.length - 1; i++) {
    const input = output;
    output = [];
    if (input.length === 0) break;

    const A = clipRing[i];
    const B = clipRing[i + 1];

    for (let j = 0; j < input.length - 1; j++) {
      const P = input[j];
      const Q = input[j + 1];
      const Pin = isLeft(P, A, B);
      const Qin = isLeft(Q, A, B);

      if (Pin && Qin) {
        output.push(Q);
      } else if (Pin && !Qin) {
        output.push(intersect(P, Q, A, B));
      } else if (!Pin && Qin) {
        output.push(intersect(P, Q, A, B));
        output.push(Q);
      }
    }
    if (output.length > 0) {
      output.push(output[0]); // close ring
    }
  }
  return output;
}

function isLeft(P, A, B) {
  return (B[0] - A[0]) * (P[1] - A[1]) - (B[1] - A[1]) * (P[0] - A[0]) >= 0;
}

function intersect(P, Q, A, B) {
  const dx1 = Q[0] - P[0], dy1 = Q[1] - P[1];
  const dx2 = B[0] - A[0], dy2 = B[1] - A[1];
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-12) return P;
  const t = ((A[0] - P[0]) * dy2 - (A[1] - P[1]) * dx2) / denom;
  return [P[0] + t * dx1, P[1] + t * dy1];
}

// ============ COORD CONVERSION ============

function applyCoordConversion(pmEl, mode) {
  const coordEls = pmEl.getElementsByTagName('coordinates');
  for (let i = 0; i < coordEls.length; i++) {
    const text = coordEls[i].textContent;
    const pts = text.trim().split(/\s+/);
    const newPts = pts.map(pt => {
      const parts = pt.split(',');
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (isNaN(lng) || isNaN(lat)) return pt;
      let result;
      if (mode === 'wgs2gcj') result = GCJ02.wgs2gcj(lng, lat);
      else if (mode === 'gcj2wgs') result = GCJ02.gcj2wgs(lng, lat);
      else return pt;
      return `${result[0].toFixed(10)},${result[1].toFixed(10)},${parts[2] || '0'}`;
    });
    coordEls[i].textContent = newPts.join(' ');
  }
}

// ============ MAP PREVIEW ============

function initMap() {
  if (!state.settings.showMap) return;
  if (state.map) return;
  state.map = L.map('map', { zoomControl: true, attributionControl: true }).setView([23.13, 113.26], 10);
  setTileSource(state.settings.defaultTile);
}

function setTileSource(key, customUrl) {
  if (!state.map) return;
  if (state.tileLayer) state.map.removeLayer(state.tileLayer);
  let url, sub, attr;
  if (key === 'custom' && customUrl) {
    url = customUrl; sub = 'abc'; attr = '自定义';
  } else {
    const src = TILE_SOURCES[key]; if (!src) return;
    url = src.url; sub = src.sub; attr = src.attr;
  }
  state.tileLayer = L.tileLayer(url, { subdomains: sub, attribution: attr, maxZoom: 20 }).addTo(state.map);
}

function renderMapData() {
  if (!state.map || state.kmlFiles.length === 0) return;
  if (state.dataLayer) state.map.removeLayer(state.dataLayer);

  const colors = ['#ff4444', '#4a9eff', '#4caf50', '#ff9800', '#9c27b0', '#00bcd4'];
  const layers = [];

  state.kmlFiles.forEach((file, idx) => {
    const color = colors[idx % colors.length];
    const geojson = kmlToGeoJSON(file.placemarks);
    const layer = L.geoJSON(geojson, {
      style: (feat) => {
        const styleUrl = feat.properties?._styleUrl || '';
        // Glyph/outline sub-geometries should be drawn as thin strokes with no fill
        // so the digit contours remain visible on top of grid cells.
        if (styleUrl.includes('glyph')) {
          return { color: '#222222', weight: 1.2, fillOpacity: 0, opacity: 0.9 };
        }
        return { color, weight: 1.5, fillColor: color, fillOpacity: 0.15 };
      },
      pointToLayer: (feat, latlng) => L.circleMarker(latlng, { radius: 4, color, fillColor: color, fillOpacity: 0.5 }),
      onEachFeature: (feat, lyr) => {
        const props = feat.properties || {};
        const html = Object.entries(props).map(([k, v]) => `<b>${k}</b>: ${v}`).join('<br>');
        lyr.bindPopup(html);
      }
    });
    layers.push(layer);
  });

  state.dataLayer = L.layerGroup(layers).addTo(state.map);
}

function kmlToGeoJSON(placemarks) {
  const features = [];
  placemarks.forEach(pm => {
    const baseProps = { name: pm.name, ...pm.extData, folder: pm.folderPath };
    const items = flattenKmlGeom(pm.geom);
    if (items.length === 0) {
      features.push({ type: 'Feature', geometry: null, properties: baseProps });
      return;
    }
    if (items.length === 1) {
      const item = items[0];
      features.push({
        type: 'Feature',
        geometry: item.geojsonGeom,
        properties: item.styleUrl ? { ...baseProps, _styleUrl: item.styleUrl } : baseProps
      });
      return;
    }

    // Multiple sub-geometries: split only when there are different styleUrls,
    // otherwise keep them as a single Multi* geometry for cleaner rendering.
    const uniqueStyles = new Set(items.map(i => i.styleUrl));
    if (uniqueStyles.size <= 1) {
      const types = items.map(i => i.geojsonGeom.type);
      let mergedGeom;
      if (types.every(t => t === 'Point')) {
        mergedGeom = { type: 'MultiPoint', coordinates: items.map(i => i.geojsonGeom.coordinates) };
      } else if (types.every(t => t === 'LineString')) {
        mergedGeom = { type: 'MultiLineString', coordinates: items.map(i => i.geojsonGeom.coordinates) };
      } else if (types.every(t => t === 'Polygon')) {
        mergedGeom = { type: 'MultiPolygon', coordinates: items.map(i => i.geojsonGeom.coordinates) };
      } else {
        mergedGeom = { type: 'GeometryCollection', geometries: items.map(i => i.geojsonGeom) };
      }
      features.push({
        type: 'Feature',
        geometry: mergedGeom,
        properties: items[0].styleUrl ? { ...baseProps, _styleUrl: items[0].styleUrl } : baseProps
      });
      return;
    }

    // Different styles (e.g. grid + glyph) -> split into separate features so
    // Leaflet can style each sub-geometry independently.
    items.forEach(item => {
      features.push({
        type: 'Feature',
        geometry: item.geojsonGeom,
        properties: item.styleUrl ? { ...baseProps, _styleUrl: item.styleUrl } : baseProps
      });
    });
  });
  return { type: 'FeatureCollection', features };
}

function flattenKmlGeom(geom) {
  if (!geom) return [];
  switch (geom.type) {
    case 'Point':
      return [{ geojsonGeom: { type: 'Point', coordinates: geom.coordinates }, styleUrl: geom.styleUrl || '' }];
    case 'LineString':
      return [{ geojsonGeom: { type: 'LineString', coordinates: geom.coordinates }, styleUrl: geom.styleUrl || '' }];
    case 'Polygon':
      return [{ geojsonGeom: { type: 'Polygon', coordinates: [geom.coordinates.outer, ...geom.coordinates.inner] }, styleUrl: geom.styleUrl || '' }];
    case 'MultiGeometry': {
      const items = [];
      for (const g of geom.geometries || []) items.push(...flattenKmlGeom(g));
      return items;
    }
    default: return [];
  }
}

function fitBounds() {
  if (!state.map || !state.dataLayer) return;
  try {
    const bounds = L.featureGroup(state.dataLayer.getLayers()).getBounds();
    if (bounds.isValid()) state.map.fitBounds(bounds, { padding: [20, 20] });
  } catch (e) {}
}

// ============ BOUNDARY UPLOAD ============

async function handleBoundaryFile(file) {
  const text = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  state.boundaryDoc = doc;

  const coords = [];
  const polygons = doc.getElementsByTagName('Polygon');
  for (let i = 0; i < polygons.length; i++) {
    const outerEl = polygons[i].getElementsByTagName('outerBoundaryIs')[0];
    const coordEl = outerEl?.getElementsByTagName('coordinates')[0];
    if (coordEl) {
      const poly = parseCoords(coordEl.textContent);
      coords.push(poly);
    }
  }
  state.boundaryCoords = coords;

  const info = document.getElementById('boundary-info');
  info.style.display = 'block';
  info.innerHTML = `<div class="info-row"><span class="info-label">边界文件</span><span class="info-value">${file.name}</span></div>
    <div class="info-row"><span class="info-label">多边形数</span><span class="info-value">${coords.length}</span></div>`;

  // Render boundary on map
  if (state.map && coords.length > 0) {
    if (state.boundaryLayer) state.map.removeLayer(state.boundaryLayer);
    const geojson = {
      type: 'FeatureCollection',
      features: coords.map(poly => ({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [poly] },
        properties: { name: 'boundary' }
      }))
    };
    state.boundaryLayer = L.geoJSON(geojson, {
      style: { color: '#ff4444', weight: 2, fillColor: '#ff4444', fillOpacity: 0.1, dashArray: '5 5' }
    }).addTo(state.map);
  }

  updateStatus(`边界文件已加载：${coords.length} 个多边形`);
}

// ============ OUTPUT ============

async function executeOperation() {
  const btn = document.getElementById('btn-execute');
  btn.disabled = true; btn.textContent = '执行中...';
  updateStatus('正在处理...');

  try {
    let results;
    if (state.operation === 'merge') {
      results = executeMerge();
    } else {
      results = executeSplit();
    }

    if (!results || results.length === 0) {
      updateStatus('⚠ 未生成任何文件', 'error');
      return;
    }

    state.results = results;

    // Download
    await downloadResults(results);

    updateStatus(`✓ 已生成 ${results.length} 个文件`, 'success');
  } catch (e) {
    console.error(e);
    updateStatus(`✗ 执行失败: ${e.message}`, 'error');
  } finally {
    btn.disabled = false; btn.textContent = '执行操作';
  }
}

async function downloadResults(results) {
  const format = document.getElementById('output-format').value;
  const prefix = document.getElementById('output-prefix').value || 'output';

  if (results.length === 1 && format === 'kml') {
    const blob = new Blob([results[0].content], { type: 'application/vnd.google-earth.kml+xml' });
    triggerDownload(blob, results[0].filename);
  } else if (format === 'kmz' && results.length === 1) {
    const zip = new JSZip();
    zip.file('doc.kml', results[0].content);
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, results[0].filename.replace('.kml', '.kmz'));
  } else {
    // Multiple files → ZIP
    const zip = new JSZip();
    for (const r of results) {
      zip.file(r.filename, r.content);
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const ext = format === 'kmz' ? 'kmz' : 'zip';
    triggerDownload(blob, `${prefix}.${ext}`);
  }
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============ HELPERS ============

function colorToKml(hexColor, opacityPercent) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const a = Math.round((opacityPercent / 100) * 255);
  return a.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + r.toString(16).padStart(2, '0');
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function updateStatus(msg, type) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  const genEl = document.getElementById('execute-status');
  if (genEl) { genEl.textContent = msg; genEl.className = `status-msg ${type || ''}`; }
}

function updateCoordHelp() {
  const el = document.getElementById('coord-help-split');
  const mode = document.getElementById('coord-mode').value;
  let msg = '';
  if (mode === 'none') msg = '保持 KML 中的原始坐标值，不做任何转换。';
  else if (mode === 'wgs2gcj') msg = '将 WGS84 坐标转换为 <b>GCJ02（火星坐标）</b>。适用于将标准 KML 在高德地图/Google 中国版上正确显示。';
  else if (mode === 'gcj2wgs') msg = '将 GCJ02 坐标转换回 <b>WGS84</b>。适用于将中国偏移坐标还原为国际标准坐标。';
  el.innerHTML = msg;
}

// ============ EVENT HANDLERS ============

function setupEventHandlers() {
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', e => handleFiles(e.target.files));

  // Settings
  document.getElementById('btn-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'flex';
  });
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').style.display = 'none';
  });
  document.getElementById('btn-save-settings').addEventListener('click', () => {
    state.settings.showMap = document.getElementById('setting-show-map').checked;
    state.settings.defaultTile = document.getElementById('setting-default-tile').value;
    applySettings();
    document.getElementById('settings-modal').style.display = 'none';
  });

  // Op tabs
  document.querySelectorAll('.op-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.op-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.operation = tab.dataset.op;
      document.getElementById('merge-options').classList.toggle('active', state.operation === 'merge');
      document.getElementById('split-options').classList.toggle('active', state.operation === 'split');
    });
  });

  // Merge style change
  document.getElementById('merge-style').addEventListener('change', e => {
    document.getElementById('unify-style-group').style.display = e.target.value === 'unify' ? 'block' : 'none';
  });

  // Split mode change
  document.getElementById('split-mode').addEventListener('change', e => {
    state.splitMode = e.target.value;
    document.querySelectorAll('.split-config').forEach(el => el.style.display = 'none');
    const cfg = document.getElementById('cfg-' + e.target.value);
    if (cfg) cfg.style.display = 'block';
  });

  // Coord mode
  document.getElementById('coord-mode').addEventListener('change', updateCoordHelp);

  // Count preview
  document.getElementById('count-per-file').addEventListener('input', updateCountPreview);

  // Boundary upload
  const bUpload = document.getElementById('boundary-upload');
  const bInput = document.getElementById('boundary-input');
  bUpload.addEventListener('click', () => bInput.click());
  bInput.addEventListener('change', e => {
    if (e.target.files[0]) handleBoundaryFile(e.target.files[0]);
  });

  // Execute
  document.getElementById('btn-execute').addEventListener('click', executeOperation);

  // Range inputs
  document.getElementById('merge-fill-opacity').addEventListener('input', e => {
    document.getElementById('merge-fill-opacity-val').textContent = e.target.value + '%';
  });

  // Tile source
  document.getElementById('tile-source').addEventListener('change', e => {
    const customInput = document.getElementById('custom-tile-url');
    customInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
    setTileSource(e.target.value, customInput.value);
  });
  document.getElementById('custom-tile-url').addEventListener('change', e => {
    setTileSource('custom', e.target.value);
  });

  // Fit bounds
  document.getElementById('btn-fit-bounds').addEventListener('click', fitBounds);
}

function applySettings() {
  const mapPanel = document.getElementById('map-panel');
  if (state.settings.showMap) {
    mapPanel.classList.remove('hidden');
    if (!state.map) initMap();
    setTimeout(() => state.map?.invalidateSize(), 100);
    if (state.kmlFiles.length > 0) renderMapData();
  } else {
    mapPanel.classList.add('hidden');
  }
  const tileSelect = document.getElementById('tile-source');
  if (tileSelect) tileSelect.value = state.settings.defaultTile;
}

// ============ INIT ============

document.addEventListener('DOMContentLoaded', () => {
  setupEventHandlers();
  initMap();
  updateCoordHelp();
});
