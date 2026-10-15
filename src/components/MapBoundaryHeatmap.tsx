import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in bundled SPA environments
try {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch (e) {
  // Graceful fallback
}
import { MapTileSkeleton } from './SkeletonLoaders';
import {
  MapPin,
  Crosshair,
  Layers,
  CheckCircle2,
  Undo2,
  Trash2,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
  X,
  Sliders,
  Check,
  AlertTriangle,
  Droplets,
  Trees,
  Database,
  Navigation,
  Calendar,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  RefreshCw,
  Activity,
  Building2,
  Layers as LayersIcon,
  Satellite,
  Key,
} from 'lucide-react';
import { LatLng, BoundaryPoint, HeatmapMode, HeatmapStats, UserLocation, IndianState, LandUnit, FieldViewMode } from '../types';
import { SavedFarm, getCachedFarms, addOrUpdateCachedFarm } from '../services/dbApi';
import { useLocation } from '../context/LocationContext';
import {
  calculatePolygonAreaSqm,
  generateFieldPolygonAroundPoint,
  classifySpectralPixel,
  calculateDistanceMeters,
  getAccurateUserLocation,
  detectSimulatedFieldStructures,
  DetectedStructure,
  STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD,
} from '../utils/geoUtils';
import {
  getStateUnitsGroup,
  INDIAN_STATE_UNITS,
} from '../data/indianUnits';
import { useLanguage } from '../context/LanguageContext';

export type BasemapType = 'google-hybrid' | 'google-earth' | 'highres' | 'street';
export type HealthFilter = 'all' | 'healthy' | 'moderate' | 'severe' | 'structures';

interface MapBoundaryHeatmapProps {
  currentLocation: LatLng;
  savedProfileLocation?: UserLocation | null;
  onLocationChange: (loc: LatLng) => void;
  onBoundaryUpdate: (points: LatLng[], areaSqm: number, stats: HeatmapStats) => void;
  initialEstimatedAcres: number;
  onOpenDatabase?: () => void;
  selectedState?: IndianState;
  selectedUnit?: LandUnit;
  onUnitChange?: (unit: LandUnit) => void;
  loadedBoundaryFarm?: SavedFarm | null;
  onClearLoadedFarm?: () => void;
  activeHeatmapMode?: HeatmapMode;
  onModeChange?: (mode: HeatmapMode) => void;
  targetMandi?: {
    name: string;
    lat: number;
    lng: number;
    distanceKm?: number;
    commodity?: string;
    modalPrice?: number;
  } | null;
  onClearTargetMandi?: () => void;
}

export const MapBoundaryHeatmap: React.FC<MapBoundaryHeatmapProps> = ({
  currentLocation,
  savedProfileLocation,
  onLocationChange,
  onBoundaryUpdate,
  initialEstimatedAcres,
  onOpenDatabase,
  selectedState = 'Punjab',
  selectedUnit,
  onUnitChange,
  loadedBoundaryFarm,
  onClearLoadedFarm,
  activeHeatmapMode,
  onModeChange,
  targetMandi,
  onClearTargetMandi,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const canvasLayerRef = useRef<HTMLCanvasElement | null>(null);
  const pinsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<
    Map<
      string,
      {
        marker: L.Marker;
        id: string | number;
        lat: number;
        lng: number;
        confirmed: boolean;
        number: number;
      }
    >
  >(new Map());
  const structurePolygonsRef = useRef<L.Polygon[]>([]);
  const liveBaseMarkerRef = useRef<L.Marker | null>(null);
  const liveBaseCircleRef = useRef<L.Circle | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const mandiMarkerRef = useRef<L.Marker | null>(null);
  const mandiRouteRef = useRef<L.Polyline | null>(null);
  const onBoundaryUpdateRef = useRef(onBoundaryUpdate);
  const lastBoundaryStatsKeyRef = useRef<string>('');
  const drawHeatmapCanvasRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onBoundaryUpdateRef.current = onBoundaryUpdate;
  }, [onBoundaryUpdate]);

  const { t, language } = useLanguage();

  // Initialize points from loaded farm, localStorage, cached farms, or empty
  const [points, setPoints] = useState<BoundaryPoint[]>(() => {
    if (loadedBoundaryFarm && loadedBoundaryFarm.points && loadedBoundaryFarm.points.length >= 3) {
      return loadedBoundaryFarm.points.map((p, idx) => ({ ...p, id: idx + 1 }));
    }
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.points && Array.isArray(parsed.points) && parsed.points.length >= 3) {
          return parsed.points.map((p: any, idx: number) => ({
            lat: p.lat,
            lng: p.lng,
            id: idx + 1,
          }));
        }
      }
      const cached = getCachedFarms();
      if (cached.length > 0 && cached[0].points && cached[0].points.length >= 3) {
        return cached[0].points.map((p, idx) => ({ ...p, id: idx + 1 }));
      }
    } catch {}
    return [];
  });

  const [isBoundaryConfirmed, setIsBoundaryConfirmed] = useState<boolean>(() => {
    if (loadedBoundaryFarm && loadedBoundaryFarm.points && loadedBoundaryFarm.points.length >= 3) {
      return true;
    }
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.points && Array.isArray(parsed.points) && parsed.points.length >= 3) {
          return true;
        }
      }
      const cached = getCachedFarms();
      if (cached.length > 0 && cached[0].points && cached[0].points.length >= 3) {
        return true;
      }
    } catch {}
    return false;
  });

  const pointsRef = useRef<BoundaryPoint[]>(points);
  const isConfirmedRef = useRef<boolean>(isBoundaryConfirmed);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    isConfirmedRef.current = isBoundaryConfirmed;
  }, [isBoundaryConfirmed]);

  // Geodesic area calculation from boundary pin coordinates
  const confirmedAreaSqm = useMemo(() => {
    if (points.length >= 3) {
      return calculatePolygonAreaSqm(points);
    }
    return 0;
  }, [points]);

  const confirmedAreaAcres = useMemo(() => {
    if (confirmedAreaSqm > 0) {
      return Number((confirmedAreaSqm / 4046.8564).toFixed(2));
    }
    return 0;
  }, [confirmedAreaSqm]);
  const [heatmapMode, setHeatmapModeState] = useState<HeatmapMode>(activeHeatmapMode || 'ndre');

  const setHeatmapMode = useCallback((mode: HeatmapMode) => {
    setHeatmapModeState(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  }, [onModeChange]);

  useEffect(() => {
    if (activeHeatmapMode && activeHeatmapMode !== heatmapMode) {
      setHeatmapModeState(activeHeatmapMode);
    }
  }, [activeHeatmapMode, heatmapMode]);
  const [estimatedAreaAcres, setEstimatedAreaAcres] = useState<number>(initialEstimatedAcres || 2.0);
  const [showAreaModal, setShowAreaModal] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [basemapType, setBasemapType] = useState<BasemapType>('google-hybrid');
  const [structureTrackingEnabled, setStructureTrackingEnabled] = useState<boolean>(true);
  const [fieldViewMode, setFieldViewMode] = useState<FieldViewMode>('default');
  const [activeHealthFilter, setActiveHealthFilter] = useState<HealthFilter>('all');
  const { coords: sharedCoords, retryLocation: refreshLocation } = useLocation();
  const [stats, setStats] = useState<HeatmapStats | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveUserGps, setLiveUserGps] = useState<LatLng | null>(null);

  const [isTilesLoading, setIsTilesLoading] = useState<boolean>(true);

  const stateGroup = useMemo(() => {
    return getStateUnitsGroup((selectedState as IndianState) || 'Punjab');
  }, [selectedState]);

  const activeUnit: LandUnit = useMemo(() => {
    if (selectedUnit) {
      return selectedUnit;
    }
    const found = stateGroup.units.find((u) => u.id === stateGroup.primaryUnit);
    return found || stateGroup.units[0];
  }, [selectedUnit, stateGroup]);


  useEffect(() => {
    if (targetMandi) {
      showToast(`Navigating to ${targetMandi.name} (~${targetMandi.distanceKm || 'nearest'} km)`);
    }
  }, [targetMandi]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Safe helper to remove Leaflet layers without throwing if map is null, already removed, or detached
  const safeRemoveLayer = useCallback((layer: L.Layer | null | undefined, customMap?: L.Map | null) => {
    if (!layer) return;
    try {
      const activeMap = customMap || mapInstanceRef.current || (layer as any)._map;
      if (activeMap && typeof activeMap.hasLayer === 'function') {
        if (activeMap.hasLayer(layer)) {
          activeMap.removeLayer(layer);
        }
      } else if (typeof (layer as any).remove === 'function') {
        (layer as any).remove();
      }
    } catch (e) {
      // Gracefully ignore layer removal errors on detached/unmounted maps
    }
  }, []);

  const handleSelectViewMode = (mode: FieldViewMode) => {
    if (!isBoundaryConfirmed) {
      showToast('Please click "Confirm Boundary" first to enable Field View Modes.');
      return;
    }
    setFieldViewMode(mode);
    switch (mode) {
      case 'default':
        setActiveHealthFilter('all');
        showToast('View Mode: DEFAULT (ALL), Collective Heatmap & Structure Overlays');
        break;
      case 'healthy_only':
        setActiveHealthFilter('healthy');
        showToast('View Mode: Healthy ONLY (Green), Red/Yellow pixels 100% transparent');
        break;
      case 'moderate_only':
        setActiveHealthFilter('moderate');
        showToast('View Mode: Moderate Stress ONLY (Yellow), Red/Green pixels 100% transparent');
        break;
      case 'severe_only':
        setActiveHealthFilter('severe');
        showToast('View Mode: Severe Stress ONLY (Red), Yellow/Green pixels 100% transparent');
        break;
      case 'structures_only':
        setActiveHealthFilter('structures');
        showToast('View Mode: Structures ONLY (Cleared Field), 0% Heatmap Opacity, Highlighted Footprints');
        break;
      case 'empty_field':
        setActiveHealthFilter('all');
        showToast('View Mode: Empty Field, All overlays hidden, pure base map imagery');
        break;
    }
  };

  const toggleHealthFilter = (filter: HealthFilter) => {
    if (!isBoundaryConfirmed) {
      showToast('Please click "Confirm Boundary" first to enable Field View Modes.');
      return;
    }
    if (filter === 'healthy') {
      handleSelectViewMode(fieldViewMode === 'healthy_only' ? 'default' : 'healthy_only');
    } else if (filter === 'moderate') {
      handleSelectViewMode(fieldViewMode === 'moderate_only' ? 'default' : 'moderate_only');
    } else if (filter === 'severe') {
      handleSelectViewMode(fieldViewMode === 'severe_only' ? 'default' : 'severe_only');
    } else if (filter === 'structures') {
      handleSelectViewMode(fieldViewMode === 'structures_only' ? 'default' : 'structures_only');
    } else {
      handleSelectViewMode('default');
    }
  };

  // Synchronize initial preset points on first mount or reset
  const initDefaultPoints = useCallback(
    (center: LatLng, acres: number) => {
      const generated = generateFieldPolygonAroundPoint(center, acres);
      const formatted: BoundaryPoint[] = generated.map((p, idx) => ({
        ...p,
        id: `preset-${idx + 1}-${Date.now()}`,
      }));
      setPoints(formatted);
      setIsBoundaryConfirmed(true);
    },
    []
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = (sharedCoords && Number.isFinite(sharedCoords.lat)) ? sharedCoords.lat : currentLocation.lat;
    const initialLng = (sharedCoords && Number.isFinite(sharedCoords.lng)) ? sharedCoords.lng : currentLocation.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 17,
      minZoom: 4,
      maxZoom: 22,
      zoomControl: true,
      attributionControl: false,
      doubleClickZoom: false, // Ensure no double-click zoom interference
    });

    map.setView([initialLat, initialLng], 17);

    console.info('ℹ️ Krishi Mitra Map Engine: High-resolution satellite basemap active (Google Earth & Esri World Imagery).');

    // 1. High-Resolution Photorealistic Satellite Basemap (Google Earth / Hybrid optical + road vectors)
    const googleHybridLayer = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxZoom: 22,
        maxNativeZoom: 21,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Earth / Airbus / Maxar Technologies',
        crossOrigin: true,
        className: 'google-earth-tile-layer',
      }
    );

    googleHybridLayer.on('tileerror', (e: any) => {
      console.warn('⚠️ Krishi Mitra: Google Hybrid tile load issue at coords:', e?.coords);
    });

    // 2. Esri World Imagery (High-Resolution Satellite - Free, Crisp worldwide optical)
    const esriLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 22,
        maxNativeZoom: 19,
        attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS',
        crossOrigin: true,
      }
    );

    esriLayer.on('tileerror', (e: any) => {
      console.warn('⚠️ Krishi Mitra: Esri satellite tile load issue at coords:', e?.coords);
    });

    // 3. Street / Standard OSM layer
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 22,
        maxNativeZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '© OpenStreetMap Contributors',
        crossOrigin: true,
      }
    );

    streetLayer.on('tileerror', (e: any) => {
      console.warn('⚠️ Krishi Mitra: OpenStreetMap tile load issue at coords:', e?.coords);
    });

    // Hook tile loading states to smoothly show MapTileSkeleton
    const handleTileLoading = () => setIsTilesLoading(true);
    const handleTileLoad = () => setIsTilesLoading(false);

    googleHybridLayer.on('loading', handleTileLoading);
    googleHybridLayer.on('load', handleTileLoad);
    esriLayer.on('loading', handleTileLoading);
    esriLayer.on('load', handleTileLoad);
    streetLayer.on('loading', handleTileLoading);
    streetLayer.on('load', handleTileLoad);

    // Add High-Resolution Satellite Hybrid as the default active layer
    googleHybridLayer.addTo(map);
    (map as any)._googleHybridLayer = googleHybridLayer;
    (map as any)._esriLayer = esriLayer;
    (map as any)._googleSatelliteLayer = esriLayer;
    (map as any)._streetLayer = streetLayer;

    // Custom Canvas Overlay for Clamped Heatmap Rendering
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';
    map.getPanes().overlayPane.appendChild(canvas);
    canvasLayerRef.current = canvas;

    // Persistent LayerGroup for Pins: created once and only ever added to during session
    const pinsLayerGroup = L.layerGroup().addTo(map);
    pinsLayerGroupRef.current = pinsLayerGroup;

    mapInstanceRef.current = map;

    // Call invalidateSize immediately and on subsequent render ticks
    map.whenReady(() => {
      map.invalidateSize();
      drawHeatmapCanvasRef.current?.();
    });

    requestAnimationFrame(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    const timer1 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        drawHeatmapCanvasRef.current?.();
      }
    }, 100);

    const timer2 = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        drawHeatmapCanvasRef.current?.();
      }
    }, 400);

    // ResizeObserver for layout resizing
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          drawHeatmapCanvasRef.current?.();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const handleWindowResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        drawHeatmapCanvasRef.current?.();
      }
    };
    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('bhootech:invalidate-map', handleWindowResize);

    // Single Click handler for placing numbered boundary pins
    map.on('click', (e: L.LeafletMouseEvent) => {
      const pinId = `pin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newPoint: BoundaryPoint = {
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
        id: pinId,
      };
      setPoints((prev) => [...prev, newPoint]);
      setIsBoundaryConfirmed(false);
    });

    // Initial default points: ONLY if no existing boundary was loaded from storage or farm
    if (pointsRef.current.length === 0) {
      initDefaultPoints(currentLocation, estimatedAreaAcres);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('bhootech:invalidate-map', handleWindowResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      // Clean up layer references before destroying map
      if (pinsLayerGroupRef.current) {
        pinsLayerGroupRef.current.clearLayers();
        safeRemoveLayer(pinsLayerGroupRef.current, map);
        pinsLayerGroupRef.current = null;
      }
      markersMapRef.current.clear();
      structurePolygonsRef.current.forEach((p) => safeRemoveLayer(p, map));
      structurePolygonsRef.current = [];
      if (polylineRef.current) {
        safeRemoveLayer(polylineRef.current, map);
        polylineRef.current = null;
      }
      if (polygonRef.current) {
        safeRemoveLayer(polygonRef.current, map);
        polygonRef.current = null;
      }
      if (liveBaseMarkerRef.current) {
        safeRemoveLayer(liveBaseMarkerRef.current, map);
        liveBaseMarkerRef.current = null;
      }
      if (liveBaseCircleRef.current) {
        safeRemoveLayer(liveBaseCircleRef.current, map);
        liveBaseCircleRef.current = null;
      }
      if (userGpsMarkerRef.current) {
        safeRemoveLayer(userGpsMarkerRef.current, map);
        userGpsMarkerRef.current = null;
      }
      canvasLayerRef.current = null;
      try {
        map.remove();
      } catch (e) {
        // Ignore map remove errors
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Center and invalidate map when currentLocation prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      map.setView([currentLocation.lat, currentLocation.lng], map.getZoom() || 17);
      map.invalidateSize();
    } catch (e) {
      // Ignore
    }
  }, [currentLocation]);



  // Live base pin option removed completely
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (liveBaseMarkerRef.current) {
      safeRemoveLayer(liveBaseMarkerRef.current, map);
      liveBaseMarkerRef.current = null;
    }
    if (liveBaseCircleRef.current) {
      safeRemoveLayer(liveBaseCircleRef.current, map);
      liveBaseCircleRef.current = null;
    }
  }, []);

  // Render User's Live GPS Pin when pinpointed
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userGpsMarkerRef.current) {
      safeRemoveLayer(userGpsMarkerRef.current, map);
      userGpsMarkerRef.current = null;
    }

    if (!liveUserGps) return;

    const pinHtml = `
      <div class="relative flex items-center justify-center pointer-events-none" style="width: 36px; height: 36px; transform: translate(-50%, -50%);">
        <span class="absolute w-9 h-9 rounded-full bg-blue-500/30 animate-ping"></span>
        <span class="absolute w-6 h-6 rounded-full bg-blue-400/40 animate-pulse"></span>
        <div class="relative w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'user-gps-marker',
      html: pinHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([liveUserGps.lat, liveUserGps.lng], {
      icon,
      zIndexOffset: 1300,
    }).addTo(map);

    marker.bindTooltip(`${t('pinpointLocation')}: ${liveUserGps.lat.toFixed(4)}°N, ${liveUserGps.lng.toFixed(4)}°E`, {
      direction: 'top',
      offset: [0, -14],
    });

    userGpsMarkerRef.current = marker;

    return () => {
      if (userGpsMarkerRef.current) {
        safeRemoveLayer(userGpsMarkerRef.current, map);
        userGpsMarkerRef.current = null;
      }
    };
  }, [liveUserGps, t, safeRemoveLayer]);

  // Render Target Mandi Destination Pin & Animated Route on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mandiMarkerRef.current) {
      safeRemoveLayer(mandiMarkerRef.current, map);
      mandiMarkerRef.current = null;
    }
    if (mandiRouteRef.current) {
      safeRemoveLayer(mandiRouteRef.current, map);
      mandiRouteRef.current = null;
    }

    if (!targetMandi) return;

    const startLoc = points.length > 0
      ? {
          lat: points.reduce((acc, p) => acc + p.lat, 0) / points.length,
          lng: points.reduce((acc, p) => acc + p.lng, 0) / points.length,
        }
      : currentLocation;

    const mandiPinHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 44px; height: 52px; transform: translate(-50%, -100%);">
        <span class="absolute top-[20px] left-[22px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-amber-500/35 animate-ping pointer-events-none"></span>
        <svg class="w-10 h-12 drop-shadow-2xl transition-transform duration-200 transform group-hover:scale-110" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 20.2 10.8 28.9 11.35 29.4C11.72 29.75 12.28 29.75 12.65 29.4C13.2 28.9 24 20.2 24 12C24 5.37 18.63 0 12 0Z" fill="url(#mandiPinGradLeaflet)"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff" />
          <circle cx="12" cy="11" r="3.2" fill="#d97706" />
          <defs>
            <linearGradient id="mandiPinGradLeaflet" x1="0" y1="0" x2="24" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#d97706"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-950/95 text-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-amber-400/80 shadow-md tracking-wider uppercase pointer-events-none flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>MANDI</span>
        </div>
      </div>
    `;

    const mandiIcon = L.divIcon({
      className: 'mandi-destination-pin',
      html: mandiPinHtml,
      iconSize: [44, 52],
      iconAnchor: [22, 52],
      popupAnchor: [0, -48],
    });

    const marker = L.marker([targetMandi.lat, targetMandi.lng], {
      icon: mandiIcon,
      zIndexOffset: 1250,
    }).addTo(map);

    const popupHtml = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; min-width: 220px; padding: 2px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
          <span style="background: #d97706; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px;">
            मंडी गंतव्य
          </span>
          <span style="font-size: 10px; color: #b45309; font-weight: 700;">APMC AUCTION</span>
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 4px;">
          ${targetMandi.name}
        </div>
        ${targetMandi.commodity ? `<div style="font-size: 11px; color: #475569; margin-bottom: 4px;">Crop: <strong>${targetMandi.commodity}</strong></div>` : ''}
        ${targetMandi.modalPrice ? `<div style="font-size: 14px; font-weight: 800; color: #047857; margin-bottom: 4px;">₹${targetMandi.modalPrice} <span style="font-size: 10px; font-weight: normal; color: #64748b;">/ Quintal</span></div>` : ''}
        ${targetMandi.distanceKm ? `<div style="font-size: 11px; color: #64748b;">Direct Distance: ~<strong>${targetMandi.distanceKm} km</strong></div>` : ''}
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: true,
      autoClose: false,
    });

    mandiMarkerRef.current = marker;

    // Animated dashed route polyline from field to mandi
    const routePoly = L.polyline(
      [
        [startLoc.lat, startLoc.lng],
        [targetMandi.lat, targetMandi.lng],
      ],
      {
        color: '#10b981',
        weight: 4,
        dashArray: '8, 8',
        className: 'google-maps-route-trace',
      }
    ).addTo(map);

    mandiRouteRef.current = routePoly;

    // Smoothly fit bounds to show both the farm and the mandi
    try {
      const bounds = L.latLngBounds([
        [startLoc.lat, startLoc.lng],
        [targetMandi.lat, targetMandi.lng],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    } catch (e) {
      // Ignore fitBounds edge case
    }

    return () => {
      if (mandiMarkerRef.current) {
        safeRemoveLayer(mandiMarkerRef.current, map);
        mandiMarkerRef.current = null;
      }
      if (mandiRouteRef.current) {
        safeRemoveLayer(mandiRouteRef.current, map);
        mandiRouteRef.current = null;
      }
    };
  }, [targetMandi, currentLocation, points, safeRemoveLayer]);

  // Update Base Layer
  const toggleMapLayer = (type: BasemapType) => {
    setBasemapType(type);
    const map = mapInstanceRef.current;
    if (!map) return;
    const googleHybrid = (map as any)._googleHybridLayer;
    const esri = (map as any)._esriLayer;
    const street = (map as any)._streetLayer;

    if (googleHybrid) safeRemoveLayer(googleHybrid, map);
    if (esri) safeRemoveLayer(esri, map);
    if (street) safeRemoveLayer(street, map);

    if (type === 'google-hybrid' || type === 'highres') {
      if (googleHybrid) googleHybrid.addTo(map);
    } else if (type === 'google-earth') {
      if (esri) esri.addTo(map);
      else if (googleHybrid) googleHybrid.addTo(map);
    } else if (type === 'street') {
      if (street) street.addTo(map);
    }
    setTimeout(() => {
      map.invalidateSize();
    }, 60);
  };

  // 1. Synchronize Leaflet Boundary Layers (Persistent Pins LayerGroup & Vector Polygon/Polyline)
  // Pins are added to the persistent LayerGroup and never destroyed during session.
  const syncBoundaryLayers = useCallback(() => {
    const map = mapInstanceRef.current;
    const pinsGroup = pinsLayerGroupRef.current;
    if (!map || !pinsGroup) return;

    const latLngs = points.map((p) => [p.lat, p.lng] as [number, number]);

    // Synchronize Numbered Pin Markers with stable unique keys
    const activeKeys = new Set<string>();
    const pinColor = isBoundaryConfirmed ? '#2D5A36' : '#D9922B';

    points.forEach((p, idx) => {
      const pinNumber = idx + 1;
      const key = `pin_${p.id || `${p.lat.toFixed(6)}_${p.lng.toFixed(6)}`}`;
      activeKeys.add(key);

      const existing = markersMapRef.current.get(key);

      const pinHtml = `
        <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${pinColor}; color: #ffffff; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; font-family: system-ui, -apple-system, sans-serif; cursor: pointer; user-select: none;">
          ${pinNumber}
        </div>
      `;

      if (!existing) {
        // Pin not yet rendered -> Create new marker and add to persistent pinsGroup
        const customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: pinHtml,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([p.lat, p.lng], {
          icon: customIcon,
          zIndexOffset: 600 + idx,
        });

        marker.bindTooltip(`Pin ${pinNumber} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`, {
          direction: 'top',
          offset: [0, -12],
        });

        marker.addTo(pinsGroup);
        markersMapRef.current.set(key, {
          marker,
          id: p.id,
          lat: p.lat,
          lng: p.lng,
          confirmed: isBoundaryConfirmed,
          number: pinNumber,
        });
      } else {
        // Pin already rendered -> Update in place without recreating or destroying
        if (existing.lat !== p.lat || existing.lng !== p.lng) {
          existing.marker.setLatLng([p.lat, p.lng]);
          existing.lat = p.lat;
          existing.lng = p.lng;
        }
        if (existing.confirmed !== isBoundaryConfirmed || existing.number !== pinNumber) {
          const customIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: pinHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          existing.marker.setIcon(customIcon);
          existing.marker.setZIndexOffset(600 + idx);
          existing.marker.setTooltipContent(`Pin ${pinNumber} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})`);
          existing.confirmed = isBoundaryConfirmed;
          existing.number = pinNumber;
        }
      }
    });

    // Prune removed pins (e.g. undo or reset)
    for (const [key, item] of markersMapRef.current.entries()) {
      if (!activeKeys.has(key)) {
        pinsGroup.removeLayer(item.marker);
        markersMapRef.current.delete(key);
      }
    }

    // 2. Drafting Polyline vs Confirmed Polygon
    if (!isBoundaryConfirmed) {
      // Remove confirmed polygon if present
      if (polygonRef.current) {
        safeRemoveLayer(polygonRef.current, map);
        polygonRef.current = null;
      }
      // Draw or update unclosed draft polyline
      if (points.length >= 2) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(latLngs);
        } else {
          polylineRef.current = L.polyline(latLngs, {
            color: '#D9922B',
            weight: 3,
            dashArray: '6, 6',
            opacity: 0.9,
          }).addTo(map);
        }
      } else if (polylineRef.current) {
        safeRemoveLayer(polylineRef.current, map);
        polylineRef.current = null;
      }
    } else {
      // Confirmed: Remove draft polyline
      if (polylineRef.current) {
        safeRemoveLayer(polylineRef.current, map);
        polylineRef.current = null;
      }
      // Draw or update confirmed boundary polygon (#2D5A36, 3px, semi-transparent fill)
      if (points.length >= 3) {
        if (polygonRef.current) {
          polygonRef.current.setLatLngs(latLngs);
          if (!map.hasLayer(polygonRef.current)) {
            polygonRef.current.addTo(map);
          }
        } else {
          polygonRef.current = L.polygon(latLngs, {
            color: '#2D5A36',
            weight: 3,
            fillColor: '#2D5A36',
            fillOpacity: 0.22,
            opacity: 1,
            className: 'confirmed-farm-boundary-polygon',
          }).addTo(map);
        }
      } else if (polygonRef.current) {
        safeRemoveLayer(polygonRef.current, map);
        polygonRef.current = null;
      }
    }
  }, [points, isBoundaryConfirmed, safeRemoveLayer]);

  // 2. Render Clamped Canvas Heatmap Overlay & Structure Tracking Polygons
  const drawHeatmapCanvas = useCallback(() => {
    const map = mapInstanceRef.current;
    const canvas = canvasLayerRef.current;
    if (!map || !canvas) return;

    // Resize canvas to match map container
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;
    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, topLeft);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear old structure tracking polygons
    structurePolygonsRef.current.forEach((p) => safeRemoveLayer(p, map));
    structurePolygonsRef.current = [];

    // Only render heatmap & structure analysis when confirmed with >= 3 pins
    if (!isBoundaryConfirmed || points.length < 3) return;

    let healthyCount = 0;
    let moderateCount = 0;
    let severeCount = 0;
    let indexSum = 0;
    let totalCells = 0;

    try {
      // CLAMPED CANVAS HEATMAP OVERLAY USING ctx.clip()
      const containerPoints = points.map((p) => map.latLngToContainerPoint([p.lat, p.lng]));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(containerPoints[0].x, containerPoints[0].y);
      for (let i = 1; i < containerPoints.length; i++) {
        ctx.lineTo(containerPoints[i].x, containerPoints[i].y);
      }
      ctx.closePath();

      // STRICTLY CLAMP RENDERING TO POLYGON BOUNDARY
      ctx.clip();

      // Find pixel bounding box of the polygon
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      containerPoints.forEach((pt) => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });

      const step = 10; // Pixel grid resolution
      const currentDaysAgo = 0;

      for (let x = minX; x <= maxX; x += step) {
        for (let y = minY; y <= maxY; y += step) {
          const u = (x - minX) / Math.max(1, maxX - minX);
          const v = (y - minY) / Math.max(1, maxY - minY);

          const classification = classifySpectralPixel(
            u,
            v,
            points[0].lat,
            points[0].lng,
            heatmapMode,
            currentDaysAgo
          );

          totalCells++;
          indexSum += classification.indexValue;
          if (classification.category === 'healthy') healthyCount++;
          else if (classification.category === 'moderate') moderateCount++;
          else severeCount++;

          const isHealthy = classification.category === 'healthy';
          const isModerate = classification.category === 'moderate';
          const isSevere = classification.category === 'severe_or_nonveg';

          let shouldRenderPixel = false;
          if (fieldViewMode === 'default') {
            shouldRenderPixel = true;
          } else if (fieldViewMode === 'healthy_only') {
            shouldRenderPixel = isHealthy;
          } else if (fieldViewMode === 'moderate_only') {
            shouldRenderPixel = isModerate;
          } else if (fieldViewMode === 'severe_only') {
            shouldRenderPixel = isSevere;
          } else if (fieldViewMode === 'structures_only' || fieldViewMode === 'empty_field') {
            shouldRenderPixel = false;
          }

          if (shouldRenderPixel) {
            ctx.fillStyle = classification.color;
            ctx.fillRect(x, y, step + 0.5, step + 0.5);
          }
        }
      }

      ctx.restore();
    } catch (canvasErr) {
      console.warn('Canvas heatmap rendering warning:', canvasErr);
    }

    // Structure tracking satellite AI layer
    let showStructures = false;
    let isStructuresHighlighted = false;

    if (fieldViewMode === 'default') {
      showStructures = structureTrackingEnabled;
      isStructuresHighlighted = false;
    } else if (fieldViewMode === 'structures_only') {
      showStructures = true;
      isStructuresHighlighted = true;
    } else if (fieldViewMode === 'healthy_only' || fieldViewMode === 'moderate_only' || fieldViewMode === 'severe_only') {
      showStructures = false;
    } else if (fieldViewMode === 'empty_field') {
      showStructures = false;
    }

    if (showStructures) {
      const detectedStructures = detectSimulatedFieldStructures(points, undefined, STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD);

      detectedStructures.forEach((struct) => {
        const structLatLngs = struct.polygon.map((p) => [p.lat, p.lng] as [number, number]);
        const structPolygon = L.polygon(structLatLngs, {
          color: isStructuresHighlighted ? '#111827' : '#374151',
          weight: isStructuresHighlighted ? 3 : 2,
          fillColor: isStructuresHighlighted ? '#4B5563' : '#6B7280',
          fillOpacity: isStructuresHighlighted ? 0.75 : 0.4,
          className: 'structure-tracking-polygon',
        }).addTo(map);

        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 4px; min-width: 230px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; color: #374151; font-size: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px;">
              <span style="display: inline-block; width: 9px; height: 9px; border-radius: 2px; background-color: #6B7280; border: 1px solid #374151;"></span>
              <span>Detected Structure (Satellite AI Analysis)</span>
            </div>
            <div style="font-size: 12px; line-height: 1.6;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="color: #64748b; font-weight: 600;">Object:</span>
                <span style="font-weight: 700; color: #0f172a; font-size: 12px;">New Structure</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="color: #64748b; font-weight: 600;">Detection Confidence:</span>
                <span style="font-weight: 700; color: #047857; background-color: #ecfdf5; padding: 1px 6px; border-radius: 4px; border: 1px solid #a7f3d0; font-size: 12px;">${struct.confidencePct}% (Threshold: ${STRUCTURE_DETECTION_CONFIDENCE_THRESHOLD}%)</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="color: #64748b; font-weight: 600;">Date Detected:</span>
                <span style="font-weight: 700; color: #1e293b; font-size: 12px;">${struct.dateDetectedStr}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
                <span>Footprint Area:</span>
                <span style="font-mono; font-weight: 600; color: #334155;">${struct.areaSqm} m²</span>
              </div>
            </div>
          </div>
        `;

        structPolygon.bindPopup(popupContent, {
          className: 'structure-change-popup',
          autoPan: true,
        });

        structPolygon.on('click', () => {
          structPolygon.openPopup();
        });

        structurePolygonsRef.current.push(structPolygon);
      });
    }

    // Calculate area and statistics
    const areaSqm = calculatePolygonAreaSqm(points);
    const totalAcres = Number((areaSqm / 4046.8564).toFixed(3));
    const totalHectares = Number((areaSqm / 10000).toFixed(3));

    const safeTotal = Math.max(1, totalCells);
    const hPct = Math.round((healthyCount / safeTotal) * 100);
    const mPct = Math.round((moderateCount / safeTotal) * 100);
    const sPct = 100 - hPct - mPct;
    const meanIdx = Number((indexSum / safeTotal).toFixed(2));
    const uniformity = Math.min(99, Math.max(45, Math.round(100 - (mPct * 0.6 + sPct * 1.2))));

    const newStats: HeatmapStats = {
      healthyPct: hPct,
      moderateStressPct: mPct,
      severeNonVegPct: Math.max(0, sPct),
      meanIndex: meanIdx,
      uniformityScore: uniformity,
      mode: heatmapMode,
      totalAreaSqm: areaSqm,
      totalAreaAcres: totalAcres,
      totalAreaHectares: totalHectares,
    };

    const statsKey = `${points.length}_${points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('_')}_${isBoundaryConfirmed}_${heatmapMode}_${areaSqm}`;
    if (lastBoundaryStatsKeyRef.current !== statsKey) {
      lastBoundaryStatsKeyRef.current = statsKey;
      setStats(newStats);
      if (onBoundaryUpdateRef.current) {
        onBoundaryUpdateRef.current(points, areaSqm, newStats);
      }
    }
  }, [points, isBoundaryConfirmed, heatmapMode, structureTrackingEnabled, fieldViewMode, safeRemoveLayer]);

  useEffect(() => {
    drawHeatmapCanvasRef.current = drawHeatmapCanvas;
  }, [drawHeatmapCanvas]);

  // Synchronize boundary layers (markers & polygon) on boundary points/confirmation changes
  useEffect(() => {
    syncBoundaryLayers();
  }, [syncBoundaryLayers]);

  // Redraw canvas heatmap when configuration changes
  useEffect(() => {
    drawHeatmapCanvas();
  }, [drawHeatmapCanvas]);

  // Hook map transform events (pan/zoom/resize) ONLY for canvas redraw.
  // Leaflet automatically handles vector pins & polygons natively, preventing any marker flicker!
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapTransform = () => {
      drawHeatmapCanvasRef.current?.();
    };

    map.on('move', handleMapTransform);
    map.on('zoom', handleMapTransform);
    map.on('viewreset', handleMapTransform);
    map.on('resize', handleMapTransform);

    return () => {
      map.off('move', handleMapTransform);
      map.off('zoom', handleMapTransform);
      map.off('viewreset', handleMapTransform);
      map.off('resize', handleMapTransform);
    };
  }, []);

  // Pinpoint geolocation handler with shared location context
  const handlePinpointLocation = async () => {
    setIsLocating(true);
    showToast('Pinpointing your GPS location...');

    try {
      let targetCoords = sharedCoords;
      if (!targetCoords || !Number.isFinite(targetCoords.lat) || !Number.isFinite(targetCoords.lng)) {
        await refreshLocation();
        targetCoords = sharedCoords;
      }

      if (targetCoords && Number.isFinite(targetCoords.lat) && Number.isFinite(targetCoords.lng)) {
        setIsLocating(false);
        const newLoc: LatLng = {
          lat: Number(targetCoords.lat.toFixed(6)),
          lng: Number(targetCoords.lng.toFixed(6)),
        };
        
        onLocationChange(newLoc);
        setLiveUserGps(newLoc);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 18, {
            duration: 1.2,
          });
        }

        // Generate field boundary at user's location
        initDefaultPoints(newLoc, estimatedAreaAcres);
        showToast(`GPS Pinpointed! (±${targetCoords.accuracy || 5}m accuracy)`);
      } else {
        const loc = await getAccurateUserLocation();
        setIsLocating(false);
        const newLoc: LatLng = { lat: loc.lat, lng: loc.lng };
        
        onLocationChange(newLoc);
        setLiveUserGps(newLoc);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newLoc.lat, newLoc.lng], 18, {
            duration: 1.2,
          });
        }

        initDefaultPoints(newLoc, estimatedAreaAcres);
        showToast(`GPS Pinpointed! (±${loc.accuracy}m accuracy)`);
      }
    } catch (err: any) {
      setIsLocating(false);
      console.warn('Geolocation error:', err);
      showToast('Location access unavailable. Please check device permissions.');
    }
  };

  // Generate field polygon with chosen area
  const handleConfirmAreaAndGenerate = (acres: number) => {
    setEstimatedAreaAcres(acres);
    setShowAreaModal(false);
    initDefaultPoints(currentLocation, acres);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 17);
    }
    showToast(`Generated ~${acres} Acre field boundary around pinpoint.`);
  };

  // Floating 40px Circular Current Location GPS Button handler (Bottom-Right over map)
  const handleCurrentLocationClick = async () => {
    setIsLocating(true);
    try {
      let targetCoords = sharedCoords;
      if (!targetCoords || !Number.isFinite(targetCoords.lat) || !Number.isFinite(targetCoords.lng)) {
        await refreshLocation();
        targetCoords = sharedCoords;
      }
      if (targetCoords && Number.isFinite(targetCoords.lat) && Number.isFinite(targetCoords.lng)) {
        setIsLocating(false);
        const newLoc: LatLng = {
          lat: Number(targetCoords.lat.toFixed(6)),
          lng: Number(targetCoords.lng.toFixed(6)),
        };
        onLocationChange(newLoc);
        setLiveUserGps(newLoc);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([newLoc.lat, newLoc.lng], 18, { duration: 1.2 });

          // Place or update high-visibility current GPS marker
          if (userGpsMarkerRef.current) {
            safeRemoveLayer(userGpsMarkerRef.current, map);
            userGpsMarkerRef.current = null;
          }

          const gpsIcon = L.divIcon({
            className: 'user-current-gps-icon',
            html: `
              <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                <span style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: rgba(45, 90, 54, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
                <span style="position: absolute; top: 6px; left: 6px; width: 20px; height: 20px; border-radius: 50%; background-color: #2D5A36; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.45);"></span>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([newLoc.lat, newLoc.lng], {
            icon: gpsIcon,
            zIndexOffset: 1500,
          }).addTo(map);

          marker.bindTooltip('Your Current GPS Location', {
            direction: 'top',
            offset: [0, -12],
          });

          userGpsMarkerRef.current = marker;
        }

        showToast('Located current GPS position');
      } else {
        setIsLocating(false);
        showToast('Live location coordinates unavailable');
      }
    } catch {
      setIsLocating(false);
      showToast('Live location coordinates unavailable');
    }
  };

  // Confirm Boundary Button: Persists boundary immediately to state & localStorage
  const handleConfirmBoundary = () => {
    if (points.length < 3) {
      showToast('Please tap at least 3 points on the map to form a field boundary.');
      return;
    }

    console.log('📌 [Krishi Mitra] handleConfirmBoundary triggered with valid points:', points);

    // Calculate geodesic area immediately
    const areaSqm = calculatePolygonAreaSqm(points);
    const areaAcres = Number((areaSqm / 4046.8564).toFixed(3));

    // Compute centroid coordinates
    const sumLat = points.reduce((acc, p) => acc + p.lat, 0);
    const sumLng = points.reduce((acc, p) => acc + p.lng, 0);
    const centerCoord: LatLng = {
      lat: Number((sumLat / points.length).toFixed(6)),
      lng: Number((sumLng / points.length).toFixed(6)),
    };

    // Store in localStorage immediately BEFORE any re-render happens to guarantee persistence on reload
    try {
      const boundaryRecord = {
        points,
        areaSqm,
        areaAcres,
        center: centerCoord,
        isConfirmed: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('bhootech_active_farm_boundary', JSON.stringify(boundaryRecord));
      console.log('💾 Stored active farm boundary to localStorage:', boundaryRecord);
    } catch (e) {
      console.warn('Could not save boundary to localStorage:', e);
    }

    setIsBoundaryConfirmed(true);
    setFieldViewMode('default');
    setActiveHealthFilter('all');
    showToast('Field boundary confirmed! Satellite spectral heatmap computed.');

    // Force an immediate sync and canvas redraw
    setTimeout(() => {
      syncBoundaryLayers();
      drawHeatmapCanvasRef.current?.();
    }, 10);
  };

  // Load saved farm boundary if passed from DatabaseModal
  useEffect(() => {
    if (loadedBoundaryFarm && loadedBoundaryFarm.points && loadedBoundaryFarm.points.length >= 3) {
      const pts: BoundaryPoint[] = loadedBoundaryFarm.points.map((p, idx) => ({
        id: `saved-${idx}-${Date.now()}`,
        lat: p.lat,
        lng: p.lng,
      }));
      setPoints(pts);
      setIsBoundaryConfirmed(true);
      setFieldViewMode('default');
      setActiveHealthFilter('all');
      if (loadedBoundaryFarm.areaAcres) {
        setEstimatedAreaAcres(loadedBoundaryFarm.areaAcres);
      }
      if (mapInstanceRef.current) {
        const bounds = L.latLngBounds(loadedBoundaryFarm.points.map((p) => [p.lat, p.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
      }
      showToast(`Loaded field boundary: ${loadedBoundaryFarm.name} (${loadedBoundaryFarm.areaAcres} Acres)`);
    }
  }, [loadedBoundaryFarm]);

  // Undo last point
  const handleUndoPoint = () => {
    if (points.length === 0) return;
    setPoints((prev) => prev.slice(0, prev.length - 1));
    setIsBoundaryConfirmed(false);
    setFieldViewMode('default');
  };

  // Clear all points & remove saved boundary from canvas/state
  const handleClearPoints = () => {
    setPoints([]);
    setIsBoundaryConfirmed(false);
    setFieldViewMode('default');
    setActiveHealthFilter('all');
    setStats(null);
    if (onClearLoadedFarm) {
      onClearLoadedFarm();
    }
    const map = mapInstanceRef.current;
    if (map) {
      if (polygonRef.current) {
        safeRemoveLayer(polygonRef.current, map);
        polygonRef.current = null;
      }
      if (polylineRef.current) {
        safeRemoveLayer(polylineRef.current, map);
        polylineRef.current = null;
      }
      if (pinsLayerGroupRef.current) {
        pinsLayerGroupRef.current.clearLayers();
      }
      markersMapRef.current.clear();
      structurePolygonsRef.current.forEach((p) => safeRemoveLayer(p, map));
      structurePolygonsRef.current = [];
      if (canvasLayerRef.current) {
        const ctx = canvasLayerRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasLayerRef.current.width, canvasLayerRef.current.height);
        }
      }
    }
    showToast('Boundary cleared. Tap the map to place new numbered pins.');
  };



  return (
    <div
      className="relative z-0 flex flex-col h-full bg-[#f6fbf5] rounded-2xl border border-[#e5e9e4] shadow-sm overflow-hidden text-[#181d1a] transition-colors duration-200"
      style={{ isolation: 'isolate' }}
    >
      {/* 1. TOP MAP CONTROL BAR */}
      <div className="p-2.5 sm:p-3 bg-white border-b border-[#E5E0D3]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          {/* Left Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={handlePinpointLocation}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2F5233] hover:bg-[#244027] text-white shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
              title="Locate my current GPS coordinates on satellite map"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? t('connectingSatellite') : t('pinpointLocation')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAreaModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] transition-colors cursor-pointer shadow-xs"
              title={`Field Area in ${activeUnit.name} (${activeUnit.localName || 'Local Unit'})`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#2F5233]" />
              <span>
                {((estimatedAreaAcres * 4046.8564) / activeUnit.sqMeters).toFixed(2)} {activeUnit.name}
                {activeUnit.localName ? ` (${activeUnit.localName})` : ''}
              </span>
            </button>
          </div>

          {/* Right Layer & Heatmap Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Simulated Structure Tracking Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !structureTrackingEnabled;
                setStructureTrackingEnabled(next);
                showToast(next ? 'Structure Tracking layer enabled' : 'Structure Tracking layer hidden');
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                structureTrackingEnabled
                  ? 'bg-[#2F5233] text-white border border-[#2F5233]'
                  : 'bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]'
              }`}
              title="Detected Structure (Satellite AI Analysis) - Commercial Building & Footprint Tracking"
            >
              <Building2 className="w-3.5 h-3.5 text-current" />
              <span>Structure Tracking</span>
              {structureTrackingEnabled && (
                <span className="bg-[#183b1e] text-[10px] px-2 py-0.5 rounded-full text-white font-mono">80%</span>
              )}
            </button>

            {/* Spectral Heatmap Mode (NDRE vs NDWI) */}
            <div className="inline-flex bg-[#FAF8F2] p-0.5 rounded-xl border border-[#E5E0D3]">
              <button
                type="button"
                onClick={() => setHeatmapMode('ndre')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  heatmapMode === 'ndre'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F]'
                }`}
                title="Normalized Difference Red Edge (Chlorophyll Activity)"
              >
                <Trees className="w-3.5 h-3.5" />
                <span>{t('chlorophyllNDRE')}</span>
              </button>
              <button
                type="button"
                onClick={() => setHeatmapMode('ndwi')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  heatmapMode === 'ndwi'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F]'
                }`}
                title="Normalized Difference Water Index (Moisture & Canopy Hydration)"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{t('moistureNDWI')}</span>
              </button>
            </div>

            {/* Satellite / Basemap Selection */}
            <div className="inline-flex bg-[#FAF8F2] p-0.5 rounded-xl border border-[#E5E0D3]">
              <button
                type="button"
                onClick={() => toggleMapLayer('google-hybrid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  basemapType === 'google-hybrid' || basemapType === 'highres'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F]'
                }`}
                title="High-Resolution Satellite Basemap (Google Earth / Esri World Imagery - Optical & Terrain)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Satellite (Spectral)</span>
              </button>
              <button
                type="button"
                onClick={() => toggleMapLayer('street')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  basemapType === 'street'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F]'
                }`}
                title="OpenStreetMap Standard Map"
              >
                <span>{t('mapLayer')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAP CANVAS CONTAINER */}
      <div
        className="relative flex-1 w-full h-full min-h-[480px] sm:min-h-[540px] bg-[#f6fbf5] overflow-hidden z-0"
        style={{ width: '100%', height: '100%', minHeight: '480px', isolation: 'isolate' }}
      >
        <div
          ref={mapContainerRef}
          className="w-full h-full min-h-[480px] sm:min-h-[540px]"
          style={{ width: '100%', height: '100%', minHeight: '480px' }}
        />

        {/* Dynamic Map Tile Skeleton Loader */}
        {isTilesLoading && (
          <MapTileSkeleton
            message="Loading High-Resolution Map Tiles..."
            subMessage="Streaming optical aerial imagery"
          />
        )}

        {/* Target Mandi Active Navigation HUD */}
        {targetMandi && (
          <div className="absolute top-3 left-3 sm:left-4 z-[420] flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-[#E5E0D3] shadow-md text-[#1F2A1F] text-xs max-w-[92vw] sm:max-w-md">
            <div className="w-7 h-7 rounded-lg bg-[#EAF0EB] text-[#2F5233] flex items-center justify-center shrink-0 border border-[#E5E0D3]">
              <Navigation className="w-3.5 h-3.5 text-[#2F5233]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold flex items-center gap-1.5 truncate">
                <span className="truncate">{targetMandi.name}</span>
                {targetMandi.distanceKm && (
                  <span className="text-[#2F5233] font-mono text-[11px] font-semibold shrink-0">
                    (~{targetMandi.distanceKm} km)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#6B7280] flex items-center gap-2">
                {targetMandi.commodity && <span>{targetMandi.commodity}</span>}
                {targetMandi.modalPrice && (
                  <span className="text-[#2F5233] font-bold">₹{targetMandi.modalPrice}/Qtl</span>
                )}
              </div>
            </div>
            {onClearTargetMandi && (
              <button
                type="button"
                onClick={onClearTargetMandi}
                className="p-1 text-[#6B7280] hover:text-[#1F2A1F] rounded-lg hover:bg-[#FAF8F2] transition-colors cursor-pointer shrink-0"
                title="Close Route"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Static In-Canvas Floating Notification */}
        {toastMessage && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[450] px-3.5 py-1.5 rounded-full bg-white text-[#1F2A1F] text-xs font-semibold border border-[#E5E0D3] shadow-md transition-all pointer-events-none">
            {toastMessage}
          </div>
        )}

        {/* Floating 40px Circular Current Location GPS Button (Bottom-Right over map) */}
        <button
          type="button"
          onClick={handleCurrentLocationClick}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-[1000] w-10 h-10 rounded-full bg-white hover:bg-[#FAF8F2] text-[#2D5A36] shadow-md border border-[#E5E0D3] flex items-center justify-center cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          style={{ width: '40px', height: '40px' }}
          title="Locate my current GPS location"
          aria-label="Locate my current position"
        >
          <Crosshair className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 2.5 TOTAL AREA BAR BELOW MAP */}
      <div className="px-3.5 py-2 bg-white border-t border-[#E5E0D3] flex items-center justify-between gap-3 text-xs text-[#1F2A1F] shadow-xs shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[#6B7280]">Total Area:</span>
          <span className="font-bold text-[#2D5A36] text-sm font-mono tracking-tight">
            {confirmedAreaAcres.toFixed(2)} acres
          </span>
          {activeUnit && activeUnit.name !== 'Acre' && confirmedAreaSqm > 0 && (
            <span className="text-[#6B7280] text-[11px] font-medium">
              ({((confirmedAreaSqm) / activeUnit.sqMeters).toFixed(2)} {activeUnit.name}
              {activeUnit.localName ? ` / ${activeUnit.localName}` : ''})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
          {isBoundaryConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAF0EB] text-[#2D5A36] font-semibold border border-[#E5E0D3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A36]"></span>
              Boundary Confirmed ({points.length} Pins)
            </span>
          ) : points.length >= 3 ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] font-medium border border-[#FDE68A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9922B]"></span>
              Ready to Confirm ({points.length} Pins)
            </span>
          ) : (
            <span className="text-[#6B7280]">
              Tap 3+ points on map ({points.length}/3 placed)
            </span>
          )}
        </div>
      </div>

      {/* COMPACT BOUNDARY CONTROLS & COLOR KEY ACTION BAR: Single-Line Horizontal Layout */}
      <div className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white border-t border-[#E5E0D3] flex items-center justify-between gap-1.5 sm:gap-2 z-10 shrink-0 overflow-x-auto no-scrollbar transition-colors">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          {/* Boundary Confirm / Confirmed Badge */}
          {!isBoundaryConfirmed ? (
            <button
              type="button"
              onClick={handleConfirmBoundary}
              disabled={points.length < 3}
              className="bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-xs cursor-pointer disabled:opacity-40 flex items-center gap-1.5 transition-all duration-150 shrink-0 active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5233]" />
              <span>{t('confirmBoundary', { count: points.length })}</span>
            </button>
          ) : (
            <div className="bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <Check className="w-3.5 h-3.5 text-[#2F5233]" />
              <span>{t('boundaryConfirmed')}</span>
            </div>
          )}

          {/* Undo Point */}
          <button
            type="button"
            onClick={handleUndoPoint}
            disabled={points.length === 0}
            className="bg-white hover:bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3] px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-xs cursor-pointer disabled:opacity-30 transition-all duration-150 flex items-center gap-1 shrink-0 active:scale-95 whitespace-nowrap"
            title="Undo last point"
          >
            <Undo2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{t('undo')}</span>
          </button>

          {/* Reset Pins */}
          <button
            type="button"
            onClick={handleClearPoints}
            disabled={points.length === 0}
            className="bg-white hover:bg-[#FDF2F2] text-[#6B7280] hover:text-[#C0392B] border border-[#E5E0D3] hover:border-[#F8B4B4] px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-xs cursor-pointer disabled:opacity-30 transition-all duration-150 flex items-center gap-1 shrink-0 active:scale-95 whitespace-nowrap"
            title="Clear all placed points"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>{t('resetPins')}</span>
          </button>

          {/* Compact Inline Vegetation / Moisture Color Indicators */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] text-xs font-medium text-[#6B7280] shrink-0 whitespace-nowrap shadow-xs">
            {heatmapMode === 'ndre' ? (
              <>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('healthy')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'healthy'
                      ? 'bg-white text-[#1F2A1F] border border-[#2F5233] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Healthy NDRE pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2F5233] shadow-xs"></span>
                  <span>Healthy</span>
                </button>
                <span className="text-[#E5E0D3]">|</span>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('moderate')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'moderate'
                      ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Moderate Stress pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6B7280] shadow-xs"></span>
                  <span>Mod. Stress</span>
                </button>
                <span className="text-[#E5E0D3]">|</span>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('severe')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'severe'
                      ? 'bg-white text-[#C0392B] border border-[#F8B4B4] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Severe / Non-Veg pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C0392B] shadow-xs"></span>
                  <span>Severe</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('healthy')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'healthy'
                      ? 'bg-white text-[#1F2A1F] border border-[#2F5233] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Well Irrigated pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#2F5233] shadow-xs"></span>
                  <span>Well Irrigated</span>
                </button>
                <span className="text-[#E5E0D3]">|</span>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('moderate')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'moderate'
                      ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Mild Stress pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#6B7280] shadow-xs"></span>
                  <span>Mild Stress</span>
                </button>
                <span className="text-[#E5E0D3]">|</span>
                <button
                  type="button"
                  onClick={() => toggleHealthFilter('severe')}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    activeHealthFilter === 'severe'
                      ? 'bg-white text-[#C0392B] border border-[#F8B4B4] font-bold shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
                  }`}
                  title="Filter map: show ONLY Water Deficient pixels (Click again to show all)"
                >
                  <span className="w-2 h-2 rounded-full bg-[#C0392B] shadow-xs"></span>
                  <span>Water Deficient</span>
                </button>
              </>
            )}

            {/* Structure Tracking Legend Entry */}
            <span className="text-[#E5E0D3]">|</span>
            <button
              type="button"
              onClick={() => toggleHealthFilter('structures')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-all duration-150 cursor-pointer ${
                activeHealthFilter === 'structures'
                  ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] font-bold shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white'
              }`}
              title="Filter map: highlight Detected Structure Footprints (Click again to show all)"
            >
              <span className="w-2 h-2 rounded-xs bg-[#FAF8F2] border border-[#E5E0D3] shadow-xs inline-block"></span>
              <span>Detected Structure</span>
            </button>

            {/* Clear Filter / Show All Button when active */}
            {activeHealthFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveHealthFilter('all')}
                className="ml-1 text-[10px] bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] px-1.5 py-0.5 rounded-md font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 border border-[#E5E0D3]"
                title="Reset filter and display all health zones"
              >
                <span>Clear All</span>
              </button>
            )}
          </div>

          {/* Save to Database Button (The single primary green accent!) */}
          {onOpenDatabase && (
            <button
              type="button"
              onClick={onOpenDatabase}
              className="bg-[#2F5233] hover:bg-[#244027] text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap active:scale-95"
              title="Save farm boundary and crop health records to Database"
            >
              <Database className="w-3.5 h-3.5 text-white" />
              <span>Save to Database</span>
            </button>
          )}
        </div>

        {/* Right side: GPS Pins Placed Counter */}
        <div className="text-[10px] text-[#6B7280] font-mono flex items-center gap-1.5 shrink-0 whitespace-nowrap pl-1 hidden sm:flex bg-[#FAF8F2] px-2 py-0.5 rounded-full border border-[#E5E0D3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F5233]"></span>
          <span>{points.length} Pins</span>
        </div>
      </div>

      {/* 3. FIELD VIEW MODE SELECTOR (ACTIVE ONLY AFTER CONFIRM BOUNDARY) */}
      <div
        className={`px-3 py-2 bg-white border-t border-[#E5E0D3] transition-all ${
          !isBoundaryConfirmed ? 'opacity-65 bg-[#FAF8F2]' : ''
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Left: Label & Confirmation Status Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2A1F]">
              <LayersIcon className="w-3.5 h-3.5 text-[#2F5233] shrink-0" />
              <span className="text-[#1F2A1F] font-bold">Select View Mode:</span>
            </div>

            {isBoundaryConfirmed ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3]">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#2F5233]" />
                Active
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]"
                title="Click 'Confirm Boundary' first to enable isolation modes"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-[#6B7280]" />
                Confirm Boundary to Enable
              </span>
            )}
          </div>

          {/* Center & Right: Universal Dropdown + Segmented Buttons Group */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Quick Dropdown (Always accessible for all screen sizes) */}
            <div className="relative">
              <select
                id="field-view-mode-dropdown"
                disabled={!isBoundaryConfirmed}
                value={fieldViewMode}
                onChange={(e) => handleSelectViewMode(e.target.value as FieldViewMode)}
                className={`text-xs font-bold rounded-xl px-2.5 py-1 outline-none transition-all cursor-pointer border shadow-xs ${
                  isBoundaryConfirmed
                    ? 'bg-white text-[#1F2A1F] border-[#E5E0D3] hover:border-[#2F5233] focus:ring-1 focus:ring-[#2F5233]'
                    : 'bg-[#FAF8F2] text-[#6B7280] border-[#E5E0D3] cursor-not-allowed'
                }`}
                title={isBoundaryConfirmed ? 'Select Field View Mode' : 'Please confirm boundary first'}
              >
                <option value="default">DEFAULT (ALL), Collective Heatmap & Structures</option>
                <option value="healthy_only">Healthy ONLY, Vigorous Canopy Pixels</option>
                <option value="moderate_only">Moderate Stress ONLY, Mild Stress Pixels</option>
                <option value="severe_only">Severe Stress ONLY, Critical Deficit Pixels</option>
                <option value="structures_only">Structures ONLY, Satellite AI</option>
                <option value="empty_field">Empty Field, Pure Base Map Only</option>
              </select>
            </div>

            {/* Segmented Radio Button Group for 1-Click Isolation */}
            <div className="hidden xl:flex items-center gap-1 bg-[#FAF8F2] p-0.5 rounded-xl border border-[#E5E0D3] shadow-xs">
              {/* DEFAULT (ALL) */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('default')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'default'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="DEFAULT (ALL): Collective NDRE heatmap including red, yellow, and green zones, plus grey structure polygons"
              >
                <span className="w-2 h-2 rounded-full bg-current inline-block"></span>
                <span>DEFAULT (ALL)</span>
              </button>

              {/* Healthy ONLY */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('healthy_only')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'healthy_only'
                    ? 'bg-[#2F5233] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="Healthy ONLY: Render ONLY healthy pixels within boundary"
              >
                <span className="w-2 h-2 rounded-full bg-current inline-block"></span>
                <span>Healthy ONLY</span>
              </button>

              {/* Moderate Stress ONLY */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('moderate_only')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'moderate_only'
                    ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="Moderate Stress ONLY: Render ONLY moderate stress pixels"
              >
                <span className="w-2 h-2 rounded-full bg-[#6B7280] inline-block shadow-xs"></span>
                <span>Mod. Stress ONLY</span>
              </button>

              {/* Severe Stress ONLY */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('severe_only')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'severe_only'
                    ? 'bg-[#FDF2F2] text-[#C0392B] border border-[#F8B4B4] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="Severe Stress ONLY: Render ONLY severe stress pixels"
              >
                <span className="w-2 h-2 rounded-full bg-[#C0392B] inline-block shadow-xs"></span>
                <span>Severe ONLY</span>
              </button>

              {/* Structures ONLY */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('structures_only')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'structures_only'
                    ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="Structures ONLY: 0% heatmap opacity to reveal base map, structure polygons highlighted"
              >
                <span className="w-2 h-2 rounded-xs bg-[#FAF8F2] border border-[#E5E0D3] inline-block"></span>
                <span>Structures ONLY</span>
              </button>

              {/* Empty Field */}
              <button
                type="button"
                disabled={!isBoundaryConfirmed}
                onClick={() => handleSelectViewMode('empty_field')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isBoundaryConfirmed
                    ? 'opacity-40 cursor-not-allowed text-[#6B7280]'
                    : fieldViewMode === 'empty_field'
                    ? 'bg-white text-[#1F2A1F] border border-[#E5E0D3] shadow-xs'
                    : 'text-[#6B7280] hover:text-[#1F2A1F] hover:bg-white cursor-pointer'
                }`}
                title="Empty Field: Hide all overlays to show pure base map imagery inside boundary"
              >
                <Globe className="w-3 h-3 text-[#6B7280]" />
                <span>Empty Field</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Field Area Dialog Modal */}
      {showAreaModal && (
        <div className="fixed inset-0 z-[3000] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FBFAF5] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] border border-[#E6E1D3] max-w-md w-full p-5 space-y-4 text-[#1E2B1F]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E5E0D3]">
              <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#2F5233] flex items-center justify-center border border-[#E5E0D3]">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1F2A1F]">{t('estimatedFieldArea')}</h4>
                <p className="text-xs text-[#6B7280]">
                  {selectedState} • {activeUnit.name} {activeUnit.localName ? `(${activeUnit.localName})` : ''}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed">
              {t('estimatedFieldAreaDesc')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {[
                { acres: 1.0 },
                { acres: 2.0 },
                { acres: 3.5 },
                { acres: 5.0 },
              ].map((opt) => {
                const localVal = ((opt.acres * 4046.8564) / activeUnit.sqMeters).toFixed(2);
                return (
                  <button
                    key={opt.acres}
                    type="button"
                    onClick={() => handleConfirmAreaAndGenerate(opt.acres)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      estimatedAreaAcres === opt.acres
                        ? 'border-[#2F5233] bg-[#EAF0EB] text-[#1F2A1F] font-bold ring-2 ring-[#2F5233]/20 shadow-xs'
                        : 'border-[#E5E0D3] hover:bg-[#FAF8F2] text-[#1F2A1F]'
                    }`}
                  >
                    <span className="text-sm font-bold block text-[#1F2A1F]">
                      {localVal} {activeUnit.name}
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      {opt.acres} {t('acres')} • {Math.round(opt.acres * 4046.8564).toLocaleString()} m²
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E0D3]">
              <button
                type="button"
                onClick={() => setShowAreaModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#1F2A1F] hover:bg-[#FAF8F2] rounded-xl transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAreaAndGenerate(estimatedAreaAcres)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#2F5233] hover:bg-[#244027] rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('confirmAndMap')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapBoundaryHeatmap;
