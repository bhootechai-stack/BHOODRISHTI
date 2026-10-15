import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type LocationStatus =
  | 'checking'
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'insecure';

export interface LiveCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
}

export interface LocationContextType {
  status: LocationStatus;
  coords: LiveCoords | null;
  errorDetail?: string | null;
  requestLocation: () => Promise<void>;
  retryLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<LocationStatus>('checking');
  const [coords, setCoords] = useState<LiveCoords | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  // Core geolocation acquisition function using high accuracy and zero cached age
  const acquirePosition = useCallback((): Promise<LiveCoords> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser or environment.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position?.coords?.latitude;
          const lng = position?.coords?.longitude;
          const accuracy = position?.coords?.accuracy;
          const heading = position?.coords?.heading ?? null;
          const speed = position?.coords?.speed ?? null;

          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            resolve({ lat, lng, accuracy, heading, speed });
          } else {
            reject(new Error('Received non-finite coordinate values from GPS sensor.'));
          }
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const requestLocation = useCallback(async () => {
    // 1. Check for secure context
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setStatus('insecure');
      setErrorDetail('Secure context (HTTPS) is required to access device GPS coordinates.');
      return;
    }

    setStatus('checking');
    setErrorDetail(null);

    try {
      const position = await acquirePosition();
      setCoords(position);
      setStatus('granted');
    } catch (err: any) {
      console.warn('[LocationContext] Location acquisition failure:', err);

      if (err?.code === 1) {
        // PERMISSION_DENIED
        setStatus('denied');
        setErrorDetail('Permission to access location was denied by the user or browser policy.');
      } else if (err?.code === 2) {
        // POSITION_UNAVAILABLE
        setStatus('unavailable');
        setErrorDetail('Device GPS or network position is currently unavailable. Please turn on device location.');
      } else if (err?.code === 3) {
        // TIMEOUT
        setStatus('timeout');
        setErrorDetail('Could not acquire GPS fix within 15 seconds. Please check satellite/network reception.');
      } else {
        setStatus('denied');
        setErrorDetail(err?.message || 'Unable to access device location.');
      }
    }
  }, [acquirePosition]);

  // Initial permission check and change listener setup
  useEffect(() => {
    let isMounted = true;

    // Check secure context
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
      setStatus('insecure');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    // Attempt Permissions API query if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((permStatus) => {
          if (!isMounted) return;
          permissionStatusRef.current = permStatus;

          const handlePermChange = () => {
            if (!isMounted) return;
            console.log('[LocationContext] PermissionStatus changed to:', permStatus.state);
            if (permStatus.state === 'granted') {
              requestLocation();
            } else if (permStatus.state === 'denied') {
              setStatus('denied');
            } else if (permStatus.state === 'prompt') {
              setStatus('prompt');
            }
          };

          permStatus.addEventListener('change', handlePermChange);

          if (permStatus.state === 'granted') {
            requestLocation();
          } else if (permStatus.state === 'denied') {
            setStatus('denied');
          } else {
            setStatus('prompt');
          }
        })
        .catch(() => {
          // Permissions API query not supported for geolocation (e.g. Safari)
          if (isMounted) setStatus('prompt');
        });
    } else {
      setStatus('prompt');
    }

    return () => {
      isMounted = false;
      if (permissionStatusRef.current) {
        try {
          permissionStatusRef.current.onchange = null;
        } catch {}
      }
    };
  }, [requestLocation]);

  const retryLocation = useCallback(async () => {
    await requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        status,
        coords,
        errorDetail,
        requestLocation,
        retryLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
