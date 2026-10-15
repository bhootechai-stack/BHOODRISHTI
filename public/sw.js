/**
 * BhooTech AI — Progressive Web App Service Worker
 * Specialized Offline Caching for Agricultural Telemetry, Mandi Rates & Crop Advisories
 */

const STATIC_CACHE_VERSION = 'bhootech-static-v2';
const AGRI_DATA_CACHE_NAME = 'bhootech-agricultural-data-v1';

// Static Shell & Core Offline App Shell
const STATIC_ASSETS_TO_PRECACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
];

// Baseline regional agricultural fallback datasets
// Pre-populated so farmers in zero-connectivity rural zones have immediate access to MSP and APMC benchmarks
const BASELINE_REGIONAL_MANDI_FALLBACKS = [
  {
    state: 'Punjab',
    crop: 'Wheat',
    data: {
      success: true,
      timestamp: new Date().toISOString(),
      offline: true,
      source: 'Cache API (Pre-cached Baseline)',
      mandiIntelligence: {
        pinnedGps: { lat: 30.901, lng: 75.8573, state: 'Punjab', district: 'Ludhiana' },
        cropName: 'Wheat (गेहूं / ਕਣਕ)',
        govtMspPerQuintal: 2425,
        prevailingMandiRate: 2680,
        mspSpread: 255,
        procuringAgency: 'FCI / PUNSUP / Markfed (Punjab APMC)',
        top3NearestMandis: [
          {
            mandiName: 'Khanna Grain Market (Asia Largest APMC)',
            district: 'Ludhiana',
            state: 'Punjab',
            currentPricePerQuintal: 2710,
            distanceKm: 28,
            roadTravelMinutes: 42,
            operationalStatus: 'Open • Active Procurement',
            trend: 'Bullish (+₹60/Qtl this week)',
            isRecommended: true,
          },
          {
            mandiName: 'Ludhiana Central Dana Mandi',
            district: 'Ludhiana',
            state: 'Punjab',
            currentPricePerQuintal: 2660,
            distanceKm: 14,
            roadTravelMinutes: 25,
            operationalStatus: 'Open',
            trend: 'Stable',
            isRecommended: false,
          },
          {
            mandiName: 'Jagraon Sub-Yard APMC',
            district: 'Ludhiana',
            state: 'Punjab',
            currentPricePerQuintal: 2640,
            distanceKm: 34,
            roadTravelMinutes: 48,
            operationalStatus: 'Open',
            trend: 'Stable',
            isRecommended: false,
          },
        ],
        optimalSellingWindow: 'Day +12 to Day +18 (Post-glut peak arrival window)',
        recommendation: 'Holding wheat for 14 days post-harvest yields estimated +₹85/Qtl higher net return based on econometric models.',
      },
    },
  },
  {
    state: 'Maharashtra',
    crop: 'Soybean',
    data: {
      success: true,
      timestamp: new Date().toISOString(),
      offline: true,
      source: 'Cache API (Pre-cached Baseline)',
      mandiIntelligence: {
        pinnedGps: { lat: 19.9975, lng: 73.7898, state: 'Maharashtra', district: 'Nashik' },
        cropName: 'Soybean (सोयाबीन)',
        govtMspPerQuintal: 4892,
        prevailingMandiRate: 5180,
        mspSpread: 288,
        procuringAgency: 'NAFED / MSAMB (Maharashtra)',
        top3NearestMandis: [
          {
            mandiName: 'Lasalgaon APMC Sub-Yard',
            district: 'Nashik',
            state: 'Maharashtra',
            currentPricePerQuintal: 5240,
            distanceKm: 22,
            roadTravelMinutes: 35,
            operationalStatus: 'Open',
            trend: 'Bullish (+₹90/Qtl)',
            isRecommended: true,
          },
          {
            mandiName: 'Nashik Agricultural Produce Market',
            district: 'Nashik',
            state: 'Maharashtra',
            currentPricePerQuintal: 5120,
            distanceKm: 12,
            roadTravelMinutes: 20,
            operationalStatus: 'Open',
            trend: 'Stable',
            isRecommended: false,
          },
        ],
        optimalSellingWindow: 'Day +10 to Day +16',
        recommendation: 'Oil content premium active. Direct APMC delivery recommended over local village aggregator.',
      },
    },
  },
  {
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    data: {
      success: true,
      timestamp: new Date().toISOString(),
      offline: true,
      source: 'Cache API (Pre-cached Baseline)',
      mandiIntelligence: {
        pinnedGps: { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh', district: 'Lucknow' },
        cropName: 'Paddy / Rice (धान)',
        govtMspPerQuintal: 2300,
        prevailingMandiRate: 2440,
        mspSpread: 140,
        procuringAgency: 'UP State Food & Civil Supplies',
        top3NearestMandis: [
          {
            mandiName: 'Lucknow Dubagga Mandi Samiti',
            district: 'Lucknow',
            state: 'Uttar Pradesh',
            currentPricePerQuintal: 2470,
            distanceKm: 16,
            roadTravelMinutes: 28,
            operationalStatus: 'Open',
            trend: 'Bullish (+₹40/Qtl)',
            isRecommended: true,
          },
        ],
        optimalSellingWindow: 'Immediate (Within 7 days of harvest)',
        recommendation: 'Government purchase centers (Kray Kendra) operating at full capacity. Register on UP e-Mandi portal for direct DBT payment.',
      },
    },
  },
];

// Baseline advisories pre-cache
const BASELINE_ADVISORIES_FALLBACK = {
  count: 3,
  offline: true,
  advisories: [
    {
      id: 'adv-offline-1',
      crop: 'Wheat',
      title: 'Optimal Spray Window & Rust Scouting Advisory',
      status: 'Optimal Spray Window Active',
      action: 'Apply recommended prophylactic bio-fungicide during early morning hours before wind speed exceeds 12 km/h.',
      confidence: 94,
    },
    {
      id: 'adv-offline-2',
      crop: 'General',
      title: 'Night Micro-Irrigation & Moisture Conservation',
      status: 'Conservative Irrigation Recommended',
      action: 'Shift irrigation to post-dusk (6:00 PM - 10:00 PM) to avoid up to 35% evaporative loss under current ambient humidity.',
      confidence: 91,
    },
    {
      id: 'adv-offline-3',
      crop: 'All Crops',
      title: 'Mandi Arbitrage & Optimal Logistics Window',
      status: 'Target APMC Yards within 35km Radius',
      action: 'Transport produce during early dawn hours to minimize transit heat degradation and arrive before peak 9:00 AM auction bidding.',
      confidence: 89,
    },
  ],
};

// 1. INSTALL LIFECYCLE: Pre-cache static shell & seed Cache API with agricultural datasets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // A. Cache App Shell
      const staticCache = await caches.open(STATIC_CACHE_VERSION);
      try {
        await staticCache.addAll(STATIC_ASSETS_TO_PRECACHE);
      } catch (err) {
        console.warn('[BhooTech SW] Static precache partial notice:', err);
      }

      // B. Pre-populate Agricultural Data Cache
      const agriCache = await caches.open(AGRI_DATA_CACHE_NAME);
      try {
        // Pre-cache baseline mandi endpoints
        for (const item of BASELINE_REGIONAL_MANDI_FALLBACKS) {
          const url = `/api/mandi/rates?state=${encodeURIComponent(item.state)}&crop=${encodeURIComponent(item.crop)}`;
          const response = new Response(JSON.stringify(item.data), {
            headers: {
              'Content-Type': 'application/json',
              'X-BhooTech-Cache': 'SW-Precached-Baseline',
              'X-BhooTech-State': item.state,
              'X-BhooTech-Crop': item.crop,
            },
          });
          await agriCache.put(new Request(url), response);
        }

        // Pre-cache baseline advisories endpoint
        const advisoriesResp = new Response(JSON.stringify(BASELINE_ADVISORIES_FALLBACK), {
          headers: {
            'Content-Type': 'application/json',
            'X-BhooTech-Cache': 'SW-Precached-Baseline',
          },
        });
        await agriCache.put(new Request('/api/advisories'), advisoriesResp);

        // Pre-cache baseline sync timestamp
        const initialSyncIso = new Date().toISOString();
        const initialMeta = new Response(JSON.stringify({ lastFetchTimestamp: initialSyncIso, source: 'Initial Installation' }), {
          headers: { 'Content-Type': 'application/json', 'X-BhooTech-Timestamp': initialSyncIso },
        });
        await agriCache.put(new Request('/api/meta/last-sync-timestamp'), initialMeta);
      } catch (err) {
        console.warn('[BhooTech SW] Agri cache seeding error:', err);
      }

      // Activate immediately
      await self.skipWaiting();
    })()
  );
});

// 2. ACTIVATE LIFECYCLE: Invalidate outdated static caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_VERSION && key !== AGRI_DATA_CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      );
      await self.clients.claim();
    })()
  );
});

// 3. FETCH INTERCEPTION: Specialized Caching Strategies
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. AGRICULTURAL DATA REQUESTS: Mandi Rates, Advisories & Weather
  const isMandiEndpoint = url.pathname.includes('/api/mandi');
  const isAdvisoryEndpoint =
    url.pathname.includes('/api/hyperlocal-advisory') ||
    url.pathname.includes('/api/advisories') ||
    url.pathname.includes('/api/advisory');
  const isOpenMeteoWeather = url.hostname.includes('open-meteo.com');

  if (isMandiEndpoint || isAdvisoryEndpoint || isOpenMeteoWeather) {
    event.respondWith(handleAgriculturalDataFetch(request, url));
    return;
  }

  // B. NAVIGATION REQUESTS: HTML pages (support SPA routing offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_VERSION);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
        } catch (e) {
          // Network failed, serve cached app shell
        }
        const cached = await caches.match(request);
        if (cached) return cached;
        const indexFallback = await caches.match('/index.html');
        if (indexFallback) return indexFallback;
        return new Response('BhooTech AI Offline. Please reconnect.', { status: 503 });
      })()
    );
    return;
  }

  // C. STATIC ASSETS: Scripts, styles, icons, fonts (Cache-First / Stale-While-Revalidate)
  if (
    url.origin === location.origin &&
    (url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.woff2'))
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // D. DEFAULT: Standard network fetch with silent failure handling
  event.respondWith(
    fetch(request).catch(async () => {
      const match = await caches.match(request);
      return match || new Response('Offline resource unavailable', { status: 504 });
    })
  );
});

/**
 * Handle Agricultural Data with Network-First, Cache API Fallback & Stale-While-Revalidate
 */
async function handleAgriculturalDataFetch(request, url) {
  const agriCache = await caches.open(AGRI_DATA_CACHE_NAME);

  // 1. For POST requests (such as /api/hyperlocal-advisory)
  // Native Cache API only supports GET requests directly.
  // We compute a deterministic GET Cache Key based on request URL and payload parameters.
  let cacheKeyRequest = request;
  if (request.method === 'POST') {
    try {
      const clonedReq = request.clone();
      const bodyJson = await clonedReq.json();
      const crop = bodyJson.crop || 'Wheat';
      const state = bodyJson.state || 'Punjab';
      const district = bodyJson.district || 'All';
      // Synthesize GET cache key for the advisory
      const synthesizedUrl = `${url.pathname}?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`;
      cacheKeyRequest = new Request(synthesizedUrl, { method: 'GET' });
    } catch (e) {
      cacheKeyRequest = new Request(url.pathname, { method: 'GET' });
    }
  }

  // 2. Attempt Network Fetch with 4-second timeout (optimized for rural connectivity)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const networkResponse = await fetch(request.clone(), {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (networkResponse && networkResponse.ok) {
      // Clone and store in Cache API
      const cloneToCache = networkResponse.clone();
      try {
        await agriCache.put(cacheKeyRequest, cloneToCache);

        // Record last successful service worker fetch timestamp
        const nowIso = new Date().toISOString();
        const metaResponse = new Response(
          JSON.stringify({ lastFetchTimestamp: nowIso, url: request.url }),
          {
            headers: {
              'Content-Type': 'application/json',
              'X-BhooTech-Timestamp': nowIso,
            },
          }
        );
        await agriCache.put(new Request('/api/meta/last-sync-timestamp'), metaResponse);

        // Notify active window clients
        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_AGRI_FETCH_SUCCESS',
            timestamp: nowIso,
            url: request.url,
          });
        });
      } catch (cacheErr) {
        console.warn('[BhooTech SW] Failed to put agricultural response in Cache API:', cacheErr);
      }
      return networkResponse;
    }
  } catch (networkError) {
    // Network timed out, threw, or offline
  }

  // 3. Fallback: Search Cache API
  const cachedResponse = await agriCache.match(cacheKeyRequest);
  if (cachedResponse) {
    // Clone response and attach offline notification headers
    const cachedHeaders = new Headers(cachedResponse.headers);
    cachedHeaders.set('X-BhooTech-From-Cache', 'true');
    cachedHeaders.set('X-BhooTech-Offline', 'true');
    const cachedBody = await cachedResponse.blob();
    return new Response(cachedBody, {
      status: 200,
      statusText: 'OK (Served from Cache API)',
      headers: cachedHeaders,
    });
  }

  // 4. Fallback 2: Check for broad match (e.g. any cached mandi data or any advisory)
  if (url.pathname.includes('/api/mandi')) {
    const keys = await agriCache.keys();
    for (const key of keys) {
      if (key.url.includes('/api/mandi')) {
        const anyMandiMatch = await agriCache.match(key);
        if (anyMandiMatch) {
          const body = await anyMandiMatch.blob();
          const headers = new Headers(anyMandiMatch.headers);
          headers.set('X-BhooTech-From-Cache', 'true');
          headers.set('X-BhooTech-Offline-Fallback', 'true');
          return new Response(body, { status: 200, headers });
        }
      }
    }

    // Default static Punjab Wheat Mandi Response if zero cache matches
    return new Response(JSON.stringify(BASELINE_REGIONAL_MANDI_FALLBACKS[0].data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-BhooTech-From-Cache': 'true',
        'X-BhooTech-Offline-Default': 'true',
      },
    });
  }

  if (url.pathname.includes('/api/hyperlocal-advisory') || url.pathname.includes('/api/advisories')) {
    return new Response(JSON.stringify(BASELINE_ADVISORIES_FALLBACK), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-BhooTech-From-Cache': 'true',
        'X-BhooTech-Offline-Default': 'true',
      },
    });
  }

  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Agricultural data is currently unavailable offline for this specific query.',
      offline: true,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-BhooTech-Offline': 'true' },
    }
  );
}

// 4. CLIENT MESSAGE HANDLER: Cache inspection & manual sync
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  if (event.data.type === 'GET_CACHE_STATS') {
    try {
      const agriCache = await caches.open(AGRI_DATA_CACHE_NAME);
      const keys = await agriCache.keys();
      const mandiKeys = keys.filter((k) => k.url.includes('mandi')).length;
      const advisoryKeys = keys.filter((k) => k.url.includes('advisory')).length;
      event.ports[0].postMessage({
        success: true,
        totalEntries: keys.length,
        mandiEntries: mandiKeys,
        advisoryEntries: advisoryKeys,
        cacheName: AGRI_DATA_CACHE_NAME,
      });
    } catch (e) {
      event.ports[0].postMessage({ success: false, error: e.message });
    }
  }

  if (event.data.type === 'CLEAR_AGRI_CACHE') {
    await caches.delete(AGRI_DATA_CACHE_NAME);
    const newCache = await caches.open(AGRI_DATA_CACHE_NAME);
    event.ports[0].postMessage({ success: true, message: 'Agricultural Cache API reset' });
  }

  if (event.data.type === 'GET_LAST_FETCH_TIMESTAMP') {
    try {
      const agriCache = await caches.open(AGRI_DATA_CACHE_NAME);
      const match = await agriCache.match(new Request('/api/meta/last-sync-timestamp'));
      let ts = null;
      if (match) {
        const json = await match.json();
        ts = json.lastFetchTimestamp || null;
      }
      event.ports[0].postMessage({ success: true, timestamp: ts });
    } catch (e) {
      event.ports[0].postMessage({ success: false, error: e.message });
    }
  }
});
