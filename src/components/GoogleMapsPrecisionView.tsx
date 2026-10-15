import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Search,
  Crosshair,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Route,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sprout,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LatLng, BoundaryPoint, HeatmapStats, UserLocation, IndianState, LandUnit } from '../types';
import { formatAreaInLocalUnit, getPrimaryUnitForState } from '../data/indianUnits';
import { calculateHaversineDistanceKm } from '../utils/locationLookup';

interface GoogleMapsPrecisionViewProps {
  currentLocation: LatLng;
  boundaryPoints: LatLng[];
  fieldAreaAcres: number;
  fieldAreaSqm: number;
  selectedState: IndianState;
  selectedUnit?: LandUnit;
  savedProfileLocation?: UserLocation | null;
  onLocationChange: (loc: LatLng) => void;
  onCloseGoogleMaps?: () => void;
  targetMandi?: {
    name: string;
    lat: number;
    lng: number;
    distanceKm?: number;
    commodity?: string;
    modalPrice?: number;
  } | null;
}

// Inner helper component for map-level controls and route drawing
interface InnerGoogleMapControlsProps {
  currentLocation: LatLng;
  boundaryPoints: LatLng[];
  fieldAreaAcres: number;
  targetMandi?: {
    name: string;
    lat: number;
    lng: number;
    distanceKm?: number;
    commodity?: string;
    modalPrice?: number;
  } | null;
  onCenterMap: () => void;
  onLocationChange: (loc: LatLng) => void;
}

function InnerGoogleMapControls({
  currentLocation,
  boundaryPoints,
  fieldAreaAcres,
  targetMandi,
  onCenterMap,
  onLocationChange,
}: InnerGoogleMapControlsProps) {
  const map = useMap();
  const mapsCore = useMapsLibrary('core');
  const mapsRoutes = useMapsLibrary('routes');
  const [routePolyline, setRoutePolyline] = useState<google.maps.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distanceText: string;
    durationText: string;
    distanceKm: number;
  } | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);
  const [fieldPolygon, setFieldPolygon] = useState<google.maps.Polygon | null>(null);

  // Sync map center if currentLocation changes externally
  useEffect(() => {
    if (map) {
      map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [map, currentLocation.lat, currentLocation.lng]);

  // Draw or update field boundary polygon on Google Map
  useEffect(() => {
    if (!map) return;

    if (fieldPolygon) {
      fieldPolygon.setMap(null);
    }

    if (boundaryPoints.length >= 3) {
      const poly = new google.maps.Polygon({
        paths: boundaryPoints.map((p) => ({ lat: p.lat, lng: p.lng })),
        strokeColor: '#10b981',
        strokeOpacity: 0.95,
        strokeWeight: 3,
        fillColor: '#059669',
        fillOpacity: 0.35,
        clickable: true,
      });

      poly.setMap(map);
      setFieldPolygon(poly);

      return () => {
        poly.setMap(null);
      };
    }
  }, [map, boundaryPoints]);

  // Calculate route to target Mandi using server proxy (with quota-safe fallbacks)
  useEffect(() => {
    if (!map || !targetMandi) {
      if (routePolyline) {
        routePolyline.setMap(null);
        setRoutePolyline(null);
      }
      setRouteInfo(null);
      return;
    }

    let isCancelled = false;
    setIsCalculatingRoute(true);

    const computeMandiRoute = async () => {
      try {
        const res = await fetch('/api/maps/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: currentLocation,
            destination: { lat: targetMandi.lat, lng: targetMandi.lng },
          }),
        });

        if (res.status === 429) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }

        if (res.ok) {
          const data = await res.json();
          if (isCancelled) return;

          const route = data.routes?.[0];
          if (route) {
            const distanceMeters = route.distanceMeters || 0;
            const durationSeconds = parseInt(route.duration?.replace('s', '') || '0', 10);
            const distKm = Number((distanceMeters / 1000).toFixed(1));
            const durationMins = Math.round(durationSeconds / 60);

            setRouteInfo({
              distanceText: `${distKm} km`,
              durationText: `${durationMins} mins drive`,
              distanceKm: distKm,
            });

            // Decode encoded polyline if present
            if (route.polyline?.encodedPolyline && (google.maps.geometry as any)?.encoding) {
              const decoded = (google.maps.geometry as any).encoding.decodePath(
                route.polyline.encodedPolyline
              );

              if (routePolyline) {
                routePolyline.setMap(null);
              }

              const line = new google.maps.Polyline({
                path: decoded,
                geodesic: true,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.9,
                strokeWeight: 4,
              });
              line.setMap(map);
              setRoutePolyline(line);

              // Fit bounds to show entire route
              const bounds = new google.maps.LatLngBounds();
              decoded.forEach((pt: any) => bounds.extend(pt));
              map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
            }
          }
        } else {
          // Haversine fallback if route API is constrained
          const directKm = calculateHaversineDistanceKm(currentLocation, {
            lat: targetMandi.lat,
            lng: targetMandi.lng,
          });
          setRouteInfo({
            distanceText: `${directKm.toFixed(1)} km direct`,
            durationText: `${Math.round(directKm * 1.8)} mins approx.`,
            distanceKm: directKm,
          });
        }
      } catch (e) {
        console.warn('Google Maps route fetch error:', e);
      } finally {
        if (!isCancelled) {
          setIsCalculatingRoute(false);
        }
      }
    };

    computeMandiRoute();

    return () => {
      isCancelled = true;
    };
  }, [map, targetMandi, currentLocation.lat, currentLocation.lng]);

  return (
    <>
      {routeInfo && targetMandi && (
        <div className="absolute top-16 left-4 z-10 max-w-sm bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-3 shadow-[0_1px_3px_rgba(40,50,35,0.06)] text-[#1E2B1F] text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#E6E1D3] pb-1.5 mb-2">
            <span className="flex items-center gap-1.5 font-bold text-[#2D5A36]">
              <Route className="w-4 h-4 text-[#2D5A36]" />
              <span>Routes to {targetMandi.name}</span>
            </span>
            <span className="text-[10px] bg-[#FAF8F2] text-[#2D5A36] font-mono px-1.5 py-0.5 rounded">
              Google Routes API
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[#1E2B1F] mb-2">
            <div className="bg-[#F7F4EC]/80 p-2 rounded-lg border border-[#E6E1D3]">
              <div className="text-[10px] text-[#6B7266]">Road Distance</div>
              <div className="text-sm font-bold text-[#1E2B1F]">{routeInfo.distanceText}</div>
            </div>
            <div className="bg-[#F7F4EC]/80 p-2 rounded-lg border border-[#E6E1D3]">
              <div className="text-[10px] text-[#6B7266]">Driving ETA</div>
              <div className="text-sm font-bold text-[#2D5A36]">{routeInfo.durationText}</div>
            </div>
          </div>
          {targetMandi.modalPrice && (
            <div className="text-[11px] text-[#6B7266] bg-[#F7F4EC]/60 p-1.5 rounded border border-[#E6E1D3]/80">
              Current APMC Rate: <strong className="text-[#2D5A36]">₹{targetMandi.modalPrice}/Qtl</strong> ({targetMandi.commodity || 'Produce'})
            </div>
          )}
        </div>
      )}
    </>
  );
}

export const GoogleMapsPrecisionView: React.FC<GoogleMapsPrecisionViewProps> = ({
  currentLocation,
  boundaryPoints,
  fieldAreaAcres,
  fieldAreaSqm,
  selectedState,
  selectedUnit,
  savedProfileLocation,
  onLocationChange,
  onCloseGoogleMaps,
  targetMandi,
}) => {
  const apiKey =
    (typeof import.meta !== 'undefined' &&
      ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
        (import.meta as any).env?.GOOGLE_MAPS_API_KEY)) ||
    '';

  const [mapType, setMapType] = useState<google.maps.MapTypeId | 'hybrid' | 'satellite' | 'roadmap' | 'terrain'>('hybrid');
  const [tilt, setTilt] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [activeInfoMarker, setActiveInfoMarker] = useState<string | null>('centroid');

  const effectiveUnit = selectedUnit || getPrimaryUnitForState(selectedState);
  const formattedArea = formatAreaInLocalUnit(fieldAreaAcres, effectiveUnit);

  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchMessage(null);
    try {
      const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(searchQuery + ', India')}`);
      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (res.ok) {
        const data = await res.json();
        const first = data.results?.[0];
        if (first?.geometry?.location) {
          const newLoc: LatLng = {
            lat: first.geometry.location.lat,
            lng: first.geometry.location.lng,
          };
          onLocationChange(newLoc);
          setSearchMessage(`Centered on: ${first.formatted_address}`);
        } else {
          setSearchMessage('Location not found in India. Try district/village name.');
        }
      } else {
        setSearchMessage('Search temporarily unavailable.');
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
      setSearchMessage('Search error.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleTilt = () => {
    setTilt((prev) => (prev === 0 ? 45 : 0));
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col bg-[#F4F1E8] p-3 sm:p-4 overflow-hidden select-none">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
        {/* Left: Engine Mode Badge & Back Button */}
        <div className="flex items-center gap-2">
          {onCloseGoogleMaps && (
            <button
              type="button"
              onClick={onCloseGoogleMaps}
              className="px-3 py-1.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FAF8F2] text-[#1E2B1F] border border-[#E6E1D3] text-xs font-semibold  shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Return to Leaflet Spectral NDRE/NDWI View"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#2D5A36]" />
              <span>Back to Spectral Heatmap</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FBFAF5] text-[#1E2B1F] border border-[#E6E1D3] text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2D5A36] animate-pulse" />
            <span>Google Maps Platform</span>
            <span className="text-[10px] text-[#2D5A36] font-mono">(Photorealistic Hybrid)</span>
          </div>
        </div>

        {/* Center: Places Search Bar */}
        <form
          onSubmit={handleSearchAddress}
          className="relative flex items-center min-w-[240px] max-w-sm flex-1 sm:flex-initial"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search village, tehsil, APMC mandi..."
            className="w-full bg-[#FBFAF5] text-[#2F3A2E] placeholder-[#9A9D92] text-xs rounded-[8px] pl-8 pr-16 py-1.5 border border-[#D9D4C4] focus:outline-none focus:border-[#2D5A36] shadow-xs"
          />
          <Search className="w-3.5 h-3.5 text-[#6B7266] absolute left-2.5 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 px-2.5 py-1 rounded-[8px] bg-[#2D5A36] hover:bg-[#23472A] text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSearching ? '...' : 'Go'}
          </button>
        </form>

        {/* Right: Map Type & 3D Tilt Selector */}
        <div className="flex items-center gap-1.5 bg-[#FBFAF5]  p-1 rounded-xl border border-[#E6E1D3] shadow-lg">
          <button
            type="button"
            onClick={() => setMapType('hybrid')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mapType === 'hybrid' ? 'bg-[#2D5A36] text-white' : 'text-[#1E2B1F] hover:text-white'
            }`}
          >
            Hybrid
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mapType === 'satellite' ? 'bg-[#2D5A36] text-white' : 'text-[#1E2B1F] hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapType('roadmap')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mapType === 'roadmap' ? 'bg-[#2D5A36] text-white' : 'text-[#1E2B1F] hover:text-white'
            }`}
          >
            Roads
          </button>
          <button
            type="button"
            onClick={toggleTilt}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              tilt === 45 ? 'bg-blue-600 text-white' : 'text-[#1E2B1F] hover:text-white'
            }`}
            title="Toggle 45° 3D Camera Tilt"
          >
            <span>3D Tilt</span>
          </button>
        </div>
      </div>

      {/* Search result toast */}
      {searchMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-[#FBFAF5] text-[#2D5A36] text-xs border border-[#E6E1D3] shadow-xl ">
          {searchMessage}
        </div>
      )}

      {/* Main Google Maps Render Canvas */}
      <div className="flex-1 w-full h-full min-h-[480px] rounded-[14px] border border-[#E6E1D3] overflow-hidden shadow-[0_1px_3px_rgba(40,50,35,0.06)]">
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'routes', 'geometry']}>
          <Map
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            defaultZoom={17}
            center={{ lat: currentLocation.lat, lng: currentLocation.lng }}
            mapTypeId={mapType}
            heading={0}
            tilt={tilt}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full min-h-[480px]"
            style={{ width: '100%', height: '100%', minHeight: '480px' }}
          >
            {/* Field Centroid Marker */}
            <AdvancedMarker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title="Krishi Mitra Parcel Centroid"
              onClick={() => setActiveInfoMarker(activeInfoMarker === 'centroid' ? null : 'centroid')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2D5A36] border-2 border-white shadow-xl text-white cursor-pointer hover:scale-110 transition-transform">
                <Sprout className="w-4 h-4 text-white" />
              </div>
            </AdvancedMarker>

            {activeInfoMarker === 'centroid' && (
              <InfoWindow
                position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
                onCloseClick={() => setActiveInfoMarker(null)}
              >
                <div className="text-[#1E2B1F] p-1 text-xs">
                  <div className="font-bold text-[#2D5A36] flex items-center gap-1 mb-1">
                    <Sprout className="w-3.5 h-3.5 text-[#2D5A36]" />
                    <span>Farm Parcel Centroid</span>
                  </div>
                  <div className="text-[#D4CEBF] mb-1">
                    State: <strong>{selectedState}</strong>
                  </div>
                  <div className="text-[#1E2B1F] font-semibold">
                    Area: {fieldAreaAcres.toFixed(2)} Acres ({formattedArea.fullBadgeText})
                  </div>
                  <div className="text-[10px] text-[#727970] font-mono mt-1">
                    {currentLocation && Number.isFinite(currentLocation.lat) && Number.isFinite(currentLocation.lng)
                      ? `${currentLocation.lat.toFixed(5)}°N, ${currentLocation.lng.toFixed(5)}°E`
                      : 'GPS Pending'}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Individual Boundary Points Vertices */}
            {boundaryPoints.map((pt, idx) => (
              <AdvancedMarker
                key={`vertex-${idx}`}
                position={{ lat: pt.lat, lng: pt.lng }}
                title={`Vertex ${idx + 1}`}
              >
                <div className="w-4 h-4 rounded-full bg-[#2D5A36] border border-white shadow-md flex items-center justify-center text-[9px] font-bold text-white">
                  {idx + 1}
                </div>
              </AdvancedMarker>
            ))}

            {/* Farmer Base GPS Profile Pin (if available) */}
            {savedProfileLocation && (
              <AdvancedMarker
                position={{ lat: savedProfileLocation.lat, lng: savedProfileLocation.lng }}
                title="Permanently Linked Kisan Base GPS"
                onClick={() => setActiveInfoMarker('kisan-base')}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2D5A36] border-2 border-white shadow-lg text-white">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )}

            {/* Target Mandi Pin (if target selected) */}
            {targetMandi && (
              <AdvancedMarker
                position={{ lat: targetMandi.lat, lng: targetMandi.lng }}
                title={targetMandi.name}
                onClick={() => setActiveInfoMarker('mandi')}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D9922B] border-2 border-white shadow-md text-white animate-bounce">
                  <Store className="w-4 h-4 text-white" />
                </div>
              </AdvancedMarker>
            )}

            {/* Map-level controller for Polygons & Routes */}
            <InnerGoogleMapControls
              currentLocation={currentLocation}
              boundaryPoints={boundaryPoints}
              fieldAreaAcres={fieldAreaAcres}
              targetMandi={targetMandi}
              onCenterMap={() => onLocationChange(currentLocation)}
              onLocationChange={onLocationChange}
            />
          </Map>
        </APIProvider>
      </div>

      {/* Bottom Summary Floating Footer */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 bg-[#FBFAF5] p-2.5 rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] text-[#1E2B1F] text-xs pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#2D5A36] font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#2D5A36]" />
            <span>Field Area:</span>
            <span className="text-[#1E2B1F]">{fieldAreaAcres.toFixed(2)} Acres</span>
            <span className="text-[#2D5A36] font-mono">({formattedArea.fullBadgeText})</span>
          </div>
          <span className="text-[#D4CEBF]">|</span>
          <div className="text-[#6B7266]">
            Vertices: <strong className="text-[#1E2B1F]">{boundaryPoints.length}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLocationChange({ lat: currentLocation.lat, lng: currentLocation.lng })}
            className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] hover:bg-[#F4F0E6] text-[#1E2B1F] border border-[#E6E1D3] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Center map on field centroid"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#2D5A36]" />
            <span>Recenter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
