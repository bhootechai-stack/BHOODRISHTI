/**
 * Copernicus Data Space Ecosystem (CDSE) / Sentinel Hub OAuth & WMS Service
 * 
 * Provides OAuth2 Client Credentials authentication, token caching,
 * dynamic Sentinel-2 L2A WMS tile URL generation, and Leaflet layer configuration
 * for BhooTech AI precision satellite agronomy.
 */

import L from 'leaflet';

export interface CopernicusCredentials {
  clientId: string;
  clientSecret: string;
  instanceId?: string;
}

export interface CopernicusAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type: string;
  'not-before-policy'?: number;
  scope?: string;
}

export interface CopernicusTokenCache {
  token: string;
  expiresAt: number; // Unix timestamp in ms
}

const TOKEN_ENDPOINT = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
const CDSE_WMS_BASE = 'https://sh.dataspace.copernicus.eu/ogc/wms';
// Copernicus Open Web Services fallback WMS / WMTS endpoints
const COPERNICUS_FALLBACK_WMS = 'https://tiles.maps.eox.at/wms';
// Note: EOX Sentinel-2 cloudless tiles have a maximum native zoom level of 14.
// By specifying maxNativeZoom: 14 in Leaflet, Leaflet overzooms the tiles at levels 15-22 without 404 errors.
const EOX_FALLBACK_TILE = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg';

// In-memory token cache
let inMemoryToken: CopernicusTokenCache | null = null;

// Storage keys
const STORAGE_KEY_CLIENT_ID = 'copernicus_client_id';
const STORAGE_KEY_CLIENT_SECRET = 'copernicus_client_secret';
const STORAGE_KEY_INSTANCE_ID = 'copernicus_instance_id';
const STORAGE_KEY_TOKEN = 'copernicus_cached_token';

let hasLoggedSentinelWarning = false;

/**
 * Retrieves configured Copernicus credentials from environment variables or localStorage
 */
export function getCopernicusCredentials(): CopernicusCredentials {
  const envClientId =
    (typeof import.meta !== 'undefined' && (
      (import.meta as any).env?.VITE_COPERNICUS_CLIENT_ID ||
      (import.meta as any).env?.VITE_SENTINEL_HUB_CLIENT_ID ||
      (import.meta as any).env?.SENTINEL_HUB_CLIENT_ID ||
      (import.meta as any).env?.COPERNICUS_CLIENT_ID
    )) ||
    (typeof process !== 'undefined' && (
      process.env?.SENTINEL_HUB_CLIENT_ID ||
      process.env?.COPERNICUS_CLIENT_ID ||
      process.env?.VITE_COPERNICUS_CLIENT_ID ||
      process.env?.VITE_SENTINEL_HUB_CLIENT_ID
    )) ||
    '';

  const envClientSecret =
    (typeof import.meta !== 'undefined' && (
      (import.meta as any).env?.VITE_COPERNICUS_CLIENT_SECRET ||
      (import.meta as any).env?.VITE_SENTINEL_HUB_CLIENT_SECRET ||
      (import.meta as any).env?.SENTINEL_HUB_CLIENT_SECRET ||
      (import.meta as any).env?.COPERNICUS_CLIENT_SECRET
    )) ||
    (typeof process !== 'undefined' && (
      process.env?.SENTINEL_HUB_CLIENT_SECRET ||
      process.env?.COPERNICUS_CLIENT_SECRET ||
      process.env?.VITE_COPERNICUS_CLIENT_SECRET ||
      process.env?.VITE_SENTINEL_HUB_CLIENT_SECRET
    )) ||
    '';

  const envInstanceId =
    (typeof import.meta !== 'undefined' && (
      (import.meta as any).env?.VITE_COPERNICUS_INSTANCE_ID ||
      (import.meta as any).env?.VITE_SENTINEL_HUB_INSTANCE_ID ||
      (import.meta as any).env?.SENTINEL_HUB_INSTANCE_ID ||
      (import.meta as any).env?.COPERNICUS_INSTANCE_ID
    )) ||
    (typeof process !== 'undefined' && (
      process.env?.SENTINEL_HUB_INSTANCE_ID ||
      process.env?.COPERNICUS_INSTANCE_ID ||
      process.env?.VITE_COPERNICUS_INSTANCE_ID
    )) ||
    '';

  const storedClientId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CLIENT_ID) || '' : '';
  const storedClientSecret = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CLIENT_SECRET) || '' : '';
  const storedInstanceId = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_INSTANCE_ID) || '' : '';

  const finalClientId = (envClientId || storedClientId).trim();
  const finalClientSecret = (envClientSecret || storedClientSecret).trim();
  const finalInstanceId = (envInstanceId || storedInstanceId).trim();

  if (!finalClientId || !finalClientSecret) {
    if (!hasLoggedSentinelWarning) {
      console.warn('ℹ️ Krishi Mitra: Sentinel Hub environment credentials (SENTINEL_HUB_CLIENT_ID / SENTINEL_HUB_CLIENT_SECRET) not set. Falling back to free Copernicus Open Web Services (EOX Sentinel-2 Cloudless).');
      hasLoggedSentinelWarning = true;
    }
  }

  return {
    clientId: finalClientId,
    clientSecret: finalClientSecret,
    instanceId: finalInstanceId,
  };
}

/**
 * Saves Copernicus credentials to localStorage
 */
export function saveCopernicusCredentials(creds: CopernicusCredentials): void {
  if (creds.clientId) {
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, creds.clientId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
  }

  if (creds.clientSecret) {
    localStorage.setItem(STORAGE_KEY_CLIENT_SECRET, creds.clientSecret.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_CLIENT_SECRET);
  }

  if (creds.instanceId) {
    localStorage.setItem(STORAGE_KEY_INSTANCE_ID, creds.instanceId.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_INSTANCE_ID);
  }

  // Invalidate cached token when credentials change
  inMemoryToken = null;
  localStorage.removeItem(STORAGE_KEY_TOKEN);
}

/**
 * Clears saved Copernicus credentials and token cache
 */
export function clearCopernicusCredentials(): void {
  localStorage.removeItem(STORAGE_KEY_CLIENT_ID);
  localStorage.removeItem(STORAGE_KEY_CLIENT_SECRET);
  localStorage.removeItem(STORAGE_KEY_INSTANCE_ID);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  inMemoryToken = null;
}

/**
 * Gets cached token synchronously if available and valid
 */
export function getCachedCopernicusToken(): string | null {
  const now = Date.now();
  if (inMemoryToken && inMemoryToken.expiresAt > now + 30000) {
    return inMemoryToken.token;
  }
  try {
    const rawStoredToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (rawStoredToken) {
      const parsed: CopernicusTokenCache = JSON.parse(rawStoredToken);
      if (parsed.token && parsed.expiresAt > now + 30000) {
        inMemoryToken = parsed;
        return parsed.token;
      }
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Fetches an OAuth Bearer token from Copernicus Data Space Ecosystem IDP
 * using client_credentials grant type. Caches token until expiration.
 */
export async function getCopernicusToken(
  customClientId?: string,
  customClientSecret?: string
): Promise<string | null> {
  const creds = getCopernicusCredentials();
  const clientId = customClientId || creds.clientId;
  const clientSecret = customClientSecret || creds.clientSecret;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Check in-memory cache (with 30-second buffer before expiry)
  const now = Date.now();
  if (inMemoryToken && inMemoryToken.expiresAt > now + 30000) {
    return inMemoryToken.token;
  }

  // Check localStorage cache
  try {
    const rawStoredToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (rawStoredToken) {
      const parsed: CopernicusTokenCache = JSON.parse(rawStoredToken);
      if (parsed.token && parsed.expiresAt > now + 30000) {
        inMemoryToken = parsed;
        return parsed.token;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Request fresh token via OAuth2 Client Credentials grant
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Copernicus OAuth error (${response.status}): ${errorText}`);
    }

    const data: CopernicusAuthResponse = await response.json();
    const expiresInMs = (data.expires_in || 600) * 1000;
    const expiresAt = now + expiresInMs;

    const cacheEntry: CopernicusTokenCache = {
      token: data.access_token,
      expiresAt,
    };

    inMemoryToken = cacheEntry;
    localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(cacheEntry));

    return data.access_token;
  } catch (error) {
    console.error('Failed to authenticate with Copernicus Data Space Ecosystem:', error);
    throw error;
  }
}

/**
 * Tests Copernicus OAuth credentials by attempting authentication
 */
export async function testCopernicusConnection(
  clientId: string,
  clientSecret: string
): Promise<{ success: boolean; message: string; tokenExpiresIn?: number }> {
  if (!clientId.trim() || !clientSecret.trim()) {
    return {
      success: false,
      message: 'Client ID and Client Secret are required.',
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId.trim());
    params.append('client_secret', clientSecret.trim());

    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errMsg = errorJson?.error_description || errorJson?.error || `HTTP ${response.status} ${response.statusText}`;
      return {
        success: false,
        message: `Authentication Failed: ${errMsg}`,
      };
    }

    const data: CopernicusAuthResponse = await response.json();
    return {
      success: true,
      message: 'Successfully connected to Copernicus Data Space Ecosystem!',
      tokenExpiresIn: data.expires_in,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Network Error: ${error.message || 'Could not reach identity.dataspace.copernicus.eu'}`,
    };
  }
}

/**
 * Checks if live Copernicus credentials are configured and valid
 */
export function hasCopernicusCredentials(): boolean {
  const creds = getCopernicusCredentials();
  return Boolean(creds.clientId && creds.clientSecret);
}

export interface SentinelTileLayerOptions {
  dateStr?: string; // YYYY-MM-DD
  layerPreset?: 'TRUE-COLOR' | 'TRUE-COLOR-S2L2A' | 'AGRICULTURE-S2L2A' | 'NDVI' | 'NATURAL-COLOR' | string;
  maxCloudCoverage?: number;
  instanceId?: string;
  token?: string;
}

/**
 * Builds the Copernicus Sentinel-2 WMS tile endpoint URL.
 * 
 * Target format:
 * Base URL: https://sh.dataspace.copernicus.eu/ogc/wms/{INSTANCE_ID_OR_TOKEN}
 * Params: REQUEST=GetMap&LAYERS=TRUE-COLOR&FORMAT=image/png&MAXCC=20&TIME={SELECTED_DATE}
 * Fallback: Copernicus Open Web Services WMS endpoint if instance ID is not provided.
 */
export function buildSentinelWmsBaseUrl(options: SentinelTileLayerOptions = {}): {
  baseUrl: string;
  isCustomInstance: boolean;
  params: Record<string, string | number | boolean>;
} {
  const creds = getCopernicusCredentials();
  const cachedToken = getCachedCopernicusToken();
  const instanceIdOrToken = options.instanceId || creds.instanceId || options.token || cachedToken;
  const dateStr = options.dateStr || new Date().toISOString().split('T')[0];
  const layerName = options.layerPreset || 'TRUE-COLOR';
  const maxCloud = options.maxCloudCoverage ?? 20;
  const timeParam = `${dateStr}/${dateStr}`;

  if (instanceIdOrToken) {
    // Authenticated / Configured CDSE Sentinel Hub WMS Endpoint
    const baseUrl = `${CDSE_WMS_BASE}/${instanceIdOrToken}`;
    return {
      baseUrl,
      isCustomInstance: true,
      params: {
        service: 'WMS',
        request: 'GetMap',
        layers: layerName,
        format: 'image/png',
        maxcc: maxCloud,
        time: timeParam,
        version: '1.3.0',
        transparent: true,
      },
    };
  }

  // Fallback WMS endpoint using Copernicus Open Web Services
  return {
    baseUrl: COPERNICUS_FALLBACK_WMS,
    isCustomInstance: false,
    params: {
      service: 'WMS',
      request: 'GetMap',
      layers: 's2cloudless-2021_3857',
      format: 'image/jpeg',
      transparent: false,
      version: '1.3.0',
    },
  };
}

/**
 * Builds the full tile URL template with Leaflet parameters
 */
export function buildSentinelTileUrl(options: SentinelTileLayerOptions = {}): string {
  const { baseUrl, isCustomInstance, params } = buildSentinelWmsBaseUrl(options);
  if (!isCustomInstance) {
    return EOX_FALLBACK_TILE;
  }
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    queryParams.append(key.toUpperCase(), String(val));
  });
  return `${baseUrl}?${queryParams.toString()}&WIDTH=512&HEIGHT=512&CRS=EPSG:3857&BBOX={bbox-epsg-3857}`;
}

/**
 * Creates an interactive Leaflet TileLayer configured for dynamic Sentinel-2 L2A imagery.
 * Uses live Copernicus Sentinel Hub WMS instance if credentials or instanceId are available,
 * otherwise falls back to Copernicus Open Web Services (EOX S2 Cloudless).
 */
export function createSentinel2TileLayer(options: SentinelTileLayerOptions = {}): L.TileLayer {
  const { baseUrl, isCustomInstance, params } = buildSentinelWmsBaseUrl(options);
  const dateStr = options.dateStr || new Date().toISOString().split('T')[0];

  if (isCustomInstance) {
    const wmsLayer = L.tileLayer.wms(baseUrl, {
      layers: params.layers as string,
      format: (params.format as string) || 'image/png',
      transparent: true,
      version: '1.3.0',
      time: (params.time as string) || `${dateStr}/${dateStr}`,
      maxcc: params.maxcc || 20,
      attribution: `© Copernicus Sentinel-2 L2A (${dateStr}) / CDSE Sentinel Hub`,
      maxZoom: 22,
      maxNativeZoom: 18,
      crossOrigin: true,
    } as any);

    // Attach metadata for dynamic setUrl updates
    (wmsLayer as any)._cdseOptions = options;
    return wmsLayer;
  }

  // Fallback to Copernicus Open Web Services Earth Observation
  const fallbackLayer = L.tileLayer(EOX_FALLBACK_TILE, {
    maxZoom: 22,
    maxNativeZoom: 14, // EOX S2 Cloudless server provides tiles up to zoom 14; Leaflet scales up to 22
    attribution: `© Copernicus Sentinel-2 (ESA) / Open Web Services [${dateStr}]`,
    crossOrigin: true,
  });

  fallbackLayer.on('tileerror', (errorEvent: any) => {
    console.warn(
      '⚠️ Krishi Mitra: Sentinel-2 EOX tile load issue at coords:',
      errorEvent?.coords,
      '- Leaflet will overzoom from lower zoom levels.'
    );
  });

  (fallbackLayer as any)._cdseOptions = options;
  return fallbackLayer;
}

/**
 * Immediately refreshes a Leaflet Sentinel-2 tile layer with a new date and cloud cover
 * via leafletMap.setUrl() and setParams() for smooth real-time date transitions.
 */
export function updateSentinel2TileLayer(
  layer: L.TileLayer | null | undefined,
  options: SentinelTileLayerOptions
): void {
  if (!layer) return;

  const dateStr = options.dateStr || new Date().toISOString().split('T')[0];
  const { baseUrl, isCustomInstance, params } = buildSentinelWmsBaseUrl(options);

  (layer as any)._cdseOptions = options;

  if (isCustomInstance && (layer as any).setParams) {
    (layer as any).setParams({
      time: `${dateStr}/${dateStr}`,
      maxcc: options.maxCloudCoverage ?? 20,
      layers: options.layerPreset || 'TRUE-COLOR',
    });
    if (typeof layer.setUrl === 'function') {
      layer.setUrl(baseUrl);
    }
  } else if (typeof layer.setUrl === 'function') {
    // If fallback or standard TileLayer, update URL
    const newUrl = isCustomInstance
      ? buildSentinelTileUrl(options)
      : EOX_FALLBACK_TILE;
    layer.setUrl(newUrl);
  }

  if (typeof (layer as any).redraw === 'function') {
    (layer as any).redraw();
  }
}

