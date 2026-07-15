/**
 * KML 按位置分割与选择导出工具
 * 暗色玻璃拟态主题 | 纯原生 JS | Leaflet 地图
 */

/* ====== State ====== */
const state = {
  mode: 'split',

  // Split mode
  gridKml: null,        // { name, xml, features, layer }
  gridFile: null,
  boundaryKmz: [],      // [{ name, xml, polygons, layer, color }]
  boundaryFiles: [],
  splitResults: [],     // [{ name, features, kmlString }]

  // Select mode
  selectKml: null,      // { name, xml, features, layer }
  selectFile: null,
  drawnLayer: null,     // Leaflet FeatureGroup
  drawnShape: null,     // Leaflet polygon/rectangle
  selectedFeatures: [],

  // Map
  map: null,
  tileLayer: null,
  gridLayer: null,
  boundaryLayerGroup: null,

  // Settings
  settings: {
    showMap: true,
    defaultTile: 'amap',
    autoFit: true,
    refScale: false,   // ArcGIS 式参考比例：符号随缩放按 2^(z-refZoom) 缩放
    refZoom: 10,       // 参考级别（锚定缩放级别）
    applySourceStyle: true, // 加载时按源 KML 的 <Style> 渲染（颜色/线宽/填充）
    showPointLabels: true, // 点要素在有名称时渲染为编号/文字徽标（否则为彩色圆点）
  },
};

/* ====== Tile Sources ====== */
const TILE_SOURCES = {
  amap: {
    name: '高德地图',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: '1234',
    maxZoom: 18,
    attribution: '&copy; 高德地图',
  },
  amap_sat: {
    name: '高德卫星',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    subdomains: '1234',
    maxZoom: 18,
    attribution: '&copy; 高德地图',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap',
  },
  google: {
    name: 'Google 地图',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxZoom: 20,
    attribution: '&copy; Google',
  },
  google_sat: {
    name: 'Google 卫星',
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    subdomains: '0123',
    maxZoom: 20,
    attribution: '&copy; Google',
  },
};

const PALLETTE = ['#4a9eff', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4', '#ff5722', '#8bc34a'];

/* ====== Initialization ====== */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupEventHandlers();
  loadSettings();
});

function initMap() {
  state.map = L.map('map', {
    center: [23.13, 113.26],
    zoom: 10,
    zoomControl: false,
    attributionControl: false,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(state.map);
  L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(state.map);

  setTileSource(state.settings.defaultTile);

  // Coordinate display
  state.map.on('mousemove', (e) => {
    document.getElementById('coord-display').textContent =
      `经度 ${e.latlng.lng.toFixed(6)} | 纬度 ${e.latlng.lat.toFixed(6)}`;
  });

  state.boundaryLayerGroup = L.layerGroup().addTo(state.map);
  state.gridLayer = L.layerGroup().addTo(state.map);

  // 参考比例：缩放时按 2^(当前级别-参考级别) 重新计算符号大小
  state.map.on('zoom', () => { if (state.settings.refScale) applySymbolScale(); });
}

function setTileSource(key) {
  if (state.tileLayer) state.map.removeLayer(state.tileLayer);
  const src = TILE_SOURCES[key] || TILE_SOURCES.amap;
  state.tileLayer = L.tileLayer(src.url, {
    subdomains: src.subdomains || 'abc',
    maxZoom: src.maxZoom || 18,
    attribution: src.attribution || '',
  }).addTo(state.map);
  document.getElementById('tile-source').value = key;
}

/* ====== Event Handlers ====== */
function setupEventHandlers() {
  // Tab switching
  document.getElementById('tab-split').addEventListener('click', () => switchMode('split'));
  document.getElementById('tab-select').addEventListener('click', () => switchMode('select'));

  // Settings
  document.getElementById('btn-settings').addEventListener('click', openSettings);
  document.getElementById('btn-modal-close').addEventListener('click', closeSettings);
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target.id === 'settings-modal') closeSettings();
  });
  document.getElementById('btn-settings-save').addEventListener('click', saveSettings);
  document.getElementById('btn-ref-zoom-current').addEventListener('click', () => {
    if (state.map) document.getElementById('setting-ref-zoom').value = state.map.getZoom();
  });

  // Map controls
  document.getElementById('tile-source').addEventListener('change', (e) => setTileSource(e.target.value));
  document.getElementById('btn-fit-bounds').addEventListener('click', fitAllBounds);

  // ===== Split Mode =====
  setupUploadZone('grid-upload-zone', 'grid-file-input', handleGridFile);
  document.getElementById('grid-file-input').addEventListener('change', (e) => handleGridFile(e.target.files));

  setupUploadZone('boundary-upload-zone', 'boundary-file-input', handleBoundaryFiles);
  document.getElementById('boundary-file-input').addEventListener('change', (e) => handleBoundaryFiles(e.target.files));

  document.getElementById('btn-split-execute').addEventListener('click', executeSplit);
  document.getElementById('btn-split-download-all').addEventListener('click', downloadAllSplitResults);

  // ===== Select Mode =====
  setupUploadZone('select-upload-zone', 'select-file-input', handleSelectFile);
  document.getElementById('select-file-input').addEventListener('change', (e) => handleSelectFile(e.target.files));

  document.getElementById('btn-draw-rect').addEventListener('click', () => activateDrawTool('rectangle'));
  document.getElementById('btn-draw-poly').addEventListener('click', () => activateDrawTool('polygon'));
  document.getElementById('btn-draw-clear').addEventListener('click', clearDrawSelection);
  document.getElementById('btn-select-export').addEventListener('click', exportSelectedFeatures);

  // Map visibility toggles
  document.getElementById('btn-toggle-grid').addEventListener('click', toggleGridVisibility);
  document.getElementById('btn-toggle-boundary').addEventListener('click', toggleBoundaryVisibility);

  // Style editor
  document.getElementById('btn-style-editor').addEventListener('click', openStyleEditor);
  document.getElementById('btn-style-editor-close').addEventListener('click', closeStyleEditor);
  document.getElementById('btn-style-apply').addEventListener('click', applyStyleEdits);
  document.getElementById('style-editor-modal').addEventListener('click', (e) => {
    if (e.target.id === 'style-editor-modal') closeStyleEditor();
  });
  document.getElementById('style-edit-scope').addEventListener('change', (e) => {
    document.getElementById('style-edit-name-row').style.display = (e.target.value === 'name') ? '' : 'none';
  });

  // Settings
  document.getElementById('setting-show-map').addEventListener('change', function () {
    document.getElementById('map-panel').style.display = this.checked ? '' : 'none';
    if (this.checked) setTimeout(() => state.map.invalidateSize(), 100);
  });
}

function setupUploadZone(zoneId, inputId, handler) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handler(e.dataTransfer.files);
  });
}

/* ====== Mode Switching ====== */
function switchMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${mode}`));

  // Hide all Leaflet Draw controls when switching
  clearDrawSelection();
  document.querySelector('.leaflet-draw')?.remove();

  updateStatus('就绪');
  document.getElementById('status-count').textContent = '';
}

/* ====== KML Parsing ====== */
function parseKmlFeatures(xmlDoc) {
  const features = [];
  // 建立样式字典（<Style id> / <StyleMap id>），供各 Placemark 解析引用
  const styleMap = (typeof buildStyleMap === 'function') ? buildStyleMap(xmlDoc) : new Map();
  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    const name = getElementText(pm, 'name') || `要素 ${i + 1}`;
    const geom = extractGeometry(pm, styleMap);
    if (geom) {
      const style = (typeof resolvePlacemarkStyle === 'function')
        ? resolvePlacemarkStyle(pm, styleMap) : null;
      features.push({
        name,
        element: pm,
        geometry: geom,
        type: geom.type,
        index: i,
        style, // 源 KML 归一化样式（可能为 null）
      });
    }
  }
  return features;
}

function extractGeometry(placemark, styleMap) {
  const resolveStyle = (el) => (typeof resolvePlacemarkStyle === 'function') ? resolvePlacemarkStyle(el, styleMap) : null;

  // MultiGeometry 优先：逐个子几何体解析为部件，保留各自 styleUrl 样式（如 #grid / #glyph）
  const multiGeom = placemark.getElementsByTagName('MultiGeometry')[0];
  if (multiGeom) {
    const parts = extractMultiGeometryParts(multiGeom, placemark, resolveStyle);
    if (parts.length > 0) {
      return { type: 'MultiPolygon', coordinates: parts.map(p => [p.ring]), parts };
    }
    return null;
  }

  // Polygon（单多边形，非 MultiGeometry 内）
  const polygons = placemark.getElementsByTagName('Polygon');
  for (let p = 0; p < polygons.length; p++) {
    const outer = polygons[p].getElementsByTagName('outerBoundaryIs')[0];
    if (outer) {
      const coords = outer.getElementsByTagName('coordinates')[0];
      if (coords && coords.textContent) {
        const ring = parseCoordinateString(coords.textContent);
        const holes = [];
        const innerBounds = polygons[p].getElementsByTagName('innerBoundaryIs');
        for (let ib = 0; ib < innerBounds.length; ib++) {
          const ic = innerBounds[ib].getElementsByTagName('coordinates')[0];
          if (ic && ic.textContent) holes.push(parseCoordinateString(ic.textContent));
        }
        return { type: 'Polygon', coordinates: [ring], holes };
      }
    }
  }

  // LineString
  const lineStrings = placemark.getElementsByTagName('LineString');
  for (let l = 0; l < lineStrings.length; l++) {
    const coords = lineStrings[l].getElementsByTagName('coordinates')[0];
    if (coords && coords.textContent) {
      return { type: 'LineString', coordinates: parseCoordinateString(coords.textContent) };
    }
  }

  // Point
  const points = placemark.getElementsByTagName('Point');
  for (let pt = 0; pt < points.length; pt++) {
    const coords = points[pt].getElementsByTagName('coordinates')[0];
    if (coords && coords.textContent) {
      const c = parseCoordinateString(coords.textContent);
      if (c.length > 0) return { type: 'Point', coordinates: c[0] };
    }
  }

  return null;
}

// 解析 MultiGeometry 的子几何体（主要多边形），每个保留自身 styleUrl 样式
function extractMultiGeometryParts(multiGeom, placemark, resolveStyle) {
  const parts = [];
  for (let c = 0; c < multiGeom.childNodes.length; c++) {
    const child = multiGeom.childNodes[c];
    if (!child || child.nodeType !== 1) continue;
    const tag = (child.tagName || '').split(':').pop();
    if (tag !== 'Polygon') continue;
    const outer = child.getElementsByTagName('outerBoundaryIs')[0];
    if (!outer) continue;
    const coords = outer.getElementsByTagName('coordinates')[0];
    if (!coords || !coords.textContent) continue;
    const ring = parseCoordinateString(coords.textContent);
    const holes = [];
    const inner = child.getElementsByTagName('innerBoundaryIs');
    for (let ib = 0; ib < inner.length; ib++) {
      const ic = inner[ib].getElementsByTagName('coordinates')[0];
      if (ic && ic.textContent) holes.push(parseCoordinateString(ic.textContent));
    }
    const childStyle = resolveStyle(child);
    const pmStyle = resolveStyle(placemark);
    const style = (childStyle && Object.keys(childStyle).length) ? childStyle : pmStyle;
    parts.push({ ring, holes, style });
  }
  return parts;
}

function parseCoordinateString(text) {
  const coords = [];
  const parts = text.trim().split(/\s+/);
  for (const part of parts) {
    const vals = part.split(',');
    if (vals.length >= 2) {
      coords.push([parseFloat(vals[0]), parseFloat(vals[1])]);
    }
  }
  return coords;
}

function getElementText(el, tag) {
  const child = el.getElementsByTagName(tag)[0];
  return child ? child.textContent : '';
}

function parseServiceAreaPolygons(xmlDoc) {
  const polygons = [];
  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  for (let i = 0; i < placemarks.length; i++) {
    const polygonElems = placemarks[i].getElementsByTagName('Polygon');
    for (let p = 0; p < polygonElems.length; p++) {
      const outer = polygonElems[p].getElementsByTagName('outerBoundaryIs')[0];
      if (!outer) continue;
      const coords = outer.getElementsByTagName('coordinates')[0];
      if (!coords || !coords.textContent) continue;
      const ring = parseCoordinateString(coords.textContent);

      const holes = [];
      const innerBounds = polygonElems[p].getElementsByTagName('innerBoundaryIs');
      for (let ib = 0; ib < innerBounds.length; ib++) {
        const ic = innerBounds[ib].getElementsByTagName('coordinates')[0];
        if (ic && ic.textContent) holes.push(parseCoordinateString(ic.textContent));
      }
      polygons.push({ ring, holes });
    }
  }
  return polygons;
}

/* ====== Spatial Operations ======
 * 纯几何/谓词函数已抽到 spatial.js（与 Node 单元测试共用），
 * 此处只保留依赖 DOM/Leaflet 的边界与渲染逻辑。
 */

/* ====== Bounds ====== */
function getFeatureBounds(feature) {
  let coords;
  if (feature.type === 'Polygon') {
    coords = feature.coordinates[0];
  } else if (feature.type === 'LineString') {
    coords = feature.coordinates;
  } else if (feature.type === 'Point') {
    return [[feature.coordinates[1], feature.coordinates[0]], [feature.coordinates[1], feature.coordinates[0]]];
  } else if (feature.type === 'MultiPolygon') {
    coords = feature.coordinates.flatMap(r => r[0]);
  } else {
    return null;
  }

  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}

function fitAllBounds() {
  const allBounds = [];
  if (state.gridKml && state.gridKml.features) {
    for (const f of state.gridKml.features) {
      const b = getFeatureBounds(f.geometry);
      if (b) allBounds.push(b);
    }
  }
  if (state.selectKml && state.selectKml.features) {
    for (const f of state.selectKml.features) {
      const b = getFeatureBounds(f.geometry);
      if (b) allBounds.push(b);
    }
  }
  for (const b of state.boundaryKmz) {
    for (const p of b.polygons) {
      const bnd = ringBounds(p.ring);
      if (bnd) allBounds.push(bnd);
    }
  }

  if (allBounds.length === 0) {
    state.map.setView([23.13, 113.26], 10);
    return;
  }

  let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
  for (const [[lat1, lng1], [lat2, lng2]] of allBounds) {
    if (lat1 < minLat) minLat = lat1;
    if (lng1 < minLng) minLng = lng1;
    if (lat2 > maxLat) maxLat = lat2;
    if (lng2 > maxLng) maxLng = lng2;
  }
  state.map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [30, 30] });
}

function ringBounds(ring) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return [[minLat, minLng], [maxLat, maxLng]];
}

/* ====== Visual Helpers ====== */
// 把归一化样式对象（或 null）转成 Leaflet 多边形/点样式，含透明填充可见下限
function leafletStyleFromStyle(styleObj, fallbackColor) {
  if (!styleObj) {
    return {
      color: fallbackColor, weight: 1, fillColor: fallbackColor,
      fillOpacity: 0.15, radius: 4, iconHref: null, iconScale: 1,
    };
  }
  const s = styleObj;
  const fill = (s.fill === false) ? false : true;
  const stroke = s.lineColor || s.iconColor || fallbackColor;
  let fillO = (s.fillOpacity != null) ? s.fillOpacity : 0.15;
  if (fill && fillO < 0.05) fillO = 0.2; // 透明填充抬升到可见下限
  return {
    color: stroke,
    weight: (s.lineWidth != null) ? s.lineWidth : (s.outline === false ? 0 : 1),
    fillColor: s.fillColor || s.lineColor || s.iconColor || fallbackColor,
    fillOpacity: fill ? fillO : 0,
    radius: 5,
    iconHref: s.iconHref || null,
    iconScale: s.iconScale || 1,
  };
}

// 主入口：使用要素级样式（兼容旧调用）
function baseLeafletStyle(feature, fallbackColor) {
  const useSrc = state.settings.applySourceStyle && feature.style;
  return leafletStyleFromStyle(useSrc ? feature.style : null, fallbackColor);
}

// 部件级：优先用子部件自身样式（如 MultiGeometry 内 #glyph），回退要素级样式
function baseLeafletStyleForPart(feature, part, fallbackColor) {
  const useSrc = state.settings.applySourceStyle;
  const s = useSrc ? (part.style || feature.style || null) : null;
  return leafletStyleFromStyle(s, fallbackColor);
}

// 返回要素所有“可渲染多边形部件”，每个带自身归一化样式（用于 MultiGeometry 子多边形分别着色）
function polygonPartsOf(feat) {
  const g = feat.geometry;
  if (!g) return [];
  if (g.type === 'Polygon') {
    return [{ ring: g.coordinates[0], holes: g.holes || [], style: feat.style }];
  }
  if (g.type === 'MultiPolygon') {
    if (g.parts && g.parts.length) {
      return g.parts.map(p => ({ ring: p.ring, holes: p.holes || [], style: p.style || feat.style }));
    }
    return (g.coordinates || []).map(r => ({ ring: r[0], holes: [], style: feat.style }));
  }
  return [];
}

// 把要素的多边形部件逐个画成独立 L.polygon 层（支持逐部件样式与洞），统一加入 gridLayer
function addPolygonParts(feat, fallbackColor, styleOf, tooltipOf) {
  const parts = polygonPartsOf(feat);
  for (const part of parts) {
    const st = styleOf(feat, part, fallbackColor);
    const rings = [part.ring.map(([lng, lat]) => [lat, lng])];
    for (const h of (part.holes || [])) rings.push(h.map(([lng, lat]) => [lat, lng]));
    const layer = L.polygon(rings, {
      color: st.color, weight: st.weight, fillOpacity: st.fillOpacity, fillColor: st.fillColor,
    }).addTo(state.gridLayer);
    layer._baseWeight = st.weight;
    const tip = tooltipOf ? tooltipOf(feat, part) : feat.name;
    if (tip) layer.bindTooltip(tip);
  }
}

/**
 * 点要素渲染：三级回退
 *  1) 源 <IconStyle><href> 图片图标（http/https/data URI）→ L.marker 图标
 *  2) 有名称/编号 → 带彩色圆点的文字徽标（divIcon），随参考比例缩放
 *  3) 其它 → 彩色圆点（circleMarker，保留 _baseRadius 供符号缩放）
 * opts: { color, radius, iconHref, iconScale, fillOpacity, tooltip }
 */
function makePointLayer(feat, latlng, opts) {
  opts = opts || {};
  const name = (feat.name || '').trim();
  const color = opts.color || '#00bfff';
  const tooltip = (opts.tooltip != null) ? opts.tooltip : name;
  const showLabels = !state.settings || state.settings.showPointLabels !== false;

  // 1) 源图标（图片）始终优先
  if (opts.iconHref && /^https?:|^data:/i.test(opts.iconHref)) {
    const size = Math.max(12, Math.round(24 * (opts.iconScale || 1)));
    const m = L.marker(latlng, {
      icon: L.icon({ iconUrl: opts.iconHref, iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
    });
    if (tooltip) m.bindTooltip(tooltip);
    return m;
  }

  // 2) 名称/编号徽标（需开启显示）
  if (showLabels && name) {
    const html =
      `<div class="kml-num-icon-inner">` +
      `<span class="kml-num-dot" style="background:${color}"></span>` +
      `<span class="kml-num-txt" style="color:${color}">${escapeHtml(name)}</span>` +
      `</div>`;
    const m = L.marker(latlng, {
      icon: L.divIcon({ className: 'kml-num-icon', html, iconSize: [1, 1], iconAnchor: [0, 0] }),
    });
    if (tooltip && tooltip !== name) m.bindTooltip(tooltip);
    return m;
  }

  // 3) 回退圆点
  const r = opts.radius || 5;
  const cm = L.circleMarker(latlng, {
    radius: r, color, fillOpacity: (opts.fillOpacity != null) ? opts.fillOpacity : 0.6,
  });
  cm._baseRadius = r;
  cm.bindTooltip(tooltip);
  return cm;
}

function featureToLeaflet(geom) {
  const coords = geom.type === 'Polygon' ? [geom.coordinates[0].map(([lng, lat]) => [lat, lng])] :
    geom.type === 'MultiPolygon' ? geom.coordinates.map(r => r[0].map(([lng, lat]) => [lat, lng])) :
    geom.type === 'LineString' ? geom.coordinates.map(([lng, lat]) => [lat, lng]) :
    geom.type === 'Point' ? [[geom.coordinates[1], geom.coordinates[0]]] :
    null;
  return coords;
}

/* ====== Mode 1: Split ====== */

async function handleGridFile(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  state.gridFile = file;
  state.gridKml = null;

  try {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('XML 解析失败');

    const features = parseKmlFeatures(xmlDoc);
    state.gridKml = { name: file.name, xml: xmlDoc, features };

    // Update file list
    document.getElementById('grid-file-list').innerHTML = `
      <div class="file-item">
        <span class="file-item-name">${escapeHtml(file.name)}</span>
        <span class="file-item-meta">${features.length} 个要素</span>
        <button class="file-item-remove" onclick="removeGridFile()">✕</button>
      </div>`;

    // Render on map
    renderGridOnMap();

    // Show boundary upload
    showSection('sec-split-boundary');
    updateStatus(`已加载: ${features.length} 个要素`, 'info');
    document.getElementById('status-count').textContent = `要素: ${features.length}`;

    if (state.settings.autoFit) fitAllBounds();
  } catch (e) {
    updateStatus(`加载失败: ${e.message}`, 'error');
  }
}

function removeGridFile() {
  state.gridKml = null;
  state.gridFile = null;
  document.getElementById('grid-file-list').innerHTML = '';
  if (state.gridLayer) state.gridLayer.clearLayers();
  hideSection('sec-split-boundary');
  hideSection('sec-split-execute');
  hideSection('sec-split-results');
  state.splitResults = [];
  updateStatus('就绪');
  document.getElementById('status-count').textContent = '';
}

async function handleBoundaryFiles(files) {
  if (!files || files.length === 0) return;
  state.boundaryFiles = Array.from(files);
  state.boundaryKmz = [];

  const listHtml = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');
      if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('解析失败');

      const polygons = parseServiceAreaPolygons(xmlDoc);
      const name = file.name.replace(/\.kml$/i, '');
      const color = PALLETTE[i % PALLETTE.length];
      state.boundaryKmz.push({ name, xml: xmlDoc, polygons, color, file });

      listHtml.push(`
        <div class="file-item">
          <span class="file-item-name">${escapeHtml(file.name)}</span>
          <span class="file-item-meta">${polygons.length} 个面</span>
          <button class="file-item-remove" onclick="removeBoundaryFile(${i})">✕</button>
        </div>`);
    } catch (e) {
      updateStatus(`加载边界失败 (${file.name}): ${e.message}`, 'error');
    }
  }

  document.getElementById('boundary-file-list').innerHTML = listHtml.join('');

  // Render boundaries on map
  renderBoundariesOnMap();

  // Show execute button
  showSection('sec-split-execute');
  updateStatus(`已加载 ${state.boundaryKmz.length} 个区域边界`, 'info');
}

function removeBoundaryFile(index) {
  state.boundaryFiles.splice(index, 1);
  state.boundaryKmz.splice(index, 1);
  // Re-render
  renderBoundaryFilesList();
  renderBoundariesOnMap();
  if (state.boundaryKmz.length === 0) {
    hideSection('sec-split-execute');
    hideSection('sec-split-results');
  }
}

function renderBoundaryFilesList() {
  document.getElementById('boundary-file-list').innerHTML = state.boundaryKmz.map((b, i) => `
    <div class="file-item">
      <span class="file-item-name">${escapeHtml(b.file.name)}</span>
      <span class="file-item-meta">${b.polygons.length} 个面</span>
      <button class="file-item-remove" onclick="removeBoundaryFile(${i})">✕</button>
    </div>`).join('');
}

/* ====== Reference Scale (ArcGIS 式参考比例) ======
 * 每个符号渲染时记录基准大小 (_baseWeight / _baseRadius)，
 * 缩放时按 factor = 2^(当前级别 - 参考级别) 重新设定，锚定在参考级别。
 */
function applySymbolScale() {
  if (!state.map) return;
  const enabled = !!state.settings.refScale;
  let factor = 1;
  if (enabled) {
    factor = Math.pow(2, state.map.getZoom() - (state.settings.refZoom || 10));
    factor = Math.min(8, Math.max(0.25, factor)); // 限制极端缩放
  }
  // 标注字号同步缩放
  state.map.getContainer().style.setProperty('--kml-symbol-scale', factor.toFixed(3));

  const groups = [state.gridLayer, state.boundaryLayerGroup, state.drawnLayer];
  for (const grp of groups) {
    if (!grp) continue;
    grp.eachLayer((layer) => {
      if (layer._baseRadius != null && layer.setRadius) {
        layer.setRadius(Math.max(1, layer._baseRadius * factor));
      }
      if (layer._baseWeight != null) {
        layer.setStyle({ weight: Math.max(0.5, layer._baseWeight * factor) });
      }
    });
  }
}

function renderGridOnMap() {
  state.gridLayer.clearLayers();
  if (!state.gridKml) return;

  for (const feat of state.gridKml.features) {
    const coords = featureToLeaflet(feat.geometry);
    if (!coords) continue;
    const st = baseLeafletStyle(feat, '#00bfff');
    if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
      addPolygonParts(feat, '#00bfff',
        (f, p) => baseLeafletStyleForPart(f, p, '#00bfff'),
        (f) => f.name);
    } else if (feat.geometry.type === 'Point') {
      makePointLayer(feat, coords[0], {
        color: st.color, radius: st.radius, iconHref: st.iconHref, iconScale: st.iconScale,
      }).addTo(state.gridLayer);
    } else if (feat.geometry.type === 'LineString') {
      const layer = L.polyline(coords, { color: st.color, weight: st.weight }).addTo(state.gridLayer);
      layer._baseWeight = st.weight;
    }
  }
  applySymbolScale();
}

function renderBoundariesOnMap() {
  state.boundaryLayerGroup.clearLayers();
  for (const b of state.boundaryKmz) {
    for (const poly of b.polygons) {
      const ring = poly.ring.map(([lng, lat]) => [lat, lng]);
      const layer = L.polygon(ring, {
        color: b.color,
        weight: 2,
        fillOpacity: 0.1,
        fillColor: b.color,
      }).addTo(state.boundaryLayerGroup);
      layer._baseWeight = 2;
      layer.bindTooltip(b.name);
    }
  }
  applySymbolScale();
}

function executeSplit() {
  if (!state.gridKml || state.boundaryKmz.length === 0) {
    updateStatus('请先加载 KML 和至少一个区域边界', 'error');
    return;
  }

  const btn = document.getElementById('btn-split-execute');
  btn.disabled = true;
  btn.textContent = '⏳ 分割中...';
  document.getElementById('split-status').innerHTML = '<span class="status-inline info">正在分类要素...</span>';

  // Use setTimeout to allow UI update
  setTimeout(() => {
    try {
      const predicate = document.getElementById('split-relationship').value; // 'intersect' | 'within' | 'centroid-in'
      const overlap = document.getElementById('split-overlap').value;        // 'first' | 'all'

      // Precompute per-area polygon bbox for fast prefilter
      const areas = state.boundaryKmz.map(b => ({
        name: b.name,
        boundary: b,
        polys: b.polygons.map(p => ({ ring: p.ring, holes: p.holes || [], bbox: ringBoundsOf(p.ring) })),
      }));

      const results = {};
      for (const a of areas) results[a.name] = { name: a.name, features: [], boundary: a.boundary };
      const unmatched = { name: '其余要素', features: [], boundary: null };

      for (const feat of state.gridKml.features) {
        const fb = featureBBox(feat);
        const matchedAreas = [];

        for (const a of areas) {
          // bbox prefilter — skip clearly-disjoint areas
          if (fb && !a.polys.some(p => bboxIntersect(fb, p.bbox))) continue;
          let hit = false;
          for (const p of a.polys) {
            if (featureMatchesArea(feat, p, predicate)) { hit = true; break; }
          }
          if (hit) {
            matchedAreas.push(a);
            if (overlap === 'first') break; // 先匹配者胜
          }
        }

        if (matchedAreas.length > 0) {
          for (const a of matchedAreas) results[a.name].features.push(feat);
        } else {
          unmatched.features.push(feat); // 未命中统一归入"其余要素"
        }
      }

      // Build results (unmatched only when non-empty → 杜绝静默丢弃)
      state.splitResults = [];
      for (const key in results) {
        if (results[key].features.length > 0) state.splitResults.push(results[key]);
      }
      if (unmatched.features.length > 0) state.splitResults.push(unmatched);

      // Render results
      renderSplitResults();

      // Color grid cells by match
      colorGridByResults(state.splitResults);

      showSection('sec-split-results');
      const unmatchedNote = unmatched.features.length > 0
        ? `（含其余要素 ${unmatched.features.length} 个）` : '';
      document.getElementById('split-status').innerHTML =
        `<span class="status-inline success">✓ 分割完成 — ${state.splitResults.length} 个分区${unmatchedNote}</span>`;
      updateStatus(`分割完成: ${state.splitResults.map(r => r.name).join('、')}`, 'success');
      document.getElementById('status-count').textContent =
        `共 ${state.gridKml.features.length} 要素 → ${state.splitResults.length} 分区`;

      if (state.settings.autoFit) fitAllBounds();
    } catch (e) {
      document.getElementById('split-status').innerHTML = `<span class="status-inline error">✕ ${escapeHtml(e.message)}</span>`;
      updateStatus(`分割失败: ${e.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ 执行分割';
    }
  }, 50);
}

function renderSplitResults() {
  const listEl = document.getElementById('split-result-list');
  listEl.innerHTML = state.splitResults.map((r, i) => `
    <div class="result-item">
      <span class="result-item-name">${escapeHtml(r.name)}</span>
      <span class="result-item-count">${r.features.length} 个要素</span>
      <button class="result-item-download" onclick="downloadSplitResult(${i})">⬇ 下载</button>
    </div>`).join('');
}

function colorGridByResults(results) {
  state.gridLayer.clearLayers();
  const useSrc = state.settings.applySourceStyle;
  for (let ri = 0; ri < results.length; ri++) {
    const isUnmatched = !results[ri].boundary;
    const catColor = isUnmatched ? '#9aa0a6' : PALLETTE[ri % PALLETTE.length];
    for (const feat of results[ri].features) {
      const coords = featureToLeaflet(feat.geometry);
      if (!coords) continue;
      const tip = `${results[ri].name}<br>${feat.name}`;
      // 开启源样式时，用要素自身颜色/线宽/填充；否则用分区分类色
      const s = (useSrc && feat.style) ? feat.style : null;
      const color = s ? (s.lineColor || s.iconColor || s.fillColor || catColor) : catColor;
      const weightBase = isUnmatched ? 1.5 : 3;
      const w = s ? (s.lineWidth != null ? s.lineWidth : weightBase) : weightBase;
      const fillC = s ? (s.fillColor || s.lineColor || color) : catColor;
      let fillO;
      if (s) {
        fillO = (s.fill === false) ? 0 : (s.fillOpacity != null ? s.fillOpacity : 0.25);
        if (fillO < 0.05 && s.fill !== false) fillO = 0.2; // 透明填充抬升到可见下限
      } else {
        fillO = isUnmatched ? 0.12 : 0.25;
      }
      if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
        // 逐个部件渲染（MultiGeometry 内 #grid / #glyph 等子多边形各自着色）
        addPolygonParts(feat, catColor,
          (f, p) => {
            const s = useSrc ? (p.style || f.style || null) : null;
            const c = s ? (s.lineColor || s.iconColor || s.fillColor || color) : color;
            const w2 = s ? (s.lineWidth != null ? s.lineWidth : weightBase) : weightBase;
            const fillC2 = s ? (s.fillColor || s.lineColor || c) : catColor;
            let fillO2;
            if (s) { fillO2 = (s.fill === false) ? 0 : (s.fillOpacity != null ? s.fillOpacity : 0.25); if (fillO2 < 0.05 && s.fill !== false) fillO2 = 0.2; }
            else { fillO2 = isUnmatched ? 0.12 : 0.25; }
            return { color: c, weight: w2, fillColor: fillC2, fillOpacity: fillO2 };
          },
          () => tip);
      } else if (feat.geometry.type === 'LineString') {
        const layer = L.polyline(coords, { color: color, weight: w }).addTo(state.gridLayer);
        layer._baseWeight = w;
      } else if (feat.geometry.type === 'Point') {
        const r = s ? 5 : (isUnmatched ? 3 : 5);
        makePointLayer(feat, coords[0], {
          color: color, radius: r,
          iconHref: s ? s.iconHref : null, iconScale: s ? s.iconScale : 1,
          tooltip: tip,
        }).addTo(state.gridLayer);
      }
    }
  }
  applySymbolScale();
}

function buildKmlForFeatures(features, documentName, sourceXml) {
  const parts = [];
  parts.push('<?xml version="1.0" encoding="UTF-8"?>');
  parts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
  parts.push('<Document>');
  parts.push(`<name>${escapeXml(documentName)}</name>`);

  // Copy styles from source if available
  if (sourceXml) {
    const styles = sourceXml.getElementsByTagName('Style');
    for (let i = 0; i < styles.length; i++) {
      parts.push(new XMLSerializer().serializeToString(styles[i]));
    }
  }

  for (const feat of features) {
    parts.push(new XMLSerializer().serializeToString(feat.element));
  }

  parts.push('</Document>');
  parts.push('</kml>');
  return parts.join('\n');
}

function downloadSplitResult(index) {
  const result = state.splitResults[index];
  if (!result) return;
  const kmlStr = buildKmlForFeatures(
    result.features,
    result.name,
    state.gridKml ? state.gridKml.xml : null,
  );
  const suffix = result.boundary ? '_编号格网' : '';
  downloadBlob(kmlStr, `${result.name}${suffix}.kml`, 'application/vnd.google-earth.kml+xml');
}

function downloadAllSplitResults() {
  if (state.splitResults.length === 0) return;
  if (state.splitResults.length === 1) {
    downloadSplitResult(0);
    return;
  }
  // Create ZIP
  const zip = new JSZip();
  for (const result of state.splitResults) {
    const kmlStr = buildKmlForFeatures(
      result.features,
      result.name,
      state.gridKml ? state.gridKml.xml : null,
    );
    const suffix = result.boundary ? '_编号格网' : '';
    zip.file(`${result.name}${suffix}.kml`, kmlStr);
  }
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    triggerDownload(blob, '分割结果.zip');
  });
}

/* ====== Mode 2: Select ====== */

async function handleSelectFile(files) {
  if (!files || files.length === 0) return;
  const file = files[0];
  state.selectFile = file;
  state.selectKml = null;

  try {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'application/xml');
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) throw new Error('XML 解析失败');

    const features = parseKmlFeatures(xmlDoc);
    state.selectKml = { name: file.name, xml: xmlDoc, features };

    document.getElementById('select-file-list').innerHTML = `
      <div class="file-item">
        <span class="file-item-name">${escapeHtml(file.name)}</span>
        <span class="file-item-meta">${features.length} 个要素</span>
        <button class="file-item-remove" onclick="removeSelectFile()">✕</button>
      </div>`;

    // Show info
    const typeCounts = {};
    for (const f of features) {
      const t = f.type || '未知';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    }
    const typeHtml = Object.entries(typeCounts).map(([t, c]) =>
      `<div class="kml-info-row"><span class="label">${t}</span><span class="value">${c}</span></div>`
    ).join('');

    document.getElementById('select-kml-info').innerHTML = `
      <div class="kml-info">
        <div class="kml-info-row"><span class="label">文件名</span><span class="value">${escapeHtml(file.name)}</span></div>
        <div class="kml-info-row"><span class="label">要素数</span><span class="value">${features.length}</span></div>
        ${typeHtml}
      </div>`;
    document.getElementById('select-kml-info').style.display = '';

    // Render on map
    renderSelectKmlOnMap();

    // Show draw tools
    showSection('sec-select-draw');
    activateDrawTool('rectangle');

    updateStatus(`已加载: ${features.length} 个要素`, 'info');
    document.getElementById('status-count').textContent = `要素: ${features.length}`;

    if (state.settings.autoFit) fitAllBounds();
  } catch (e) {
    updateStatus(`加载失败: ${e.message}`, 'error');
  }
}

function removeSelectFile() {
  state.selectKml = null;
  state.selectFile = null;
  document.getElementById('select-file-list').innerHTML = '';
  document.getElementById('select-kml-info').style.display = 'none';
  clearDrawSelection();
  if (state.gridLayer) state.gridLayer.clearLayers();
  hideSection('sec-select-draw');
  hideSection('sec-select-preview');
  hideSection('sec-select-export');
  updateStatus('就绪');
  document.getElementById('status-count').textContent = '';
}

function renderSelectKmlOnMap() {
  state.gridLayer.clearLayers();
  if (!state.selectKml) return;

  for (const feat of state.selectKml.features) {
    const coords = featureToLeaflet(feat.geometry);
    if (!coords) continue;
    const st = baseLeafletStyle(feat, '#4a9eff');
    if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
      addPolygonParts(feat, '#4a9eff',
        (f, p) => baseLeafletStyleForPart(f, p, '#4a9eff'),
        (f) => f.name);
    } else if (feat.geometry.type === 'LineString') {
      const layer = L.polyline(coords, { color: st.color, weight: st.weight }).addTo(state.gridLayer);
      layer._baseWeight = st.weight;
    } else if (feat.geometry.type === 'Point') {
      makePointLayer(feat, coords[0], {
        color: st.color, radius: st.radius, iconHref: st.iconHref, iconScale: st.iconScale,
      }).addTo(state.gridLayer);
    }
  }
  applySymbolScale();
}

function activateDrawTool(tool) {
  // Update button states
  document.querySelectorAll('.draw-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tool === 'rectangle' ? 'btn-draw-rect' : 'btn-draw-poly').classList.add('active');

  // Remove existing draw control
  document.querySelector('.leaflet-draw')?.remove();

  // Remove previous drawn layer
  if (state.drawnLayer) {
    state.map.removeLayer(state.drawnLayer);
  }
  state.drawnLayer = new L.FeatureGroup().addTo(state.map);

  const options = {
    position: 'topright',
    draw: {
      polygon: tool === 'polygon' ? {
        allowIntersection: false,
        showArea: true,
        shapeOptions: { color: '#4caf50', weight: 2, fillOpacity: 0.1 },
      } : false,
      rectangle: tool === 'rectangle' ? {
        shapeOptions: { color: '#4caf50', weight: 2, fillOpacity: 0.1 },
      } : false,
      polyline: false,
      circle: false,
      circlemarker: false,
      marker: false,
    },
    edit: {
      featureGroup: state.drawnLayer,
      remove: true,
    },
  };

  const drawControl = new L.Control.Draw(options);
  state.map.addControl(drawControl);

  state.map.on(L.Draw.Event.CREATED, (e) => {
    state.drawnLayer.clearLayers();
    state.drawnLayer.addLayer(e.layer);
    state.drawnShape = e.layer;
    document.getElementById('btn-draw-undo').style.display = '';
    performSelection(e.layer);
  });

  state.map.on(L.Draw.Event.EDITED, () => {
    const layers = state.drawnLayer.getLayers();
    if (layers.length > 0) {
      state.drawnShape = layers[0];
      performSelection(layers[0]);
    }
  });

  state.map.on(L.Draw.Event.DELETED, () => {
    state.drawnShape = null;
    document.getElementById('btn-draw-undo').style.display = 'none';
    clearSelectionResults();
  });
}

function clearDrawSelection() {
  if (state.drawnLayer) {
    state.map.removeLayer(state.drawnLayer);
    state.drawnLayer = null;
  }
  state.drawnShape = null;
  document.getElementById('btn-draw-undo').style.display = 'none';
  document.querySelector('.leaflet-draw')?.remove();
  clearSelectionResults();
  // Re-render original KML
  if (state.selectKml) renderSelectKmlOnMap();
  hideSection('sec-select-preview');
  hideSection('sec-select-export');
}

function clearSelectionResults() {
  state.selectedFeatures = [];
  document.getElementById('select-stats').innerHTML = '';
  document.getElementById('select-feature-list').innerHTML = '';
}

function performSelection(layer) {
  if (!state.selectKml) return;

  let selectionRing;
  if (layer instanceof L.Rectangle) {
    const bounds = layer.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    selectionRing = [
      [sw.lng, sw.lat],
      [ne.lng, sw.lat],
      [ne.lng, ne.lat],
      [sw.lng, ne.lat],
      [sw.lng, sw.lat],
    ];
  } else if (layer instanceof L.Polygon) {
    const latlngs = layer.getLatLngs()[0];
    selectionRing = latlngs.map(ll => [ll.lng, ll.lat]);
    // Close the ring
    if (selectionRing.length > 0) {
      const first = selectionRing[0];
      const last = selectionRing[selectionRing.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        selectionRing.push([first[0], first[1]]);
      }
    }
  }

  if (!selectionRing || selectionRing.length < 3) return;

  const predicate = document.getElementById('select-relationship').value; // 'intersect'|'within'|'contains'|'centroid-in'
  const area = { ring: selectionRing, holes: [] };

  const selected = [];
  for (const feat of state.selectKml.features) {
    if (featureMatchesArea(feat, area, predicate)) {
      selected.push(feat);
    }
  }

  state.selectedFeatures = selected;

  // Show stats
  document.getElementById('select-stats').innerHTML =
    `✓ 选中 ${selected.length} / ${state.selectKml.features.length} 个要素`;

  // Show feature list (first 20)
  const listHtml = selected.slice(0, 20).map(f => `
    <div class="feature-item">
      <span class="feat-name">${escapeHtml(f.name)}</span>
      <span class="feat-type">${f.type || '未知'}</span>
    </div>`).join('');
  const moreHtml = selected.length > 20 ? `<div class="feature-item"><span>... 还有 ${selected.length - 20} 个要素</span></div>` : '';
  document.getElementById('select-feature-list').innerHTML = listHtml + moreHtml;

  // Highlight selected on map
  highlightSelectedOnMap(selected);

  showSection('sec-select-preview');
  showSection('sec-select-export');
  updateStatus(`选中 ${selected.length} 个要素`, 'info');
  document.getElementById('status-count').textContent = `选中: ${selected.length} / ${state.selectKml.features.length}`;
}

function highlightSelectedOnMap(selected) {
  // Clear and redraw with highlights
  state.gridLayer.clearLayers();

  // Draw all features dim
  const selectedSet = new Set(selected.map(f => f.index));
  for (const feat of state.selectKml.features) {
    const coords = featureToLeaflet(feat.geometry);
    if (!coords) continue;
    const isSelected = selectedSet.has(feat.index);
    if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
      addPolygonParts(feat, '#4a9eff',
        () => {
          const w = isSelected ? 2 : 0.5;
          const c = isSelected ? '#4caf50' : '#4a9eff';
          return { color: c, weight: w, fillColor: c, fillOpacity: isSelected ? 0.35 : 0.05 };
        },
        (f) => f.name);
    } else if (feat.geometry.type === 'LineString') {
      const w = isSelected ? 3 : 1;
      const layer = L.polyline(coords, {
        color: isSelected ? '#4caf50' : '#4a9eff',
        weight: w,
      }).addTo(state.gridLayer);
      layer._baseWeight = w;
    } else if (feat.geometry.type === 'Point') {
      const r = isSelected ? 6 : 3;
      makePointLayer(feat, coords[0], {
        color: isSelected ? '#4caf50' : '#4a9eff',
        radius: r,
        tooltip: feat.name,
      }).addTo(state.gridLayer);
    }
  }
  applySymbolScale();
}

function exportSelectedFeatures() {
  if (state.selectedFeatures.length === 0) {
    document.getElementById('select-status').innerHTML =
      '<span class="status-inline error">没有选中任何要素</span>';
    return;
  }

  const exportName = document.getElementById('select-export-name').value.trim() || '选中要素';
  const kmlStr = buildKmlForFeatures(
    state.selectedFeatures,
    exportName,
    state.selectKml ? state.selectKml.xml : null,
  );
  downloadBlob(kmlStr, `${exportName}.kml`, 'application/vnd.google-earth.kml+xml');

  document.getElementById('select-status').innerHTML =
    `<span class="status-inline success">✓ 已导出 ${state.selectedFeatures.length} 个要素</span>`;
}

/* ====== Map Visibility Toggles ====== */
function toggleGridVisibility() {
  if (state.gridLayer) {
    const el = state.map.hasLayer(state.gridLayer);
    if (el) state.map.removeLayer(state.gridLayer);
    else state.map.addLayer(state.gridLayer);
  }
}

function toggleBoundaryVisibility() {
  if (state.boundaryLayerGroup) {
    const el = state.map.hasLayer(state.boundaryLayerGroup);
    if (el) state.map.removeLayer(state.boundaryLayerGroup);
    else state.map.addLayer(state.boundaryLayerGroup);
  }
}

/* ====== Style Editor（渲染 + 调整样式） ====== */
function openStyleEditor() {
  const hasSel = state.mode === 'select' && state.selectedFeatures.length > 0;
  document.getElementById('style-edit-scope').value = hasSel ? 'selected' : 'all';
  document.getElementById('style-edit-name-row').style.display = 'none';
  // 预填：取范围内首个要素当前样式
  const pool = (state.mode === 'select' && state.selectKml) ? state.selectKml.features
    : (state.gridKml ? state.gridKml.features : []);
  const first = pool[0];
  if (first && first.style) {
    document.getElementById('style-edit-color').value = first.style.lineColor || '#4a9eff';
    document.getElementById('style-edit-weight').value = first.style.lineWidth != null ? first.style.lineWidth : 1;
    document.getElementById('style-edit-fill').checked = first.style.fill !== false;
    document.getElementById('style-edit-fillop').value = first.style.fillOpacity != null ? first.style.fillOpacity : 0.15;
    document.getElementById('style-edit-fillcolor').value = first.style.fillColor || first.style.lineColor || '#4a9eff';
  } else {
    document.getElementById('style-edit-color').value = '#4a9eff';
    document.getElementById('style-edit-weight').value = 2;
    document.getElementById('style-edit-fill').checked = true;
    document.getElementById('style-edit-fillop').value = 0.3;
    document.getElementById('style-edit-fillcolor').value = '#4a9eff';
  }
  document.getElementById('style-edit-radius').value = 5;
  document.getElementById('style-editor-modal').classList.add('visible');
}

function closeStyleEditor() {
  document.getElementById('style-editor-modal').classList.remove('visible');
}

// 取编辑目标要素集合
function getStyleEditTargets() {
  const scope = document.getElementById('style-edit-scope').value;
  let pool = [];
  if (state.mode === 'select' && state.selectKml) pool = state.selectKml.features;
  else if (state.gridKml) pool = state.gridKml.features;
  if (scope === 'all') return pool.slice();
  if (scope === 'selected') return state.selectedFeatures.slice();
  if (scope === 'name') {
    const q = (document.getElementById('style-edit-name').value || '').trim().toLowerCase();
    if (!q) return pool.slice();
    return pool.filter(f => (f.name || '').toLowerCase().includes(q));
  }
  return pool.slice();
}

// 把样式写回要素的 KML <Placemark>（内联 <Style>），使导出 KML 也携带新样式
function applyStyleToFeatureElement(feature, st) {
  const pm = feature.element;
  if (!pm || !pm.ownerDocument) return;
  // 移除已有内联 <Style>（无 id）与 styleUrl，避免叠加
  const styles = pm.getElementsByTagName('Style');
  const toRemove = [];
  for (let i = 0; i < styles.length; i++) {
    if (!styles[i].getAttribute('id')) toRemove.push(styles[i]);
  }
  toRemove.forEach(s => s.parentNode.removeChild(s));
  const sus = pm.getElementsByTagName('styleUrl');
  const susRemove = [];
  for (let i = 0; i < sus.length; i++) susRemove.push(sus[i]);
  susRemove.forEach(s => s.parentNode.removeChild(s));

  const doc = pm.ownerDocument;
  const style = doc.createElement('Style');
  const ls = doc.createElement('LineStyle');
  const lc = doc.createElement('color');
  lc.textContent = (typeof cssToKmlColor === 'function') ? cssToKmlColor(st.color, 1) : st.color;
  ls.appendChild(lc);
  const lw = doc.createElement('width');
  lw.textContent = String(st.weight);
  ls.appendChild(lw);
  style.appendChild(ls);

  const ps = doc.createElement('PolyStyle');
  const pc = doc.createElement('color');
  pc.textContent = (typeof cssToKmlColor === 'function') ? cssToKmlColor(st.fillColor || st.color, 1) : (st.fillColor || st.color);
  ps.appendChild(pc);
  const pf = doc.createElement('fill');
  pf.textContent = (st.fillOpacity > 0) ? '1' : '0';
  ps.appendChild(pf);
  const po = doc.createElement('outline');
  po.textContent = (st.weight > 0) ? '1' : '0';
  ps.appendChild(po);
  style.appendChild(ps);

  pm.appendChild(style);
}

// 应用编辑：更新 feature.style + 写回 KML + 重渲染
function applyStyleEdits() {
  const targets = getStyleEditTargets();
  if (targets.length === 0) { updateStatus('没有可应用的要素', 'error'); return; }

  const color = document.getElementById('style-edit-color').value || '#4a9eff';
  const weight = parseFloat(document.getElementById('style-edit-weight').value) || 1;
  const fillOn = document.getElementById('style-edit-fill').checked;
  const fillOpacity = parseFloat(document.getElementById('style-edit-fillop').value);
  const fillColor = fillOn ? (document.getElementById('style-edit-fillcolor').value || color) : color;
  const radius = parseFloat(document.getElementById('style-edit-radius').value) || 5;

  for (const feat of targets) {
    const st = { color, weight, fillColor, fillOpacity: fillOn ? fillOpacity : 0, radius };
    feat.style = Object.assign({}, feat.style, {
      lineColor: color,
      lineWidth: weight,
      fillColor: fillColor,
      fillOpacity: fillOn ? fillOpacity : 0,
      fill: fillOn,
      outline: weight > 0,
      radius: (feat.geometry.type === 'Point') ? radius : (feat.style ? feat.style.radius : undefined),
      iconHref: feat.style ? feat.style.iconHref : null,
      iconScale: feat.style ? feat.style.iconScale : 1,
    });
    if (feat.geometry.type === 'Point') feat.style.radius = radius;
    applyStyleToFeatureElement(feat, st);
  }

  rerenderActiveView();
  closeStyleEditor();
  updateStatus(`已调整 ${targets.length} 个要素的样式`, 'success');
}

// 根据当前模式重渲染可见视图
function rerenderActiveView() {
  if (state.mode === 'select' && state.selectKml) {
    if (state.selectedFeatures.length > 0 && state.drawnShape) highlightSelectedOnMap(state.selectedFeatures);
    else renderSelectKmlOnMap();
  } else if (state.gridKml) {
    if (state.splitResults.length > 0) colorGridByResults(state.splitResults);
    else renderGridOnMap();
  }
  applySymbolScale();
}

/* ====== Settings ====== */
function openSettings() {
  document.getElementById('settings-modal').classList.add('visible');
  document.getElementById('setting-show-map').checked = state.settings.showMap;
  document.getElementById('setting-default-tile').value = state.settings.defaultTile;
  document.getElementById('setting-auto-fit').checked = state.settings.autoFit;
  document.getElementById('setting-ref-scale').checked = state.settings.refScale;
  document.getElementById('setting-ref-zoom').value = state.settings.refZoom;
  document.getElementById('setting-apply-source-style').checked = state.settings.applySourceStyle;
  document.getElementById('setting-show-point-labels').checked = state.settings.showPointLabels;
  if (state.map) {
    document.getElementById('ref-zoom-hint').textContent = `当前缩放级别：${state.map.getZoom()}`;
  }
}

function closeSettings() {
  document.getElementById('settings-modal').classList.remove('visible');
}

function saveSettings() {
  state.settings.showMap = document.getElementById('setting-show-map').checked;
  state.settings.defaultTile = document.getElementById('setting-default-tile').value;
  state.settings.autoFit = document.getElementById('setting-auto-fit').checked;
  state.settings.refScale = document.getElementById('setting-ref-scale').checked;
  state.settings.refZoom = parseInt(document.getElementById('setting-ref-zoom').value, 10) || 10;
  state.settings.applySourceStyle = document.getElementById('setting-apply-source-style').checked;
  state.settings.showPointLabels = document.getElementById('setting-show-point-labels').checked;

  document.getElementById('map-panel').style.display = state.settings.showMap ? '' : 'none';
  if (state.settings.showMap) setTimeout(() => state.map.invalidateSize(), 100);

  try {
    localStorage.setItem('kml-split-tool-settings', JSON.stringify(state.settings));
  } catch (e) { /* ignore */ }

  applySymbolScale(); // 立即按新设置重算符号大小
  rerenderActiveView(); // 点标签开关需重绘
  closeSettings();
  updateStatus('设置已保存', 'success');
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('kml-split-tool-settings');
    if (saved) {
      const s = JSON.parse(saved);
      state.settings = { ...state.settings, ...s };
    }
  } catch (e) { /* use defaults */ }

  document.getElementById('setting-show-map').checked = state.settings.showMap;
  document.getElementById('setting-default-tile').value = state.settings.defaultTile;
  document.getElementById('setting-auto-fit').checked = state.settings.autoFit;
  document.getElementById('setting-ref-scale').checked = state.settings.refScale;
  document.getElementById('setting-ref-zoom').value = state.settings.refZoom;
  document.getElementById('setting-apply-source-style').checked = state.settings.applySourceStyle;
  document.getElementById('setting-show-point-labels').checked = state.settings.showPointLabels;
  document.getElementById('map-panel').style.display = state.settings.showMap ? '' : 'none';

  if (state.settings.showMap) setTimeout(() => state.map.invalidateSize(), 100);
  applySymbolScale();
}

/* ====== Utility Functions ====== */
function showSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function hideSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function updateStatus(msg, type) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  el.style.color = type === 'error' ? 'var(--error)' :
    type === 'success' ? 'var(--success)' :
    type === 'info' ? 'var(--accent)' : '';
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
