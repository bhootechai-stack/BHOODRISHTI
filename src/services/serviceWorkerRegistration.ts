/**
 * BhooTech AI — Service Worker Registration Handler
 * Registers /sw.js to activate the Cache API strategy for agricultural telemetry
 */

export interface SWRegistrationCallbacks {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export function registerServiceWorker(callbacks?: SWRegistrationCallbacks) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register on window load to avoid delaying initial critical telemetry render
  window.addEventListener('load', async () => {
    try {
      const swUrl = '/sw.js';
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/',
      });

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available once old tabs close
              console.log('[BhooTech SW] Updated agricultural cache available.');
              callbacks?.onUpdate?.(registration);
            } else {
              // Content cached for offline use
              console.log('[BhooTech SW] Core agricultural data cached for offline use.');
              callbacks?.onSuccess?.(registration);
            }
          }
        };
      };

      callbacks?.onSuccess?.(registration);
    } catch (error: any) {
      console.warn('[BhooTech SW] Service worker registration notice:', error);
      callbacks?.onError?.(error);
    }
  });
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => registration.unregister())
      .catch((error) => console.error(error.message));
  }
}
