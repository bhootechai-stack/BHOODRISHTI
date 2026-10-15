/**
 * BhooTech AI — Client-Side Agricultural Cache API Service
 * Manages local persistence of mandi rates, APMC price intelligence & crop advisories
 * using the browser Cache API.
 */

import { CustomFarmScheduleMandiIntelligence, HyperLocalAdvisoryEngineResult } from '../types/hyperLocalAdvisory';

export const AGRI_DATA_CACHE_NAME = 'bhootech-agricultural-data-v1';

export interface CacheAgriStats {
  mandiCount: number;
  advisoryCount: number;
  totalEntries: number;
  isAvailable: boolean;
  lastUpdated: string | null;
}

export interface StorageQuotaInfo {
  // Agricultural Cache Specific
  agriCacheBytes: number;
  agriCacheFormatted: string;
  mandiCount: number;
  mandiBytes: number;
  mandiFormatted: string;
  advisoryCount: number;
  advisoryBytes: number;
  advisoryFormatted: string;
  
  // Static Shell Cache
  staticCacheBytes: number;
  staticCacheFormatted: string;
  
  // Device Storage Quota (navigator.storage)
  totalUsageBytes: number;
  totalUsageFormatted: string;
  totalQuotaBytes: number;
  totalQuotaFormatted: string;
  usagePercentage: number;
  
  // Capabilities & Status
  isSupported: boolean;
  isPersisted: boolean;
  lastUpdated: string | null;
}

export type SyncStatusState = 'Synced' | 'Pending Sync' | 'Outdated';

export interface OfflineSyncStatusInfo {
  state: SyncStatusState;
  color: 'emerald' | 'amber' | 'rose';
  lastFetchTimestamp: string | null;
  lastFetchRelativeTime: string;
  isOnline: boolean;
  ageHours: number | null;
  label: string;
  subLabel: string;
  description: string;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never Synced';
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Unknown';
  }
}

class OfflineAgriCacheService {
  private hasCacheApi: boolean;

  constructor() {
    this.hasCacheApi = typeof window !== 'undefined' && 'caches' in window;
  }

  /**
   * Save Mandi Rates and Market Intelligence to Cache API
   */
  public async cacheMandiRates(
    state: string,
    crop: string,
    data: CustomFarmScheduleMandiIntelligence
  ): Promise<boolean> {
    if (!this.hasCacheApi) return false;
    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const url = `/api/mandi/rates?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}`;
      
      const payload = {
        success: true,
        cachedAt: new Date().toISOString(),
        offline: true,
        state,
        crop,
        mandiIntelligence: data,
      };

      const response = new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-BhooTech-Cache-Timestamp': new Date().toISOString(),
          'X-BhooTech-State': state,
          'X-BhooTech-Crop': crop,
        },
      });

      await cache.put(new Request(url), response);
      localStorage.setItem('bhootech_agri_cache_last_updated', new Date().toISOString());
      return true;
    } catch (error) {
      console.warn('[OfflineAgriCache] Error caching mandi rates:', error);
      return false;
    }
  }

  /**
   * Retrieve Cached Mandi Rates for a state & crop
   */
  public async getCachedMandiRates(
    state: string,
    crop: string
  ): Promise<CustomFarmScheduleMandiIntelligence | null> {
    if (!this.hasCacheApi) return null;
    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const exactUrl = `/api/mandi/rates?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}`;
      
      let matched = await cache.match(new Request(exactUrl));

      // If exact query not found, search for state match or any cached mandi item
      if (!matched) {
        const keys = await cache.keys();
        for (const req of keys) {
          if (req.url.includes('/api/mandi') && (req.url.includes(encodeURIComponent(state)) || req.url.includes(encodeURIComponent(crop)))) {
            matched = await cache.match(req);
            break;
          }
        }
      }

      if (matched) {
        const json = await matched.json();
        return json.mandiIntelligence || null;
      }
      return null;
    } catch (error) {
      console.warn('[OfflineAgriCache] Error retrieving cached mandi rates:', error);
      return null;
    }
  }

  /**
   * Save HyperLocal Advisory and Agronomic Recommendations to Cache API
   */
  public async cacheCropAdvisory(
    crop: string,
    state: string,
    district: string | undefined,
    advisory: HyperLocalAdvisoryEngineResult
  ): Promise<boolean> {
    if (!this.hasCacheApi) return false;
    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const url = `/api/hyperlocal-advisory?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district || 'all')}`;
      
      const payload = {
        success: true,
        cachedAt: new Date().toISOString(),
        offline: true,
        advisory,
      };

      const response = new Response(JSON.stringify(payload), {
        headers: {
          'Content-Type': 'application/json',
          'X-BhooTech-Cache-Timestamp': new Date().toISOString(),
          'X-BhooTech-Advisory-Crop': crop,
        },
      });

      await cache.put(new Request(url), response);
      localStorage.setItem('bhootech_agri_cache_last_updated', new Date().toISOString());
      return true;
    } catch (error) {
      console.warn('[OfflineAgriCache] Error caching crop advisory:', error);
      return false;
    }
  }

  /**
   * Retrieve Cached Crop Advisory
   */
  public async getCachedCropAdvisory(
    crop: string,
    state: string
  ): Promise<HyperLocalAdvisoryEngineResult | null> {
    if (!this.hasCacheApi) return null;
    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const keys = await cache.keys();
      
      for (const req of keys) {
        if (req.url.includes('/api/hyperlocal-advisory')) {
          if (req.url.includes(encodeURIComponent(crop)) || req.url.includes(encodeURIComponent(state))) {
            const matched = await cache.match(req);
            if (matched) {
              const json = await matched.json();
              return json.advisory || null;
            }
          }
        }
      }

      // Fallback: check any cached advisory
      for (const req of keys) {
        if (req.url.includes('/api/hyperlocal-advisory')) {
          const matched = await cache.match(req);
          if (matched) {
            const json = await matched.json();
            return json.advisory || null;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('[OfflineAgriCache] Error retrieving cached crop advisory:', error);
      return null;
    }
  }

  /**
   * Get Storage Stats for UI indicators
   */
  public async getStats(): Promise<CacheAgriStats> {
    if (!this.hasCacheApi) {
      return {
        mandiCount: 0,
        advisoryCount: 0,
        totalEntries: 0,
        isAvailable: false,
        lastUpdated: null,
      };
    }

    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const keys = await cache.keys();
      const mandiCount = keys.filter((k) => k.url.includes('mandi')).length;
      const advisoryCount = keys.filter((k) => k.url.includes('advisory')).length;
      const lastUpdated = localStorage.getItem('bhootech_agri_cache_last_updated');

      return {
        mandiCount,
        advisoryCount,
        totalEntries: keys.length,
        isAvailable: true,
        lastUpdated,
      };
    } catch (e) {
      return {
        mandiCount: 0,
        advisoryCount: 0,
        totalEntries: 0,
        isAvailable: false,
        lastUpdated: null,
      };
    }
  }

  /**
   * Get comprehensive Cache API Storage Quota and Breakdown
   */
  public async getStorageQuota(): Promise<StorageQuotaInfo> {
    const defaultRes: StorageQuotaInfo = {
      agriCacheBytes: 0,
      agriCacheFormatted: '0 B',
      mandiCount: 0,
      mandiBytes: 0,
      mandiFormatted: '0 B',
      advisoryCount: 0,
      advisoryBytes: 0,
      advisoryFormatted: '0 B',
      staticCacheBytes: 0,
      staticCacheFormatted: '0 B',
      totalUsageBytes: 0,
      totalUsageFormatted: '0 B',
      totalQuotaBytes: 0,
      totalQuotaFormatted: 'Unlimited / Unknown',
      usagePercentage: 0,
      isSupported: this.hasCacheApi,
      isPersisted: false,
      lastUpdated: localStorage.getItem('bhootech_agri_cache_last_updated'),
    };

    if (!this.hasCacheApi) return defaultRes;

    try {
      // 1. Measure Agricultural Cache usage
      let agriBytes = 0;
      let mandiCount = 0;
      let mandiBytes = 0;
      let advCount = 0;
      let advBytes = 0;

      if ('caches' in window) {
        const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
        const keys = await cache.keys();

        for (const req of keys) {
          const res = await cache.match(req);
          if (res) {
            try {
              const blob = await res.clone().blob();
              const size = blob.size;
              agriBytes += size;

              if (req.url.includes('/api/mandi')) {
                mandiCount++;
                mandiBytes += size;
              } else if (req.url.includes('advisory')) {
                advCount++;
                advBytes += size;
              }
            } catch (blobErr) {
              // Ignore individual read error
            }
          }
        }

        // Measure Static Cache if present
        let staticBytes = 0;
        try {
          const staticCache = await window.caches.open('bhootech-static-v2');
          const staticKeys = await staticCache.keys();
          for (const sReq of staticKeys) {
            const sRes = await staticCache.match(sReq);
            if (sRes) {
              const sBlob = await sRes.clone().blob();
              staticBytes += sBlob.size;
            }
          }
        } catch (e) {
          // static cache might not exist yet
        }

        // 2. Query Device Storage Quota via navigator.storage.estimate()
        let usage = agriBytes + staticBytes;
        let quota = 0;
        let isPersisted = false;

        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
          try {
            const estimate = await navigator.storage.estimate();
            if (estimate.usage !== undefined) usage = estimate.usage;
            if (estimate.quota !== undefined) quota = estimate.quota;
          } catch (e) {
            // estimate error fallback
          }

          if (navigator.storage.persisted) {
            try {
              isPersisted = await navigator.storage.persisted();
            } catch (e) {
              // persistence check fallback
            }
          }
        }

        const pct = quota > 0 ? Number(((usage / quota) * 100).toFixed(2)) : 0;

        return {
          agriCacheBytes: agriBytes,
          agriCacheFormatted: formatBytes(agriBytes),
          mandiCount,
          mandiBytes,
          mandiFormatted: formatBytes(mandiBytes),
          advisoryCount: advCount,
          advisoryBytes: advBytes,
          advisoryFormatted: formatBytes(advBytes),
          staticCacheBytes: staticBytes,
          staticCacheFormatted: formatBytes(staticBytes),
          totalUsageBytes: usage,
          totalUsageFormatted: formatBytes(usage),
          totalQuotaBytes: quota,
          totalQuotaFormatted: quota > 0 ? formatBytes(quota) : 'Unknown',
          usagePercentage: pct,
          isSupported: true,
          isPersisted,
          lastUpdated: localStorage.getItem('bhootech_agri_cache_last_updated') || new Date().toISOString(),
        };
      }

      return defaultRes;
    } catch (err) {
      console.warn('[OfflineAgriCache] Error estimating quota:', err);
      return defaultRes;
    }
  }

  public async getStorageQuotaEstimate(): Promise<StorageQuotaInfo> {
    return this.getStorageQuota();
  }

  /**
   * Clear Agricultural Cache API storage and reset
   */
  public async clearAgriCache(): Promise<boolean> {
    if (!this.hasCacheApi) return false;
    try {
      await window.caches.delete(AGRI_DATA_CACHE_NAME);
      localStorage.removeItem('bhootech_agri_cache_last_updated');
      localStorage.removeItem('bhootech_sw_last_fetch_timestamp');
      return true;
    } catch (e) {
      console.error('[OfflineAgriCache] Failed to clear agricultural cache:', e);
      return false;
    }
  }

  /**
   * Retrieve the last successful Service Worker fetch timestamp
   */
  public async getLastFetchTimestamp(): Promise<string | null> {
    if (!this.hasCacheApi) return null;

    // 1. Check localStorage fast cache
    const localTs = localStorage.getItem('bhootech_sw_last_fetch_timestamp');
    if (localTs) return localTs;

    // 2. Check Service Worker Cache API metadata entry
    try {
      const cache = await window.caches.open(AGRI_DATA_CACHE_NAME);
      const match = await cache.match(new Request('/api/meta/last-sync-timestamp'));
      if (match) {
        const json = await match.json();
        if (json.lastFetchTimestamp) {
          localStorage.setItem('bhootech_sw_last_fetch_timestamp', json.lastFetchTimestamp);
          return json.lastFetchTimestamp;
        }
      }
    } catch (e) {
      console.warn('[OfflineAgriCache] Error reading sync timestamp metadata:', e);
    }

    return localStorage.getItem('bhootech_agri_cache_last_updated');
  }

  /**
   * Determine whether cached agricultural data is Synced, Pending Sync, or Outdated
   */
  public async getOfflineSyncStatus(): Promise<OfflineSyncStatusInfo> {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const lastFetch = await this.getLastFetchTimestamp();

    if (!lastFetch) {
      return {
        state: isOnline ? 'Pending Sync' : 'Outdated',
        color: isOnline ? 'amber' : 'rose',
        lastFetchTimestamp: null,
        lastFetchRelativeTime: 'Never Synced',
        isOnline,
        ageHours: null,
        label: isOnline ? 'Pending Sync' : 'Outdated',
        subLabel: isOnline ? 'Initial sync scheduled' : 'Zero local sync records',
        description: isOnline
          ? 'Connecting to Service Worker to establish first live agricultural baseline.'
          : 'No verified live sync recorded. Please connect to internet to refresh mandi rates.',
      };
    }

    const fetchTime = new Date(lastFetch).getTime();
    const now = Date.now();
    const ageMs = Math.max(0, now - fetchTime);
    const ageHours = Number((ageMs / (1000 * 60 * 60)).toFixed(1));
    const relativeTime = formatRelativeTime(lastFetch);

    // Rule 1: Synced (Fresh < 12 hours)
    if (ageHours < 12) {
      return {
        state: 'Synced',
        color: 'emerald',
        lastFetchTimestamp: lastFetch,
        lastFetchRelativeTime: relativeTime,
        isOnline,
        ageHours,
        label: 'Synced',
        subLabel: `Fresh (${relativeTime})`,
        description: `Verified APMC mandi rates and crop advisories fetched via Service Worker ${relativeTime}. Ready for offline use.`,
      };
    }

    // Rule 2: Pending Sync (12 to 36 hours old, or offline with recent baseline)
    if (ageHours < 36) {
      return {
        state: 'Pending Sync',
        color: 'amber',
        lastFetchTimestamp: lastFetch,
        lastFetchRelativeTime: relativeTime,
        isOnline,
        ageHours,
        label: 'Pending Sync',
        subLabel: isOnline ? `Scheduled update pending (${relativeTime})` : `Offline • Synced ${relativeTime}`,
        description: isOnline
          ? `Cached data is ${relativeTime}. Service Worker is scheduling an automatic background refresh.`
          : `Device is currently offline. Cached data from ${relativeTime} remains active until reconnected.`,
      };
    }

    // Rule 3: Outdated (>= 36 hours old)
    return {
      state: 'Outdated',
      color: 'rose',
      lastFetchTimestamp: lastFetch,
      lastFetchRelativeTime: relativeTime,
      isOnline,
      ageHours,
      label: 'Outdated',
      subLabel: `Stale (${relativeTime})`,
      description: `Cached agricultural data is older than 36 hours (${relativeTime}). APMC market arrivals and prices may have shifted. Connect to internet to re-sync.`,
    };
  }

  /**
   * Manually trigger a fresh Service Worker fetch sync
   */
  public async triggerAgriSync(state: string = 'Punjab', crop: string = 'Wheat'): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const url = `/api/mandi/rates?state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}&_sync=${Date.now()}`;
      const res = await fetch(url);
      if (res.ok) {
        const nowIso = new Date().toISOString();
        localStorage.setItem('bhootech_sw_last_fetch_timestamp', nowIso);
        localStorage.setItem('bhootech_agri_cache_last_updated', nowIso);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}

export const offlineAgriCache = new OfflineAgriCacheService();
