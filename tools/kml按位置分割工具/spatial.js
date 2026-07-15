/**
 * spatial.js — 纯空间谓词工具（不依赖 DOM / Leaflet）
 * 被 app.js 与 Node 单元测试共用，保证"被测代码 == 上线代码"。
 *
 * 坐标约定：所有 ring / 点 均为 [lng, lat] 数组。
 * 区域(area) 结构：{ ring: number[][], holes: number[][][] }
 */

/* ===== 基础几何 ===== */

function pointInPolygon(lng, lat, ring) {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function segmentsIntersect(a, b, c, d) {
  const d1 = crossProduct(c, d, a);
  const d2 = crossProduct(c, d, b);
  const d3 = crossProduct(a, b, c);
  const d4 = crossProduct(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  if (d1 === 0 && pointOnSegment(c, d, a)) return true;
  if (d2 === 0 && pointOnSegment(c, d, b)) return true;
  if (d3 === 0 && pointOnSegment(a, b, c)) return true;
  if (d4 === 0 && pointOnSegment(a, b, d)) return true;
  return false;
}

function crossProduct(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function pointOnSegment(a, b, p) {
  return Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) &&
         Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]);
}

/* 两个环是否相交（任意顶点包含 / 任意边穿越，含相切） */
function ringIntersectsRing(ring1, ring2) {
  for (const v of ring1) {
    if (pointInPolygon(v[0], v[1], ring2)) return true;
  }
  for (const v of ring2) {
    if (pointInPolygon(v[0], v[1], ring1)) return true;
  }
  for (let i = 0; i < ring1.length - 1; i++) {
    for (let j = 0; j < ring2.length - 1; j++) {
      if (segmentsIntersect(ring1[i], ring1[i + 1], ring2[j], ring2[j + 1])) return true;
    }
  }
  return false;
}

/* 点在"外环内且不在任何洞内" */
function pointInPolygonWithHoles(lng, lat, outer, holes) {
  if (!pointInPolygon(lng, lat, outer)) return false;
  if (holes && holes.length) {
    for (const h of holes) {
      if (pointInPolygon(lng, lat, h)) return false;
    }
  }
  return true;
}

/* ringA 是否整体落在 ringB 内（ringB 可带洞） */
function ringWithinRing(ringA, ringBOuter, ringBHoles) {
  for (const v of ringA) {
    if (!pointInPolygonWithHoles(v[0], v[1], ringBOuter, ringBHoles)) return false;
  }
  for (let i = 0; i < ring1_safe(ringA); i++) {
    for (let j = 0; j < ringBOuter.length - 1; j++) {
      if (segmentsIntersect(ringA[i], ringA[i + 1], ringBOuter[j], ringBOuter[j + 1])) return false;
    }
  }
  return true;
}

/* 防止压缩器把 ringA 长度内联搞错，独立取长度 */
function ring1_safe(ring) { return ring.length - 1; }

/* ===== 质心 / 代表点 ===== */

/* 单个环的面积加权质心 */
function ringCentroid(ring) {
  let area = 0, cx = 0, cy = 0;
  const n = ring.length;
  for (let i = 0; i < n - 1; i++) {
    const x0 = ring[i][0], y0 = ring[i][1];
    const x1 = ring[i + 1][0], y1 = ring[i + 1][1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-12) {
    let sx = 0, sy = 0;
    const m = n - 1;
    for (const v of ring) { sx += v[0]; sy += v[1]; }
    return [sx / m, sy / m];
  }
  cx /= (6 * area);
  cy /= (6 * area);
  return [cx, cy];
}

/* 要素的"代表点"：点=自身；线=中点；面=面积最大部件质心 */
function featureRepresentativePoint(feature) {
  const g = feature.geometry;
  if (g.type === 'Point') return g.coordinates;
  if (g.type === 'LineString') {
    const mid = Math.floor(g.coordinates.length / 2);
    return g.coordinates[mid];
  }
  if (g.type === 'Polygon') return ringCentroid(g.coordinates[0]);
  if (g.type === 'MultiPolygon') {
    let best = null, bestArea = -1;
    for (const poly of g.coordinates) {
      const r = poly[0];
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      for (const [lng, lat] of r) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
      const a = (maxLng - minLng) * (maxLat - minLat);
      if (a > bestArea) { bestArea = a; best = r; }
    }
    return best ? ringCentroid(best) : null;
  }
  return null;
}

function featureOuterRings(feature) {
  const g = feature.geometry;
  if (g.type === 'Polygon') return [g.coordinates[0]];
  if (g.type === 'MultiPolygon') return g.coordinates.map(p => p[0]);
  return [];
}

function ringBoundsOf(ring) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLng, minLat, maxLng, maxLat };
}

function bboxIntersect(b1, b2) {
  return !(b1.minLng > b2.maxLng || b1.maxLng < b2.minLng ||
           b1.minLat > b2.maxLat || b1.maxLat < b2.minLat);
}

function featureBBox(feature) {
  const g = feature.geometry;
  let coords = [];
  if (g.type === 'Polygon') coords = g.coordinates[0];
  else if (g.type === 'LineString') coords = g.coordinates;
  else if (g.type === 'Point') return { minLng: g.coordinates[0], minLat: g.coordinates[1], maxLng: g.coordinates[0], maxLat: g.coordinates[1] };
  else if (g.type === 'MultiPolygon') coords = g.coordinates.flatMap(p => p[0]);
  else return null;
  return ringBoundsOf(coords);
}

/* ===== 面相交（尊重洞） ===== */
function polygonIntersectsServiceArea(gridRing, servicePoly) {
  if (!ringIntersectsRing(gridRing, servicePoly.ring)) return false;
  if (servicePoly.holes && servicePoly.holes.length) {
    for (const h of servicePoly.holes) {
      // 若格网整体落在某个洞内，则不算与"实心区域"相交
      if (ringWithinRing(gridRing, h, [])) return false;
    }
  }
  return true;
}

/* ===== 统一谓词：要素 <predicate> 区域 =====
 * predicate:
 *   'intersect'   —— 有任何重叠/接触
 *   'within'      —— 要素整体在区域内
 *   'contains'    —— 区域整体在要素内
 *   'centroid-in' —— 要素代表点(质心/中点/自身)在区域内
 * area: { ring, holes }
 */
function featureMatchesArea(feature, area, predicate) {
  const g = feature.geometry;
  const outer = area.ring;
  const holes = area.holes || [];

  if (predicate === 'centroid-in') {
    const rp = featureRepresentativePoint(feature);
    if (!rp) return false;
    return pointInPolygonWithHoles(rp[0], rp[1], outer, holes);
  }

  if (g.type === 'Point') {
    if (predicate === 'contains') return false;
    return pointInPolygonWithHoles(g.coordinates[0], g.coordinates[1], outer, holes);
  }

  if (g.type === 'LineString') {
    if (predicate === 'contains') return false;
    if (predicate === 'within') {
      for (const pt of g.coordinates) {
        if (!pointInPolygonWithHoles(pt[0], pt[1], outer, holes)) return false;
      }
      for (let i = 0; i < g.coordinates.length - 1; i++) {
        for (let j = 0; j < outer.length - 1; j++) {
          if (segmentsIntersect(g.coordinates[i], g.coordinates[i + 1], outer[j], outer[j + 1])) return false;
        }
      }
      return true;
    }
    // intersect
    for (const pt of g.coordinates) {
      if (pointInPolygonWithHoles(pt[0], pt[1], outer, holes)) return true;
    }
    for (let i = 0; i < g.coordinates.length - 1; i++) {
      for (let j = 0; j < outer.length - 1; j++) {
        if (segmentsIntersect(g.coordinates[i], g.coordinates[i + 1], outer[j], outer[j + 1])) return true;
      }
    }
    return false;
  }

  // Polygon / MultiPolygon
  const rings = featureOuterRings(feature);
  if (predicate === 'contains') {
    return rings.some(r => ringWithinRing(outer, r, []));
  }
  if (predicate === 'within') {
    return rings.every(r => ringWithinRing(r, outer, holes));
  }
  // intersect (default)
  return rings.some(r => polygonIntersectsServiceArea(r, { ring: outer, holes }));
}

/* 浏览器中挂到全局，Node 中由 eval 提供 */
if (typeof window !== 'undefined') {
  window.pointInPolygon = pointInPolygon;
  window.segmentsIntersect = segmentsIntersect;
  window.ringIntersectsRing = ringIntersectsRing;
  window.pointInPolygonWithHoles = pointInPolygonWithHoles;
  window.ringWithinRing = ringWithinRing;
  window.ringCentroid = ringCentroid;
  window.featureRepresentativePoint = featureRepresentativePoint;
  window.featureOuterRings = featureOuterRings;
  window.ringBoundsOf = ringBoundsOf;
  window.bboxIntersect = bboxIntersect;
  window.featureBBox = featureBBox;
  window.polygonIntersectsServiceArea = polygonIntersectsServiceArea;
  window.featureMatchesArea = featureMatchesArea;
}
