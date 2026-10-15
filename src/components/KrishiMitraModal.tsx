import React from 'react';
import {
  X,
  MapPin,
  Sprout,
  Plus,
  Activity,
  ArrowRight,
  ShieldAlert,
  Compass,
} from 'lucide-react';
import { WeatherData, HeatmapStats, LatLng, LandUnit, IndianState } from '../types';
import { UserProfile, SavedFarm, getCachedFarms } from '../services/dbApi';
import { AIAdvisory } from './AIAdvisory';
import { MandiMarketQuote } from '../types/hyperLocalAdvisory';
import { BrandLogo } from './BrandLogo';
import { useLocation } from '../context/LocationContext';

interface KrishiMitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFarm?: SavedFarm | null;
  hasSavedFarms?: boolean;
  boundaryPoints?: LatLng[];
  weather: WeatherData | null;
  heatmapStats: HeatmapStats | null;
  selectedState: IndianState;
  fieldAreaAcres: number;
  currentLocation: LatLng;
  activeUser: UserProfile | null;
  selectedUnit: LandUnit;
  onNavigateToMandi?: (mandi: MandiMarketQuote) => void;
  onGoToAddFarm?: () => void;
  onRunAnalysis?: () => void;
}

export const KrishiMitraModal: React.FC<KrishiMitraModalProps> = ({
  isOpen,
  onClose,
  selectedFarm,
  hasSavedFarms,
  boundaryPoints,
  weather,
  heatmapStats,
  selectedState,
  fieldAreaAcres,
  currentLocation,
  activeUser,
  selectedUnit,
  onNavigateToMandi,
  onGoToAddFarm,
  onRunAnalysis,
}) => {
  if (!isOpen) return null;

  // 1. Check if a farm exists / is selected
  const cachedFarms = getCachedFarms();
  const activeFarm = selectedFarm || (cachedFarms.length > 0 ? cachedFarms[0] : null);
  const hasBoundaryPoints = Boolean(boundaryPoints && boundaryPoints.length >= 3);
  const hasFarm = Boolean(activeFarm || hasBoundaryPoints || hasSavedFarms);

  // 2. Check if analysis / health data has been computed for the farm
  const hasAnalysis = Boolean(
    (heatmapStats && (heatmapStats.healthyPct != null || heatmapStats.meanIndex != null)) ||
    (activeFarm?.healthScore != null && activeFarm.healthScore > 0)
  );

  const { coords: liveCoords } = useLocation();
  const isCoordsValid = Boolean(currentLocation && Number.isFinite(currentLocation.lat) && Number.isFinite(currentLocation.lng));
  const safeLocation: LatLng = isCoordsValid
    ? currentLocation
    : (activeFarm?.center || (liveCoords && Number.isFinite(liveCoords.lat) && Number.isFinite(liveCoords.lng) ? { lat: liveCoords.lat, lng: liveCoords.lng } : { lat: 0, lng: 0 }));

  const safeAreaAcres = fieldAreaAcres > 0 ? fieldAreaAcres : (activeFarm?.areaAcres || 2.5);
  const safeFarmName = activeFarm?.name || (hasBoundaryPoints ? 'Current Boundary Plot' : 'Your Farm');

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4 bg-black/40 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#f6fbf5] border border-[#e5e9e4] text-[#181d1a] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header - Light Minimalist Agri-Tech Palette */}
        <div className="p-5 sm:p-6 bg-[#f6fbf5] text-[#181d1a] border-b border-[#e5e9e4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" showTagline={false} />
            <div className="h-7 w-px bg-[#e5e9e4] mx-0.5 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-[#183b1e] tracking-tight">
                  Krishi Mitra AI
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c4edc3] text-[#002108] border border-[#a9d1a8]">
                  Advisory Engine
                </span>
              </div>
              <p className="text-xs text-[#727970] font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2f5233]" />
                  {selectedState} ({safeAreaAcres.toFixed(1)} Acres)
                </span>
                <span>•</span>
                <span>
                  {hasFarm
                    ? `Farm: ${safeFarmName}`
                    : 'No Farm Selected'}
                </span>
                <span>•</span>
                <span>
                  GPS: {isCoordsValid ? `${safeLocation.lat.toFixed(4)}°N, ${safeLocation.lng.toFixed(4)}°E` : 'Pending'}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#ffffff] hover:bg-[#ebefea] text-[#727970] hover:text-[#181d1a] border border-[#e5e9e4] flex items-center justify-center transition-colors cursor-pointer"
            title="Close Krishi Mitra"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Precondition Guard Screen or Full AI Advisory */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 bg-[#ffffff]">
          {/* PRECONDITION STATE 1: Zero farms added or selected */}
          {!hasFarm && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#f0f7ef] text-[#2f5233] border border-[#d2e4d0] flex items-center justify-center shadow-xs">
                <Sprout className="w-8 h-8 text-[#2f5233]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-[#183b1e] tracking-tight">
                  Add a farm first to use Krishi Mitra AI
                </h3>
                <p className="text-xs sm:text-sm text-[#727970] leading-relaxed">
                  Krishi Mitra AI provides precision agronomic intelligence, satellite vegetation analysis, and hyper-local mandi pricing tailored specifically to your parcel coordinates and soil profile.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafdf9] border border-[#e5e9e4] text-left text-xs text-[#525950] space-y-1.5 w-full">
                <div className="font-bold text-[#183b1e] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#2f5233]" />
                  What you will get after adding your farm:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#727970]">
                  <li>Live Sentinel-2 NDRE &amp; NDWI canopy chlorophyll score</li>
                  <li>Sovereign NPK split recommendation and tubewell schedule</li>
                  <li>Real GPS Haversine APMC Mandi rates and profit projections</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onGoToAddFarm) {
                      onGoToAddFarm();
                    } else {
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2f5233] hover:bg-[#244027] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Farm</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#ffffff] hover:bg-[#ebefea] text-[#727970] hover:text-[#181d1a] border border-[#e5e9e4] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Return to Map
                </button>
              </div>
            </div>
          )}

          {/* PRECONDITION STATE 2: Farm exists, but no analysis / health data computed yet */}
          {hasFarm && !hasAnalysis && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#fffbeb] text-[#d97706] border border-[#fde68a] flex items-center justify-center shadow-xs">
                <Activity className="w-8 h-8 text-[#d97706]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-[#183b1e] tracking-tight">
                  Run a field analysis first to get AI advisory
                </h3>
                <p className="text-xs sm:text-sm text-[#727970] leading-relaxed">
                  Your farm <strong className="text-[#181d1a]">"{safeFarmName}"</strong> is registered, but satellite spectral and health analysis has not been processed yet. Confirm your parcel boundary to calculate vegetation index and risk score.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafdf9] border border-[#e5e9e4] text-left text-xs text-[#525950] space-y-1.5 w-full">
                <div className="font-bold text-[#183b1e] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#d97706]" />
                  Why field analysis is required:
                </div>
                <p className="text-[11px] text-[#727970] leading-relaxed">
                  Krishi Mitra uses real multi-spectral satellite reflectance to quantify chlorosis, moisture deficits, and soil nitrogen before issuing prescriptive urea and irrigation advice.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onRunAnalysis) {
                      onRunAnalysis();
                    } else {
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2f5233] hover:bg-[#244027] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Run Field Analysis</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#ffffff] hover:bg-[#ebefea] text-[#727970] hover:text-[#181d1a] border border-[#e5e9e4] rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* PRECONDITION STATE 3: Farm AND Analysis Confirmed Present -> Render AI Advisory */}
          {hasFarm && hasAnalysis && (
            <AIAdvisory
              weather={weather}
              heatmapStats={heatmapStats}
              selectedState={selectedState}
              fieldAreaAcres={safeAreaAcres}
              currentLocation={safeLocation}
              activeUser={activeUser}
              selectedUnit={selectedUnit}
              onNavigateToMandi={onNavigateToMandi}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#f6fbf5] border-t border-[#e5e9e4] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#727970] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2f5233] inline-block"></span>
            Deterministic Ensemble &amp; Live ICAR Grounded Engine
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#ffffff] hover:bg-[#ebefea] text-[#181d1a] border border-[#e5e9e4] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Return to Satellite Map
          </button>
        </div>
      </div>
    </div>
  );
};
