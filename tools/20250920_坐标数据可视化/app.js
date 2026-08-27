
        // ========================== 常量配置 ==========================
        const MAP_SOURCES = [
            { id: 'gaode-vector', name: '高德矢量', url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', subdomains: '1234', crs: 'gcj02', attribution: '高德地图', maxZoom: 18 },
            { id: 'gaode-sat', name: '高德影像', url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', subdomains: '1234', crs: 'gcj02', attribution: '高德地图', maxZoom: 18 },
            { id: 'tencent-vector', name: '腾讯矢量', url: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0', subdomains: '0123', crs: 'gcj02', attribution: '腾讯地图', maxZoom: 18 },
            { id: 'tencent-sat', name: '腾讯影像', url: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=satellite&style=0', subdomains: '0123', crs: 'gcj02', attribution: '腾讯地图', maxZoom: 18 },
            { id: 'baidu-vector', name: '百度矢量', url: 'https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&udt=20240714&scaler=1', subdomains: '0123', crs: 'bd09', attribution: '百度地图', maxZoom: 19 },
            { id: 'baidu-sat', name: '百度影像', url: 'https://maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=sl&udt=20240714&scaler=1', subdomains: '0123', crs: 'bd09', attribution: '百度地图', maxZoom: 19 },
            { id: 'osm', name: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', subdomains: 'abc', crs: 'wgs84', attribution: '© OpenStreetMap contributors', maxZoom: 19 },
            { id: 'osm-hot', name: 'OpenStreetMap HOT', url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', subdomains: 'abc', crs: 'wgs84', attribution: '© OpenStreetMap contributors', maxZoom: 19 },
            { id: 'carto-light', name: 'CartoDB Positron', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', crs: 'wgs84', attribution: '© CARTO', maxZoom: 19 },
            { id: 'carto-dark', name: 'CartoDB Dark Matter', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', subdomains: 'abcd', crs: 'wgs84', attribution: '© CARTO', maxZoom: 19 },
            { id: 'esri-imagery', name: 'ESRI 卫星影像', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', crs: 'wgs84', attribution: 'Esri', maxZoom: 18 },
            { id: 'esri-street', name: 'ESRI 街道', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', crs: 'wgs84', attribution: 'Esri', maxZoom: 18 },
            { id: 'esri-topo', name: 'ESRI 地形', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', crs: 'wgs84', attribution: 'Esri', maxZoom: 18 },
            { id: 'opentopomap', name: 'OpenTopoMap', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', subdomains: 'abc', crs: 'wgs84', attribution: 'OpenTopoMap', maxZoom: 17 },
            { id: 'wikimedia', name: 'Wikimedia', url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', subdomains: 'abcd', crs: 'wgs84', attribution: 'Wikimedia', maxZoom: 19 },
            { id: 'usgs', name: 'USGS 影像', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', crs: 'wgs84', attribution: 'USGS', maxZoom: 16 },
            { id: 'google-sat', name: 'Google 卫星', url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', subdomains: '0123', crs: 'wgs84', attribution: 'Google Maps', maxZoom: 20 },
            { id: 'google-street', name: 'Google 街道', url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', subdomains: '0123', crs: 'wgs84', attribution: 'Google Maps', maxZoom: 20 },
            { id: 'custom', name: '自定义图源', url: '', crs: 'wgs84', attribution: '自定义', maxZoom: 19 }
        ];

        const CRS_NAMES = {
            wgs84: 'WGS-84',
            gcj02: 'GCJ-02（火星 / 高德）',
            bd09: 'BD-09（百度）'
        };

        const LAT_SYNONYMS = ['lat', 'latitude', '纬度', 'y', 'latitu', 'lat_',
            'gcjlat', 'bdlat', 'wgslat', '高德纬度', '百度纬度', '火星纬度', 'latitud'];
        const LNG_SYNONYMS = ['lng', 'lon', 'long', 'longitude', '经度', 'x', 'longit', 'long_',
            'gcjlng', 'bdlng', 'wgslng', '高德经度', '百度经度', '火星经度', 'longitud'];
        const NAME_SYNONYMS = ['name', '名称', '地址', 'address', 'location', '位置', 'title', 'label', '地名', '地点', 'point'];
        const CRS_SYNONYMS = ['crs', 'coordinatesystem', 'coordtype', 'system', '坐标系', '坐标类型', '类型', 'coord', 'coordsystem', 'coordinatetype'];

        const SAMPLE_DATA = [
            { name: '北京', lng: 116.4074, lat: 39.9042, crs: 'wgs84', properties: { 名称: '北京', 经度: 116.4074, 纬度: 39.9042, 坐标系: 'WGS84' } },
            { name: '上海', lng: 121.4737, lat: 31.2304, crs: 'wgs84', properties: { 名称: '上海', 经度: 121.4737, 纬度: 31.2304, 坐标系: 'WGS84' } },
            { name: '广州', lng: 113.2644, lat: 23.1291, crs: 'wgs84', properties: { 名称: '广州', 经度: 113.2644, 纬度: 23.1291, 坐标系: 'WGS84' } },
            { name: '成都', lng: 104.0665, lat: 30.5723, crs: 'wgs84', properties: { 名称: '成都', 经度: 104.0665, 纬度: 30.5723, 坐标系: 'WGS84' } },
            { name: '西安', lng: 108.9398, lat: 34.3416, crs: 'wgs84', properties: { 名称: '西安', 经度: 108.9398, 纬度: 34.3416, 坐标系: 'WGS84' } },
            { name: '杭州', lng: 120.1551, lat: 30.2741, crs: 'wgs84', properties: { 名称: '杭州', 经度: 120.1551, 纬度: 30.2741, 坐标系: 'WGS84' } },
            { name: '武汉', lng: 114.3054, lat: 30.5928, crs: 'wgs84', properties: { 名称: '武汉', 经度: 114.3054, 纬度: 30.5928, 坐标系: 'WGS84' } },
            { name: '深圳', lng: 114.0579, lat: 22.5431, crs: 'wgs84', properties: { 名称: '深圳', 经度: 114.0579, 纬度: 22.5431, 坐标系: 'WGS84' } },
            { name: '重庆', lng: 106.5516, lat: 29.5630, crs: 'wgs84', properties: { 名称: '重庆', 经度: 106.5516, 纬度: 29.5630, 坐标系: 'WGS84' } },
            { name: '南京', lng: 118.7969, lat: 32.0603, crs: 'wgs84', properties: { 名称: '南京', 经度: 118.7969, 纬度: 32.0603, 坐标系: 'WGS84' } }
        ];

        // ========================== 状态 ==========================
        let appState = {
            points: [],
            columns: [],
            inputCRS: 'auto',
            convertOnDisplay: false,
            mapSourceId: 'gaode-vector',
            customSource: null,
            markerLayer: null,
            lineLayer: null,
            pendingFiles: null,
            rawHeaders: [],
            rawHasHeader: false
        };
        let map;
        let baseLayer;

        // ========================== 坐标系转换 ==========================
        const PI = Math.PI;
        const X_PI = PI * 3000.0 / 180.0;
        const A = 6378245.0;
        const EE = 0.00669342162296594323;

        function outOfChina(lng, lat) {
            return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
        }
        function transformLat(lng, lat) {
            let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320.0 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
            return ret;
        }
        function transformLng(lng, lat) {
            let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
            return ret;
        }
        function wgs84ToGcj02(lng, lat) {
            if (outOfChina(lng, lat)) return { lng: lng, lat: lat };
            let dlat = transformLat(lng - 105.0, lat - 35.0);
            let dlng = transformLng(lng - 105.0, lat - 35.0);
            let radlat = lat / 180.0 * PI;
            let magic = Math.sin(radlat);
            magic = 1 - EE * magic * magic;
            let sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (A / sqrtmagic * Math.cos(radlat) * PI);
            return { lng: lng + dlng, lat: lat + dlat };
        }
        function gcj02ToWgs84(lng, lat) {
            if (outOfChina(lng, lat)) return { lng: lng, lat: lat };
            let dlat = transformLat(lng - 105.0, lat - 35.0);
            let dlng = transformLng(lng - 105.0, lat - 35.0);
            let radlat = lat / 180.0 * PI;
            let magic = Math.sin(radlat);
            magic = 1 - EE * magic * magic;
            let sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI);
            dlng = (dlng * 180.0) / (A / sqrtmagic * Math.cos(radlat) * PI);
            let mglat = lat + dlat;
            let mglng = lng + dlng;
            return { lng: lng * 2 - mglng, lat: lat * 2 - mglat };
        }
        function gcj02ToBd09(lng, lat) {
            let z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
            let theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
            return { lng: z * Math.cos(theta) + 0.0065, lat: z * Math.sin(theta) + 0.006 };
        }
        function bd09ToGcj02(lng, lat) {
            let x = lng - 0.0065, y = lat - 0.006;
            let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
            let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
            return { lng: z * Math.cos(theta), lat: z * Math.sin(theta) };
        }
        function wgs84ToBd09(lng, lat) {
            const gcj = wgs84ToGcj02(lng, lat);
            return gcj02ToBd09(gcj.lng, gcj.lat);
        }
        function bd09ToWgs84(lng, lat) {
            const gcj = bd09ToGcj02(lng, lat);
            return gcj02ToWgs84(gcj.lng, gcj.lat);
        }
        function convertCoord(pt, from, to) {
            if (from === to || from === 'auto' || to === 'auto') return { lng: pt.lng, lat: pt.lat };
            if (from === 'wgs84') {
                if (to === 'gcj02') return wgs84ToGcj02(pt.lng, pt.lat);
                if (to === 'bd09') return wgs84ToBd09(pt.lng, pt.lat);
            } else if (from === 'gcj02') {
                if (to === 'wgs84') return gcj02ToWgs84(pt.lng, pt.lat);
                if (to === 'bd09') return gcj02ToBd09(pt.lng, pt.lat);
            } else if (from === 'bd09') {
                if (to === 'wgs84') return bd09ToWgs84(pt.lng, pt.lat);
                if (to === 'gcj02') return bd09ToGcj02(pt.lng, pt.lat);
            }
            return { lng: pt.lng, lat: pt.lat };
        }

        // ========================== 坐标格式解析 ==========================
        function normalizeCoordString(s) {
            return String(s).trim()
                .replace(/[°dD]/gi, '°')
                .replace(/['′′′′′]/g, "'")
                .replace(/["″″″″]/g, '"')
                .replace(/[度]/g, '°')
                .replace(/[分]/g, "'")
                .replace(/[秒]/g, '"')
                .replace(/[东]/g, 'E')
                .replace(/[西]/g, 'W')
                .replace(/[南]/g, 'S')
                .replace(/[北]/g, 'N');
        }
        function applyDir(dir, num) {
            if (!dir) return num;
            if (dir === 'W' || dir === 'S') return -Math.abs(num);
            return Math.abs(num);
        }
        function parseCoord(str) {
            if (str === null || str === undefined) return null;
            let s = normalizeCoordString(str);
            if (!s) return null;
            // 移除千分位逗号并规整空白
            s = s.replace(/,/g, '').replace(/\s+/g, ' ').trim();

            // 提取并移除半球字母（N/S/E/W），可出现在开头或结尾
            const dirMatch = s.match(/[NSEW]/i);
            let dir = null;
            if (dirMatch) {
                dir = dirMatch[0].toUpperCase();
                s = s.replace(/[NSEW]/i, '').trim();
            }
            if (s === '') return null;

            // 1) 纯十进制（已无字母）
            const num = Number(s);
            if (!isNaN(num)) return applyDir(dir, num);

            // 2) 度分秒 / 度分（以 ° ' " : 或空白分隔）
            const tokens = s.split(/[°'"\:]+|\s+/).filter(t => t !== '');
            if (tokens.length >= 1) {
                const deg = parseFloat(tokens[0]);
                if (!isNaN(deg)) {
                    let val = Math.abs(deg);
                    let sign = deg < 0 ? -1 : 1;
                    if (tokens.length >= 2) {
                        const min = parseFloat(tokens[1]);
                        if (!isNaN(min)) val += min / 60;
                    }
                    if (tokens.length >= 3) {
                        const sec = parseFloat(tokens[2]);
                        if (!isNaN(sec)) val += sec / 3600;
                    }
                    return applyDir(dir, sign * val);
                }
            }
            return null;
        }
        function isValidLatLng(lat, lng) {
            return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
        }

        // ========================== 列识别与数据解析 ==========================
        function normalizeHeader(h) {
            return String(h).toLowerCase()
                .replace(/[\s_\-（）()\[\]{}]/g, '')
                .replace(/[°d]/g, '')
                .trim();
        }
        function isHeaderRow(row) {
            if (!row || row.length < 2) return false;
            const keywords = LAT_SYNONYMS.concat(LNG_SYNONYMS).concat(NAME_SYNONYMS).concat(CRS_SYNONYMS).map(k => normalizeHeader(k));
            const normalized = row.map(normalizeHeader);
            return normalized.some(h => keywords.some(k => h.includes(k)));
        }
        function detectColumns(headers) {
            const norm = headers.map(normalizeHeader);
            let nameIdx = -1, latIdx = -1, lngIdx = -1, crsIdx = -1;
            norm.forEach((h, i) => {
                if (latIdx < 0 && LAT_SYNONYMS.some(k => h.includes(k)) && !LNG_SYNONYMS.some(k => h.includes(k))) latIdx = i;
                if (lngIdx < 0 && LNG_SYNONYMS.some(k => h.includes(k)) && !LAT_SYNONYMS.some(k => h.includes(k))) lngIdx = i;
                if (nameIdx < 0 && NAME_SYNONYMS.some(k => h.includes(k))) nameIdx = i;
                if (crsIdx < 0 && CRS_SYNONYMS.some(k => h.includes(k))) crsIdx = i;
            });
            return { nameIdx, latIdx, lngIdx, crsIdx };
        }
        function inferCRSFromHeaders(headers) {
            const norm = headers.map(normalizeHeader);
            if (norm.some(h => h.includes('高德') || h.includes('gcj') || h.includes('火星'))) return 'gcj02';
            if (norm.some(h => h.includes('百度') || h.includes('bd'))) return 'bd09';
            if (norm.some(h => h.includes('wgs') || h.includes('gps') || h.includes('84'))) return 'wgs84';
            return 'wgs84';
        }
        function inferCRSFromValue(c) {
            const v = String(c).toLowerCase();
            if (v.includes('gcj') || v.includes('mars') || v.includes('gaode') || v.includes('高德') || v.includes('火星')) return 'gcj02';
            if (v.includes('bd') || v.includes('baidu') || v.includes('百度')) return 'bd09';
            if (v.includes('wgs') || v.includes('gps') || v.includes('84')) return 'wgs84';
            return null;
        }
        function fallbackNumericColumns(rows) {
            if (!rows || rows.length === 0) return { latIdx: -1, lngIdx: -1 };
            for (let r = 0; r < Math.min(rows.length, 10); r++) {
                const numeric = rows[r].map((v, i) => (parseCoord(v) !== null ? i : -1)).filter(i => i >= 0);
                if (numeric.length >= 2) return { lngIdx: numeric[0], latIdx: numeric[1] };
            }
            return { latIdx: -1, lngIdx: -1 };
        }
        function parseRowsToPoints(rows, hasHeader) {
            const headers = hasHeader ? rows[0].map(h => String(h === undefined ? '' : h).trim()) : rows[0].map((_, i) => '列' + (i + 1));
            const cols = detectColumns(headers);
            let { nameIdx, latIdx, lngIdx, crsIdx } = cols;

            if (latIdx < 0 || lngIdx < 0) {
                const fb = fallbackNumericColumns(hasHeader ? rows.slice(1) : rows);
                if (lngIdx < 0) lngIdx = fb.lngIdx;
                if (latIdx < 0) latIdx = fb.latIdx;
            }
            if (latIdx < 0 || lngIdx < 0) {
                throw new Error('未能识别经纬度列，请检查表头是否包含“经度/纬度”或“lng/lat”');
            }

            const start = hasHeader ? 1 : 0;
            const points = [];
            for (let i = start; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;
                const rawLng = parseCoord(row[lngIdx]);
                const rawLat = parseCoord(row[latIdx]);
                if (rawLng === null || rawLat === null) continue;
                if (!isValidLatLng(rawLat, rawLng)) continue;

                const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : ('点' + (points.length + 1));
                let crs = inferCRSFromValue(row[crsIdx]);
                if (!crs) crs = inferCRSFromHeaders(headers);
                if (appState.inputCRS !== 'auto') crs = appState.inputCRS;

                const props = {};
                headers.forEach((h, idx) => { props[h] = row[idx] === undefined ? '' : row[idx]; });

                points.push({
                    id: points.length + 1,
                    name: name,
                    lng: rawLng,
                    lat: rawLat,
                    crs: crs,
                    originalLng: rawLng,
                    originalLat: rawLat,
                    properties: props
                });
            }
            return { points, columns: headers };
        }

        // ========================== 文件解析 ==========================
        function detectDelimiter(text) {
            const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
            const counts = { '\t': 0, ';': 0, '|': 0, ',': 0 };
            for (const c of sample) {
                if (counts[c] !== undefined) counts[c]++;
            }
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            return sorted[0][1] > 0 ? sorted[0][0] : null;
        }
        function parseLine(line, delimiter) {
            const result = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const c = line[i];
                if (c === '"') {
                    if (inQuotes && line[i + 1] === '"') {
                        current += '"'; i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (c === delimiter && !inQuotes) {
                    result.push(current);
                    current = '';
                } else {
                    current += c;
                }
            }
            result.push(current);
            return result;
        }
        function parseText(text) {
            const delimiter = detectDelimiter(text);
            const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
            if (!delimiter) {
                return lines.map(l => l.trim().split(/\s+/));
            }
            return lines.map(l => parseLine(l, delimiter));
        }
        function parseJSON(text) {
            try {
                const data = JSON.parse(text);
                if (Array.isArray(data)) return data.map(obj => Object.values(obj));
                if (Array.isArray(data.features)) {
                    return data.features.map(f => {
                        const c = f.geometry && f.geometry.coordinates;
                        const p = f.properties || {};
                        return [c ? c[0] : '', c ? c[1] : '', p.name || p.名称 || ''];
                    });
                }
            } catch (e) {}
            return null;
        }
        async function parseFile(file) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'xlsx' || ext === 'xls') {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
                return json;
            } else if (ext === 'json') {
                const text = await file.text();
                const parsed = parseJSON(text);
                if (parsed) return parsed;
                throw new Error('JSON 格式不支持，仅支持对象数组或 GeoJSON');
            } else {
                const text = await file.text();
                return parseText(text);
            }
        }
        function parseManualInput(text) {
            const lines = text.split(/\r?\n/).filter(l => l.trim());
            const rows = [];
            lines.forEach(line => {
                const tokens = line.trim().split(/[\s,，]+/).filter(t => t);
                if (tokens.length < 2) return;
                let name = '';
                let coordTokens = tokens;
                if (isNaN(parseFloat(tokens[0]))) {
                    name = tokens[0];
                    coordTokens = tokens.slice(1);
                }
                const nums = coordTokens.map(t => parseCoord(t)).filter(n => n !== null);
                if (nums.length < 2) return;
                let lng, lat;
                if (Math.abs(nums[0]) <= 90 && Math.abs(nums[1]) <= 180 && !(Math.abs(nums[1]) <= 90 && Math.abs(nums[0]) > 90)) {
                    lat = nums[0]; lng = nums[1];
                } else {
                    lng = nums[0]; lat = nums[1];
                }
                if (!isValidLatLng(lat, lng)) return;
                const row = [name, lng, lat];
                rows.push(row);
            });
            if (rows.length === 0) return { points: [], columns: [] };
            const cols = ['名称', '经度', '纬度'];
            return parseRowsToPoints([cols].concat(rows), true);
        }
        function processRows(rows) {
            const hasHeader = isHeaderRow(rows[0]);
            return parseRowsToPoints(rows, hasHeader);
        }

        // ========================== 手动指定列解析 ==========================
        // 由用户在下拉框中明确选择经度/纬度/名称/坐标系列，而非由机器猜测
        function parseRowsToPointsExplicit(rows, hasHeader, sel) {
            const headers = hasHeader ? rows[0].map(h => String(h === undefined ? '' : h).trim()) : rows[0].map((_, i) => '列' + (i + 1));
            const { nameIdx, latIdx, lngIdx, crsIdx } = sel;
            if (latIdx < 0 || lngIdx < 0) {
                throw new Error(t('colsel_pick_required'));
            }
            const start = hasHeader ? 1 : 0;
            const points = [];
            for (let i = start; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;
                const rawLng = parseCoord(row[lngIdx]);
                const rawLat = parseCoord(row[latIdx]);
                if (rawLng === null || rawLat === null) continue;
                if (!isValidLatLng(rawLat, rawLng)) continue;

                const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : ('点' + (points.length + 1));
                let crs = crsIdx >= 0 ? inferCRSFromValue(row[crsIdx]) : null;
                if (!crs) crs = inferCRSFromHeaders(headers);
                if (appState.inputCRS !== 'auto') crs = appState.inputCRS;

                const props = {};
                headers.forEach((h, idx) => { props[h] = row[idx] === undefined ? '' : row[idx]; });

                points.push({
                    id: points.length + 1,
                    name: name,
                    lng: rawLng,
                    lat: rawLat,
                    crs: crs,
                    originalLng: rawLng,
                    originalLat: rawLat,
                    properties: props
                });
            }
            return { points, columns: headers };
        }
        function showColumnSelector() {
            const panel = document.getElementById('column-selector');
            if (panel) panel.classList.remove('hidden');
        }
        function hideColumnSelector() {
            const panel = document.getElementById('column-selector');
            if (panel) panel.classList.add('hidden');
        }
        function populateColumnSelector(headers, def) {
            [['col-name', def.nameIdx], ['col-lng', def.lngIdx], ['col-lat', def.latIdx], ['col-crs', def.crsIdx]].forEach(([id, d]) => {
                const sel = document.getElementById(id);
                if (!sel) return;
                sel.innerHTML = '';
                const o0 = document.createElement('option');
                o0.value = '-1';
                o0.textContent = t('colsel_none');
                sel.appendChild(o0);
                headers.forEach((h, i) => {
                    const o = document.createElement('option');
                    o.value = String(i);
                    o.textContent = (h === undefined || h === '') ? ('列' + (i + 1)) : h;
                    sel.appendChild(o);
                });
                sel.value = String(d);
            });
        }
        async function applyColumnSelection() {
            if (!appState.pendingFiles || appState.pendingFiles.length === 0) return;
            showLoading(t('gen_offline') ? '正在解析...' : '正在解析...');
            try {
                const sel = {
                    nameIdx: parseInt(document.getElementById('col-name').value, 10),
                    lngIdx: parseInt(document.getElementById('col-lng').value, 10),
                    latIdx: parseInt(document.getElementById('col-lat').value, 10),
                    crsIdx: parseInt(document.getElementById('col-crs').value, 10)
                };
                if (sel.lngIdx < 0 || sel.latIdx < 0) {
                    showStatus(t('colsel_pick_required'), 'error');
                    return;
                }
                const allPoints = [];
                for (const file of appState.pendingFiles) {
                    const rows = await parseFile(file);
                    if (!rows || rows.length < 2) continue;
                    const res = parseRowsToPointsExplicit(rows, appState.rawHasHeader, sel);
                    allPoints.push(...res.points);
                }
                if (allPoints.length === 0) {
                    showStatus(t('parse_no_coord'), 'error');
                    return;
                }
                hideColumnSelector();
                loadData(allPoints, appState.rawHeaders);
            } catch (e) {
                showStatus(t('parse_fail_msg') + e.message, 'error');
            } finally {
                hideLoading();
            }
        }

        // ========================== 地图初始化与图层 ==========================
        function getMapSource(id) {
            if (id === 'custom' && appState.customSource) return appState.customSource;
            return MAP_SOURCES.find(s => s.id === id) || MAP_SOURCES[0];
        }
        function getCurrentMapSource() {
            return getMapSource(appState.mapSourceId);
        }
        function initMap() {
            map = L.map('map', { zoomControl: false }).setView([35.8617, 104.1954], 4);
            L.control.scale({ metric: true, imperial: false }).addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            setMapSource('gaode-vector');
        }
        function setMapSource(id) {
            const source = getMapSource(id);
            appState.mapSourceId = source.id;
            if (baseLayer) map.removeLayer(baseLayer);
            const url = source.url;
            const options = {
                attribution: source.attribution || '',
                maxZoom: source.maxZoom || 19,
                subdomains: source.subdomains || 'abc'
            };
            baseLayer = L.tileLayer(url, options);
            baseLayer.addTo(map);
            refreshCRSWarning();
        }
        function addCustomSource() {
            const url = document.getElementById('custom-url').value.trim();
            if (!url || url.indexOf('{x}') < 0 || url.indexOf('{y}') < 0 || url.indexOf('{z}') < 0) {
                showStatus('请输入包含 {x}、{y}、{z} 的瓦片地址', 'error');
                return;
            }
            const crs = document.getElementById('custom-crs').value;
            appState.customSource = {
                id: 'custom', name: '自定义', url: url, crs: crs, attribution: '自定义', maxZoom: 19
            };
            document.getElementById('map-source').value = 'custom';
            setMapSource('custom');
            showStatus('自定义图源已加载', 'success');
        }

        // ========================== 样式与渲染 ==========================
        function getStyle() {
            return {
                shape: document.getElementById('style-shape').value,
                size: parseInt(document.getElementById('style-size').value) || 14,
                fillColor: document.getElementById('style-fill-color').value,
                fillOpacity: parseFloat(document.getElementById('style-fill-opacity').value) || 0.85,
                borderColor: document.getElementById('style-border-color').value,
                borderWidth: parseInt(document.getElementById('style-border-width').value) || 0,
                showLabels: document.getElementById('style-label').checked,
                labelColumn: document.getElementById('style-label-column').value,
                connect: document.getElementById('style-connect').checked,
                lineColor: document.getElementById('style-line-color').value,
                lineWidth: parseInt(document.getElementById('style-line-width').value) || 2,
                clustering: document.getElementById('style-cluster').checked
            };
        }
        function getIconSvg(style) {
            const size = parseInt(style.size);
            const bw = parseFloat(style.borderWidth);
            const fill = style.fillColor;
            const fillOp = style.fillOpacity;
            const stroke = style.borderColor;
            const strokeW = bw;
            if (style.shape === 'pin') {
                const sw = bw * 24 / size;
                return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + (size * 1.5) + '" viewBox="0 0 24 36">' +
                    '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="' + fill + '" fill-opacity="' + fillOp + '" stroke="' + (bw > 0 ? stroke : 'none') + '" stroke-width="' + sw + '"/>' +
                    '<circle cx="12" cy="12" r="4" fill="' + stroke + '"/></svg>';
            }
            const strokeAttr = bw > 0 ? 'stroke="' + stroke + '" stroke-width="' + strokeW + '"' : 'stroke="none"';
            let shape = '';
            if (style.shape === 'circle') {
                const r = size / 2 - bw / 2;
                shape = '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="' + fill + '" fill-opacity="' + fillOp + '" ' + strokeAttr + '/>';
            } else if (style.shape === 'square') {
                shape = '<rect x="' + (bw / 2) + '" y="' + (bw / 2) + '" width="' + (size - bw) + '" height="' + (size - bw) + '" fill="' + fill + '" fill-opacity="' + fillOp + '" ' + strokeAttr + '/>';
            } else if (style.shape === 'diamond') {
                shape = '<polygon points="' + (size / 2) + ',' + (bw / 2) + ' ' + (size - bw / 2) + ',' + (size / 2) + ' ' + (size / 2) + ',' + (size - bw / 2) + ' ' + (bw / 2) + ',' + (size / 2) + '" fill="' + fill + '" fill-opacity="' + fillOp + '" ' + strokeAttr + '/>';
            } else if (style.shape === 'triangle') {
                shape = '<polygon points="' + (size / 2) + ',' + (bw / 2) + ' ' + (size - bw / 2) + ',' + (size - bw / 2) + ' ' + (bw / 2) + ',' + (size - bw / 2) + '" fill="' + fill + '" fill-opacity="' + fillOp + '" ' + strokeAttr + '/>';
            }
            return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + shape + '</svg>';
        }
        function createIcon(style) {
            const size = parseInt(style.size);
            let w = size, h = size, anchor = [w / 2, h / 2];
            if (style.shape === 'pin') {
                h = Math.round(size * 1.5);
                anchor = [w / 2, h];
            }
            return L.divIcon({
                className: 'custom-marker',
                html: getIconSvg(style),
                iconSize: [w, h],
                iconAnchor: anchor
            });
        }
        function getPointSourceCRS(p) {
            if (p.crs && p.crs !== 'auto') return p.crs;
            if (appState.inputCRS !== 'auto') return appState.inputCRS;
            return 'wgs84';
        }
        function getDisplayPoint(p) {
            const mapSource = getCurrentMapSource();
            const mapCrs = mapSource.crs;
            const sourceCrs = getPointSourceCRS(p);
            if (appState.convertOnDisplay && sourceCrs !== mapCrs) {
                return convertCoord(p, sourceCrs, mapCrs);
            }
            return { lat: p.lat, lng: p.lng };
        }
        function buildPopup(p, dp) {
            let html = '<div style="min-width:180px;max-width:320px;">';
            html += '<h4 style="margin:0 0 8px 0;color:#333;border-bottom:1px solid #eee;padding-bottom:4px;">' + (p.name || '未命名') + '</h4>';
            html += '<div style="font-size:12px;margin-bottom:3px;"><b>经度:</b> ' + dp.lng.toFixed(6) + '</div>';
            html += '<div style="font-size:12px;margin-bottom:3px;"><b>纬度:</b> ' + dp.lat.toFixed(6) + '</div>';
            html += '<div style="font-size:12px;margin-bottom:6px;color:#666;"><b>原始坐标系:</b> ' + CRS_NAMES[getPointSourceCRS(p)] + '</div>';
            if (p.properties && Object.keys(p.properties).length > 0) {
                html += '<div style="border-top:1px solid #eee;padding-top:6px;margin-top:6px;">';
                for (const [k, v] of Object.entries(p.properties)) {
                    if (k === '经度' || k === '纬度' || k === '名称') continue;
                    html += '<div style="font-size:12px;"><b>' + k + ':</b> ' + v + '</div>';
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        }
        function createMarkerLayer() {
            const style = getStyle();
            if (style.clustering && typeof L.markerClusterGroup === 'function') {
                return L.markerClusterGroup({
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: true,
                    zoomToBoundsOnClick: true,
                    disableClusteringAtZoom: 18
                });
            }
            return L.layerGroup();
        }
        function renderMarkers() {
            if (!map) return;
            const style = getStyle();
            if (appState.markerLayer) {
                map.removeLayer(appState.markerLayer);
                appState.markerLayer = null;
            }
            if (appState.lineLayer) {
                map.removeLayer(appState.lineLayer);
                appState.lineLayer = null;
            }
            if (appState.points.length === 0) return;

            const layer = createMarkerLayer();
            appState.markerLayer = layer;
            const latlngs = [];
            const bounds = L.latLngBounds();

            appState.points.forEach(p => {
                const dp = getDisplayPoint(p);
                const latlng = [dp.lat, dp.lng];
                latlngs.push(latlng);
                bounds.extend(latlng);
                const icon = createIcon(style);
                const marker = L.marker(latlng, { icon: icon });
                marker.bindPopup(buildPopup(p, dp));
                if (style.showLabels) {
                    const label = style.labelColumn && p.properties && p.properties[style.labelColumn] ? p.properties[style.labelColumn] : p.name;
                    if (label) {
                        marker.bindTooltip(String(label), {
                            permanent: true,
                            direction: 'top',
                            className: 'marker-label',
                            offset: [0, -style.size / 2]
                        }).openTooltip();
                    }
                }
                layer.addLayer(marker);
            });

            map.addLayer(layer);
            if (style.connect && latlngs.length > 1) {
                appState.lineLayer = L.polyline(latlngs, { color: style.lineColor, weight: style.lineWidth, opacity: 0.7 }).addTo(map);
            }
            if (latlngs.length > 0) {
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
            }
        }

        // ========================== 坐标系提醒 ==========================
        function refreshCRSWarning() {
            const warning = document.getElementById('crs-warning');
            const btn = document.getElementById('btn-convert');
            const mapCrs = getCurrentMapSource().crs;
            const inputCrs = appState.inputCRS;
            if (appState.points.length === 0) {
                warning.classList.add('hidden');
                btn.classList.add('hidden');
                return;
            }
            if (inputCrs !== 'auto' && inputCrs !== mapCrs && !appState.convertOnDisplay) {
                warning.innerHTML = t('crs_mismatch').replace('{src}', crsName(inputCrs)).replace('{map}', crsName(mapCrs));
                warning.classList.remove('hidden');
                btn.classList.remove('hidden');
                btn.textContent = t('btn_convert_action');
            } else if (appState.convertOnDisplay) {
                warning.innerHTML = t('crs_converted').replace('{map}', crsName(mapCrs));
                warning.classList.remove('hidden');
                btn.classList.remove('hidden');
                btn.textContent = t('btn_cancel_action');
            } else {
                warning.classList.add('hidden');
                btn.classList.add('hidden');
            }
        }

        // ========================== UI 控制 ==========================
        function showStatus(msg, type) {
            const el = document.getElementById('status');
            el.textContent = msg;
            el.className = 'status ' + (type || 'info');
            el.style.display = 'block';
            setTimeout(() => { el.style.display = 'none'; }, 5000);
        }
        function showLoading(text) {
            document.getElementById('loading-text').textContent = text || '处理中...';
            document.getElementById('loading-overlay').classList.add('active');
        }
        function hideLoading() {
            document.getElementById('loading-overlay').classList.remove('active');
        }
        function showModal(title, content, actions) {
            const body = document.getElementById('modal-body');
            body.innerHTML = '<h3 style="margin:0 0 12px 0;">' + title + '</h3>' + content + (actions || '');
            document.getElementById('modal').classList.add('active');
        }
        function closeModal() {
            document.getElementById('modal').classList.remove('active');
        }
        function updateDataPreview() {
            const container = document.getElementById('data-preview');
            if (appState.points.length === 0) {
                container.innerHTML = '';
                return;
            }
            const cols = [t('col_name'), t('col_lng'), t('col_lat'), t('col_crs')];
            let html = '<table><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
            appState.points.slice(0, 50).forEach(p => {
                html += '<tr>' +
                    '<td>' + (p.name || '') + '</td>' +
                    '<td>' + p.lng.toFixed(6) + '</td>' +
                    '<td>' + p.lat.toFixed(6) + '</td>' +
                    '<td>' + crsName(getPointSourceCRS(p)) + '</td>' +
                    '</tr>';
            });
            if (appState.points.length > 50) {
                html += '<tr><td colspan="4" style="text-align:center;color:#888;">' + t('preview_more').replace('{n}', appState.points.length - 50) + '</td></tr>';
            }
            html += '</tbody></table>';
            container.innerHTML = html;
        }
        function updateLabelColumnOptions() {
            const select = document.getElementById('style-label-column');
            select.innerHTML = '<option value="">名称</option>';
            appState.columns.forEach(col => {
                const opt = document.createElement('option');
                opt.value = col;
                opt.textContent = col;
                select.appendChild(opt);
            });
        }
        function populateMapSourceSelect() {
            const select = document.getElementById('map-source');
            select.innerHTML = '';
            MAP_SOURCES.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = sourceDisplayName(s);
                select.appendChild(opt);
            });
            // 自定义图源不在 MAP_SOURCES 中，需手动补回，否则切换语言后会被重置为第一项
            if (appState.customSource) {
                const opt = document.createElement('option');
                opt.value = 'custom';
                opt.textContent = SOURCE_NAMES['custom'] || '自定义';
                select.appendChild(opt);
            }
            select.value = appState.mapSourceId;
            // 同步自定义面板显隐，保持与当前选择一致
            const customPanel = document.getElementById('custom-source');
            if (customPanel) customPanel.classList.toggle('hidden', appState.mapSourceId !== 'custom');
        }
        function loadData(points, columns) {
            appState.points = points;
            appState.columns = columns || [];
            appState.convertOnDisplay = false;
            updateLabelColumnOptions();
            updateDataPreview();
            renderMarkers();
            refreshCRSWarning();
            showStatus(t('loaded_n').replace('{n}', points.length), 'success');
        }
        function loadSampleData() {
            appState.inputCRS = 'wgs84';
            document.getElementById('input-crs').value = 'wgs84';
            loadData(SAMPLE_DATA.map(p => ({ ...p })), ['名称', '经度', '纬度', '坐标系']);
        }
        async function handleFiles(files) {
            if (!files || files.length === 0) return;
            showLoading('正在解析文件...');
            try {
                appState.pendingFiles = Array.from(files);
                const first = files[0];
                const rows = await parseFile(first);
                if (!rows || rows.length < 1) {
                    showStatus(t('parse_no_coord'), 'error');
                    return;
                }
                const hasHeader = isHeaderRow(rows[0]);
                const headers = hasHeader
                    ? rows[0].map(h => String(h === undefined ? '' : h).trim())
                    : rows[0].map((_, i) => '列' + (i + 1));
                let def;
                if (hasHeader) {
                    const c = detectColumns(headers);
                    def = { nameIdx: c.nameIdx, latIdx: c.latIdx, lngIdx: c.lngIdx, crsIdx: c.crsIdx };
                } else {
                    const fb = fallbackNumericColumns(rows);
                    def = { nameIdx: -1, latIdx: fb.latIdx, lngIdx: fb.lngIdx, crsIdx: -1 };
                }
                appState.rawHeaders = headers;
                appState.rawHasHeader = hasHeader;
                populateColumnSelector(headers, def);
                showColumnSelector();
                showStatus(t('colsel_hint'), 'info');
            } catch (e) {
                showStatus(t('parse_fail_msg') + e.message, 'error');
            } finally {
                hideLoading();
            }
        }
        function handleManualInput() {
            const text = document.getElementById('manual-input').value;
            if (!text.trim()) return;
            showLoading('正在解析手动输入...');
            try {
                const result = parseManualInput(text);
                if (result.points.length === 0) {
                    showStatus(t('parse_no_coord'), 'error');
                    return;
                }
                loadData(result.points, result.columns);
            } catch (e) {
                showStatus(t('parse_fail_msg') + e.message, 'error');
            } finally {
                hideLoading();
            }
        }
        function download(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
        function exportCSV() {
            if (appState.points.length === 0) return;
            let csv = '\uFEFF' + t('col_name') + ',' + t('col_lng') + ',' + t('col_lat') + ',' + t('col_crs') + '\n';
            appState.points.forEach(p => {
                csv += '"' + (p.name || '') + '",' + p.lng + ',' + p.lat + ',"' + crsName(getPointSourceCRS(p)) + '"\n';
            });
            download(csv, '坐标数据_' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv;charset=utf-8;');
            showStatus(t('csv_done'), 'success');
        }
        async function exportOfflineHTML() {
            if (appState.points.length === 0) {
                showStatus(t('no_data'), 'error');
                return;
            }
            showLoading(t('gen_offline'));
            try {
                const [css, js] = await Promise.all([
                    fetch('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css').then(r => r.text()),
                    fetch('https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js').then(r => r.text())
                ]);
                const html = buildOfflineHTML(css, js);
                download(html, '离线坐标地图_' + new Date().toISOString().slice(0, 10) + '.html', 'text/html;charset=utf-8;');
                showStatus(t('offline_done'), 'success');
            } catch (e) {
                showStatus(t('offline_fail') + e.message, 'error');
            } finally {
                hideLoading();
            }
        }
        function buildOfflineHTML(leafletCss, leafletJs) {
            const style = getStyle();
            const data = appState.points.map(p => {
                const dp = getDisplayPoint(p);
                return { name: p.name, lat: dp.lat, lng: dp.lng, props: p.properties };
            });
            const dataJSON = JSON.stringify(data);
            const styleJSON = JSON.stringify(style);
            const source = getCurrentMapSource();
            const sourceJSON = JSON.stringify({
                id: source.id,
                name: source.name,
                url: source.url,
                attribution: source.attribution || '',
                maxZoom: source.maxZoom || 19,
                subdomains: source.subdomains || 'abc',
                crs: source.crs || 'wgs84'
            });

            const scriptLines = [
                'const DATA = ' + dataJSON + ';',
                'const STYLE = ' + styleJSON + ';',
                'const SOURCE = ' + sourceJSON + ';',
                'function getIconSvg(style) {',
                '  var size = parseInt(style.size);',
                '  var bw = parseFloat(style.borderWidth);',
                '  var fill = style.fillColor;',
                '  var fillOp = style.fillOpacity;',
                '  var stroke = style.borderColor;',
                '  var strokeW = bw;',
                '  if (style.shape === "pin") {',
                '    var sw = bw * 24 / size;',
                '    return \'<svg xmlns="http://www.w3.org/2000/svg" width="\' + size + \'" height="\' + (size * 1.5) + \'" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="\' + fill + \'" fill-opacity="\' + fillOp + \'" stroke="\' + (bw > 0 ? stroke : "none") + \'" stroke-width="\' + sw + \'"/><circle cx="12" cy="12" r="4" fill="\' + stroke + \'"/></svg>\';',
                '  }',
                '  var strokeAttr = bw > 0 ? \'stroke="\' + stroke + \'" stroke-width="\' + strokeW + \'"\' : \'stroke="none"\';',
                '  var shape = "";',
                '  if (style.shape === "circle") {',
                '    var r = size / 2 - bw / 2;',
                '    shape = \'<circle cx="\' + (size / 2) + \'" cy="\' + (size / 2) + \'" r="\' + r + \'" fill="\' + fill + \'" fill-opacity="\' + fillOp + \'" \' + strokeAttr + \'/>\';',
                '  } else if (style.shape === "square") {',
                '    shape = \'<rect x="\' + (bw / 2) + \'" y="\' + (bw / 2) + \'" width="\' + (size - bw) + \'" height="\' + (size - bw) + \'" fill="\' + fill + \'" fill-opacity="\' + fillOp + \'" \' + strokeAttr + \'/>\';',
                '  } else if (style.shape === "diamond") {',
                '    shape = \'<polygon points="\' + (size / 2) + \',\' + (bw / 2) + \' \' + (size - bw / 2) + \',\' + (size / 2) + \' \' + (size / 2) + \',\' + (size - bw / 2) + \' \' + (bw / 2) + \',\' + (size / 2) + \'" fill="\' + fill + \'" fill-opacity="\' + fillOp + \'" \' + strokeAttr + \'/>\';',
                '  } else if (style.shape === "triangle") {',
                '    shape = \'<polygon points="\' + (size / 2) + \',\' + (bw / 2) + \' \' + (size - bw / 2) + \',\' + (size - bw / 2) + \' \' + (bw / 2) + \',\' + (size - bw / 2) + \'" fill="\' + fill + \'" fill-opacity="\' + fillOp + \'" \' + strokeAttr + \'/>\';',
                '  }',
                '  return \'<svg xmlns="http://www.w3.org/2000/svg" width="\' + size + \'" height="\' + size + \'" viewBox="0 0 \' + size + \' \' + size + \'">\' + shape + \'</svg>\';',
                '}',
                'function createIcon(style) {',
                '  var size = parseInt(style.size);',
                '  var w = size, h = size, anchor = [w / 2, h / 2];',
                '  if (style.shape === "pin") { h = Math.round(size * 1.5); anchor = [w / 2, h]; }',
                '  return L.divIcon({ className: "custom-marker", html: getIconSvg(style), iconSize: [w, h], iconAnchor: anchor });',
                '}',
                'L.GridLayer.Grid = L.GridLayer.extend({',
                '  createTile: function(coords) {',
                '    var tile = document.createElement("canvas");',
                '    var s = this.getTileSize();',
                '    tile.setAttribute("width", s.x);',
                '    tile.setAttribute("height", s.y);',
                '    var ctx = tile.getContext("2d");',
                '    ctx.fillStyle = "rgba(240,248,255,1)";',
                '    ctx.fillRect(0, 0, s.x, s.y);',
                '    ctx.strokeStyle = "rgba(0,0,0,0.08)";',
                '    ctx.lineWidth = 1;',
                '    ctx.strokeRect(0, 0, s.x, s.y);',
                '    ctx.fillStyle = "rgba(0,0,0,0.35)";',
                '    ctx.font = "11px sans-serif";',
                '    ctx.fillText(coords.x + "," + coords.y, 4, 12);',
                '    return tile;',
                '  }',
                '});',
                'L.gridLayer.grid = function(opts) { return new L.GridLayer.Grid(opts); };',
                'var map = L.map("map").setView([35, 105], 4);',
                'var onlineLayer = null;',
                'var offlineLayer = null;',
                'function addStatusBar(cls, text) {',
                '  var bar = document.getElementById("status-bar");',
                '  bar.className = "status-bar " + cls;',
                '  bar.textContent = text;',
                '  if (cls === "online") {',
                '    setTimeout(function() { bar.classList.add("hidden"); }, 3000);',
                '  }',
                '}',
                'function addOnlineLayer() {',
                '  if (!onlineLayer) {',
                '    onlineLayer = L.tileLayer(SOURCE.url, { attribution: SOURCE.attribution, maxZoom: SOURCE.maxZoom, subdomains: SOURCE.subdomains }).addTo(map);',
                '  }',
                '  if (offlineLayer) { map.removeLayer(offlineLayer); offlineLayer = null; }',
                '  addStatusBar("online", "已加载在线地图：" + SOURCE.name);',
                '}',
                'function addOfflineLayer() {',
                '  if (onlineLayer) { map.removeLayer(onlineLayer); onlineLayer = null; }',
                '  if (!offlineLayer) {',
                '    offlineLayer = L.gridLayer.grid({ attribution: "离线网格底图" }).addTo(map);',
                '  }',
                '  addStatusBar("offline", "当前无网络，已切换为离线网格底图");',
                '}',
                'function testTile(url, timeout) {',
                '  return new Promise(function(resolve) {',
                '    var img = new Image();',
                '    var timer = setTimeout(function() { resolve(false); }, timeout);',
                '    img.onload = function() { clearTimeout(timer); resolve(true); };',
                '    img.onerror = function() { clearTimeout(timer); resolve(false); };',
                '    var sep = url.indexOf("?") >= 0 ? "&" : "?";',
                '    img.src = url + sep + "_t=" + Date.now();',
                '  });',
                '}',
                'function tryOnline() {',
                '  addOnlineLayer();',
                '  var center = L.latLng(35, 105);',
                '  var point = L.CRS.EPSG3857.latLngToPoint(center, 4);',
                '  var tileSize = 256;',
                '  var sampleUrl = SOURCE.url.replace("{x}", Math.floor(point.x / tileSize)).replace("{y}", Math.floor(point.y / tileSize)).replace("{z}", 4).replace("{s}", (SOURCE.subdomains || "a")[0]);',
                '  testTile(sampleUrl, 5000).then(function(ok) {',
                '    if (!ok) addOfflineLayer();',
                '  });',
                '}',
                'if (navigator.onLine) {',
                '  tryOnline();',
                '} else {',
                '  addOfflineLayer();',
                '}',
                'window.addEventListener("online", tryOnline);',
                'window.addEventListener("offline", addOfflineLayer);',
                'var markers = (typeof L.markerClusterGroup === "function" && STYLE.clustering) ? L.markerClusterGroup() : L.layerGroup();',
                'map.addLayer(markers);',
                'var latlngs = [];',
                'DATA.forEach(function(p) {',
                '  var latlng = [p.lat, p.lng];',
                '  latlngs.push(latlng);',
                '  var marker = L.marker(latlng, { icon: createIcon(STYLE) });',
                '  var popup = \'<div style="min-width:160px;"><h4 style="margin:0 0 6px 0;">\' + (p.name || "未命名") + \'</h4>\';',
                '  if (p.props) {',
                '    for (var k in p.props) {',
                '      popup += \'<div style="font-size:12px;"><b>\' + k + \':</b> \' + p.props[k] + \'</div>\';',
                '    }',
                '  }',
                '  popup += \'<div style="font-size:12px;"><b>经纬度:</b> \' + p.lng.toFixed(6) + \', \' + p.lat.toFixed(6) + \'</div></div>\';',
                '  marker.bindPopup(popup);',
                '  if (STYLE.showLabels && p.name) {',
                '    marker.bindTooltip(p.name, { permanent: true, direction: "top", className: "marker-label", offset: [0, -STYLE.size / 2] }).openTooltip();',
                '  }',
                '  markers.addLayer(marker);',
                '});',
                'if (latlngs.length > 0) { map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40], maxZoom: 16 }); }',
                'if (STYLE.connect && latlngs.length > 1) { L.polyline(latlngs, { color: STYLE.lineColor, weight: STYLE.lineWidth, opacity: 0.7 }).addTo(map); }'
            ];

            return [
                '<!DOCTYPE html>',
                '<html lang="zh-CN">',
                '<head>',
                '<meta charset="UTF-8">',
                '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
                '<title>离线坐标可视化地图</title>',
                '<style>',
                leafletCss,
                'body { margin: 0; padding: 0; font-family: "Microsoft YaHei", sans-serif; }',
                '#map { height: 100vh; width: 100%; background: #eef2f5; }',
                '.status-bar { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 2000; padding: 8px 16px; border-radius: 20px; font-size: 13px; background: rgba(255,255,255,0.96); box-shadow: 0 2px 8px rgba(0,0,0,0.15); pointer-events: none; transition: opacity .5s; }',
                '.status-bar.loading { color: #333; border: 1px solid #e0e0e0; }',
                '.status-bar.online { color: #2e7d32; background: #e8f5e9; border: 1px solid #a5d6a7; }',
                '.status-bar.offline { color: #e65100; background: #fff3e0; border: 1px solid #ffcc80; }',
                '.status-bar.hidden { opacity: 0; }',
                '.custom-marker svg { display: block; }',
                '.marker-label { background: transparent !important; border: none !important; box-shadow: none !important; color: #333 !important; font-size: 12px !important; font-weight: 600 !important; text-shadow: 0 0 2px #fff, 0 0 3px #fff; }',
                '</style>',
                '</head>',
                '<body>',
                '<div id="status-bar" class="status-bar loading">正在检测网络并尝试加载在线地图…</div>',
                '<div id="map"></div>',
                '<script>',
                leafletJs,
                scriptLines.join('\n'),
                '</scr' + 'ipt>',
                '</body>',
                '</html>'
            ].join('\n');
        }
        // ========================== 多语言 (i18n) ==========================
        const LANGS = ['zh-CN', 'zh-TW', 'en', 'ru', 'vi', 'ja', 'ko'];
        let currentLang = 'zh-CN';

        const I18N = {
            'zh-CN': {
                'app_title': '坐标数据可视化地图',
                'app_subtitle': '支持 Excel / CSV / TXT 及手动输入',
                'lang_label': '界面语言',
                'panel1_title': '1. 导入数据',
                'panel2_title': '2. 地图图源',
                'panel3_title': '3. 样式设置',
                'panel4_title': '4. 导出与下载',
                'drop_main': '点击或拖拽文件到此处',
                'drop_sub': '支持 .xlsx .xls .csv .txt .tsv .json',
                'crs_label': '数据坐标系',
                'crs_auto': '自动检测 / 默认 WGS-84',
                'crs_wgs84': 'WGS-84',
                'crs_gcj02': 'GCJ-02（火星 / 高德）',
                'crs_bd09': 'BD-09（百度）',
                'btn_load_sample': '加载示例数据',
                'manual_label': '手动输入坐标',
                'manual_ph': '每行一个点，示例：\n北京 116.4074 39.9042\n116.4074,39.9042 上海\n也可支持度分秒格式： 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': '解析手动输入',
                'custom_url_label': '自定义瓦片 URL',
                'custom_url_ph': 'https://.../{z}/{x}/{y}.png',
                'ccrs_wgs84': 'WGS84',
                'ccrs_gcj02': 'GCJ02',
                'ccrs_bd09': 'BD09',
                'btn_add_custom': '添加',
                'custom_hint': '使用 {x} {y} {z}，可选 {s} 表示子域',
                'style_shape_label': '形状',
                'shape_circle': '圆形',
                'shape_square': '方形',
                'shape_diamond': '菱形',
                'shape_triangle': '三角形',
                'shape_pin': '图钉',
                'style_size_label': '大小',
                'style_fill_label': '填充色',
                'style_opacity_label': '不透明度',
                'style_border_color_label': '边框色',
                'style_border_width_label': '边框宽',
                'style_label_label': '显示名称标签',
                'style_connect_label': '连接点',
                'style_line_color_label': '线颜色',
                'style_line_width_label': '线宽',
                'style_cluster_label': '开启聚合',
                'btn_apply_style': '应用样式',
                'geo_format_label': '矢量导出格式',
                'fmt_geojson': 'GeoJSON (.geojson)',
                'fmt_kml': 'KML (.kml)',
                'fmt_shp': 'Shapefile (.shp / .dbf / .shx / .prj)',
                'geo_export_btn': '导出矢量数据',
                'btn_export_csv': '导出 CSV',
                'btn_export_offline': '导出离线 HTML 地图',
                'btn_download_sample': '下载示例文件包',
                'btn_clear': '清空数据',
                'btn_fit': '适配',
                'fit_title': '缩放地图以适配所有数据点',
                'toggle_title': '收起 / 展开侧边栏',
                'fullscreen_title': '全屏预览地图',
                'doc_title': '坐标数据可视化地图工作室',
                'crsname_wgs84': 'WGS-84',
                'crsname_gcj02': 'GCJ-02（火星 / 高德）',
                'crsname_bd09': 'BD-09（百度）',
                'no_data': '没有数据可导出',
                'data_cleared': '已清空数据',
                'geo_done_geojson': 'GeoJSON 已导出，可直接在 QGIS / ArcGIS 中加载（坐标系 WGS-84）',
                'geo_done_kml': 'KML 已导出，可直接在 Google Earth / QGIS 中打开（坐标系 WGS-84）',
                'geo_done_shp': 'Shapefile 已导出（.zip 含 .shp/.dbf/.shx/.prj，坐标系 WGS-84）',
                'gen_shp': '正在生成 Shapefile...',
                'shp_fail': 'Shapefile 生成失败：',
                'loaded_n': '成功加载 {n} 条坐标数据',
                'preview_more': '还有 {n} 行未显示',
                'col_name': '名称', 'col_lng': '经度', 'col_lat': '纬度', 'col_crs': '原始坐标系',
                'gen_offline': '正在生成离线 HTML 地图...',
                'parse_no_coord': '未能从文件中解析到有效坐标，请检查格式或示例文件',
                'crs_mismatch': '当前数据为 {src}，当前地图使用 {map}。若不转换，点会出现约百米级偏移。',
                'crs_converted': '已启用坐标转换，数据已按 {map} 显示。',
                'btn_convert_action': '转换坐标系以匹配地图',
                'btn_cancel_action': '取消转换',
                'offline_done': '离线 HTML 地图已生成，可直接打开或分享',
                'offline_fail': '离线地图生成失败：',
                'csv_done': 'CSV 已导出',
                'parse_fail_msg': '解析失败：',
                'colsel_title': '选择经纬度列',
                'colsel_desc': '请在下拉框中指定每一列对应的字段，再点击“应用列选择”',
                'colsel_name': '名称列',
                'colsel_lng': '经度列',
                'colsel_lat': '纬度列',
                'colsel_crs': '坐标系列',
                'colsel_none': '（无）',
                'colsel_apply': '应用列选择',
                'colsel_hint': '已识别全部列字段，请选择经度/纬度列后点击“应用列选择”',
                'colsel_pick_required': '请先选择经度列和纬度列',
                'btn_download_format_sample': '下载多格式示例',
                'format_sample_done': '已下载多格式坐标示例'
            },
            'zh-TW': {
                'app_title': '座標資料視覺化地圖',
                'app_subtitle': '支援 Excel / CSV / TXT 及手動輸入',
                'lang_label': '介面語言',
                'panel1_title': '1. 匯入資料',
                'panel2_title': '2. 地圖圖源',
                'panel3_title': '3. 樣式設定',
                'panel4_title': '4. 匯出與下載',
                'drop_main': '點擊或拖曳檔案到此處',
                'crs_label': '資料座標系',
                'crs_auto': '自動偵測 / 預設 WGS-84',
                'crs_gcj02': 'GCJ-02（火星 / 高德）',
                'crs_bd09': 'BD-09（百度）',
                'btn_load_sample': '載入範例資料',
                'manual_label': '手動輸入座標',
                'manual_ph': '每行一個點，範例：\n北京 116.4074 39.9042\n116.4074,39.9042 上海\n亦支援度分秒格式： 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': '解析手動輸入',
                'custom_url_label': '自訂瓦片 URL',
                'btn_add_custom': '新增',
                'custom_hint': '使用 {x} {y} {z}，可選 {s} 表示子網域',
                'style_shape_label': '形狀',
                'shape_circle': '圓形',
                'shape_square': '方形',
                'shape_diamond': '菱形',
                'shape_triangle': '三角形',
                'shape_pin': '圖釘',
                'style_size_label': '大小',
                'style_fill_label': '填滿色',
                'style_opacity_label': '不透明度',
                'style_border_color_label': '邊框色',
                'style_border_width_label': '邊框寬',
                'style_label_label': '顯示名稱標籤',
                'style_connect_label': '連接點',
                'style_line_color_label': '線顏色',
                'style_line_width_label': '線寬',
                'style_cluster_label': '開啟聚合',
                'btn_apply_style': '套用樣式',
                'geo_format_label': '矢量匯出格式',
                'geo_export_btn': '匯出矢量資料',
                'btn_export_csv': '匯出 CSV',
                'btn_export_offline': '匯出離線 HTML 地圖',
                'btn_download_sample': '下載範例檔案包',
                'btn_clear': '清空資料',
                'btn_fit': '適配',
                'fit_title': '縮放地圖以適配所有資料點',
                'toggle_title': '收起 / 展開側邊欄',
                'fullscreen_title': '全螢幕預覽地圖',
                'doc_title': '座標資料視覺化地圖工作室',
                'crsname_gcj02': 'GCJ-02（火星 / 高德）',
                'crsname_bd09': 'BD-09（百度）',
                'no_data': '沒有資料可匯出',
                'data_cleared': '已清空資料',
                'geo_done_geojson': 'GeoJSON 已匯出，可直接在 QGIS / ArcGIS 中載入（座標系 WGS-84）',
                'geo_done_kml': 'KML 已匯出，可直接在 Google Earth / QGIS 中開啟（座標系 WGS-84）',
                'geo_done_shp': 'Shapefile 已匯出（.zip 含 .shp/.dbf/.shx/.prj，座標系 WGS-84）',
                'gen_shp': '正在產生 Shapefile...',
                'shp_fail': 'Shapefile 產生失敗：',
                'loaded_n': '成功載入 {n} 筆座標資料',
                'preview_more': '還有 {n} 行未顯示',
                'crs_mismatch': '目前資料為 {src}，目前地圖使用 {map}。若不轉換，點位會偏移約百公尺。',
                'crs_converted': '已啟用座標轉換，資料已依 {map} 顯示。',
                'btn_convert_action': '轉換座標系以符合地圖',
                'btn_cancel_action': '取消轉換',
                'offline_done': '離線 HTML 地圖已產生，可直接開啟或分享',
                'offline_fail': '離線地圖產生失敗：',
                'csv_done': 'CSV 已匯出',
                'parse_fail_msg': '解析失敗：'
            },
            'en': {
                'app_title': 'Coordinate Data Visualization Map',
                'app_subtitle': 'Supports Excel / CSV / TXT and manual input',
                'lang_label': 'Interface Language',
                'panel1_title': '1. Import Data',
                'panel2_title': '2. Map Sources',
                'panel3_title': '3. Style Settings',
                'panel4_title': '4. Export & Download',
                'drop_main': 'Click or drag files here',
                'crs_label': 'Data Coordinate System',
                'crs_auto': 'Auto-detect / Default WGS-84',
                'crs_gcj02': 'GCJ-02 (Mars / Gaode)',
                'crs_bd09': 'BD-09 (Baidu)',
                'btn_load_sample': 'Load Sample Data',
                'manual_label': 'Manual Coordinate Input',
                'manual_ph': 'One point per line, e.g.:\nBeijing 116.4074 39.9042\n116.4074,39.9042 Shanghai\nAlso supports DMS: 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': 'Parse Manual Input',
                'custom_url_label': 'Custom Tile URL',
                'btn_add_custom': 'Add',
                'custom_hint': 'Use {x} {y} {z}, optional {s} for subdomain',
                'style_shape_label': 'Shape',
                'shape_circle': 'Circle',
                'shape_square': 'Square',
                'shape_diamond': 'Diamond',
                'shape_triangle': 'Triangle',
                'shape_pin': 'Pin',
                'style_size_label': 'Size',
                'style_fill_label': 'Fill Color',
                'style_opacity_label': 'Opacity',
                'style_border_color_label': 'Border Color',
                'style_border_width_label': 'Border Width',
                'style_label_label': 'Show name label',
                'style_connect_label': 'Connect points',
                'style_line_color_label': 'Line Color',
                'style_line_width_label': 'Line Width',
                'style_cluster_label': 'Enable clustering',
                'btn_apply_style': 'Apply Style',
                'geo_format_label': 'Vector Export Format',
                'geo_export_btn': 'Export Vector Data',
                'btn_export_csv': 'Export CSV',
                'btn_export_offline': 'Export Offline HTML Map',
                'btn_download_sample': 'Download Sample Files',
                'btn_clear': 'Clear Data',
                'btn_fit': 'Fit',
                'fit_title': 'Fit map to all data points',
                'toggle_title': 'Collapse / Expand Sidebar',
                'fullscreen_title': 'Fullscreen Map Preview',
                'doc_title': 'Coordinate Data Visualization Map Studio',
                'crsname_gcj02': 'GCJ-02 (Mars / Gaode)',
                'crsname_bd09': 'BD-09 (Baidu)',
                'no_data': 'No data to export',
                'data_cleared': 'Data cleared',
                'geo_done_geojson': 'GeoJSON exported, ready to load in QGIS / ArcGIS (WGS-84)',
                'geo_done_kml': 'KML exported, open in Google Earth / QGIS (WGS-84)',
                'geo_done_shp': 'Shapefile exported (.zip with .shp/.dbf/.shx/.prj, WGS-84)',
                'gen_shp': 'Generating Shapefile...',
                'shp_fail': 'Shapefile generation failed: ',
                'loaded_n': 'Successfully loaded {n} coordinates',
                'preview_more': '{n} more rows not shown',
                'col_name': 'Name', 'col_lng': 'Lon', 'col_lat': 'Lat', 'col_crs': 'Source CRS',
                'gen_offline': 'Generating offline HTML map...',
                'parse_no_coord': 'No valid coordinates could be parsed from the file, check the format or sample file',
                'crs_mismatch': 'Source data is {src}, current map uses {map}. Without conversion points shift by ~hundreds of meters.',
                'crs_converted': 'Coordinate conversion enabled, data shown in {map}.',
                'btn_convert_action': 'Convert coordinates to match map',
                'btn_cancel_action': 'Cancel conversion',
                'offline_done': 'Offline HTML map generated, can be opened or shared',
                'offline_fail': 'Offline map generation failed: ',
                'csv_done': 'CSV exported',
                'parse_fail_msg': 'Parse failed: ',
                'colsel_title': 'Select Lon/Lat Columns',
                'colsel_desc': 'Choose which column maps to each field, then click "Apply Column Selection"',
                'colsel_name': 'Name column',
                'colsel_lng': 'Longitude column',
                'colsel_lat': 'Latitude column',
                'colsel_crs': 'CRS column',
                'colsel_none': '(none)',
                'colsel_apply': 'Apply Column Selection',
                'colsel_hint': 'All columns detected. Pick the longitude/latitude columns then click "Apply Column Selection"',
                'colsel_pick_required': 'Please select the longitude and latitude columns first',
                'btn_download_format_sample': 'Download Multi-format Sample',
                'format_sample_done': 'Multi-format coordinate sample downloaded'
            },
            'ru': {
                'app_title': 'Карта визуализации координатных данных',
                'app_subtitle': 'Поддержка Excel / CSV / TXT и ручного ввода',
                'lang_label': 'Язык интерфейса',
                'panel1_title': '1. Импорт данных',
                'panel2_title': '2. Источники карты',
                'panel3_title': '3. Настройки стиля',
                'panel4_title': '4. Экспорт и загрузка',
                'drop_main': 'Нажмите или перетащите файлы сюда',
                'crs_label': 'Система координат данных',
                'crs_auto': 'Авто / WGS-84 по умолчанию',
                'crs_gcj02': 'GCJ-02 (Марс / Gaode)',
                'crs_bd09': 'BD-09 (Baidu)',
                'btn_load_sample': 'Загрузить пример',
                'manual_label': 'Ручной ввод координат',
                'manual_ph': 'Одна точка на строку, напр.:\nBeijing 116.4074 39.9042\n116.4074,39.9042 Shanghai\nПоддерживается DMS: 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': 'Разобрать ввод',
                'custom_url_label': 'Свой URL тайлов',
                'btn_add_custom': 'Добавить',
                'custom_hint': 'Используйте {x} {y} {z}, необязательно {s} для поддомена',
                'style_shape_label': 'Форма',
                'shape_circle': 'Круг',
                'shape_square': 'Квадрат',
                'shape_diamond': 'Ромб',
                'shape_triangle': 'Треугольник',
                'shape_pin': 'Булавка',
                'style_size_label': 'Размер',
                'style_fill_label': 'Цвет заливки',
                'style_opacity_label': 'Прозрачность',
                'style_border_color_label': 'Цвет границы',
                'style_border_width_label': 'Толщина границы',
                'style_label_label': 'Показывать подпись',
                'style_connect_label': 'Соединить точки',
                'style_line_color_label': 'Цвет линии',
                'style_line_width_label': 'Толщина линии',
                'style_cluster_label': 'Включить кластеризацию',
                'btn_apply_style': 'Применить стиль',
                'geo_format_label': 'Формат векторного экспорта',
                'geo_export_btn': 'Экспорт векторных данных',
                'btn_export_csv': 'Экспорт CSV',
                'btn_export_offline': 'Экспорт офлайн HTML-карты',
                'btn_download_sample': 'Скачать примеры файлов',
                'btn_clear': 'Очистить данные',
                'btn_fit': 'Подогнать',
                'toggle_title': 'Свернуть / Развернуть панель',
                'fullscreen_title': 'Полноэкранный предпросмотр',
                'doc_title': 'Студия визуализации координат',
                'crsname_gcj02': 'GCJ-02 (Марс / Gaode)',
                'crsname_bd09': 'BD-09 (Baidu)',
                'no_data': 'Нет данных для экспорта',
                'data_cleared': 'Данные очищены',
                'geo_done_geojson': 'GeoJSON экспортирован, открывается в QGIS / ArcGIS (WGS-84)',
                'geo_done_kml': 'KML экспортирован, открывается в Google Earth / QGIS (WGS-84)',
                'geo_done_shp': 'Shapefile экспортирован (.zip с .shp/.dbf/.shx/.prj, WGS-84)',
                'gen_shp': 'Генерация Shapefile...',
                'shp_fail': 'Ошибка генерации Shapefile: ',
                'loaded_n': 'Успешно загружено точек: {n}',
                'preview_more': 'Ещё {n} строк не показано',
                'crs_mismatch': 'Данные в системе {src}, карта использует {map}. Без преобразования смещение ~сотни метров.',
                'crs_converted': 'Преобразование включено, данные в системе {map}.',
                'btn_convert_action': 'Преобразовать к системе карты',
                'btn_cancel_action': 'Отменить преобразование',
                'offline_done': 'Офлайн HTML-карта создана',
                'offline_fail': 'Ошибка создания карты: ',
                'csv_done': 'CSV экспортирован',
                'parse_fail_msg': 'Ошибка разбора: '
            },
            'vi': {
                'app_title': 'Bản đồ trực quan hóa dữ liệu tọa độ',
                'app_subtitle': 'Hỗ trợ Excel / CSV / TXT và nhập thủ công',
                'lang_label': 'Ngôn ngữ giao diện',
                'panel1_title': '1. Nhập dữ liệu',
                'panel2_title': '2. Nguồn bản đồ',
                'panel3_title': '3. Cài đặt kiểu',
                'panel4_title': '4. Xuất và tải xuống',
                'drop_main': 'Nhấp hoặc kéo tệp vào đây',
                'crs_label': 'Hệ tọa độ dữ liệu',
                'crs_auto': 'Tự động / Mặc định WGS-84',
                'crs_gcj02': 'GCJ-02 (Sao Hỏa / Gaode)',
                'crs_bd09': 'BD-09 (Baidu)',
                'btn_load_sample': 'Tải dữ liệu mẫu',
                'manual_label': 'Nhập tọa độ thủ công',
                'manual_ph': 'Mỗi dòng một điểm, ví dụ:\nBeijing 116.4074 39.9042\n116.4074,39.9042 Shanghai\nHỗ trợ DMS: 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': 'Phân tích đầu vào',
                'custom_url_label': 'URL tile tùy chỉnh',
                'btn_add_custom': 'Thêm',
                'custom_hint': 'Dùng {x} {y} {z}, tùy chọn {s} cho tên miền phụ',
                'style_shape_label': 'Hình dạng',
                'shape_circle': 'Hình tròn',
                'shape_square': 'Hình vuông',
                'shape_diamond': 'Hình thoi',
                'shape_triangle': 'Tam giác',
                'shape_pin': 'Ghim',
                'style_size_label': 'Kích thước',
                'style_fill_label': 'Màu tô',
                'style_opacity_label': 'Độ mờ',
                'style_border_color_label': 'Màu viền',
                'style_border_width_label': 'Độ rộng viền',
                'style_label_label': 'Hiển thị nhãn tên',
                'style_connect_label': 'Nối các điểm',
                'style_line_color_label': 'Màu đường',
                'style_line_width_label': 'Độ rộng đường',
                'style_cluster_label': 'Bật gộp nhóm',
                'btn_apply_style': 'Áp dụng kiểu',
                'geo_format_label': 'Định dạng xuất vec-tơ',
                'geo_export_btn': 'Xuất dữ liệu vec-tơ',
                'btn_export_csv': 'Xuất CSV',
                'btn_export_offline': 'Xuất bản đồ HTML ngoại tuyến',
                'btn_download_sample': 'Tải tệp mẫu',
                'btn_clear': 'Xóa dữ liệu',
                'btn_fit': 'Vừa vặn',
                'toggle_title': 'Thu gọn / Mở rộng thanh bên',
                'fullscreen_title': 'Xem bản đồ toàn màn hình',
                'doc_title': 'Phòng thiết kế bản đồ trực quan hóa tọa độ',
                'crsname_gcj02': 'GCJ-02 (Sao Hỏa / Gaode)',
                'crsname_bd09': 'BD-09 (Baidu)',
                'no_data': 'Không có dữ liệu để xuất',
                'data_cleared': 'Đã xóa dữ liệu',
                'geo_done_geojson': 'Đã xuất GeoJSON, mở được trong QGIS / ArcGIS (WGS-84)',
                'geo_done_kml': 'Đã xuất KML, mở được trong Google Earth / QGIS (WGS-84)',
                'geo_done_shp': 'Đã xuất Shapefile (.zip gồm .shp/.dbf/.shx/.prj, WGS-84)',
                'gen_shp': 'Đang tạo Shapefile...',
                'shp_fail': 'Lỗi tạo Shapefile: ',
                'loaded_n': 'Đã tải thành công {n} tọa độ',
                'preview_more': 'Còn {n} dòng chưa hiển thị',
                'crs_mismatch': 'Dữ liệu là {src}, bản đồ dùng {map}. Nếu không chuyển đổi, điểm lệch khoảng trăm mét.',
                'crs_converted': 'Đã bật chuyển đổi, dữ liệu hiển thị theo {map}.',
                'btn_convert_action': 'Chuyển đổi tọa độ theo bản đồ',
                'btn_cancel_action': 'Hủy chuyển đổi',
                'offline_done': 'Đã tạo bản đồ HTML ngoại tuyến',
                'offline_fail': 'Lỗi tạo bản đồ ngoại tuyến: ',
                'csv_done': 'Đã xuất CSV',
                'parse_fail_msg': 'Lỗi phân tích: '
            },
            'ja': {
                'app_title': '座標データ可視化マップ',
                'app_subtitle': 'Excel / CSV / TXT および手動入力に対応',
                'lang_label': 'インターフェースの言語',
                'panel1_title': '1. データのインポート',
                'panel2_title': '2. 地図ソース',
                'panel3_title': '3. スタイル設定',
                'panel4_title': '4. エクスポートとダウンロード',
                'drop_main': 'ここにファイルをクリックまたはドラッグ',
                'crs_label': 'データの座標系',
                'crs_auto': '自動検出 / デフォルト WGS-84',
                'crs_gcj02': 'GCJ-02（火星 / 高徳）',
                'crs_bd09': 'BD-09（百度）',
                'btn_load_sample': 'サンプルを読み込む',
                'manual_label': '座標を手動入力',
                'manual_ph': '1行に1点、例：\n北京 116.4074 39.9042\n116.4074,39.9042 上海\n度分秒にも対応： 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': '手動入力を解析',
                'custom_url_label': 'カスタムタイル URL',
                'btn_add_custom': '追加',
                'custom_hint': '{x} {y} {z} を使用、サブドメンは {s}',
                'style_shape_label': '形状',
                'shape_circle': '円',
                'shape_square': '四角',
                'shape_diamond': '菱形',
                'shape_triangle': '三角形',
                'shape_pin': 'ピン',
                'style_size_label': 'サイズ',
                'style_fill_label': '塗りつぶし色',
                'style_opacity_label': '不透明度',
                'style_border_color_label': '枠線色',
                'style_border_width_label': '枠線幅',
                'style_label_label': '名前ラベルを表示',
                'style_connect_label': '点を接続',
                'style_line_color_label': '線の色',
                'style_line_width_label': '線の幅',
                'style_cluster_label': 'クラスタリングを有効',
                'btn_apply_style': 'スタイルを適用',
                'geo_format_label': 'ベクトル書き出し形式',
                'geo_export_btn': 'ベクトルデータを書き出し',
                'btn_export_csv': 'CSVを書き出し',
                'btn_export_offline': 'オフライン HTML 地図を書き出し',
                'btn_download_sample': 'サンプルファイルをダウンロード',
                'btn_clear': 'データをクリア',
                'btn_fit': 'フィット',
                'toggle_title': 'サイドバーを折りたたむ / 展開',
                'fullscreen_title': '地図を全画面プレビュー',
                'doc_title': '座標データ可視化マップスタジオ',
                'crsname_gcj02': 'GCJ-02（火星 / 高徳）',
                'crsname_bd09': 'BD-09（百度）',
                'no_data': '書き出すデータがありません',
                'data_cleared': 'データをクリアしました',
                'geo_done_geojson': 'GeoJSON を書き出しました（QGIS / ArcGIS で読み込み可、WGS-84）',
                'geo_done_kml': 'KML を書き出しました（Google Earth / QGIS で開可、WGS-84）',
                'geo_done_shp': 'Shapefile を書き出しました（.zip に .shp/.dbf/.shx/.prj を含む、WGS-84）',
                'gen_shp': 'Shapefile を生成中...',
                'shp_fail': 'Shapefile の生成に失敗：',
                'loaded_n': '{n} 件の座標データを読み込みました',
                'preview_more': 'あと {n} 行は表示されていません',
                'crs_mismatch': 'データは {src}、現在の地図は {map} を使用。変換しないと数100mずれます。',
                'crs_converted': '座標変換を有効にし、{map} で表示しています。',
                'btn_convert_action': '地図に合わせて座標を変換',
                'btn_cancel_action': '変換をキャンセル',
                'offline_done': 'オフライン HTML 地図を生成しました',
                'offline_fail': 'オフライン地図の生成に失敗：',
                'csv_done': 'CSV を書き出しました',
                'parse_fail_msg': '解析に失敗：'
            },
            'ko': {
                'app_title': '좌표 데이터 시각화 지도',
                'app_subtitle': 'Excel / CSV / TXT 및 수동 입력 지원',
                'lang_label': '인터페이스 언어',
                'panel1_title': '1. 데이터 가져오기',
                'panel2_title': '2. 지도 소스',
                'panel3_title': '3. 스타일 설정',
                'panel4_title': '4. 내보내기 및 다운로드',
                'drop_main': '여기를 클릭하거나 파일을 drag하세요',
                'crs_label': '데이터 좌표계',
                'crs_auto': '자동 감지 / 기본 WGS-84',
                'crs_gcj02': 'GCJ-02 (화성 / 가오드)',
                'crs_bd09': 'BD-09 (바이두)',
                'btn_load_sample': '샘플 데이터 불러오기',
                'manual_label': '좌표 수동 입력',
                'manual_ph': '한 줄에 한 점, 예:\nBeijing 116.4074 39.9042\n116.4074,39.9042 Shanghai\nDMS도 지원: 116°24\'26.6"E 39°54\'15.1"N',
                'btn_parse_manual': '수동 입력 파싱',
                'custom_url_label': '사용자 정의 타일 URL',
                'btn_add_custom': '추가',
                'custom_hint': '{x} {y} {z} 사용, 하위 도메인은 {s}',
                'style_shape_label': '모양',
                'shape_circle': '원',
                'shape_square': '사각형',
                'shape_diamond': '마름모',
                'shape_triangle': '삼각형',
                'shape_pin': '핀',
                'style_size_label': '크기',
                'style_fill_label': '채우기 색',
                'style_opacity_label': '불투명도',
                'style_border_color_label': '테두리 색',
                'style_border_width_label': '테두리 두께',
                'style_label_label': '이름 라벨 표시',
                'style_connect_label': '점 연결',
                'style_line_color_label': '선 색',
                'style_line_width_label': '선 두께',
                'style_cluster_label': '클러스터링 사용',
                'btn_apply_style': '스타일 적용',
                'geo_format_label': '벡터 내보내기 형식',
                'geo_export_btn': '벡터 데이터 내보내기',
                'btn_export_csv': 'CSV 내보내기',
                'btn_export_offline': '오프라인 HTML 지도 내보내기',
                'btn_download_sample': '샘플 파일 다운로드',
                'btn_clear': '데이터 지우기',
                'btn_fit': '맞춤',
                'toggle_title': '사이드바 접기 / 펼치기',
                'fullscreen_title': '지도 전체화면 미리보기',
                'doc_title': '좌표 데이터 시각화 지도 스튜디오',
                'crsname_gcj02': 'GCJ-02 (화성 / 가오드)',
                'crsname_bd09': 'BD-09 (바이두)',
                'no_data': '내보낼 데이터가 없습니다',
                'data_cleared': '데이터를 지웠습니다',
                'geo_done_geojson': 'GeoJSON 내보내기 완료 (QGIS / ArcGIS에서 로드 가능, WGS-84)',
                'geo_done_kml': 'KML 내보내기 완료 (Google Earth / QGIS에서 열기 가능, WGS-84)',
                'geo_done_shp': 'Shapefile 내보내기 완료 (.zip에 .shp/.dbf/.shx/.prj 포함, WGS-84)',
                'gen_shp': 'Shapefile 생성 중...',
                'shp_fail': 'Shapefile 생성 실패: ',
                'loaded_n': '좌표 {n}건을 불러왔습니다',
                'preview_more': '{n}행 더 표시되지 않음',
                'crs_mismatch': '데이터는 {src}, 현재 지도는 {map} 사용. 변환하지 않으면 수백 미터 오차 발생.',
                'crs_converted': '좌표 변환 사용, {map}으로 표시 중.',
                'btn_convert_action': '지도에 맞게 좌표 변환',
                'btn_cancel_action': '변환 취소',
                'offline_done': '오프라인 HTML 지도를 생성했습니다',
                'offline_fail': '오프라인 지도 생성 실패: ',
                'csv_done': 'CSV 내보내기 완료',
                'parse_fail_msg': '파싱 실패: '
            }
        };

        const SOURCE_NAMES = {
            'gaode-vector': 'Gaode Vector', 'gaode-sat': 'Gaode Satellite',
            'tencent-vector': 'Tencent Vector', 'tencent-sat': 'Tencent Satellite',
            'baidu-vector': 'Baidu Vector', 'baidu-sat': 'Baidu Satellite',
            'osm': 'OpenStreetMap', 'osm-hot': 'OpenStreetMap HOT',
            'carto-light': 'CartoDB Positron', 'carto-dark': 'CartoDB Dark Matter',
            'esri-imagery': 'ESRI Satellite', 'esri-street': 'ESRI Street', 'esri-topo': 'ESRI Topo',
            'opentopomap': 'OpenTopoMap', 'wikimedia': 'Wikimedia', 'usgs': 'USGS Imagery',
            'google-sat': 'Google Satellite', 'google-street': 'Google Street',
            'custom': 'Custom Source'
        };

        function t(key) {
            const d = I18N[currentLang];
            if (d && d[key] != null) return d[key];
            if (I18N['en'] && I18N['en'][key] != null) return I18N['en'][key];
            if (I18N['zh-CN'][key] != null) return I18N['zh-CN'][key];
            return key;
        }
        function crsName(code) {
            const k = 'crsname_' + code;
            const d = I18N[currentLang];
            if (d && d[k] != null) return d[k];
            return CRS_NAMES[code] || code;
        }
        function sourceDisplayName(s) {
            if (currentLang === 'zh-CN' || currentLang === 'zh-TW') return s.name;
            return SOURCE_NAMES[s.id] || s.name;
        }
        function applyI18n() {
            const dict = I18N[currentLang];
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                let txt = (dict && dict[key] != null) ? dict[key] : (I18N['zh-CN'][key] != null ? I18N['zh-CN'][key] : null);
                if (txt == null) return;
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.hasAttribute('placeholder')) el.placeholder = txt;
                    return;
                }
                el.textContent = txt;
            });
            document.querySelectorAll('[data-i18n-title]').forEach(el => {
                const key = el.getAttribute('data-i18n-title');
                let txt = (dict && dict[key] != null) ? dict[key] : (I18N['zh-CN'][key] != null ? I18N['zh-CN'][key] : null);
                if (txt != null) el.title = txt;
            });
            populateMapSourceSelect();
            updateDataPreview();
            refreshCRSWarning();
            const dt = (dict && dict['doc_title'] != null) ? dict['doc_title'] : I18N['zh-CN']['doc_title'];
            if (dt) document.title = dt;
        }

        // ========================== 地理矢量导出 ==========================
        function getWGS84Point(p) {
            const src = getPointSourceCRS(p);
            const c = convertCoord(p, src, 'wgs84');
            return { lng: c.lng, lat: c.lat };
        }
        function escXML(s) {
            return String(s == null ? '' : s)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        }
        function exportFileName() {
            return 'Coordinate_Export_' + new Date().toISOString().slice(0, 10);
        }
        function buildGeoJSON() {
            const features = appState.points.map(p => {
                const w = getWGS84Point(p);
                const props = Object.assign({}, p.properties || {});
                props.name = p.name || '';
                props.source_crs = getPointSourceCRS(p);
                props.source_lng = Number(p.lng.toFixed(6));
                props.source_lat = Number(p.lat.toFixed(6));
                return {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [Number(w.lng.toFixed(6)), Number(w.lat.toFixed(6))] },
                    properties: props
                };
            });
            return {
                type: 'FeatureCollection',
                name: 'Coordinate Export',
                crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
                features: features
            };
        }
        function exportGeoJSON() {
            const gj = buildGeoJSON();
            download(JSON.stringify(gj, null, 2), exportFileName() + '.geojson', 'application/geo+json;charset=utf-8;');
            showStatus(t('geo_done_geojson'), 'success');
        }
        function buildKML() {
            let kml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            kml += '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n';
            kml += '<name>Coordinate Export</name>\n';
            appState.points.forEach(p => {
                const w = getWGS84Point(p);
                const props = Object.assign({}, p.properties || {});
                props.source_crs = getPointSourceCRS(p);
                props.source_lng = p.lng;
                props.source_lat = p.lat;
                kml += '<Placemark>\n<name>' + escXML(p.name || 'Unnamed') + '</name>\n';
                kml += '<Point><coordinates>' + w.lng + ',' + w.lat + ',0</coordinates></Point>\n';
                kml += '<ExtendedData>\n';
                for (const [k, v] of Object.entries(props)) {
                    kml += '<Data name="' + escXML(k) + '"><value>' + escXML(v) + '</value></Data>\n';
                }
                kml += '</ExtendedData>\n</Placemark>\n';
            });
            kml += '</Document>\n</kml>';
            return kml;
        }
        function exportKML() {
            const kml = buildKML();
            download(kml, exportFileName() + '.kml', 'application/vnd.google-earth.kml+xml;charset=utf-8;');
            showStatus(t('geo_done_kml'), 'success');
        }

        const WGS84_PRJ = 'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]';

        function writeSHP(points) {
            const n = points.length;
            const contentWords = 10;
            const fileLenWords = 50 + (4 + contentWords) * n;
            const buf = new ArrayBuffer(fileLenWords * 2);
            const dv = new DataView(buf);
            dv.setInt32(0, 9994, false);
            dv.setInt32(24, fileLenWords, false);
            dv.setInt32(28, 1000, true);
            dv.setInt32(32, 1, true);
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            points.forEach(p => { minX = Math.min(minX, p.lng); minY = Math.min(minY, p.lat); maxX = Math.max(maxX, p.lng); maxY = Math.max(maxY, p.lat); });
            if (!isFinite(minX)) { minX = minY = maxX = maxY = 0; }
            dv.setFloat64(36, minX, true); dv.setFloat64(44, minY, true); dv.setFloat64(52, maxX, true); dv.setFloat64(60, maxY, true);
            dv.setFloat64(68, 0, true); dv.setFloat64(76, 0, true); dv.setFloat64(84, 0, true); dv.setFloat64(92, 0, true);
            let off = 100;
            for (let i = 0; i < n; i++) {
                dv.setInt32(off, i + 1, false);
                dv.setInt32(off + 4, contentWords, false);
                const co = off + 8;
                dv.setInt32(co, 1, true);
                dv.setFloat64(co + 4, points[i].lng, true);
                dv.setFloat64(co + 12, points[i].lat, true);
                off += 8 + 20;
            }
            return buf;
        }
        function writeSHX(points) {
            const n = points.length;
            const fileLenWords = 50 + 4 * n;
            const buf = new ArrayBuffer(fileLenWords * 2);
            const dv = new DataView(buf);
            dv.setInt32(0, 9994, false);
            dv.setInt32(24, fileLenWords, false);
            dv.setInt32(28, 1000, true);
            dv.setInt32(32, 1, true);
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            points.forEach(p => { minX = Math.min(minX, p.lng); minY = Math.min(minY, p.lat); maxX = Math.max(maxX, p.lng); maxY = Math.max(maxY, p.lat); });
            if (!isFinite(minX)) { minX = minY = maxX = maxY = 0; }
            dv.setFloat64(36, minX, true); dv.setFloat64(44, minY, true); dv.setFloat64(52, maxX, true); dv.setFloat64(60, maxY, true);
            dv.setFloat64(68, 0, true); dv.setFloat64(76, 0, true); dv.setFloat64(84, 0, true); dv.setFloat64(92, 0, true);
            let off = 100;
            for (let i = 0; i < n; i++) {
                const recOffWords = 50 + 14 * i;
                dv.setInt32(off, recOffWords, false);
                dv.setInt32(off + 4, 10, false);
                off += 8;
            }
            return buf;
        }
        function strToBytes(s) { return new TextEncoder().encode(s); }
        function padRight(s, len) { s = String(s); if (s.length >= len) return s.slice(0, len); return s + ' '.repeat(len - s.length); }
        function padLeft(s, len) { s = String(s); if (s.length >= len) return s.slice(0, len); return ' '.repeat(len - s.length) + s; }
        function writeDBF(fields, records) {
            const n = records.length;
            const headerLen = 32 + 32 * fields.length + 1;
            const recordLen = 1 + fields.reduce((s, f) => s + f.length, 0);
            const buf = new ArrayBuffer(headerLen + recordLen * n);
            const dv = new DataView(buf);
            dv.setUint8(0, 0x03);
            dv.setUint32(4, n, true);
            dv.setUint16(8, headerLen, true);
            dv.setUint16(10, recordLen, true);
            dv.setUint8(29, 0x57);
            let p = 32;
            fields.forEach(f => {
                const nb = strToBytes(String(f.name).slice(0, 11));
                for (let i = 0; i < 11; i++) dv.setUint8(p + i, i < nb.length ? nb[i] : 0);
                dv.setUint8(p + 11, f.type.charCodeAt(0));
                dv.setUint8(p + 16, f.length);
                dv.setUint8(p + 17, f.dec);
                p += 32;
            });
            dv.setUint8(p, 0x0D);
            let rp = headerLen;
            records.forEach(rec => {
                dv.setUint8(rp, 0x20);
                rp += 1;
                fields.forEach(f => {
                    let val = rec[f.name];
                    let s;
                    if (f.type === 'N') {
                        s = (typeof val === 'number' && isFinite(val)) ? val.toFixed(f.dec) : String(val == null ? '' : val);
                        s = padLeft(s, f.length);
                    } else {
                        s = (val == null ? '' : String(val));
                        s = padRight(s, f.length);
                    }
                    const b = strToBytes(s);
                    for (let i = 0; i < f.length; i++) dv.setUint8(rp + i, i < b.length ? b[i] : 0x20);
                    rp += f.length;
                });
            });
            return buf;
        }
        function buildShapefileFiles() {
            const wpts = appState.points.map(p => getWGS84Point(p));
            const fields = [
                { name: 'Name', type: 'C', length: 254, dec: 0 },
                { name: 'SrcCRS', type: 'C', length: 10, dec: 0 },
                { name: 'SrcLng', type: 'N', length: 19, dec: 6 },
                { name: 'SrcLat', type: 'N', length: 19, dec: 6 },
                { name: 'Attrs', type: 'C', length: 254, dec: 0 }
            ];
            const records = appState.points.map(p => {
                const w = getWGS84Point(p);
                let attrs = '';
                try { attrs = JSON.stringify(p.properties || {}); } catch (e) { attrs = ''; }
                return { Name: p.name || '', SrcCRS: getPointSourceCRS(p), SrcLng: w.lng, SrcLat: w.lat, Attrs: attrs };
            });
            return {
                base: exportFileName(),
                shp: writeSHP(wpts),
                shx: writeSHX(wpts),
                dbf: writeDBF(fields, records),
                prj: WGS84_PRJ
            };
        }
        function loadScript(src) {
            return new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => res();
                s.onerror = () => rej(new Error('script load failed: ' + src));
                document.head.appendChild(s);
            });
        }
        function saveBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
        async function exportShapefile() {
            if (appState.points.length === 0) { showStatus(t('no_data'), 'error'); return; }
            showLoading(t('gen_shp'));
            try {
                if (typeof JSZip === 'undefined') {
                    await loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
                }
                const f = buildShapefileFiles();
                const zip = new JSZip();
                zip.file(f.base + '.shp', f.shp);
                zip.file(f.base + '.shx', f.shx);
                zip.file(f.base + '.dbf', f.dbf);
                zip.file(f.base + '.prj', f.prj);
                const blob = await zip.generateAsync({ type: 'blob' });
                saveBlob(blob, f.base + '.zip');
                showStatus(t('geo_done_shp'), 'success');
            } catch (e) {
                showStatus(t('shp_fail') + e.message, 'error');
            } finally {
                hideLoading();
            }
        }
        function exportVector() {
            const fmt = document.getElementById('geo-format').value;
            if (appState.points.length === 0) { showStatus(t('no_data'), 'error'); return; }
            if (fmt === 'geojson') exportGeoJSON();
            else if (fmt === 'kml') exportKML();
            else if (fmt === 'shp') exportShapefile();
        }

        function downloadSampleFiles() {
            const csv = '\uFEFF名称,经度,纬度,坐标系\n' +
                '北京,116.4074,39.9042,WGS84\n' +
                '上海,121.4737,31.2304,WGS84\n' +
                '广州,113.2644,23.1291,WGS84\n' +
                '成都,104.0665,30.5723,WGS84\n' +
                '西安,108.9398,34.3416,WGS84\n';
            const txt = '北京\t116.4074\t39.9042\n' +
                '上海\t121.4737\t31.2304\n' +
                '广州\t113.2644\t23.1291\n' +
                '成都\t104.0665\t30.5723\n' +
                '西安\t108.9398\t34.3416\n';
            download(csv, '坐标导入示例.csv', 'text/csv;charset=utf-8;');
            download(txt, '坐标导入示例.txt', 'text/plain;charset=utf-8;');
        }
        function csvCell(v) {
            v = String(v);
            if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
            return v;
        }
        const MULTI_FORMAT_SAMPLE_ROWS = [
            ['名称', '十进制经度', '十进制纬度', '度分秒经度', '度分秒纬度', '度分经度', '度分纬度', '冒号经度', '冒号纬度'],
            ['北京', '116.4074', '39.9042', '116°24\'26.6"E', '39°54\'15.1"N', '116°24.4433\'E', '39°54.2517\'N', '116:24:26.6E', '39:54:15.1N'],
            ['上海', '121.4737', '31.2304', '121°28\'25.3"E', '31°13\'49.4"N', '121°28.422\'E', '31°13.823\'N', '121:28:25.3E', '31:13:49.4N'],
            ['广州', '113.2644', '23.1291', '113°15\'51.8"E', '23°07\'44.8"N', '113°15.863\'E', '23°07.747\'N', '113:15:51.8E', '23:07:44.8N'],
            ['成都', '104.0665', '30.5723', '104°03\'59.4"E', '30°34\'20.3"N', '104°03.990\'E', '30°34.338\'N', '104:03:59.4E', '30:34:20.3N'],
            ['西安', '108.9398', '34.3416', '108°56\'23.3"E', '34°20\'29.8"N', '108°56.388\'E', '34°20.497\'N', '108:56:23.3E', '34:20:29.8N'],
            ['杭州', '120.1551', '30.2741', '120°09\'18.4"E', '30°16\'26.8"N', '120°09.306\'E', '30°16.446\'N', '120:09:18.4E', '30:16:26.8N'],
            ['武汉', '114.3054', '30.5928', '114°18\'19.4"E', '30°35\'34.1"N', '114°18.323\'E', '30°35.569\'N', '114:18:19.4E', '30:35:34.1N'],
            ['深圳', '114.0579', '22.5431', '114°03\'28.4"E', '22°32\'35.2"N', '114°03.473\'E', '22°32.587\'N', '114:03:28.4E', '22:32:35.2N']
        ];
        function downloadMultiFormatSample() {
            const lines = MULTI_FORMAT_SAMPLE_ROWS.map(r => r.map(csvCell).join(','));
            const csv = '\uFEFF' + lines.join('\n');
            download(csv, '坐标格式示例.csv', 'text/csv;charset=utf-8;');
            showStatus(t('format_sample_done'), 'success');
        }

        // ========================== 事件绑定 ==========================
        function bindEvents() {
            const dropZone = document.getElementById('drop-zone');
            const fileInput = document.getElementById('file-input');
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            dropZone.addEventListener('drop', e => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', e => { if (e.target.files.length) handleFiles(e.target.files); });

            const btnApplyCols = document.getElementById('btn-apply-cols');
            if (btnApplyCols) btnApplyCols.addEventListener('click', applyColumnSelection);

            document.getElementById('btn-parse-manual').addEventListener('click', handleManualInput);
            document.getElementById('btn-load-sample').addEventListener('click', loadSampleData);
            document.getElementById('btn-apply-style').addEventListener('click', renderMarkers);
            document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
            document.getElementById('btn-export-offline').addEventListener('click', exportOfflineHTML);
            document.getElementById('btn-export-geo').addEventListener('click', exportVector);
            document.getElementById('btn-download-sample').addEventListener('click', downloadSampleFiles);
            const btnDownloadFormat = document.getElementById('btn-download-format-sample');
            if (btnDownloadFormat) btnDownloadFormat.addEventListener('click', downloadMultiFormatSample);
            const uiLang = document.getElementById('ui-lang');
            if (uiLang) uiLang.addEventListener('change', e => { currentLang = e.target.value; applyI18n(); });
            document.getElementById('btn-clear').addEventListener('click', () => {
                appState.points = [];
                appState.columns = [];
                appState.convertOnDisplay = false;
                appState.pendingFiles = null;
                appState.rawHeaders = [];
                appState.rawHasHeader = false;
                document.getElementById('manual-input').value = '';
                document.getElementById('file-input').value = '';
                hideColumnSelector();
                updateDataPreview();
                renderMarkers();
                refreshCRSWarning();
                showStatus(t('data_cleared'), 'info');
            });
            document.getElementById('map-source').addEventListener('change', e => {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-source').classList.remove('hidden');
                } else {
                    document.getElementById('custom-source').classList.add('hidden');
                    setMapSource(e.target.value);
                }
            });
            document.getElementById('btn-add-custom').addEventListener('click', addCustomSource);
            document.getElementById('input-crs').addEventListener('change', e => {
                appState.inputCRS = e.target.value;
                if (appState.points.length > 0) {
                    appState.points.forEach(p => {
                        if (appState.inputCRS !== 'auto') p.crs = appState.inputCRS;
                    });
                    appState.convertOnDisplay = false;
                    refreshCRSWarning();
                    renderMarkers();
                }
            });
            document.getElementById('btn-convert').addEventListener('click', () => {
                appState.convertOnDisplay = !appState.convertOnDisplay;
                refreshCRSWarning();
                renderMarkers();
            });
            document.getElementById('btn-zoom-in').addEventListener('click', () => map && map.zoomIn());
            document.getElementById('btn-zoom-out').addEventListener('click', () => map && map.zoomOut());
            document.getElementById('btn-fit').addEventListener('click', () => {
                if (!map || appState.points.length === 0) return;
                const bounds = L.latLngBounds();
                appState.points.forEach(p => bounds.extend(getDisplayPoint(p)));
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
            });
            document.getElementById('style-label').addEventListener('change', e => {
                const col = document.getElementById('style-label-column');
                col.classList.toggle('hidden', !e.target.checked);
            });
            document.getElementById('style-connect').addEventListener('change', e => {
                document.getElementById('line-controls').classList.toggle('hidden', !e.target.checked);
            });
            document.getElementById('modal-close').addEventListener('click', closeModal);
            document.getElementById('modal').addEventListener('click', e => {
                if (e.target.id === 'modal') closeModal();
            });

            // 侧边栏折叠 / 展开
            const appEl = document.querySelector('.app');
            const btnToggle = document.getElementById('btn-toggle-sidebar');
            const backdrop = document.getElementById('sidebar-backdrop');
            function updateToggleIcon() {
                btnToggle.textContent = appEl.classList.contains('sidebar-collapsed') ? '›' : '‹';
            }
            function setSidebar(collapsed) {
                appEl.classList.toggle('sidebar-collapsed', collapsed);
                updateToggleIcon();
                setTimeout(() => { if (map) map.invalidateSize(); }, 300);
            }
            btnToggle.addEventListener('click', () => setSidebar(!appEl.classList.contains('sidebar-collapsed')));
            const btnCloseSidebar = document.getElementById('btn-close-sidebar');
            if (btnCloseSidebar) btnCloseSidebar.addEventListener('click', () => setSidebar(true));
            if (backdrop) backdrop.addEventListener('click', () => setSidebar(true));
            updateToggleIcon();
            // 手机端默认收起侧边栏，让地图先可见
            if (window.matchMedia('(max-width: 768px)').matches) {
                setSidebar(true);
            }

            // 地图全屏预览
            const mapContainer = document.querySelector('.map-container');
            const btnFs = document.getElementById('btn-fullscreen');
            function toggleFullscreen() {
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
                if (!fsEl) {
                    if (mapContainer.requestFullscreen) mapContainer.requestFullscreen();
                    else if (mapContainer.webkitRequestFullscreen) mapContainer.webkitRequestFullscreen();
                } else {
                    if (document.exitFullscreen) document.exitFullscreen();
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                }
            }
            btnFs.addEventListener('click', toggleFullscreen);
            function onFsChange() {
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
                btnFs.textContent = fsEl ? '⤡' : '⛶';
                setTimeout(() => { if (map) map.invalidateSize(); }, 200);
            }
            document.addEventListener('fullscreenchange', onFsChange);
            document.addEventListener('webkitfullscreenchange', onFsChange);
        }

        document.addEventListener('DOMContentLoaded', () => {
            initMap();
            populateMapSourceSelect();
            bindEvents();
            applyI18n();
        });
    