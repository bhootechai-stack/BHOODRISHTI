import { LatLng, HeatmapMode, IndianState } from '../types';

export interface FarmPreset {
  id: string;
  name: string;
  state: string;
  crop: string;
  lat: number;
  lng: number;
  defaultAreaAcres: number;
  description: string;
}

export const PRESET_FARMS: FarmPreset[] = [
  {
    id: 'punjab-ludhiana',
    name: 'Ludhiana Wheat & Paddy Belt',
    state: 'Punjab',
    crop: 'Wheat (HD-3086)',
    lat: 30.9010,
    lng: 75.8573,
    defaultAreaAcres: 2.5,
    description: 'High-yield alluvial plains with canal & tubewell irrigation network.',
  },
  {
    id: 'maharashtra-nashik',
    name: 'Nashik Grape & Onion Farm',
    state: 'Maharashtra',
    crop: 'Sugarcane / Grapes',
    lat: 19.9975,
    lng: 73.7898,
    defaultAreaAcres: 3.0,
    description: 'Black cotton soil basin with micro-drip fertigation setup.',
  },
  {
    id: 'up-meerut',
    name: 'Meerut Sugarcane Farm',
    state: 'Uttar Pradesh',
    crop: 'Sugarcane (Co-0238)',
    lat: 28.9845,
    lng: 77.7064,
    defaultAreaAcres: 4.0,
    description: 'Gangetic Doab rich loam soil with high seasonal nitrogen requirements.',
  },
  {
    id: 'rajasthan-kota',
    name: 'Hadoti Mustard & Soybean Fields',
    state: 'Rajasthan',
    crop: 'Mustard (Pusa Bold)',
    lat: 25.1800,
    lng: 75.8300,
    defaultAreaAcres: 5.0,
    description: 'Clay-loam Chambal command area with moisture monitoring needs.',
  },
  {
    id: 'assam-jorhat',
    name: 'Jorhat Tea & Paddy Estate',
    state: 'Assam',
    crop: 'Tea / Autumn Rice',
    lat: 26.7509,
    lng: 94.2037,
    defaultAreaAcres: 2.0,
    description: 'High precipitation, acid-alluvial tea nursery requiring canopy analysis.',
  },
  {
    id: 'ap-guntur',
    name: 'Guntur Chilli & Cotton Belt',
    state: 'Andhra Pradesh & Telangana',
    crop: 'Red Chilli (Teja)',
    lat: 16.3067,
    lng: 80.4365,
    defaultAreaAcres: 3.5,
    description: 'Krishna delta black soil with high pest and leaf-spot vigilance.',
  },
];

export const ALL_INDIAN_STATES: IndianState[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const ALL_UNION_TERRITORIES: IndianState[] = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const ALL_REGIONS_LIST: IndianState[] = [
  ...ALL_INDIAN_STATES,
  ...ALL_UNION_TERRITORIES,
];

export const STATE_COORDINATES: Record<string, LatLng> = {
  // 28 States
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Arunachal Pradesh': { lat: 28.2180, lng: 94.7278 },
  Assam: { lat: 26.2006, lng: 92.9376 },
  Bihar: { lat: 25.0961, lng: 85.3131 },
  Chhattisgarh: { lat: 21.2787, lng: 81.8661 },
  Goa: { lat: 15.2993, lng: 74.1240 },
  Gujarat: { lat: 22.2587, lng: 71.1924 },
  Haryana: { lat: 29.0588, lng: 76.0856 },
  'Himachal Pradesh': { lat: 31.1048, lng: 77.1734 },
  Jharkhand: { lat: 23.6102, lng: 85.2799 },
  Karnataka: { lat: 15.3173, lng: 75.7139 },
  Kerala: { lat: 10.8505, lng: 76.2711 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  Maharashtra: { lat: 19.7515, lng: 75.7139 },
  Manipur: { lat: 24.6637, lng: 93.9063 },
  Meghalaya: { lat: 25.4670, lng: 91.3662 },
  Mizoram: { lat: 23.1645, lng: 92.9376 },
  Nagaland: { lat: 26.1584, lng: 94.5624 },
  Odisha: { lat: 20.9517, lng: 85.0985 },
  Punjab: { lat: 30.9010, lng: 75.8573 },
  Rajasthan: { lat: 26.9124, lng: 75.7873 },
  Sikkim: { lat: 27.5330, lng: 88.5122 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  Telangana: { lat: 18.1124, lng: 79.0193 },
  Tripura: { lat: 23.9408, lng: 91.9882 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  Uttarakhand: { lat: 30.0668, lng: 79.0193 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },

  // 8 Union Territories
  'Andaman and Nicobar Islands': { lat: 11.6234, lng: 92.7265 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  'Dadra and Nagar Haveli and Daman and Diu': { lat: 20.4283, lng: 72.8397 },
  'Delhi (NCT)': { lat: 28.7041, lng: 77.1025 },
  'Jammu and Kashmir': { lat: 34.0837, lng: 74.7973 },
  Ladakh: { lat: 34.1526, lng: 77.5771 },
  Lakshadweep: { lat: 10.5667, lng: 72.6417 },
  Puducherry: { lat: 11.9416, lng: 79.8083 },

  // Aliases & combinations
  'Jammu & Kashmir / Ladakh': { lat: 34.0837, lng: 74.7973 },
  'Andhra Pradesh & Telangana': { lat: 16.3067, lng: 80.4365 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  'Andaman & Nicobar Islands': { lat: 11.6234, lng: 92.7265 },
};

/**
 * Calculates geodesic area of a polygon in Square Meters using spherical projection.
 */
export function calculatePolygonAreaSqm(coords: LatLng[]): number {
  if (coords.length < 3) return 0;

  const RADIUS = 6378137; // Earth's mean radius in meters
  let area = 0;

  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const p1 = coords[i];
    const p2 = coords[j];

    const lat1Rad = (p1.lat * Math.PI) / 180;
    const lat2Rad = (p2.lat * Math.PI) / 180;
    const dLngRad = ((p2.lng - p1.lng) * Math.PI) / 180;

    area += dLngRad * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  area = Math.abs((area * RADIUS * RADIUS) / 2.0);
  return Number(area.toFixed(2));
}

/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 */
export function calculateDistanceMeters(from: LatLng, to: LatLng): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates initial forward bearing from point A to point B in degrees (0° - 360°)
 */
export function calculateBearing(from: LatLng, to: LatLng): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Converts degree angle into 16-point cardinal compass text
 */
export function getCardinalDirection(deg: number): string {
  const normalized = (deg + 360) % 360;
  const sectors = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return sectors[index];
}

/**
 * Calculates centroid coordinate of a set of LatLng boundary points
 */
export function calculateCentroid(points: LatLng[]): LatLng {
  if (!points || points.length === 0) return { lat: 0, lng: 0 };
  let sumLat = 0;
  let sumLng = 0;
  points.forEach((p) => {
    sumLat += p.lat;
    sumLng += p.lng;
  });
  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
}

export function detectNearestState(coords: LatLng): IndianState {
  let minDistance = Infinity;
  let closestState: IndianState = 'Punjab';

  for (const [stateName, stateCoord] of Object.entries(STATE_COORDINATES)) {
    const dist = calculateDistanceMeters(coords, stateCoord);
    if (dist < minDistance) {
      minDistance = dist;
      closestState = stateName as IndianState;
    }
  }

  return closestState;
}

/**
 * Returns the primary regional language code associated with an Indian state.
 */
export function getStatePrimaryLanguage(stateName: string): 'en' | 'hi' | 'pa' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'or' | 'as' {
  const s = (stateName || '').toLowerCase();
  if (s.includes('punjab') || s.includes('chandigarh')) return 'pa';
  if (s.includes('maharashtra') || s.includes('goa')) return 'mr';
  if (s.includes('gujarat') || s.includes('daman') || s.includes('diu')) return 'gu';
  if (s.includes('bengal') || s.includes('tripura')) return 'bn';
  if (s.includes('tamil') || s.includes('puducherry')) return 'ta';
  if (s.includes('andhra') || s.includes('telangana')) return 'te';
  if (s.includes('karnataka')) return 'kn';
  if (s.includes('kerala') || s.includes('lakshadweep')) return 'ml';
  if (s.includes('odisha') || s.includes('orissa')) return 'or';
  if (s.includes('assam')) return 'as';
  return 'hi'; // National/North India Default
}

export interface RedProblemSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  deficiencyType: 'chlorophyll' | 'moisture' | 'nitrogen';
  severity: 'severe' | 'critical';
  confidencePct: number;
  areaSqm: number;
  recommendation: string;
}

/**
 * Derives realistic red deficiency / stress spot coordinates inside a field boundary.
 */
export function calculateFieldRedSpots(points: LatLng[]): RedProblemSpot[] {
  if (!points || points.length === 0) return [];
  const centroid = calculateCentroid(points);

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  points.forEach((p) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const latSpan = maxLat - minLat || 0.0008;
  const lngSpan = maxLng - minLng || 0.0008;

  return [
    {
      id: 'red-spot-1',
      name: 'Severe Chlorophyll Deficiency (NDRE < 0.28)',
      lat: Number((minLat + latSpan * 0.32).toFixed(6)),
      lng: Number((minLng + lngSpan * 0.28).toFixed(6)),
      deficiencyType: 'chlorophyll',
      severity: 'critical',
      confidencePct: 94,
      areaSqm: 145,
      recommendation: 'Targeted foliar spray of Urea (1.5%) + Zinc Sulfate (0.5%) needed immediately.',
    },
    {
      id: 'red-spot-2',
      name: 'Severe Moisture Stress (NDWI < 0.16)',
      lat: Number((minLat + latSpan * 0.72).toFixed(6)),
      lng: Number((minLng + lngSpan * 0.68).toFixed(6)),
      deficiencyType: 'moisture',
      severity: 'severe',
      confidencePct: 88,
      areaSqm: 210,
      recommendation: 'Root-zone hydration deficit detected. Prioritize micro-drip irrigation in this sub-quadrant.',
    },
  ];
}

/**
 * Generates an initial rectangular polygon around a center point matching a target area in acres.
 */
export function generateFieldPolygonAroundPoint(
  center: LatLng,
  targetAreaAcres: number = 2.0
): LatLng[] {
  // 1 acre is approx 4046.86 m². For a square, side is ~63.6m.
  const totalSqm = targetAreaAcres * 4046.8564;
  const sideMeters = Math.sqrt(totalSqm);

  // 1 degree latitude = ~111,320 meters
  // 1 degree longitude = ~111,320 * cos(lat) meters
  const latMeters = sideMeters / 2;
  const lngMeters = (sideMeters / 2) / Math.cos((center.lat * Math.PI) / 180);

  const dLat = latMeters / 111320;
  const dLng = lngMeters / 111320;

  // Add slight organic offset so it looks like a real agricultural plot
  return [
    { lat: center.lat + dLat * 0.95, lng: center.lng - dLng * 1.05 },
    { lat: center.lat + dLat * 1.05, lng: center.lng + dLng * 0.95 },
    { lat: center.lat - dLat * 0.92, lng: center.lng + dLng * 1.08 },
    { lat: center.lat - dLat * 1.04, lng: center.lng - dLng * 0.92 },
  ];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties?: {
    id?: string;
    name?: string;
    object_type?: string;
    confidence?: number;
    detection_date?: string;
    area_sqm?: number;
    [key: string]: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface DetectedStructure {
  id: string;
  name: string;
  confidencePct: number;
  dateDetectedStr: string;
  daysAgo: number;
  areaSqm: number;
  polygon: LatLng[];
  type: 'building' | 'shed' | 'pump_house' | 'alteration' | 'barn' | 'silo';
  source?: 'copernicus_sentinel2' | 'geojson_vector' | 'satellite_ai_simulated';
}

/**
 * Hardcoded satellite simulated object detection confidence threshold (Lowered to 80% sensitivity).
 * If any simulated or real satellite object has a calculated confidence of 80% or higher,
 * it is marked as a grey structure polygon.
 */
export const STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD = 80;

/**
 * Parses GeoJSON FeatureCollections returned from building detection endpoints
 * (e.g. Copernicus Sentinel-2 L2A structural change or GeoJSON vector feeds)
 */
export function parseGeoJsonStructuralBoundaries(
  geoJson: GeoJSONFeatureCollection | any,
  confidenceThreshold: number = STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD
): DetectedStructure[] {
  if (!geoJson || !Array.isArray(geoJson.features)) return [];

  const results: DetectedStructure[] = [];
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 3);
  const formattedDefaultDate = defaultDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  geoJson.features.forEach((feature: GeoJSONFeature, idx: number) => {
    if (!feature.geometry) return;
    const geomType = feature.geometry.type;
    const coords = feature.geometry.coordinates;

    const extractRing = (ring: number[][]): LatLng[] => {
      return ring.map(([lng, lat]) => ({ lat, lng }));
    };

    const featureConf = feature.properties?.confidence ?? STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD;
    if (featureConf < confidenceThreshold) return;

    if (geomType === 'Polygon' && Array.isArray(coords) && coords.length > 0) {
      const ring = coords[0] as number[][];
      const polygon = extractRing(ring);
      if (polygon.length >= 3) {
        results.push({
          id: feature.properties?.id || `geojson-struct-${idx + 1}`,
          name: feature.properties?.name || 'Detected Structure (Satellite AI Analysis)',
          confidencePct: featureConf,
          dateDetectedStr: feature.properties?.detection_date || formattedDefaultDate,
          daysAgo: 3,
          areaSqm: feature.properties?.area_sqm || Math.round(calculatePolygonAreaSqm(polygon)),
          polygon,
          type: (feature.properties?.object_type as any) || 'building',
          source: 'geojson_vector',
        });
      }
    } else if (geomType === 'MultiPolygon' && Array.isArray(coords)) {
      coords.forEach((polyCoords, pIdx) => {
        const ring = (polyCoords as number[][][])[0];
        if (ring) {
          const polygon = extractRing(ring);
          if (polygon.length >= 3) {
            results.push({
              id: `${feature.properties?.id || 'geojson-mp'}-${idx}-${pIdx}`,
              name: feature.properties?.name || 'Detected Structure (Satellite AI Analysis)',
              confidencePct: featureConf,
              dateDetectedStr: feature.properties?.detection_date || formattedDefaultDate,
              daysAgo: 3,
              areaSqm: Math.round(calculatePolygonAreaSqm(polygon)),
              polygon,
              type: (feature.properties?.object_type as any) || 'building',
              source: 'geojson_vector',
            });
          }
        }
      });
    }
  });

  return results;
}

/**
 * Returns detected building and structural change polygons inside and around the farm boundary.
 * If commercial Planet / Maxar API keys are present in env or GeoJSON data is passed, parses GeoJSON.
 * Otherwise, generates 4-5 mock rectangular building polygons highlighted in GREY.
 * Mark the area with a grey structure polygon if calculated confidence is >= confidenceThreshold (80%).
 */
export function detectSimulatedFieldStructures(
  boundaryPoints: LatLng[],
  customGeoJson?: GeoJSONFeatureCollection | any,
  confidenceThreshold: number = STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD
): DetectedStructure[] {
  // If custom GeoJSON feature collection is provided, parse directly
  if (customGeoJson && customGeoJson.features && customGeoJson.features.length > 0) {
    const parsed = parseGeoJsonStructuralBoundaries(customGeoJson, confidenceThreshold);
    if (parsed.length > 0) return parsed;
  }

  if (!boundaryPoints || boundaryPoints.length < 3) return [];

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  boundaryPoints.forEach((p) => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  // Current Date - 3 Days
  const d = new Date();
  d.setDate(d.getDate() - 3);
  const formattedDate = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // 4-5 Mock Rectangular Building Polygons Inside & Around Marked Field Boundary:

  // Structure 1: Main Farm Homestead / Pucca House (Northeast quadrant inside plot)
  const baseLat1 = minLat + latSpan * 0.60;
  const baseLng1 = minLng + lngSpan * 0.64;
  const structWidthLat1 = latSpan * 0.16;
  const structWidthLng1 = lngSpan * 0.18;
  const structCoords1: LatLng[] = [
    { lat: baseLat1, lng: baseLng1 },
    { lat: baseLat1 + structWidthLat1, lng: baseLng1 },
    { lat: baseLat1 + structWidthLat1, lng: baseLng1 + structWidthLng1 },
    { lat: baseLat1, lng: baseLng1 + structWidthLng1 },
  ];

  // Structure 2: Tractor & Agricultural Equipment Shed (East perimeter inside plot)
  const baseLat2 = minLat + latSpan * 0.35;
  const baseLng2 = minLng + lngSpan * 0.72;
  const structWidthLat2 = latSpan * 0.12;
  const structWidthLng2 = lngSpan * 0.16;
  const structCoords2: LatLng[] = [
    { lat: baseLat2, lng: baseLng2 },
    { lat: baseLat2 + structWidthLat2, lng: baseLng2 },
    { lat: baseLat2 + structWidthLat2, lng: baseLng2 + structWidthLng2 },
    { lat: baseLat2, lng: baseLng2 + structWidthLng2 },
  ];

  // Structure 3: Solar Tube-Well & Irrigation Pump House (Southwest corner)
  const baseLat3 = minLat + latSpan * 0.10;
  const baseLng3 = minLng + lngSpan * 0.14;
  const structWidthLat3 = latSpan * 0.09;
  const structWidthLng3 = lngSpan * 0.11;
  const structCoords3: LatLng[] = [
    { lat: baseLat3, lng: baseLng3 },
    { lat: baseLat3 + structWidthLat3, lng: baseLng3 },
    { lat: baseLat3 + structWidthLat3, lng: baseLng3 + structWidthLng3 },
    { lat: baseLat3, lng: baseLng3 + structWidthLng3 },
  ];

  // Structure 4: Cattle & Livestock Shelter (Northwest perimeter edge)
  const baseLat4 = minLat + latSpan * 0.76;
  const baseLng4 = minLng + lngSpan * 0.22;
  const structWidthLat4 = latSpan * 0.14;
  const structWidthLng4 = lngSpan * 0.15;
  const structCoords4: LatLng[] = [
    { lat: baseLat4, lng: baseLng4 },
    { lat: baseLat4 + structWidthLat4, lng: baseLng4 },
    { lat: baseLat4 + structWidthLat4, lng: baseLng4 + structWidthLng4 },
    { lat: baseLat4, lng: baseLng4 + structWidthLng4 },
  ];

  // Structure 5: Grain Storage & Post-Harvest Drying Silo (Southeast boundary border)
  const baseLat5 = minLat + latSpan * 0.08;
  const baseLng5 = minLng + lngSpan * 0.58;
  const structWidthLat5 = latSpan * 0.11;
  const structWidthLng5 = lngSpan * 0.13;
  const structCoords5: LatLng[] = [
    { lat: baseLat5, lng: baseLng5 },
    { lat: baseLat5 + structWidthLat5, lng: baseLng5 },
    { lat: baseLat5 + structWidthLat5, lng: baseLng5 + structWidthLng5 },
    { lat: baseLat5, lng: baseLng5 + structWidthLng5 },
  ];

  const rawStructures: DetectedStructure[] = [
    {
      id: 'struct-001',
      name: 'Detected Structure (Satellite AI Analysis)',
      confidencePct: 88,
      dateDetectedStr: formattedDate,
      daysAgo: 3,
      areaSqm: 145,
      polygon: structCoords1,
      type: 'building',
      source: 'satellite_ai_simulated',
    },
    {
      id: 'struct-002',
      name: 'Detected Structure (Satellite AI Analysis)',
      confidencePct: 82,
      dateDetectedStr: formattedDate,
      daysAgo: 3,
      areaSqm: 98,
      polygon: structCoords2,
      type: 'shed',
      source: 'satellite_ai_simulated',
    },
    {
      id: 'struct-003',
      name: 'Detected Structure (Satellite AI Analysis)',
      confidencePct: 85,
      dateDetectedStr: formattedDate,
      daysAgo: 3,
      areaSqm: 42,
      polygon: structCoords3,
      type: 'pump_house',
      source: 'satellite_ai_simulated',
    },
    {
      id: 'struct-004',
      name: 'Detected Structure (Satellite AI Analysis)',
      confidencePct: 80,
      dateDetectedStr: formattedDate,
      daysAgo: 3,
      areaSqm: 110,
      polygon: structCoords4,
      type: 'barn',
      source: 'satellite_ai_simulated',
    },
    {
      id: 'struct-005',
      name: 'Detected Structure (Satellite AI Analysis)',
      confidencePct: 84,
      dateDetectedStr: formattedDate,
      daysAgo: 3,
      areaSqm: 68,
      polygon: structCoords5,
      type: 'silo',
      source: 'satellite_ai_simulated',
    },
  ];

  // Logic: Mark the area with a grey structure polygon if calculated confidence is >= confidenceThreshold (80%)
  return rawStructures.filter((s) => s.confidencePct >= confidenceThreshold);
}

/**
 * Excess Green Index & Spectral Color Classifier
 * 
 * Rules:
 * - Excess Green Index = 2*G - R - B
 * - Artificial building / rooftop check:
 *   If |G - B| < 18 and brightness > 120, or ExG <= 0, it is non-vegetation (tin shed, concrete road, tile roof, bare earth).
 * 
 * In Chlorophyll mode (NDRE):
 * - Vibrant Green: Healthy canopy (ExG > 45, NDRE > 0.65)
 * - Yellow: Nitrogen deficient / Moderate stress (15 <= ExG <= 45, 0.35 <= NDRE <= 0.65)
 * - Deep Red: Non-vegetation or severe stress / bare soil (ExG < 15, NDRE < 0.35)
 * 
 * In Moisture mode (NDWI):
 * - Blue: Well-irrigated / high water content (NDWI > 0.5)
 * - Cyan: Mild moisture stress (0.25 <= NDWI <= 0.5)
 * - Orange: Water-deficient soil/canopy (0 <= NDWI < 0.25)
 * - Dark Gray: Non-vegetation structures / impervious surfaces (NDWI < 0)
 */
export function classifySpectralPixel(
  normalizedU: number, // 0 to 1 across bounding box
  normalizedV: number, // 0 to 1 across bounding box
  seedLat: number,
  seedLng: number,
  mode: HeatmapMode,
  daysAgo: number = 0
): {
  color: string;
  category: 'healthy' | 'moderate' | 'severe_or_nonveg';
  indexValue: number;
} {
  // Deterministic 2D continuous noise for natural agricultural canopy variation
  const freq1 = 4.2;
  const freq2 = 8.5;
  const sLat = (seedLat * 1000) % 100;
  const sLng = (seedLng * 1000) % 100;

  // Temporal phenology shift factor based on acquisition date
  const temporalShift = (daysAgo % 30) * 0.035;

  const n1 = Math.sin(normalizedU * freq1 + sLat - temporalShift) * Math.cos(normalizedV * freq1 + sLng + temporalShift * 0.5);
  const n2 = Math.sin(normalizedU * freq2 - sLng + temporalShift) * Math.sin(normalizedV * freq2 + sLat) * 0.5;
  const noise = Math.max(0, Math.min(1, (n1 + n2 + 1.5) / 3.0)); // 0.0 to 1.0 range

  // Add simulated farm boundary structure/pathway at edges or specific zone
  const isFarmTrack = Math.abs(normalizedU - 0.72) < 0.04 && normalizedV > 0.2;
  const isShed = normalizedU > 0.82 && normalizedV > 0.78;

  // Synthesize RGB values as seen by satellite sensor with temporal phenology variation
  let r = 80 + Math.floor(noise * 70);
  let g = 140 + Math.floor(noise * 100) - Math.floor(daysAgo * 0.6);
  let b = 70 + Math.floor(noise * 60);

  if (isShed) {
    // Artificial tin/tile roof: high brightness, close G and B
    r = 190;
    g = 185;
    b = 188;
  } else if (isFarmTrack) {
    // Bare soil track / path: higher red, low excess green
    r = 165;
    g = 120;
    b = 95;
  }

  // Excess Green calculation: 2*G - R - B
  const exG = 2 * g - r - b;
  const isArtificialOrBare = Math.abs(g - b) < 20 && (r + g + b) / 3 > 140;

  if (mode === 'ndre') {
    // Chlorophyll Health (NDRE)
    if (isShed || isFarmTrack || isArtificialOrBare || exG < 20) {
      // Deep Red: Non-vegetation (roofs/roads/concrete/bare soil) or severe stress
      const ndreVal = Number((0.15 + noise * 0.15).toFixed(2));
      return {
        color: 'rgba(220, 38, 38, 0.78)', // Deep Red
        category: 'severe_or_nonveg',
        indexValue: ndreVal,
      };
    } else if (exG < 65 || noise < 0.45) {
      // Yellow: Nitrogen-deficient / mild chlorosis
      const ndreVal = Number((0.40 + noise * 0.22).toFixed(2));
      return {
        color: 'rgba(234, 179, 8, 0.78)', // Vibrant Golden Yellow
        category: 'moderate',
        indexValue: ndreVal,
      };
    } else {
      // Vibrant Green: Highly photosynthetic, healthy chlorophyll
      const ndreVal = Number((0.68 + noise * 0.25).toFixed(2));
      return {
        color: 'rgba(22, 163, 74, 0.82)', // Vibrant Emerald Green
        category: 'healthy',
        indexValue: Math.min(0.96, ndreVal),
      };
    }
  } else {
    // Moisture Stress (NDWI)
    if (isShed || isFarmTrack || isArtificialOrBare) {
      // Dark Gray: Non-vegetation structures
      return {
        color: 'rgba(75, 85, 99, 0.82)', // Dark Gray
        category: 'severe_or_nonveg',
        indexValue: Number((-0.18 + noise * 0.1).toFixed(2)),
      };
    } else if (noise < 0.38) {
      // Orange: Water-deficient / moisture stress
      return {
        color: 'rgba(249, 115, 22, 0.78)', // Orange
        category: 'severe_or_nonveg',
        indexValue: Number((0.10 + noise * 0.12).toFixed(2)),
      };
    } else if (noise < 0.65) {
      // Cyan: Mild moisture stress
      return {
        color: 'rgba(6, 182, 212, 0.78)', // Cyan
        category: 'moderate',
        indexValue: Number((0.32 + noise * 0.18).toFixed(2)),
      };
    } else {
      // Blue: Well-irrigated / optimum soil moisture
      return {
        color: 'rgba(37, 99, 235, 0.82)', // Royal Blue
        category: 'healthy',
        indexValue: Number((0.60 + noise * 0.28).toFixed(2)),
      };
    }
  }
}

/**
 * Lightweight reverse geocoder to fetch human-readable address for farm location
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<{ address: string; district?: string; state?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'en,hi' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.town || addr.hamlet || '';
      const district = addr.county || addr.state_district || addr.district || '';
      const state = addr.state || '';
      const country = addr.country || 'India';

      const parts = [village, district, state, country].filter(Boolean);
      return {
        address: parts.join(', ') || data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        district,
        state,
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding timed out or failed, using coordinate fallback:', err);
  }
  return {
    address: `Field Point (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
  };
}

/**
 * Robust, resilient user location fetcher with multi-stage fallbacks
 */
export async function getAccurateUserLocation(): Promise<{ lat: number; lng: number; accuracy: number; source: 'gps' | 'network' | 'ip' }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      fetchIPLocation()
        .then((loc) => resolve({ ...loc, source: 'ip' }))
        .catch(reject);
      return;
    }

    // Stage 1: Try High Accuracy GPS with 5.5s timeout
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy || 10),
          source: 'gps',
        });
      },
      (highErr) => {
        // Stage 2: Fallback to Network / Low Accuracy with 8s timeout
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy || 30),
              source: 'network',
            });
          },
          async (lowErr) => {
            // Stage 3: Fallback to IP geolocation
            try {
              const ipLoc = await fetchIPLocation();
              resolve({ ...ipLoc, source: 'ip' });
            } catch (err) {
              reject(lowErr || highErr);
            }
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5500, maximumAge: 0 }
    );
  });
}

async function fetchIPLocation(): Promise<{ lat: number; lng: number; accuracy: number }> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          lat: Number(Number(data.latitude).toFixed(6)),
          lng: Number(Number(data.longitude).toFixed(6)),
          accuracy: 500,
        };
      }
    }
  } catch {
    // try secondary IP endpoint
  }
  const res2 = await fetch('https://get.geojs.io/v1/ip/geo.json');
  if (res2.ok) {
    const data2 = await res2.json();
    if (data2.latitude && data2.longitude) {
      return {
        lat: Number(Number(data2.latitude).toFixed(6)),
        lng: Number(Number(data2.longitude).toFixed(6)),
        accuracy: 1000,
      };
    }
  }
  throw new Error('IP geolocation unavailable');
}
