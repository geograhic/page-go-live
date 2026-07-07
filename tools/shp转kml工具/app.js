/* ============================================================
 * SHP → KML 转换工具
 * 纯浏览器端：shpjs + opentype.js + proj4 + Leaflet
 * ============================================================ */

// ============ CONFIG ============

const TILE_SOURCES = {
  amap_map: { name: '高德地图', url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', sub: '1234', attr: '© 高德' },
  amap_sat: { name: '高德卫星', url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', sub: '1234', attr: '© 高德' },
  osm: { name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', sub: 'abc', attr: '© OpenStreetMap' },
  google_map: { name: 'Google 地图', url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', sub: '0123', attr: '© Google' },
  google_sat: { name: 'Google 卫星', url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', sub: '0123', attr: '© Google' },
};

// CGCS2000 / 3-degree Gauss-Kruger projections (no false easting prefix)
const PROJ_DEFS = {
  4326: '+proj=longlat +datum=WGS84 +no_defs +type=crs',
  4490: '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
  4479: '+proj=longlat +ellps=GRS80 +no_defs +type=crs',
  4513: '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4514: '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4515: '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4516: '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4517: '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4518: '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4519: '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4520: '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4521: '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4522: '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4523: '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4524: '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4525: '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4526: '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4527: '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4528: '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4529: '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4530: '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4531: '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4532: '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4533: '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  // With zone prefix (false easting = zone_number * 1000000 + 500000)
  4534: '+proj=tmerc +lat_0=0 +lon_0=75 +k=1 +x_0=39500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4535: '+proj=tmerc +lat_0=0 +lon_0=78 +k=1 +x_0=40500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4536: '+proj=tmerc +lat_0=0 +lon_0=81 +k=1 +x_0=41500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4537: '+proj=tmerc +lat_0=0 +lon_0=84 +k=1 +x_0=42500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4538: '+proj=tmerc +lat_0=0 +lon_0=87 +k=1 +x_0=43500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4539: '+proj=tmerc +lat_0=0 +lon_0=90 +k=1 +x_0=44500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4540: '+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=45500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4541: '+proj=tmerc +lat_0=0 +lon_0=96 +k=1 +x_0=46500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4542: '+proj=tmerc +lat_0=0 +lon_0=99 +k=1 +x_0=47500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4543: '+proj=tmerc +lat_0=0 +lon_0=102 +k=1 +x_0=48500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4544: '+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=49500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4545: '+proj=tmerc +lat_0=0 +lon_0=108 +k=1 +x_0=50500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4546: '+proj=tmerc +lat_0=0 +lon_0=111 +k=1 +x_0=51500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4547: '+proj=tmerc +lat_0=0 +lon_0=114 +k=1 +x_0=52500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4548: '+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=53500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4549: '+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=54500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4550: '+proj=tmerc +lat_0=0 +lon_0=123 +k=1 +x_0=55500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4551: '+proj=tmerc +lat_0=0 +lon_0=126 +k=1 +x_0=56500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4552: '+proj=tmerc +lat_0=0 +lon_0=129 +k=1 +x_0=57500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4553: '+proj=tmerc +lat_0=0 +lon_0=132 +k=1 +x_0=58500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  4554: '+proj=tmerc +lat_0=0 +lon_0=135 +k=1 +x_0=59500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs',
  // UTM
  32649: '+proj=utm +zone=49 +datum=WGS84 +units=m +no_defs +type=crs',
  32650: '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs +type=crs',
  32651: '+proj=utm +zone=51 +datum=WGS84 +units=m +no_defs +type=crs',
};

// Register proj4 defs
Object.entries(PROJ_DEFS).forEach(([code, def]) => proj4.defs(`EPSG:${code}`, def));

const FONT_URLS = [
  'fonts/SimHei-Bold.ttf',
  'fonts/Roboto-Black.ttf',
];

// ============ STATE ============

const state = {
  geojson: null,         // parsed GeoJSON FeatureCollection
  geomType: null,        // 'Polygon' | 'LineString' | 'Point' | 'MultiPolygon' etc
  fields: [],            // field names from dbf
  font: null,            // opentype.js font object
  fontLoading: false,
  fontError: null,
  currentFontPath: null, // track which font is loaded
  prjWkt: null,          // .prj file content
  detectedCrs: null,     // auto-detected EPSG code
  map: null,
  tileLayer: null,
  dataLayer: null,
  previewLayer: null,
  settings: {
    showMap: true,
    defaultTile: 'amap_map',
    autoFit: true,
  },
  outputBlob: null,
  outputName: null,
};

// ============ GCJ02 ALGORITHM ============

const GCJ02 = {
  a: 6378245.0,
  ee: 0.00669342162296594323,

  transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  },

  transformLng(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * Math.PI) + 66.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  },

  wgs2gcj(lng, lat) {
    let dLat = this.transformLat(lng - 105.0, lat - 35.0);
    let dLng = this.transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - this.ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((this.a * (1 - this.ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (this.a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lng + dLng, lat + dLat];
  },

  gcj2wgs(lng, lat) {
    let [gLng, gLat] = [lng, lat];
    for (let i = 0; i < 30; i++) {
      const [tx, ty] = this.wgs2gcj(gLng, gLat);
      const dLng = lng - tx;
      const dLat = lat - ty;
      gLng += dLng;
      gLat += dLat;
      if (Math.abs(dLng) < 1e-9 && Math.abs(dLat) < 1e-9) break;
    }
    return [gLng, gLat];
  },
};

// ============ FONT LOADING ============

const BUNDLED_FONTS = {
  'fonts/SimHei-Bold.ttf': { label: '黑体 (SimHei)', note: '内置中英文+数字' },
  'fonts/MicrosoftYaHei-Bold.ttf': { label: '微软雅黑 Bold', note: '现代无衬线中文字体' },
  'fonts/SimSun.ttf': { label: '宋体 (SimSun)', note: '衬线中文字体' },
  'fonts/DejaVuSans-Bold.ttf': { label: 'DejaVu Sans Bold', note: '开源拉丁/数字字体' },
  'fonts/Roboto-Black.ttf': { label: 'Roboto Black', note: '现代粗体拉丁/数字字体' },
};

async function loadFont(fontPath) {
  // If no path given, use default
  if (!fontPath) {
    fontPath = FONT_URLS[0];
  }

  // If already loaded this font, skip
  if (state.font && state.currentFontPath === fontPath) return;
  state.fontLoading = true;
  state.currentFontPath = fontPath;

  // For custom uploaded fonts, fontPath is a data URL or array buffer
  if (fontPath instanceof ArrayBuffer) {
    try {
      const font = opentype.parse(fontPath);
      state.font = font;
      state.fontError = null;
      state.fontLoading = false;
      console.log('Custom font loaded from buffer');
      updateStatus('字体加载成功（自定义）');
      return;
    } catch (e) {
      console.warn('Custom font parse failed:', e.message);
      state.fontLoading = false;
      state.fontError = '无法解析上传的字体文件';
      updateStatus('⚠ 字体解析失败，标注将使用文本标签', 'warn');
      return;
    }
  }

  // For bundled fonts, prefer embedded base64 data (works under file:// protocol)
  const embeddedBase64 = (typeof self !== 'undefined' && self.FONT_BASE64_MAP && self.FONT_BASE64_MAP[fontPath]) || null;
  if (embeddedBase64) {
    try {
      const buffer = base64ToArrayBuffer(embeddedBase64);
      const font = opentype.parse(buffer);
      state.font = font;
      state.fontError = null;
      state.fontLoading = false;
      console.log('Font loaded from embedded base64:', fontPath);
      updateStatus('字体加载成功');
      return;
    } catch (e) {
      console.warn('Embedded base64 parse failed:', fontPath, e.message);
      // Fall through to fetch fallback
    }
  }

  // Load from local file path (fetch + parse for better reliability)
  try {
    console.log('Loading font from:', fontPath);
    const response = await fetch(fontPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const font = opentype.parse(buffer);
    state.font = font;
    state.fontError = null;
    state.fontLoading = false;
    state.currentFontPath = fontPath;
    console.log('Font loaded successfully');
    updateStatus('字体加载成功');
    return;
  } catch (e) {
    console.warn('Font load failed:', fontPath, e.message);
    state.fontLoading = false;
    state.fontError = '无法加载字体，标注将使用文本标签代替';
    updateStatus('⚠ 字体加载失败，标注将使用文本标签', 'warn');
  }
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function detectCrsFromCoords(coords) {
  // Check if all coordinates are within WGS84 range
  let allInWgs84 = true;
  for (const [x, y] of coords) {
    if (x < -180 || x > 180 || y < -90 || y > 90) {
      allInWgs84 = false;
      break;
    }
  }
  if (allInWgs84) return 4326; // Already WGS84

  // Projected coordinates - try to infer CGCS2000 3-degree zone
  let minX = Infinity, maxX = -Infinity, sumY = 0, count = 0;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    sumY += y;
    count++;
  }
  const avgY = sumY / count;

  // CGCS2000 3-degree zone WITH zone-number prefix: x in 39.5M~59.5M (zone 39~59)
  if (minX > 39000000 && maxX < 60000000 && avgY > 0 && avgY < 6000000) {
    const zone = Math.round(minX / 1000000);          // 带号 39~59
    const cm = 75 + (zone - 39) * 3;                   // 反推中央经线
    const baseCode = 4513 + Math.round((cm - 75) / 3) + 21; // 4534~4554
    if (baseCode >= 4534 && baseCode <= 4554) return baseCode;
  }

  // Chinese CGCS2000 3-degree zone (no prefix): x in 100k~900k, y in 500k~5500k
  if (minX > 100000 && maxX < 900000 && avgY > 500000 && avgY < 5500000) {
    const latApprox = avgY / 111000;
    if (latApprox > 38) return 4527;      // CM 117E (Beijing)
    else if (latApprox > 28) return 4526; // CM 114E (Central/South)
    else if (latApprox > 20) return 4526; // CM 114E (Guangdong)
    else return 4525;                     // CM 111E (Far South)
  }

  // UTM fallback
  if (minX > 100000 && maxX < 900000 && avgY > 0 && avgY < 10000000) {
    const lonApprox = (minX + maxX) / 2 / 1000000;
    const zone = Math.floor((lonApprox + 180) / 6) + 1;
    return 32600 + Math.min(zone, 60);
  }

  return null;
}

// ============ SHP PARSING ============

async function parseShpFiles(files) {
  updateStatus('解析矢量文件...');

  const fileMap = {};
  for (const f of files) {
    const ext = f.name.split('.').pop().toLowerCase();
    fileMap[ext] = f;
  }

  // Check for missing companion files
  const missingFiles = [];
  if (!fileMap.dbf && !fileMap.zip) {
    missingFiles.push('.dbf（属性表）');
  }
  if (!fileMap.prj && !fileMap.zip) {
    missingFiles.push('.prj（坐标系定义）');
  }

  let shpBuf, dbfBuf, cpgText, prjWkt;

  if (fileMap.zip) {
    // 手动解压 zip：shp(buf) 会读取 zip 内 .prj 并自动反投影坐标，
    // 与本工具后续 proj4 转换叠加会产生"双重转换"导致严重位置偏移。
    // 改为解压后只取原始几何，坐标转换统一交由 transformCoordinates 处理。
    const zipAb = await fileMap.zip.arrayBuffer();
    const zip = await JSZip.loadAsync(zipAb);
    let shpE = null, dbfE = null, prjE = null, cpgE = null;
    Object.values(zip.files).forEach(e => {
      if (e.dir) return;
      const ext = e.name.split('.').pop().toLowerCase();
      if (ext === 'shp' && !shpE) shpE = e;
      else if (ext === 'dbf' && !dbfE) dbfE = e;
      else if (ext === 'prj' && !prjE) prjE = e;
      else if (ext === 'cpg' && !cpgE) cpgE = e;
    });
    if (!shpE) throw new Error('ZIP 中未找到 .shp 文件');
    shpBuf = await shpE.async('arraybuffer');
    if (dbfE) dbfBuf = await dbfE.async('arraybuffer');
    if (prjE) prjWkt = await prjE.async('text');
    if (cpgE) cpgText = await cpgE.async('text');
  } else if (fileMap.shp) {
    shpBuf = await fileMap.shp.arrayBuffer();
    if (fileMap.dbf) dbfBuf = await fileMap.dbf.arrayBuffer();
    if (fileMap.prj) prjWkt = await fileMap.prj.text();
    if (fileMap.cpg) cpgText = await fileMap.cpg.text();
  } else {
    throw new Error('未找到 .shp 或 .zip 文件');
  }

  // 读取 .prj 仅用于检测源坐标系。切勿将 prjWkt 传给 shp.parseShp ——
  // shp.js 内部会据此自动反投影，与 transformCoordinates 的 proj4 转换叠加会双重转换。
  if (prjWkt) {
    state.prjWkt = prjWkt;
    state.detectedCrs = detectCrsFromWkt(prjWkt);
    if (state.detectedCrs) {
      const sel = document.getElementById('src-crs');
      sel.value = String(state.detectedCrs);
      updateCoordHelp();
    }
  } else {
    state.prjWkt = null;
  }

  // 解析几何（保持原始坐标，投影转换由 transformCoordinates 统一处理）
  const geoms = shp.parseShp(shpBuf);

  let geojson;
  if (dbfBuf) {
    const props = shp.parseDbf(dbfBuf, cpgText);
    geojson = shp.combine([geoms, props]);
  } else {
    const features = geoms.map(geom => ({ type: 'Feature', geometry: geom, properties: {} }));
    geojson = { type: 'FeatureCollection', features };
  }

  if (!geojson || !geojson.features) {
    throw new Error('解析失败：无要素数据');
  }

  state.geojson = geojson;

  // Detect geometry type
  const firstGeom = geojson.features[0]?.geometry;
  if (firstGeom) {
    state.geomType = firstGeom.type;
  }

  // Extract fields from first feature
  if (geojson.features[0]?.properties) {
    state.fields = Object.keys(geojson.features[0].properties);
  }

  // If no .prj, try to infer CRS from coordinates
  if (!state.detectedCrs) {
    const allCoords = [];
    for (const feat of geojson.features) {
      allCoords.push(...extractAllCoords(feat.geometry));
    }
    state.detectedCrs = detectCrsFromCoords(allCoords);
    if (state.detectedCrs) {
      const sel = document.getElementById('src-crs');
      sel.value = String(state.detectedCrs);
      updateCoordHelp();
      updateStatus(`已自动推断坐标系 EPSG:${state.detectedCrs}，请确认`, 'warn');
    }
  }

  displayShpInfo(missingFiles);
  populateFieldSelectors();
  showSections();
  updateAnnoHelp();

  // Load map preview
  if (state.settings.showMap) {
    renderMapData();
    if (state.settings.autoFit) fitBounds();
  }

  updateStatus(`已加载 ${geojson.features.length} 个要素（${state.geomType || '未知类型'}）`);
}

function detectCrsFromWkt(wkt) {
  const wktUpper = wkt.trim().toUpperCase();
  // Common patterns in Chinese .prj files
  if (wktUpper.startsWith('GEOGCS') || wktUpper.startsWith('GEOGCRS')) {
    // Geographic CRS - check datum
    if (wkt.includes('WGS_1984') || wkt.includes('WGS 84') || wkt.includes('WGS84')) return 4326;
    if (wkt.includes('CGCS2000') || wkt.includes('China_2000')) return 4490;
    return null; // Unknown geographic CRS
  }
  // Projected CRS (PROJCS/PROJCRS) - extract projection params
  if (wktUpper.startsWith('PROJCS') || wktUpper.startsWith('PROJCRS')) {
    // CGCS2000 3-degree Gauss-Kruger
    if (wkt.includes('CGCS2000') || wkt.includes('China_2000')) {
      // Case-insensitive match for central_meridian / Central_Meridian
      const cmMatch = wkt.match(/central_meridian["\s,]+(\d+\.?\d*)/i);
      if (cmMatch) {
        const cm = parseFloat(cmMatch[1]);
        const feMatch = wkt.match(/false_easting["\s,]+(\d+)/i);
        const hasPrefix = feMatch && parseInt(feMatch[1]) > 10000000;
        const baseCode = 4513 + Math.round((cm - 75) / 3);
        if (hasPrefix) return baseCode + 21; // 4534+ zone (with prefix)
        return baseCode; // 4513+ zone (no prefix)
      }
    }
    // UTM
    if (wkt.includes('UTM') || (wkt.includes('WGS_1984') && wkt.includes('Transverse_Mercator'))) {
      const zoneMatch = wkt.match(/zone[",\s]+(\d+)/i);
      if (zoneMatch) return 32600 + parseInt(zoneMatch[1]);
    }
  }
  return null;
}

function displayShpInfo(missingFiles) {
  const el = document.getElementById('shp-info');
  el.style.display = 'block';

  const f = state.geojson.features;
  const sample = f[0];

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const coords = state.geojson.features.flatMap(feat => extractAllCoords(feat.geometry));
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  let warningHtml = '';
  if (missingFiles && missingFiles.length > 0) {
    warningHtml = `<div class="info-warning" style="color:#ff6b6b; background:rgba(255,107,107,0.1); border-radius:4px; padding:8px; margin-bottom:8px; font-size:12px;">
      <b>⚠ 缺少文件：</b>${missingFiles.join('、')}。建议将 .shp/.shx/.dbf/.prj 打包为 .zip 上传，或同时选择所有文件。
    </div>`;
  }

  el.innerHTML = warningHtml + `
    <div class="info-row"><span class="info-label">要素数量</span><span class="info-value">${f.length}</span></div>
    <div class="info-row"><span class="info-label">几何类型</span><span class="info-value">${state.geomType}</span></div>
    <div class="info-row"><span class="info-label">字段数量</span><span class="info-value">${state.fields.length}</span></div>
    <div class="info-row"><span class="info-label">范围 X</span><span class="info-value">${minX.toFixed(2)} ~ ${maxX.toFixed(2)}</span></div>
    <div class="info-row"><span class="info-label">范围 Y</span><span class="info-value">${minY.toFixed(2)} ~ ${maxY.toFixed(2)}</span></div>
    ${state.detectedCrs ? `<div class="info-row"><span class="info-label">检测坐标系</span><span class="info-value">EPSG:${state.detectedCrs}</span></div>` : ''}
  `;
}

function extractAllCoords(geometry) {
  const result = [];
  if (!geometry) return result;

  switch (geometry.type) {
    case 'Point':
      result.push(geometry.coordinates);
      break;
    case 'MultiPoint':
    case 'LineString':
      result.push(...geometry.coordinates);
      break;
    case 'MultiLineString':
    case 'Polygon':
      for (const ring of geometry.coordinates) result.push(...ring);
      break;
    case 'MultiPolygon':
      for (const poly of geometry.coordinates)
        for (const ring of poly) result.push(...ring);
      break;
  }
  return result;
}

function populateFieldSelectors() {
  const annoField = document.getElementById('anno-field');
  const splitField = document.getElementById('split-field');

  const options = state.fields.map(f => `<option value="${f}">${f}</option>`).join('');
  annoField.innerHTML = options;
  splitField.innerHTML = options;

  // Auto-select common field names
  const commonNames = ['PageNumber', 'pagenumber', 'Name', 'name', '编号', '名称', 'ID', 'id'];
  for (const cn of commonNames) {
    if (state.fields.includes(cn)) {
      annoField.value = cn;
      splitField.value = cn;
      break;
    }
  }
}

function showSections() {
  ['annotation-section', 'style-section', 'coord-section', 'export-section'].forEach(id => {
    document.getElementById(id).style.display = 'block';
  });
  document.getElementById('btn-generate').disabled = false;
}

// ============ ANNOTATION HELP ============

function updateAnnoHelp() {
  const el = document.getElementById('anno-help');
  if (!state.geomType) return;

  let msg = '';
  if (state.geomType.includes('Polygon')) {
    msg = '<b>面要素</b>：标注将渲染为字形轮廓<b>多边形面</b>（Polygon），填充半透明色，按所选位置放置于要素范围内。';
  } else if (state.geomType.includes('LineString')) {
    msg = '<b>线要素</b>：标注将渲染为字形轮廓<b>线划</b>（LineString），以描边形式展示，按所选位置放置于要素范围内。';
  } else if (state.geomType.includes('Point')) {
    msg = '<b>点要素</b>：标注将渲染为字形轮廓<b>小尺寸多边形</b>，以点位置为中心放置。';
  }
  el.innerHTML = msg;
}

function updateCoordHelp() {
  const el = document.getElementById('coord-help');
  const src = document.getElementById('src-crs').value;
  const dst = document.getElementById('dst-crs').value;

  let msg = '';
  if (src === 'auto') {
    msg = state.detectedCrs
      ? `已从 .prj 自动检测为 <b>EPSG:${state.detectedCrs}</b>。`
      : '未检测到 .prj 文件或无法识别，请<b>手动选择</b>源坐标系。';
  } else {
    msg = `源坐标系：<b>EPSG:${src}</b>。`;
  }

  if (dst === 'gcj02') {
    msg += ' 输出为 <b>GCJ02（火星坐标）</b>：WGS84→GCJ02 偏移转换将自动应用。适用于直接在 Google Earth / 高德地图显示的 KML。';
  } else {
    msg += ' 输出为 <b>WGS84</b>：标准 KML 坐标，适用于 Google Earth 原生显示。';
  }
  el.innerHTML = msg;
}

// ============ GLYPH GENERATION ============

/**
 * Convert opentype.js Path to polygon coordinate arrays.
 * Each polygon = array of [x, y] points (closed ring).
 */
function pathToPolygons(path, flattenSteps = 8) {
  const polygons = [];
  let currentRing = [];

  for (const cmd of path.commands) {
    switch (cmd.type) {
      case 'M': // moveTo
        if (currentRing.length > 1) {
          closeRing(currentRing);
          polygons.push(currentRing);
        }
        currentRing = [[cmd.x, cmd.y]];
        break;
      case 'L': // lineTo
        currentRing.push([cmd.x, cmd.y]);
        break;
      case 'Q': // quadraticCurveTo
        if (currentRing.length > 0) {
          const prev = currentRing[currentRing.length - 1];
          for (let i = 1; i <= flattenSteps; i++) {
            const t = i / flattenSteps;
            const x = (1 - t) * (1 - t) * prev[0] + 2 * (1 - t) * t * cmd.x1 + t * t * cmd.x;
            const y = (1 - t) * (1 - t) * prev[1] + 2 * (1 - t) * t * cmd.y1 + t * t * cmd.y;
            currentRing.push([x, y]);
          }
        }
        break;
      case 'C': // bezierCurveTo
        if (currentRing.length > 0) {
          const prev = currentRing[currentRing.length - 1];
          for (let i = 1; i <= flattenSteps; i++) {
            const t = i / flattenSteps;
            const x = Math.pow(1 - t, 3) * prev[0] +
                      3 * Math.pow(1 - t, 2) * t * cmd.x1 +
                      3 * (1 - t) * t * t * cmd.x2 +
                      t * t * t * cmd.x;
            const y = Math.pow(1 - t, 3) * prev[1] +
                      3 * Math.pow(1 - t, 2) * t * cmd.y1 +
                      3 * (1 - t) * t * t * cmd.y2 +
                      t * t * t * cmd.y;
            currentRing.push([x, y]);
          }
        }
        break;
      case 'Z': // closePath
        if (currentRing.length > 1) {
          closeRing(currentRing);
          polygons.push(currentRing);
          currentRing = [];
        }
        break;
    }
  }
  if (currentRing.length > 1) {
    closeRing(currentRing);
    polygons.push(currentRing);
  }
  return polygons;
}

function closeRing(ring) {
  if (ring.length > 0) {
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([first[0], first[1]]);
    }
  }
}

/**
 * Position anchors for glyph placement within feature bbox.
 * [anchorX, anchorY] where 0=left/bottom, 0.5=center, 1=right/top.
 * Y in geographic coords: top = maxY, bottom = minY.
 */
const POSITION_ANCHORS = {
  'center':        [0.5, 0.5],
  'top-left':      [0.0, 1.0],
  'top-center':    [0.5, 1.0],
  'top-right':     [1.0, 1.0],
  'middle-left':   [0.0, 0.5],
  'middle-right':  [1.0, 0.5],
  'bottom-left':   [0.0, 0.0],
  'bottom-center': [0.5, 0.0],
  'bottom-right':  [1.0, 0.0],
};

const POSITION_LABELS = {
  'center': '居中',
  'top-left': '左上',
  'top-center': '上中',
  'top-right': '右上',
  'middle-left': '左中',
  'middle-right': '右中',
  'bottom-left': '左下',
  'bottom-center': '下中',
  'bottom-right': '右下',
};

/**
 * Get glyph polygons for a text string, scaled and positioned within a bounding box.
 * @param {string} text - The text to render (e.g., "27")
 * @param {object} bbox - Feature bbox from getFeatureCenterBBox ({minX,minY,maxX,maxY,boxW,boxH,cx,cy})
 * @param {number} widthPct - Max width as % of boxW (0-1)
 * @param {number} heightPct - Max height as % of boxH (0-1)
 * @param {string} position - Position key from POSITION_ANCHORS
 * @returns {Array<Array<[number, number]>>} Array of polygon rings
 */
function generateGlyphs(text, bbox, widthPct, heightPct, position) {
  if (!state.font || !text) return [];

  // Get path at size 100
  const fontSize = 100;
  const path = state.font.getPath(text, 0, 0, fontSize);
  const polygons = pathToPolygons(path, 6);
  if (polygons.length === 0) return [];

  // Compute bounding box of all polygons (in font units)
  let gMinX = Infinity, gMinY = Infinity, gMaxX = -Infinity, gMaxY = -Infinity;
  for (const ring of polygons) {
    for (const [x, y] of ring) {
      if (x < gMinX) gMinX = x;
      if (x > gMaxX) gMaxX = x;
      if (y < gMinY) gMinY = y;
      if (y > gMaxY) gMaxY = y;
    }
  }

  const glyphW = gMaxX - gMinX;
  const glyphH = gMaxY - gMinY;
  if (glyphW <= 0 || glyphH <= 0) return [];

  // Scale to fit within the requested percentage of the feature bbox
  const targetW = bbox.boxW * widthPct;
  const targetH = bbox.boxH * heightPct;
  const scale = Math.min(targetW / glyphW, targetH / glyphH);
  const scaledGlyphW = glyphW * scale;
  const scaledGlyphH = glyphH * scale;

  // Determine anchor point on feature bbox based on position
  const [ax, ay] = POSITION_ANCHORS[position] || POSITION_ANCHORS['center'];
  const featAnchorX = bbox.minX + ax * bbox.boxW;
  const featAnchorY = bbox.minY + ay * bbox.boxH;

  // Compute offset so that the glyph's corresponding anchor point aligns with featAnchor
  // After transform: x' = x * scale + offsetX, y' = offsetY - (y - gMinY) * scale
  // Glyph bbox in geo coords: left = offsetX + gMinX*scale, right = left + scaledGlyphW
  //                           top = offsetY, bottom = offsetY - scaledGlyphH
  const offsetX = featAnchorX - gMinX * scale - ax * scaledGlyphW;
  const offsetY = featAnchorY + (1 - ay) * scaledGlyphH;

  // Transform each polygon point (flip Y: font Y goes down, geo Y goes up)
  return polygons.map(ring =>
    ring.map(([x, y]) => [
      x * scale + offsetX,
      offsetY - (y - gMinY) * scale
    ])
  );
}

/**
 * Get the center and bounding box of a geometry feature.
 */
function getFeatureCenterBBox(geometry) {
  const coords = extractAllCoords(geometry);
  if (coords.length === 0) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    sumX += x;
    sumY += y;
  }

  return {
    cx: sumX / coords.length,
    cy: sumY / coords.length,
    boxW: maxX - minX,
    boxH: maxY - minY,
    minX, minY, maxX, maxY,
  };
}

// ============ COORDINATE TRANSFORMATION ============

function transformCoordinates(coords, srcCrs, dstCrs) {
  // If source is projected and target is WGS84 or GCJ02
  const needsProj = srcCrs !== '4326' && srcCrs !== '4490' && srcCrs !== '4479' && srcCrs !== 'gcj02';
  const needsGcj = dstCrs === 'gcj02';

  if (!needsProj && !needsGcj) return coords;

  // Step 1: Project to WGS84 if needed
  let result = coords;
  if (needsProj) {
    const srcCode = parseInt(srcCrs);
    const srcDef = PROJ_DEFS[srcCode];
    if (srcDef) {
      result = result.map(([x, y]) => proj4(`EPSG:${srcCode}`, 'EPSG:4326', [x, y]));
    }
  }

  // Step 2: WGS84 → GCJ02 if needed
  if (needsGcj) {
    result = result.map(([lng, lat]) => GCJ02.wgs2gcj(lng, lat));
  }

  return result;
}

function transformGeometry(geometry, srcCrs, dstCrs) {
  if (!geometry) return null;
  const src = srcCrs === 'auto' ? (state.detectedCrs || '4326') : srcCrs;

  switch (geometry.type) {
    case 'Point':
      return { type: 'Point', coordinates: transformCoordinates([geometry.coordinates], src, dstCrs)[0] };

    case 'MultiPoint':
      return { type: 'MultiPoint', coordinates: transformCoordinates(geometry.coordinates, src, dstCrs) };

    case 'LineString':
      return { type: 'LineString', coordinates: transformCoordinates(geometry.coordinates, src, dstCrs) };

    case 'MultiLineString':
      return {
        type: 'MultiLineString',
        coordinates: geometry.coordinates.map(ring => transformCoordinates(ring, src, dstCrs))
      };

    case 'Polygon':
      return {
        type: 'Polygon',
        coordinates: geometry.coordinates.map(ring => transformCoordinates(ring, src, dstCrs))
      };

    case 'MultiPolygon':
      return {
        type: 'MultiPolygon',
        coordinates: geometry.coordinates.map(poly =>
          poly.map(ring => transformCoordinates(ring, src, dstCrs))
        )
      };

    default:
      return geometry;
  }
}

// ============ KML BUILDING ============

function colorToKml(hexColor, opacityPercent) {
  // KML color format: AABBGGRR
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const a = Math.round((opacityPercent / 100) * 255);
  return a.toString(16).padStart(2, '0') +
         b.toString(16).padStart(2, '0') +
         g.toString(16).padStart(2, '0') +
         r.toString(16).padStart(2, '0');
}

function fmtCoords(coords) {
  return coords.map(([lon, lat]) => `${lon.toFixed(10)},${lat.toFixed(10)},0`).join(' ');
}

function buildKmlStyles() {
  const vecLineColor = document.getElementById('vec-line-color').value;
  const vecLineWidth = document.getElementById('vec-line-width').value;
  const vecFillColor = document.getElementById('vec-fill-color').value;
  const vecFillOpacity = parseInt(document.getElementById('vec-fill-opacity').value);

  const glyphLineColor = document.getElementById('glyph-line-color').value;
  const glyphLineWidth = document.getElementById('glyph-line-width').value;
  const glyphFillColor = document.getElementById('glyph-fill-color').value;
  const glyphFillOpacity = parseInt(document.getElementById('glyph-fill-opacity').value);

  return `
    <Style id="vector">
      <LineStyle><color>${colorToKml(vecLineColor, 100)}</color><width>${vecLineWidth}</width></LineStyle>
      <PolyStyle><color>${colorToKml(vecFillColor, vecFillOpacity)}</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>
    <Style id="glyph">
      <LineStyle><color>${colorToKml(glyphLineColor, 100)}</color><width>${glyphLineWidth}</width></LineStyle>
      <PolyStyle><color>${colorToKml(glyphFillColor, glyphFillOpacity)}</color><fill>1</fill><outline>1</outline></PolyStyle>
    </Style>
    <Style id="glyph-line">
      <LineStyle><color>${colorToKml(glyphLineColor, 100)}</color><width>${glyphLineWidth}</width></LineStyle>
      <PolyStyle><color>00000000</color><fill>0</fill><outline>1</outline></PolyStyle>
    </Style>`;
}

function geometryToKml(geometry, styleId) {
  switch (geometry.type) {
    case 'Point':
      return `      <Point><coordinates>${fmtCoords([geometry.coordinates])}</coordinates></Point>`;

    case 'MultiPoint':
      return geometry.coordinates.map(c => `      <Point><coordinates>${c[0]},${c[1]},0</coordinates></Point>`).join('\n');

    case 'LineString':
      return `      <LineString><coordinates>${fmtCoords(geometry.coordinates)}</coordinates></LineString>`;

    case 'MultiLineString':
      return geometry.coordinates.map(ring =>
        `      <LineString><coordinates>${fmtCoords(ring)}</coordinates></LineString>`
      ).join('\n');

    case 'Polygon':
      return polygonToKml(geometry, styleId);

    case 'MultiPolygon':
      return geometry.coordinates.map(poly => polygonToKml({ type: 'Polygon', coordinates: poly }, styleId)).join('\n');

    default:
      return '';
  }
}

function polygonToKml(geometry, styleId) {
  const rings = geometry.coordinates;
  if (rings.length === 0) return '';

  let parts = [];
  parts.push(`    <Polygon>`);
  if (styleId) parts.push(`      <styleUrl>#${styleId}</styleUrl>`);
  parts.push('      <extrude>0</extrude><altitudeMode>clampToGround</altitudeMode>');

  // Outer ring
  parts.push('      <outerBoundaryIs><LinearRing>');
  parts.push(`        <coordinates>${fmtCoords(rings[0])}</coordinates>`);
  parts.push('      </LinearRing></outerBoundaryIs>');

  // Inner rings (holes)
  for (let i = 1; i < rings.length; i++) {
    parts.push('      <innerBoundaryIs><LinearRing>');
    parts.push(`        <coordinates>${fmtCoords(rings[i])}</coordinates>`);
    parts.push('      </LinearRing></innerBoundaryIs>');
  }

  parts.push('    </Polygon>');
  return parts.join('\n');
}

function generateKML(mode) {
  const features = state.geojson.features;
  const srcCrs = document.getElementById('src-crs').value;
  const dstCrs = document.getElementById('dst-crs').value;
  const annoEnabled = document.getElementById('anno-enabled').checked;
  const annoField = document.getElementById('anno-field').value;
  const glyphScale = parseInt(document.getElementById('glyph-scale').value) / 100;
  const glyphWidth = parseInt(document.getElementById('glyph-width').value) / 100;
  const glyphPosition = document.querySelector('input[name="anno-position"]:checked')?.value || 'center';
  const prefix = document.getElementById('export-prefix').value || 'output';
  const splitField = document.getElementById('split-field').value;

  const styles = buildKmlStyles();
  const isLine = state.geomType?.includes('LineString');
  const glyphStyleId = isLine ? 'glyph-line' : 'glyph';

  // Transform all features
  const transformed = features.map((feat, idx) => {
    const tGeom = transformGeometry(feat.geometry, srcCrs, dstCrs);
    const props = feat.properties || {};
    const cb = getFeatureCenterBBox(tGeom);
    let glyphs = [];

    if (annoEnabled && state.font && cb && annoField) {
      const textVal = String(props[annoField] ?? '');
      if (textVal) {
        glyphs = generateGlyphs(textVal, cb, glyphWidth, glyphScale, glyphPosition);
      }
    }

    return { idx, geometry: tGeom, properties: props, glyphs, center: cb };
  });

  const results = []; // {filename, content}

  if (mode === 'merged' || mode === 'merged-split') {
    // Build merged KML
    let parts = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
    parts.push('<Document>');
    parts.push(`<name>${prefix}</name>`);
    parts.push(styles);

    for (const item of transformed) {
      parts.push(buildPlacemark(item, annoField, isLine, glyphStyleId));
    }

    parts.push('</Document>');
    parts.push('</kml>');
    results.push({ filename: `${prefix}.kml`, content: parts.join('\n') });
  }

  if (mode === 'split' || mode === 'merged-split') {
    // Split by field value
    for (const item of transformed) {
      const val = String(item.properties[splitField] ?? item.idx);
      const safeVal = val.replace(/[<>:"/\\|?*]/g, '_');
      let parts = [];
      parts.push('<?xml version="1.0" encoding="UTF-8"?>');
      parts.push('<kml xmlns="http://www.opengis.net/kml/2.2">');
      parts.push('<Document>');
      parts.push(`<name>${safeVal}</name>`);
      parts.push(styles);
      parts.push(buildPlacemark(item, annoField, isLine, glyphStyleId));
      parts.push('</Document>');
      parts.push('</kml>');
      results.push({ filename: `${safeVal}.kml`, content: parts.join('\n') });
    }
  }

  return results;
}

function buildPlacemark(item, annoField, isLine, glyphStyleId) {
  const pn = item.properties[annoField] ?? item.idx;
  const name = String(pn);
  let parts = [];
  parts.push('<Placemark>');
  parts.push(`  <name>${escapeXml(name)}</name>`);
  parts.push('  <ExtendedData>');
  for (const [k, v] of Object.entries(item.properties)) {
    parts.push(`    <Data name="${escapeXml(k)}"><value>${escapeXml(String(v))}</value></Data>`);
  }
  parts.push('  </ExtendedData>');
  parts.push('  <MultiGeometry>');

  // Vector geometry
  parts.push(geometryToKml(item.geometry, 'vector'));

  // Glyph polygons
  if (item.glyphs.length > 0) {
    for (const ring of item.glyphs) {
      if (isLine) {
        // Output as LineString
        parts.push(`    <LineString>`);
        parts.push(`      <styleUrl>#${glyphStyleId}</styleUrl>`);
        parts.push(`      <coordinates>${fmtCoords(ring)}</coordinates>`);
        parts.push(`    </LineString>`);
      } else {
        // Output as Polygon
        parts.push(`    <Polygon>`);
        parts.push(`      <styleUrl>#${glyphStyleId}</styleUrl>`);
        parts.push('      <extrude>0</extrude><altitudeMode>clampToGround</altitudeMode>');
        parts.push('      <outerBoundaryIs><LinearRing>');
        parts.push(`        <coordinates>${fmtCoords(ring)}</coordinates>`);
        parts.push('      </LinearRing></outerBoundaryIs>');
        parts.push(`    </Polygon>`);
      }
    }
  }

  parts.push('  </MultiGeometry>');
  parts.push('</Placemark>');
  return parts.join('\n');
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============ KML IMPORT / PREVIEW ============

// State for KML overlay layers (independent of SHP data layer)
state.kmlOverlays = []; // [{ id, name, layer, featureCount, visible, color }]
state.kmlColorIdx = 0;
const KML_OVERLAY_COLORS = ['#2196f3', '#9c27b0', '#00bcd4', '#e91e63', '#4caf50', '#ff5722'];

/**
 * Parse KML text into a GeoJSON FeatureCollection.
 * Supports: Point, LineString, Polygon (with holes), MultiGeometry,
 *           <name>, <ExtendedData><Data>, <SchemaData><SimpleData>.
 * Works with KML default namespace (no prefix) and prefixed namespaces.
 */
function parseKml(text) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'application/xml');
  if (xml.getElementsByTagName('parsererror').length > 0) {
    throw new Error('KML XML 解析失败，请检查文件格式');
  }

  // Collect all Placemark elements (robust to namespace prefixes)
  const placemarks = collectByLocalName(xml, 'Placemark');
  const features = [];
  for (const pm of placemarks) {
    const feat = parseKmlPlacemark(pm);
    if (feat && feat.geometry) features.push(feat);
  }
  return { type: 'FeatureCollection', features };
}

function collectByLocalName(root, localName) {
  const out = [];
  const all = root.getElementsByTagName('*');
  for (let i = 0; i < all.length; i++) {
    if (all[i].localName === localName) out.push(all[i]);
  }
  return out;
}

function parseKmlPlacemark(pm) {
  const props = {};
  const nameEl = firstChildByLocalName(pm, 'name');
  if (nameEl) props.name = nameEl.textContent.trim();

  // ExtendedData > Data > value
  const dataEls = collectByLocalName(pm, 'Data');
  for (const d of dataEls) {
    // Only direct Data children of ExtendedData within this placemark
    if (!isDescendantOfPlacemark(d, pm)) continue;
    const key = d.getAttribute('name');
    const valEl = firstChildByLocalName(d, 'value');
    if (key && valEl) props[key] = valEl.textContent.trim();
  }
  // SchemaData > SimpleData
  const sdEls = collectByLocalName(pm, 'SimpleData');
  for (const sd of sdEls) {
    const key = sd.getAttribute('name');
    if (key) props[key] = sd.textContent.trim();
  }

  const geometry = parseKmlGeometry(pm);
  return geometry ? { type: 'Feature', properties: props, geometry } : null;
}

function isDescendantOfPlacemark(el, placemark) {
  let node = el.parentNode;
  while (node) {
    if (node === placemark) return true;
    node = node.parentNode;
  }
  return false;
}

// Portable: iterate element children only (works in browser DOM and Node XML parsers)
function childElements(parent) {
  if (!parent) return [];
  if (parent.children) return Array.from(parent.children);
  const out = [];
  for (let n = parent.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === 1) out.push(n);
  }
  return out;
}

function firstChildByLocalName(parent, localName) {
  for (const child of childElements(parent)) {
    if (child.localName === localName) return child;
  }
  return null;
}

function directChildrenByLocalName(parent, localName) {
  return childElements(parent).filter(child => child.localName === localName);
}

function parseKmlGeometry(parent) {
  // Try direct geometry children (not nested inside MultiGeometry)
  const pt = firstChildByLocalName(parent, 'Point');
  if (pt) return { type: 'Point', coordinates: parseKmlCoords(pt)[0] || [] };

  const ls = firstChildByLocalName(parent, 'LineString');
  if (ls) return { type: 'LineString', coordinates: parseKmlCoords(ls) };

  const poly = firstChildByLocalName(parent, 'Polygon');
  if (poly) return parseKmlPolygon(poly);

  const mg = firstChildByLocalName(parent, 'MultiGeometry');
  if (mg) {
    const geoms = [];
    for (const child of childElements(mg)) {
      const ln = child.localName;
      if (ln === 'Point') geoms.push({ type: 'Point', coordinates: parseKmlCoords(child)[0] || [] });
      else if (ln === 'LineString') geoms.push({ type: 'LineString', coordinates: parseKmlCoords(child) });
      else if (ln === 'Polygon') geoms.push(parseKmlPolygon(child));
      else if (ln === 'MultiGeometry') { const n = parseKmlGeometry(child); if (n) geoms.push(n); }
    }
    return simplifyMultiGeometry(geoms);
  }
  return null;
}

function simplifyMultiGeometry(geoms) {
  if (geoms.length === 0) return null;
  if (geoms.length === 1) return geoms[0];
  const types = new Set(geoms.map(g => g.type));
  if (types.size === 1) {
    const t = geoms[0].type;
    if (t === 'Point') return { type: 'MultiPoint', coordinates: geoms.map(g => g.coordinates) };
    if (t === 'LineString') return { type: 'MultiLineString', coordinates: geoms.map(g => g.coordinates) };
    if (t === 'Polygon') return { type: 'MultiPolygon', coordinates: geoms.map(g => g.coordinates) };
  }
  // Mixed types — return as GeometryCollection
  return { type: 'GeometryCollection', geometries: geoms };
}

function parseKmlPolygon(poly) {
  const rings = [];
  const outer = firstChildByLocalName(poly, 'outerBoundaryIs');
  if (outer) {
    const lr = firstChildByLocalName(outer, 'LinearRing');
    if (lr) rings.push(parseKmlCoords(lr));
  }
  const inners = directChildrenByLocalName(poly, 'innerBoundaryIs');
  for (const inner of inners) {
    const lr = firstChildByLocalName(inner, 'LinearRing');
    if (lr) rings.push(parseKmlCoords(lr));
  }
  return rings.length ? { type: 'Polygon', coordinates: rings } : null;
}

/**
 * Parse a <coordinates> element's text into [[lng, lat], ...].
 * KML format: "lng,lat[,alt] lng,lat[,alt] ..." (space/whitespace separated).
 */
function parseKmlCoords(el) {
  const coordEl = firstChildByLocalName(el, 'coordinates') ||
                  (el.localName === 'coordinates' ? el : null);
  if (!coordEl) return [];
  const raw = coordEl.textContent.trim();
  if (!raw) return [];
  const out = [];
  const parts = raw.split(/\s+/);
  for (const p of parts) {
    if (!p) continue;
    const c = p.split(',');
    const lng = parseFloat(c[0]);
    const lat = parseFloat(c[1]);
    if (!isNaN(lng) && !isNaN(lat)) out.push([lng, lat]);
  }
  return out;
}

/**
 * Add a KML file as a preview overlay on the map.
 */
async function addKmlOverlay(file) {
  const text = await file.text();
  let geojson;
  try {
    geojson = parseKml(text);
  } catch (e) {
    updateStatus(`✗ KML 解析失败: ${e.message}`, 'error');
    return;
  }

  if (!geojson.features.length) {
    updateStatus(`⚠ KML "${file.name}" 中未找到要素`, 'warn');
    return;
  }

  if (!state.map) {
    updateStatus('请先在设置中开启地图预览', 'warn');
    return;
  }

  const color = KML_OVERLAY_COLORS[state.kmlColorIdx % KML_OVERLAY_COLORS.length];
  state.kmlColorIdx++;
  const safeName = file.name.replace(/\.kml$/i, '');

  const layer = L.geoJSON(geojson, {
    style: { color, weight: 2, fillColor: color, fillOpacity: 0.1, dashArray: '4 3' },
    pointToLayer: (feat, latlng) => L.circleMarker(latlng, { radius: 5, color, fillColor: color, fillOpacity: 0.6 }),
    onEachFeature: (feat, l) => {
      const props = feat.properties || {};
      const html = Object.entries(props).map(([k, v]) => `<b>${k}</b>: ${v}`).join('<br>');
      l.bindPopup(html || safeName);
    }
  }).addTo(state.map);

  const id = 'kml_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  const overlay = { id, name: safeName, layer, featureCount: geojson.features.length, visible: true, color };
  state.kmlOverlays.push(overlay);
  renderKmlOverlayList();

  // Fit bounds to the new overlay
  try {
    const b = layer.getBounds();
    if (b.isValid()) state.map.fitBounds(b, { padding: [30, 30] });
  } catch (e) {}

  updateStatus(`✓ 已加载 KML "${safeName}"（${geojson.features.length} 个要素）`, 'success');
}

function removeKmlOverlay(id) {
  const idx = state.kmlOverlays.findIndex(o => o.id === id);
  if (idx === -1) return;
  if (state.map) state.map.removeLayer(state.kmlOverlays[idx].layer);
  state.kmlOverlays.splice(idx, 1);
  renderKmlOverlayList();
  updateStatus('已移除 KML 叠加层');
}

function toggleKmlOverlay(id) {
  const ov = state.kmlOverlays.find(o => o.id === id);
  if (!ov || !state.map) return;
  ov.visible = !ov.visible;
  if (ov.visible) {
    ov.layer.addTo(state.map);
  } else {
    state.map.removeLayer(ov.layer);
  }
  renderKmlOverlayList();
}

function clearAllKmlOverlays() {
  for (const ov of state.kmlOverlays) {
    if (state.map) state.map.removeLayer(ov.layer);
  }
  state.kmlOverlays = [];
  state.kmlColorIdx = 0;
  renderKmlOverlayList();
  updateStatus('已清除全部 KML 叠加层');
}

function renderKmlOverlayList() {
  const panel = document.getElementById('kml-overlay-list');
  if (!panel) return;
  if (state.kmlOverlays.length === 0) {
    panel.style.display = 'none';
    panel.innerHTML = '';
    return;
  }
  panel.style.display = 'block';
  panel.innerHTML = `
    <div class="kml-overlay-header">
      <span>KML 叠加层（${state.kmlOverlays.length}）</span>
      <button class="kml-clear-btn" id="btn-clear-kml" title="全部清除">✕ 全部清除</button>
    </div>
    ${state.kmlOverlays.map(ov => `
      <div class="kml-overlay-item">
        <label class="kml-overlay-toggle">
          <input type="checkbox" ${ov.visible ? 'checked' : ''} data-kml-id="${ov.id}">
          <span class="kml-color-dot" style="background:${ov.color}"></span>
          <span class="kml-name" title="${ov.name}">${ov.name}</span>
          <span class="kml-count">${ov.featureCount}</span>
        </label>
        <button class="kml-remove-btn" data-kml-remove="${ov.id}" title="移除">✕</button>
      </div>
    `).join('')}
  `;
  // Wire up
  panel.querySelectorAll('input[data-kml-id]').forEach(cb => {
    cb.addEventListener('change', e => toggleKmlOverlay(e.target.dataset.kmlId));
  });
  panel.querySelectorAll('button[data-kml-remove]').forEach(btn => {
    btn.addEventListener('click', e => removeKmlOverlay(e.target.dataset.kmlRemove));
  });
  const clearBtn = document.getElementById('btn-clear-kml');
  if (clearBtn) clearBtn.addEventListener('click', clearAllKmlOverlays);
}

// ============ MAP PREVIEW ============

function initMap() {
  if (!state.settings.showMap) return;
  if (state.map) return;

  state.map = L.map('map', { zoomControl: true, attributionControl: true }).setView([23.13, 113.26], 10);
  setTileSource(state.settings.defaultTile);
}

function setTileSource(sourceKey, customUrl) {
  if (!state.map) return;

  if (state.tileLayer) state.map.removeLayer(state.tileLayer);

  let url, sub, attr;
  if (sourceKey === 'custom' && customUrl) {
    url = customUrl;
    sub = 'abc';
    attr = '自定义图源';
  } else {
    const src = TILE_SOURCES[sourceKey];
    if (!src) return;
    url = src.url;
    sub = src.sub;
    attr = src.attr;
  }

  state.tileLayer = L.tileLayer(url, {
    subdomains: sub,
    attribution: attr,
    maxZoom: 20,
  }).addTo(state.map);
}

function renderMapData() {
  if (!state.map || !state.geojson) return;

  if (state.dataLayer) state.map.removeLayer(state.dataLayer);

  const srcCrs = document.getElementById('src-crs').value;
  const dstCrs = document.getElementById('dst-crs').value;
  const src = srcCrs === 'auto' ? (state.detectedCrs || '4326') : srcCrs;

  // Transform for display (always to WGS84 for Leaflet)
  const displayCrs = '4326';
  const transformedFeatures = state.geojson.features.map(feat => ({
    ...feat,
    geometry: transformGeometry(feat.geometry, src, displayCrs)
  }));

  state.dataLayer = L.geoJSON({ type: 'FeatureCollection', features: transformedFeatures }, {
    style: {
      color: document.getElementById('vec-line-color').value,
      weight: parseFloat(document.getElementById('vec-line-width').value),
      fillColor: document.getElementById('vec-fill-color').value,
      fillOpacity: parseInt(document.getElementById('vec-fill-opacity').value) / 100,
    },
    pointToLayer: (feat, latlng) => L.circleMarker(latlng, { radius: 4, color: '#ff8800', fillColor: '#ffaa00', fillOpacity: 0.5 }),
    onEachFeature: (feat, layer) => {
      const props = feat.properties || {};
      const html = Object.entries(props).map(([k, v]) => `<b>${k}</b>: ${v}`).join('<br>');
      layer.bindPopup(html);
    }
  }).addTo(state.map);
}

function fitBounds() {
  if (!state.map || !state.dataLayer) return;
  try {
    const bounds = state.dataLayer.getBounds();
    if (bounds.isValid()) state.map.fitBounds(bounds, { padding: [20, 20] });
  } catch (e) {}
}

// ============ FILE DOWNLOAD ============

async function downloadResults(results) {
  if (results.length === 1) {
    // Single file
    const blob = new Blob([results[0].content], { type: 'application/vnd.google-earth.kml+xml' });
    triggerDownload(blob, results[0].filename);
  } else {
    // Multiple files → ZIP
    const zip = new JSZip();
    for (const r of results) zip.file(r.filename, r.content);
    const blob = await zip.generateAsync({ type: 'blob' });
    const prefix = document.getElementById('export-prefix').value || 'output';
    triggerDownload(blob, `${prefix}.zip`);
  }
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

// ============ UI HELPERS ============

function updateStatus(msg, type) {
  const el = document.getElementById('status-text');
  el.textContent = msg;
  el.className = type ? `status-${type}` : '';

  const genStatus = document.getElementById('generate-status');
  if (genStatus) {
    genStatus.textContent = msg;
    genStatus.className = `status-msg ${type || ''}`;
  }
}

// ============ POSITION HELP TOOLTIP ============

function initPositionHelpTooltip() {
  const tooltip = document.getElementById('position-help-tooltip');
  if (!tooltip) return;

  // Build an SVG diagram showing all 9 positions with labels
  const positions = [
    { key: 'top-left',      label: '左上', ax: 0,   ay: 1   },
    { key: 'top-center',    label: '上中', ax: 0.5, ay: 1   },
    { key: 'top-right',     label: '右上', ax: 1,   ay: 1   },
    { key: 'middle-left',   label: '左中', ax: 0,   ay: 0.5 },
    { key: 'center',        label: '居中', ax: 0.5, ay: 0.5 },
    { key: 'middle-right',  label: '右中', ax: 1,   ay: 0.5 },
    { key: 'bottom-left',   label: '左下', ax: 0,   ay: 0   },
    { key: 'bottom-center', label: '下中', ax: 0.5, ay: 0   },
    { key: 'bottom-right',  label: '右下', ax: 1,   ay: 0   },
  ];

  const W = 290, H = 200;
  const pad = 20;
  const boxX = pad, boxY = pad;
  const boxW = W - pad * 2 - 60; // leave room for labels on right
  const boxH = H - pad * 2;
  const glyphW = 28, glyphH = 18;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">`;
  // Background
  svg += `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>`;

  // Feature bbox
  svg += `<rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" fill="rgba(74,158,255,0.06)" stroke="rgba(74,158,255,0.5)" stroke-width="1.5" stroke-dasharray="4 3" rx="3"/>`;
  svg += `<text x="${boxX + boxW/2}" y="${boxY - 6}" text-anchor="middle" fill="#8a90a0" font-size="9">要素范围</text>`;

  // Draw glyph boxes at each position
  for (const pos of positions) {
    const cx = boxX + pos.ax * boxW;
    const cy = boxY + (1 - pos.ay) * boxH; // SVG Y is flipped
    const gx = cx - glyphW / 2;
    const gy = cy - glyphH / 2;
    const isCenter = pos.key === 'center';
    const fill = isCenter ? 'rgba(74,158,255,0.35)' : 'rgba(255,255,255,0.1)';
    const stroke = isCenter ? '#4a9eff' : 'rgba(160,170,190,0.5)';
    const sw = isCenter ? 1.5 : 1;
    svg += `<rect x="${gx}" y="${gy}" width="${glyphW}" height="${glyphH}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="2"/>`;
    // Small label
    svg += `<text x="${cx}" y="${cy + 3}" text-anchor="middle" fill="${isCenter ? '#4a9eff' : '#8a90a0'}" font-size="8">${pos.label}</text>`;
  }

  // Legend on the right
  const legX = W - 55;
  svg += `<rect x="${legX}" y="${boxY}" width="12" height="9" fill="rgba(74,158,255,0.35)" stroke="#4a9eff" stroke-width="1" rx="1.5"/>`;
  svg += `<text x="${legX + 16}" y="${boxY + 8}" fill="#e0e4ec" font-size="9">当前选中</text>`;
  svg += `<rect x="${legX}" y="${boxY + 18}" width="12" height="9" fill="rgba(255,255,255,0.1)" stroke="rgba(160,170,190,0.5)" stroke-width="1" rx="1.5"/>`;
  svg += `<text x="${legX + 16}" y="${boxY + 26}" fill="#8a90a0" font-size="9">其他位置</text>`;

  svg += `</svg>`;

  tooltip.innerHTML = `
    <div style="font-size:11px;color:var(--text);margin-bottom:6px;font-weight:600;">标注放置位置示意</div>
    ${svg}
    <div style="font-size:10px;color:var(--text-dim);margin-top:6px;line-height:1.5;">
      点击左侧 3×3 网格选择标注在要素范围内的放置位置。<br>
      蓝色虚线框表示要素范围，小方块表示字形标注的放置位置。
    </div>
  `;
}

// ============ EVENT HANDLERS ============

function setupEventHandlers() {
  // Upload zone
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');
  const folderInput = document.getElementById('folder-input');

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', e => handleFiles(e.target.files));
  folderInput.addEventListener('change', e => handleFiles(e.target.files));

  // KML overlay file input (map toolbar)
  const kmlInput = document.getElementById('kml-file-input');
  const kmlBtn = document.getElementById('btn-add-kml');
  if (kmlBtn) {
    kmlBtn.addEventListener('click', e => {
      e.stopPropagation();
      kmlInput && kmlInput.click();
    });
  }
  if (kmlInput) {
    kmlInput.addEventListener('change', e => {
      const kmlFiles = Array.from(e.target.files).filter(f => /\.kml$/i.test(f.name));
      for (const kf of kmlFiles) {
        addKmlOverlay(kf).catch(err => {
          console.error(err);
          updateStatus(`✗ 加载 KML 失败: ${err.message}`, 'error');
        });
      }
      e.target.value = ''; // reset
    });
  }

  // Upload buttons
  document.getElementById('btn-select-files').addEventListener('click', e => {
    e.stopPropagation();
    fileInput.click();
  });
  document.getElementById('btn-select-folder').addEventListener('click', e => {
    e.stopPropagation();
    folderInput.click();
  });

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
    state.settings.autoFit = document.getElementById('setting-auto-fit').checked;
    applySettings();
    document.getElementById('settings-modal').style.display = 'none';
  });

  // Range inputs
  ['glyph-scale', 'glyph-width', 'vec-fill-opacity', 'glyph-fill-opacity'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      const valEl = document.getElementById(id + '-val');
      if (valEl) valEl.textContent = el.value + '%';
    });
  });

  // Annotation toggle
  document.getElementById('anno-enabled').addEventListener('change', e => {
    document.getElementById('anno-options').style.display = e.target.checked ? 'block' : 'none';
  });

  // Annotation position selection
  document.querySelectorAll('input[name="anno-position"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const label = POSITION_LABELS[radio.value] || radio.value;
      const hint = document.getElementById('position-hint');
      if (hint) hint.textContent = `当前：${label}`;
      // Fallback for browsers without :has() support
      document.querySelectorAll('.pos-cell').forEach(cell => cell.classList.remove('pos-selected'));
      radio.closest('.pos-cell')?.classList.add('pos-selected');
    });
  });
  // Trigger initial state
  const checkedPos = document.querySelector('input[name="anno-position"]:checked');
  if (checkedPos) checkedPos.closest('.pos-cell')?.classList.add('pos-selected');

  // Populate position help tooltip with SVG diagram
  initPositionHelpTooltip();

  // Coordinate change
  document.getElementById('src-crs').addEventListener('change', updateCoordHelp);
  document.getElementById('dst-crs').addEventListener('change', updateCoordHelp);

  // Export mode change
  document.getElementById('export-mode').addEventListener('change', e => {
    const showSplit = e.target.value === 'split' || e.target.value === 'merged-split';
    document.getElementById('split-field-group').style.display = showSplit ? 'block' : 'none';
  });

  // Generate
  document.getElementById('btn-generate').addEventListener('click', async () => {
    const btn = document.getElementById('btn-generate');
    btn.disabled = true;
    btn.textContent = '生成中...';
    updateStatus('正在生成 KML...');

    try {
      // Ensure font is loaded if annotation enabled
      if (document.getElementById('anno-enabled').checked) {
        const fontPath = document.getElementById('font-select').value;
        if (!fontPath || fontPath === '__custom__') {
          throw new Error('请选择一个字体文件（自定义字体需点击 ↑ 上传）');
        }
        if (!state.font) {
          updateStatus('正在加载字体...');
          await loadFont(fontPath);
        }
        if (!state.font) {
          throw new Error('字体加载失败，无法生成标注。请尝试使用内置字体（黑体）或检查文件路径');
        }
      }

      const mode = document.getElementById('export-mode').value;
      const results = generateKML(mode);
      await downloadResults(results);

      updateStatus(`✓ 已生成 ${results.length} 个文件`, 'success');

      // Re-render map with transformed data
      if (state.settings.showMap) renderMapData();
    } catch (e) {
      console.error(e);
      updateStatus(`✗ 生成失败: ${e.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '生成 KML';
    }
  });

  // Tile source change
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

  // Font selector
  document.getElementById('font-select').addEventListener('change', async e => {
    const val = e.target.value;
    const hint = document.getElementById('font-hint');
    if (val === '__custom__') {
      hint.textContent = '请点击 ↑ 按钮上传 .ttf/.otf 字体文件';
      document.getElementById('font-file-input').click();
    } else {
      const info = BUNDLED_FONTS[val];
      hint.textContent = info ? `${info.label} — ${info.note}` : '';
      // Reset font state to force reload
      state.font = null;
      state.fontError = null;
      state.currentFontPath = null;
      updateStatus('正在加载字体...');
      await loadFont(val);
      // Re-render map if data loaded
      if (state.settings.showMap && state.geojson) renderMapData();
    }
  });

  // Upload font button
  document.getElementById('btn-upload-font').addEventListener('click', () => {
    document.getElementById('font-file-input').click();
  });

  // Font file input
  document.getElementById('font-file-input').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const hint = document.getElementById('font-hint');
    hint.textContent = `正在加载: ${file.name}...`;
    updateStatus(`正在加载字体: ${file.name}...`);
    try {
      const buf = await file.arrayBuffer();
      const font = opentype.parse(buf);
      state.font = font;
      state.fontError = null;
      state.currentFontPath = file.name;
      // Update dropdown to show custom font
      const select = document.getElementById('font-select');
      let customOption = select.querySelector('option[data-custom]');
      if (!customOption) {
        customOption = document.createElement('option');
        customOption.setAttribute('data-custom', 'true');
        select.insertBefore(customOption, select.querySelector('option[value="__custom__"]'));
      }
      customOption.value = file.name;
      customOption.textContent = `📂 ${file.name}`;
      customOption.selected = true;
      hint.textContent = `自定义字体: ${file.name}（矢量精度保留）`;
      updateStatus(`字体加载成功: ${file.name}`);
      // Re-render map
      if (state.settings.showMap && state.geojson) renderMapData();
    } catch (err) {
      hint.textContent = `⚠ 无法解析: ${file.name} (${err.message})`;
      updateStatus(`⚠ 字体解析失败: ${err.message}`, 'warn');
      // Reset to default
      select.value = 'fonts/SimHei-Bold.ttf';
    }
    e.target.value = ''; // reset input
  });

  // Style change → re-render map
  ['vec-line-color', 'vec-line-width', 'vec-fill-color', 'vec-fill-opacity'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      if (state.settings.showMap && state.geojson) renderMapData();
    });
  });
}

function applySettings() {
  const mapPanel = document.getElementById('map-panel');
  const mainContent = document.getElementById('main-content');

  if (state.settings.showMap) {
    mapPanel.classList.remove('hidden');
    if (!state.map) initMap();
    setTimeout(() => state.map?.invalidateSize(), 100);
    if (state.geojson) {
      renderMapData();
      if (state.settings.autoFit) fitBounds();
    }
  } else {
    mapPanel.classList.add('hidden');
  }

  // Update tile selector
  const tileSelect = document.getElementById('tile-source');
  if (tileSelect) tileSelect.value = state.settings.defaultTile;
}

// Shapefile component definitions
const SHP_COMPONENTS = [
  { ext: 'shp', label: '几何数据', required: true },
  { ext: 'shx', label: '索引文件', required: false },
  { ext: 'dbf', label: '属性表', required: false },
  { ext: 'prj', label: '坐标系', required: false },
  { ext: 'cpg', label: '编码定义', required: false },
];
const SHP_EXTENSIONS = new Set(['shp', 'shx', 'dbf', 'prj', 'cpg', 'zip']);

function handleFiles(fileList) {
  let files = Array.from(fileList);
  if (files.length === 0) return;

  // Separate KML overlay files from SHP/data files
  const kmlFiles = files.filter(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    return ext === 'kml';
  });

  // Filter: only keep shapefile-related files (ignore folders' unrelated files, system files, etc.)
  let shpFiles = files.filter(f => {
    const ext = f.name.split('.').pop().toLowerCase();
    if (f.name.startsWith('.') || f.name === 'Thumbs.db' || f.name === 'desktop.ini') return false;
    return SHP_EXTENSIONS.has(ext);
  });

  // Load KML overlay files (independent of SHP pipeline)
  if (kmlFiles.length > 0) {
    for (const kf of kmlFiles) {
      addKmlOverlay(kf).catch(err => {
        console.error(err);
        updateStatus(`✗ 加载 KML 失败: ${err.message}`, 'error');
      });
    }
  }

  // If only KML files (no SHP), don't attempt SHP parsing
  if (shpFiles.length === 0) {
    if (kmlFiles.length > 0) return;
    updateStatus('✗ 未找到矢量文件（.shp/.zip/.kml），请选择包含 shapefile 或 KML 的文件夹或文件', 'error');
    return;
  }

  // Show component status badges
  const fileMap = {};
  for (const f of shpFiles) {
    const ext = f.name.split('.').pop().toLowerCase();
    fileMap[ext] = f;
  }

  const statusEl = document.getElementById('component-status');
  statusEl.style.display = 'flex';
  statusEl.innerHTML = SHP_COMPONENTS.map(c => {
    const found = fileMap[c.ext] || (fileMap.zip && c.ext !== 'cpg');
    const cls = found ? 'ok' : 'miss';
    const icon = found ? '✓' : '✗';
    return `<span class="comp-badge ${cls}"><span class="comp-icon">${icon}</span> .${c.ext} ${c.label}</span>`;
  }).join('');

  // Display file list
  const listEl = document.getElementById('upload-files-list');
  listEl.innerHTML = shpFiles.map(f => `
    <div class="file-item">
      <span class="file-name">${f.name}</span>
      <span class="file-size">${(f.size / 1024).toFixed(1)} KB</span>
    </div>
  `).join('');

  parseShpFiles(shpFiles).catch(err => {
    console.error(err);
    updateStatus(`✗ 解析失败: ${err.message}`, 'error');
  });
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
  setupEventHandlers();
  initMap();
  updateCoordHelp();

  // Preload default font (SimHei)
  loadFont('fonts/SimHei-Bold.ttf');
});
