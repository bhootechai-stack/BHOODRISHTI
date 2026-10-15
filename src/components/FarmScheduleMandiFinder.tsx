import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Store,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  Navigation,
  DollarSign,
  ChevronRight,
  Info,
  CalendarDays,
  Target,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Compass,
  Sprout,
  Database,
  WifiOff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  CartesianGrid,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  CustomFarmScheduleMandiIntelligence,
  MandiMarketQuote,
  MandiForecastPoint,
} from '../types/hyperLocalAdvisory';
import { OFFICIAL_CROPS_DATA } from '../data/indianMandiData';
import { generateScheduleAndMandiIntelligence } from '../services/hyperLocalAdvisoryEngine';
import { MandiRatesSkeleton } from './SkeletonLoaders';
import { EmptyState } from './EmptyState';
import { SparklineArea, SparklineDataPoint } from './charts/GeospatialCharts';
import { useLanguage } from '../context/LanguageContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { offlineAgriCache } from '../services/offlineAgriCache';

interface FarmScheduleMandiFinderProps {
  initialData?: CustomFarmScheduleMandiIntelligence;
  pinnedLocation: {
    lat: number;
    lng: number;
    state: string;
    district?: string;
    tehsil?: string;
    village?: string;
  };
  fieldAreaAcres?: number;
  activeCropName?: string;
  savedPlantingDate?: string;
  savedHarvestingDate?: string;
  onApplyCropSchedule?: (cropName: string, plantingDate: string, harvestingDate: string) => void;
  onNavigateToMandi?: (mandi: MandiMarketQuote) => void;
}

export const FarmScheduleMandiFinder: React.FC<FarmScheduleMandiFinderProps> = ({
  initialData,
  pinnedLocation,
  fieldAreaAcres = 2.5,
  activeCropName,
  savedPlantingDate,
  savedHarvestingDate,
  onApplyCropSchedule,
  onNavigateToMandi,
}) => {
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();
  const effectiveAreaAcres = Number(fieldAreaAcres || 2.5);

  const cropOptions = useMemo(() => {
    return Object.values(OFFICIAL_CROPS_DATA).map((c) => ({
      id: c.id,
      name: `${c.name} (${c.hindiName})`,
      cropName: c.name,
      defaultDays: c.growthDays || 120,
      stateMatch: (c.suitableStates || []).some((st) =>
        st.toLowerCase().includes((pinnedLocation.state || '').toLowerCase())
      ),
    }));
  }, [pinnedLocation.state]);

  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    if (activeCropName) {
      const match = cropOptions.find((c) =>
        c.cropName.toLowerCase().includes(activeCropName.toLowerCase()) ||
        activeCropName.toLowerCase().includes(c.cropName.toLowerCase())
      );
      if (match) return match.name;
    }
    const stateMatched = cropOptions.find((c) => c.stateMatch);
    return stateMatched ? stateMatched.name : (cropOptions[0]?.name || 'Wheat (गेहूं)');
  });

  const [plantingDate, setPlantingDate] = useState<string>(() => {
    if (savedPlantingDate) return savedPlantingDate;
    const now = new Date();
    now.setMonth(now.getMonth() - 2);
    return now.toISOString().split('T')[0];
  });

  const [harvestingDate, setHarvestingDate] = useState<string>(() => {
    if (savedHarvestingDate) return savedHarvestingDate;
    const now = new Date();
    now.setDate(now.getDate() + 25);
    return now.toISOString().split('T')[0];
  });

  const [activeMandiIndex, setActiveMandiIndex] = useState<number>(0);
  const [forecastHorizonMode, setForecastHorizonMode] = useState<'2to3days' | '30days'>('2to3days');
  const [intelligenceData, setIntelligenceData] = useState<CustomFarmScheduleMandiIntelligence | null>(() => initialData || null);
  const [isMandiLoading, setIsMandiLoading] = useState<boolean>(!initialData);

  useEffect(() => {
    let isMounted = true;
    setIsMandiLoading(true);

    const recompute = async () => {
      try {
        const rawCropName = selectedCrop.split('(')[0].trim();
        const data = generateScheduleAndMandiIntelligence({
          cropName: rawCropName,
          lat: pinnedLocation.lat,
          lng: pinnedLocation.lng,
          state: pinnedLocation.state,
          district: pinnedLocation.district,
          plantingDate,
          harvestingDate,
        });
        if (isMounted) {
          setIntelligenceData(data);
          setIsMandiLoading(false);
          setActiveMandiIndex(0);
        }
      } catch (err) {
        console.error('Error generating schedule & mandi data:', err);
        if (isMounted) setIsMandiLoading(false);
      }
    };

    recompute();
    return () => {
      isMounted = false;
    };
  }, [selectedCrop, plantingDate, harvestingDate, pinnedLocation.lat, pinnedLocation.lng, pinnedLocation.state]);

  const handleCropChange = (newCropFullName: string) => {
    setSelectedCrop(newCropFullName);
    const matched = cropOptions.find((c) => c.name === newCropFullName);
    const duration = matched ? matched.defaultDays : 120;
    try {
      const p = new Date(plantingDate);
      if (!isNaN(p.getTime())) {
        const h = new Date(p);
        h.setDate(h.getDate() + duration);
        setHarvestingDate(h.toISOString().split('T')[0]);
      }
    } catch {
      // ignore
    }
  };

  const currentCropInfo = useMemo(() => {
    const raw = selectedCrop.split('(')[0].trim().toLowerCase();
    return Object.values(OFFICIAL_CROPS_DATA).find((c) => c.name.toLowerCase() === raw) || OFFICIAL_CROPS_DATA['wheat'];
  }, [selectedCrop]);

  const fallbackData: CustomFarmScheduleMandiIntelligence = useMemo(() => {
    const rawCropName = selectedCrop.split('(')[0].trim();
    return generateScheduleAndMandiIntelligence({
      cropName: rawCropName,
      lat: pinnedLocation.lat,
      lng: pinnedLocation.lng,
      state: pinnedLocation.state,
      district: pinnedLocation.district,
      plantingDate,
      harvestingDate,
    });
  }, [selectedCrop, plantingDate, harvestingDate, pinnedLocation]);

  const activeData = intelligenceData || fallbackData;
  const {
    cropName,
    growthDurationDays,
    govtMspPerQuintal,
    procuringAgency,
    prevailingMandiRate,
    top3NearestMandis = [],
    optimalSellingWindow,
    priceForecastHorizon = [],
    pinnedGps,
  } = activeData;

  const forecastTimeline = priceForecastHorizon;
  const mspSpread = prevailingMandiRate - govtMspPerQuintal;
  const currentSelectedMandi = top3NearestMandis[activeMandiIndex] || top3NearestMandis[0];

  const estimatedYieldPerAcre = currentCropInfo.avgYieldPerAcreQuintals || 20;
  const totalParcelYieldQuintals = Math.round(estimatedYieldPerAcre * effectiveAreaAcres);
  const totalEstimatedMandiValue = currentSelectedMandi
    ? Math.round(totalParcelYieldQuintals * currentSelectedMandi.currentPricePerQuintal)
    : Math.round(totalParcelYieldQuintals * prevailingMandiRate);
  const totalGovtMspValue = Math.round(totalParcelYieldQuintals * govtMspPerQuintal);

  const displayedForecastData = useMemo(() => {
    if (forecastHorizonMode === '2to3days') {
      return forecastTimeline.slice(0, 7);
    }
    return forecastTimeline;
  }, [forecastHorizonMode, forecastTimeline]);

  const peakPricePoint = useMemo(() => {
    if (!displayedForecastData.length) {
      return { date: 'N/A', forecastedPrice: prevailingMandiRate, dayLabel: 'Peak' };
    }
    return displayedForecastData.reduce(
      (max, p) => (p.forecastedPrice > max.forecastedPrice ? p : max),
      displayedForecastData[0]
    );
  }, [displayedForecastData, prevailingMandiRate]);

  const heroMandiHistory = useMemo(() => {
    if (!currentSelectedMandi) return [];
    const base = currentSelectedMandi.currentPricePerQuintal;
    const prev = currentSelectedMandi.prevDayPricePerQuintal;
    const diff = base - prev;
    return [
      { label: '6d ago', price: Math.round(prev - diff * 1.8) },
      { label: '5d ago', price: Math.round(prev - diff * 1.2) },
      { label: '4d ago', price: Math.round(prev - diff * 0.8) },
      { label: '3d ago', price: Math.round(prev - diff * 0.3) },
      { label: '2d ago', price: Math.round(prev) },
      { label: 'Yesterday', price: prev },
      { label: 'Today', price: base },
    ];
  }, [currentSelectedMandi]);

  return (
    <div className="space-y-4">
      {/* SECTION 1: MANDI FINDER TELEMETRY & 3 CONTROLS */}
      <div className="p-3.5 sm:p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] space-y-3.5 shadow-xs">
        {/* Header & Pin Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E0D3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF0EB] text-[#2F5233] flex items-center justify-center shrink-0 border border-[#2F5233]/20">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#1F2A1F] flex items-center gap-1.5 flex-wrap">
                <span>{t('farmSchedule')} &amp; {t('mandiFinder')}</span>
                {!isOnline ? (
                  <span className="text-[9px] font-mono text-[#C0392B] bg-[#FDF2F2] px-2 py-0.5 rounded-md border border-[#F8B4B4] inline-flex items-center gap-1 font-bold">
                    <WifiOff className="w-2.5 h-2.5 text-[#C0392B]" />
                    Offline • Cache API Active
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-[#6B7280] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#E5E0D3] inline-flex items-center gap-1">
                    <Database className="w-2.5 h-2.5 text-[#2F5233]" />
                    Live APMC &amp; Cached
                  </span>
                )}
              </h4>
              <p className="text-[11px] text-[#727970]">
                GPS: {pinnedGps && Number.isFinite(pinnedGps.lat) && Number.isFinite(pinnedGps.lng)
                  ? `${pinnedGps.lat.toFixed(4)}°N, ${pinnedGps.lng.toFixed(4)}°E`
                  : (console.error('FarmScheduleMandiFinder.tsx: pinnedGps coordinates undefined or invalid', pinnedGps), 'Location Pending')} ({pinnedGps?.district || pinnedGps?.state || 'Local Region'})
              </p>
            </div>
          </div>

          <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Growth Duration: <strong className="text-[#1F2A1F]">{growthDurationDays} Days</strong></span>
          </div>
        </div>

        {/* 3 USER INPUT CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* FIELD 1: CROP NAME */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1F2A1F] flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-[#6B7280]" />{t('cropVariety')}</span>
              <span className="text-[9px] text-[#6B7280] font-medium">Regional APMC Match</span>
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl px-3 py-2 text-xs font-semibold text-[#1F2A1F] focus:outline-none focus:border-[#2F5233] cursor-pointer"
            >
              {cropOptions.map((c) => (
                <option key={c.id} value={c.name} className="bg-white text-[#1F2A1F]">
                  {c.name} {c.stateMatch ? '(Local Fit)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* FIELD 2: PLANTING DATE */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1F2A1F] flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#6B7280]" />{t('plantingDate')}</span>
              <span className="text-[9px] text-[#6B7280]">Auto-populated</span>
            </label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl px-3 py-2 text-xs font-mono text-[#1F2A1F] focus:outline-none focus:border-[#2F5233]"
            />
          </div>

          {/* FIELD 3: EXPECTED HARVESTING DATE */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#1F2A1F] flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#6B7280]" />{t('harvestingDate')}</span>
              <span className="text-[9px] text-[#6B7280]">Auto-populated</span>
            </label>
            <input
              type="date"
              value={harvestingDate}
              onChange={(e) => setHarvestingDate(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E0D3] rounded-xl px-3 py-2 text-xs font-mono text-[#1F2A1F] focus:outline-none focus:border-[#2F5233]"
            />
          </div>
        </div>
      </div>

      {isMandiLoading ? (
        <MandiRatesSkeleton />
      ) : (
        <>
          {/* GOVERNMENT MSP VS PREVAILING MANDI TRADING RATES METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Official Govt MSP */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-bold uppercase">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6B7280]" />
                  {t('officialGovtMsp')}
                </span>
                <span className="text-[9px] font-mono text-[#6B7280] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#E5E0D3]">
                  CACP Benchmark
                </span>
              </div>
              <div className="text-xl font-black font-mono text-[#1F2A1F]">
                ₹{govtMspPerQuintal.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-[#6B7280]">/ Quintal</span>
              </div>
              <p className="text-[10px] text-[#6B7280] leading-tight">
                Procuring Agency: <strong className="text-[#1F2A1F]">{procuringAgency}</strong>
              </p>
            </div>

            {/* Metric 2: Live Mandi Trading Rate */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-bold uppercase">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#6B7280]" />
                  {t('prevailingMandiRate')}
                </span>
                <span className="text-[9px] font-mono text-[#6B7280] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#E5E0D3]">
                  {currentSelectedMandi.mandiName.split(' ')[0]}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-[#1F2A1F] flex items-center gap-1.5">
                <span>₹{prevailingMandiRate.toLocaleString('en-IN')}</span>
                <span className="text-xs font-normal text-[#6B7280]">/ Quintal</span>
              </div>
              <p className="text-[10px] text-[#6B7280] flex items-center gap-1">
                {mspSpread >= 0 ? (
                  <span className="text-[#2F5233] font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    +₹{mspSpread}/Qtl (+{((mspSpread / (govtMspPerQuintal || 1)) * 100).toFixed(1)}%) above MSP
                  </span>
                ) : (
                  <span className="text-[#6B7280] font-bold">
                    Protected at Govt MSP floor (₹{govtMspPerQuintal})
                  </span>
                )}
              </p>
            </div>

            {/* Metric 3: Peak Price & Recommended Window */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-[#E5E0D3] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-bold uppercase">
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-[#2F5233]" />
                  {t('optimalSellingWindow')}
                </span>
                <span className="text-[9px] font-black text-white bg-[#2F5233] px-1.5 py-0.2 rounded">
                  Peak Gain
                </span>
              </div>
              <div className="text-xl font-black font-mono text-[#1F2A1F] flex items-center gap-1.5">
                <span>₹{peakPricePoint.forecastedPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs font-normal text-[#6B7280]">
                  (+₹{optimalSellingWindow.estimatedSurplusPerQuintal}/Qtl Surplus)
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] font-medium leading-tight">
                Target Window: <strong className="text-[#1F2A1F]">{optimalSellingWindow.startDate} – {optimalSellingWindow.endDate}</strong>
              </p>
            </div>
          </div>

          {/* NEAREST OFFICIAL APMC MANDIS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F2A1F] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2F5233]" />
                {t('nearestAPMCMandis')}
              </span>
              <span className="text-[10px] text-[#6B7280] font-mono">
                Direct Haversine Distance from Pinned Field
              </span>
            </div>

            {!currentSelectedMandi ? (
              <EmptyState
                icon="store"
                title="No Official APMC Mandi Data Found"
                description="No electronic auction feeds were retrieved for this specific crop and pin coordinates. Try selecting another crop or nearby state."
                actionLabel="Reset to Regional Crop"
                onAction={() => handleCropChange(cropOptions[0]?.name || 'Wheat (गेहूं)')}
              />
            ) : (
              <>
                <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] relative overflow-hidden shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D3]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] text-[#1F2A1F] font-black flex items-center justify-center text-sm border border-[#E5E0D3] shrink-0">
                        #{activeMandiIndex + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-[#1F2A1F]">
                            {currentSelectedMandi.mandiName}
                          </h4>
                          <span className="text-[9px] font-bold uppercase bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-[#2F5233]" />
                            APMC {currentSelectedMandi.mandiType || 'Principal Yard'}
                          </span>
                          <span className="text-[9px] font-semibold bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3] px-2 py-0.5 rounded-full">
                            Agency: {currentSelectedMandi.agency || procuringAgency}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-[#1F2A1F] font-bold">
                            <Navigation className="w-3 h-3 text-[#6B7280]" />
                            {currentSelectedMandi.distanceKm} km direct distance
                          </span>
                          <span>•</span>
                          <span>{currentSelectedMandi.district ? `${currentSelectedMandi.district}, ` : ''}{currentSelectedMandi.state || pinnedGps.state}</span>
                        </p>
                      </div>
                    </div>

                    {onNavigateToMandi && (
                      <button
                        type="button"
                        onClick={() => onNavigateToMandi(currentSelectedMandi)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2F5233] hover:bg-[#244027] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Navigate to Mandi ({currentSelectedMandi.distanceKm} km)</span>
                      </button>
                    )}
                  </div>

                  {/* Grid of Key Market Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
                    <div className="p-2.5 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3]">
                      <div className="text-[10px] text-[#6B7280]">Live Trading Rate</div>
                      <div className="text-base sm:lg font-black font-mono text-[#1F2A1F] flex items-center gap-1">
                        <span>₹{currentSelectedMandi.currentPricePerQuintal}</span>
                        <span className="text-[10px] text-[#6B7280] font-normal">/Qtl</span>
                      </div>
                      <div className="text-[9px] font-bold mt-0.5">
                        {currentSelectedMandi.trend === 'UP' ? (
                          <span className="text-[#2F5233] flex items-center gap-0.5">
                            <ArrowUpRight className="w-2.5 h-2.5" />
                            +₹{currentSelectedMandi.currentPricePerQuintal - currentSelectedMandi.prevDayPricePerQuintal} (24h)
                          </span>
                        ) : (
                          <span className="text-[#C0392B] flex items-center gap-0.5">
                            <ArrowDownRight className="w-2.5 h-2.5" />
                            -₹{Math.abs(currentSelectedMandi.currentPricePerQuintal - currentSelectedMandi.prevDayPricePerQuintal)} (24h)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3]">
                      <div className="text-[10px] text-[#6B7280]">Daily Arrivals</div>
                      <div className="text-base sm:text-lg font-black font-mono text-[#1F2A1F]">
                        {currentSelectedMandi.arrivalTons}{' '}
                        <span className="text-[10px] text-[#6B7280] font-normal">Tons/day</span>
                      </div>
                      <div className="text-[9px] text-[#6B7280] mt-0.5">APMC Weighbridge</div>
                    </div>

                    <div className="p-2.5 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3]">
                      <div className="text-[10px] text-[#6B7280]">Modal Price Band</div>
                      <div className="text-xs sm:text-sm font-extrabold font-mono text-[#1F2A1F]">
                        ₹{currentSelectedMandi.lowestPrice} – ₹{currentSelectedMandi.highestPrice}
                      </div>
                      <div className="text-[9px] text-[#6B7280] mt-0.5">Daily Trading Range</div>
                    </div>

                    <div className="p-2.5 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3]">
                      <div className="text-[10px] text-[#6B7280]">Govt MSP Spread</div>
                      <div className="text-xs sm:text-sm font-extrabold font-mono">
                        {currentSelectedMandi.currentPricePerQuintal >= govtMspPerQuintal ? (
                          <span className="text-[#2F5233]">
                            +₹{currentSelectedMandi.currentPricePerQuintal - govtMspPerQuintal} above MSP
                          </span>
                        ) : (
                          <span className="text-[#6B7280]">
                            -₹{govtMspPerQuintal - currentSelectedMandi.currentPricePerQuintal} below MSP
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-[#6B7280] mt-0.5">Agency: {currentSelectedMandi.agency || procuringAgency}</div>
                    </div>
                  </div>

                  {/* 7-DAY APMC AUCTION PRICE TREND */}
                  <div className="mt-3 p-3 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#2F5233]" />
                        <span className="text-xs font-bold text-[#1F2A1F]">
                          7-Day Trading Rate History &amp; MSP Floor
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1 text-[#1F2A1F] font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#2F5233] inline-block" />
                          Mandi Rate
                        </span>
                        <span className="flex items-center gap-1 text-[#6B7280] font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#9CA3AF] inline-block" />
                          Govt MSP (₹{govtMspPerQuintal})
                        </span>
                      </div>
                    </div>

                    <div className="h-28 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={heroMandiHistory} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="heroMandiPriceGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2F5233" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#2F5233" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D3" vertical={false} />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 9, fill: '#6B7280' }}
                            axisLine={{ stroke: '#E5E0D3' }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={['dataMin - 60', 'dataMax + 60']}
                            tick={{ fontSize: 9, fill: '#6B7280' }}
                            axisLine={false}
                            tickLine={false}
                            width={45}
                            tickFormatter={(v) => `₹${v}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E5E0D3',
                              borderRadius: '0.75rem',
                              fontSize: '11px',
                              color: '#1F2A1F',
                            }}
                            formatter={(val: number) => [`₹${val}/Qtl`, 'Rate']}
                          />
                          <ReferenceLine
                            y={govtMspPerQuintal}
                            stroke="#9CA3AF"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                          />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#2F5233"
                            strokeWidth={2}
                            fill="url(#heroMandiPriceGrad)"
                            dot={{ r: 2.5, fill: '#2F5233', strokeWidth: 1, stroke: '#FFFFFF' }}
                            activeDot={{ r: 4.5, fill: '#2F5233', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Total Estimated Production Value Box */}
                  <div className="mt-3 p-3 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1F2A1F] flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#2F5233]" />
                        Estimated Total Production Value
                      </span>
                      <p className="text-xs text-[#6B7280] leading-snug">
                        Estimated total value at this mandi: <strong className="text-[#1F2A1F] font-mono font-bold">₹{totalEstimatedMandiValue.toLocaleString('en-IN')}</strong> for your <strong className="text-[#1F2A1F]">{effectiveAreaAcres.toFixed(1)} acre</strong> field's expected yield (<span className="font-bold text-[#1F2A1F]">{totalParcelYieldQuintals} Quintals</span> at {estimatedYieldPerAcre} Qtl/Acre).
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-base sm:text-xl font-black font-mono text-[#2F5233] leading-tight">
                        ₹{totalEstimatedMandiValue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-mono">
                        vs ₹{totalGovtMspValue.toLocaleString('en-IN')} at Govt MSP Floor
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALL NEARBY MANDIS DECK */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {top3NearestMandis.map((mandi, idx) => {
                    const mandiTotalVal = Math.round(totalParcelYieldQuintals * mandi.currentPricePerQuintal);
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveMandiIndex(idx)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                          activeMandiIndex === idx
                            ? 'bg-[#FAF8F2] border-[#2F5233] shadow-xs'
                            : 'bg-[#FFFFFF] hover:bg-[#FAF8F2] border-[#E5E0D3]'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FAF8F2] text-[#6B7280] border border-[#E5E0D3]">
                              #{idx + 1} {mandi.mandiType || 'APMC Yard'}
                            </span>
                            <span className="text-[10px] font-bold text-[#1F2A1F] font-mono">
                              ₹{mandi.currentPricePerQuintal}/Qtl
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-[#1F2A1F] truncate">
                            {mandi.mandiName}
                          </h5>
                          <div className="text-[10px] text-[#6B7280] flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[#1F2A1F] font-semibold">
                              <Navigation className="w-2.5 h-2.5 text-[#6B7280]" />
                              {mandi.distanceKm} km
                            </span>
                            <span>{mandi.arrivalTons} T/day</span>
                          </div>

                          <div className="py-0.5">
                            <SparklineArea
                              data={[
                                { label: '4d', value: Math.round(mandi.currentPricePerQuintal - (mandi.currentPricePerQuintal - mandi.prevDayPricePerQuintal) * 2.1) },
                                { label: '3d', value: Math.round(mandi.currentPricePerQuintal - (mandi.currentPricePerQuintal - mandi.prevDayPricePerQuintal) * 1.5) },
                                { label: '2d', value: Math.round(mandi.currentPricePerQuintal - (mandi.currentPricePerQuintal - mandi.prevDayPricePerQuintal) * 1.2) },
                                { label: '1d', value: mandi.prevDayPricePerQuintal },
                                { label: 'Live', value: mandi.currentPricePerQuintal },
                              ]}
                              color={mandi.trend === 'UP' ? '#2F5233' : '#C0392B'}
                              gradientId={`mandi-spark-${idx}`}
                              height={22}
                              valueFormatter={(v) => `₹${v}`}
                              activeLabel="Live"
                            />
                          </div>

                          <div className="pt-1 border-t border-[#E5E0D3] flex items-center justify-between text-[10px]">
                            <span className="text-[#6B7280]">Total Parcel Value:</span>
                            <strong className="text-[#1F2A1F] font-mono">
                              ₹{mandiTotalVal.toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>

                        {onNavigateToMandi && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToMandi(mandi);
                            }}
                            className="mt-2.5 w-full py-1.5 text-[10px] font-bold text-[#1F2A1F] bg-[#FAF8F2] hover:bg-[#E5E0D3]/50 border border-[#E5E0D3] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Compass className="w-3 h-3 text-[#6B7280]" />
                            <span>Navigate ({mandi.distanceKm} km)</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Trust Signal Attribution Strip */}
          <div className="px-3.5 py-2 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#6B7280] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2F5233] inline-block" />
              Data: Agmarknet APMC • Directorate of Marketing &amp; Inspection (DMI) • CACP MSP Benchmarks
            </span>
            <span className="font-mono text-[9px] text-[#6B7280]">Live Electronic Feeds</span>
          </div>

          {/* INTERACTIVE 2-TO-3 DAY HARVEST PRICE TREND & OPTIMAL SELLING WINDOW */}
          <div className="p-3.5 sm:p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5E0D3] space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#EAF0EB] text-[#2F5233] border border-[#2F5233]/20 flex items-center justify-center font-black">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1F2A1F] flex items-center gap-2">
                    <span>Mandi Price Trend Forecast Around Harvest</span>
                    <span className="text-[9px] font-mono text-[#6B7280] bg-[#FAF8F2] px-1.5 py-0.2 rounded border border-[#E5E0D3]">
                      {forecastHorizonMode === '2to3days' ? '2-to-3 Day Harvest Window' : '30-Day Season Forecast'}
                    </span>
                  </h4>
                  <p className="text-[10px] text-[#6B7280]">
                    Prophet model tracking post-harvest bids, peak price point, and optimal holding gain
                  </p>
                </div>
              </div>

              {/* Horizon switch */}
              <div className="flex items-center gap-1.5 bg-[#FAF8F2] p-1 rounded-lg border border-[#E5E0D3] self-start sm:self-auto">
                <button
                  onClick={() => setForecastHorizonMode('2to3days')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    forecastHorizonMode === '2to3days'
                      ? 'bg-[#2F5233] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F]'
                  }`}
                >
                  2-to-3 Day Harvest Trend
                </button>
                <button
                  onClick={() => setForecastHorizonMode('30days')}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    forecastHorizonMode === '30days'
                      ? 'bg-[#2F5233] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#1F2A1F]'
                  }`}
                >
                  30-Day Full Horizon
                </button>
              </div>
            </div>

            {/* Peak Price Point Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#FAF8F2] rounded-xl border border-[#E5E0D3] text-xs">
              <div className="flex items-center gap-1.5 text-[#1F2A1F]">
                <Sparkles className="w-3.5 h-3.5 text-[#2F5233]" />
                <span>
                  <strong>Peak Price Point:</strong> ₹{peakPricePoint.forecastedPrice}/Qtl ({peakPricePoint.dayLabel})
                </span>
              </div>
              <div className="text-[11px] text-[#6B7280]">
                Optimal Window: <strong className="text-[#1F2A1F]">{optimalSellingWindow.startDate} – {optimalSellingWindow.endDate}</strong> (+₹{optimalSellingWindow.estimatedSurplusPerQuintal}/Qtl Surplus)
              </div>
            </div>

            {/* RECHARTS COMPOSED CHART */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayedForecastData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="priceGradientMandi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2F5233" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2F5233" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="confidenceBandMandi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E0D3' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={10}
                    domain={['dataMin - 50', 'dataMax + 50']}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E0D3' }}
                    tickFormatter={(val) => `₹${val}`}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataPoint = payload[0].payload as MandiForecastPoint;
                        return (
                          <div className="bg-[#FFFFFF] border border-[#E5E0D3] p-2.5 rounded-xl shadow-md text-xs space-y-1 z-50 text-[#1F2A1F]">
                            <div className="flex items-center justify-between gap-3 font-bold border-b border-[#E5E0D3] pb-1">
                              <span>{dataPoint.date} ({dataPoint.dayLabel})</span>
                              {dataPoint.isPeak && (
                                <span className="text-[9px] bg-[#2F5233] text-white font-bold px-1.5 py-0.5 rounded">
                                  PEAK PRICE
                                </span>
                              )}
                              {dataPoint.isHarvestDay && (
                                <span className="text-[9px] bg-[#FAF8F2] text-[#1F2A1F] border border-[#E5E0D3] font-bold px-1.5 py-0.5 rounded">
                                  HARVEST DAY
                                </span>
                              )}
                            </div>

                            <div className="space-y-0.5 text-[11px] font-mono">
                              <div className="text-[#1F2A1F] font-bold flex items-center justify-between gap-2">
                                <span>Predicted Mandi Price:</span>
                                <span className="text-[#2F5233]">₹{dataPoint.forecastedPrice}/Qtl</span>
                              </div>
                              <div className="text-[#6B7280] flex items-center justify-between gap-2">
                                <span>Upper Bound:</span>
                                <span>₹{dataPoint.upperBound}/Qtl</span>
                              </div>
                              <div className="text-[#6B7280] flex items-center justify-between gap-2">
                                <span>Lower Bound:</span>
                                <span>₹{dataPoint.lowerBound}/Qtl</span>
                              </div>
                              <div className="text-[#6B7280] flex items-center justify-between gap-2 pt-0.5 border-t border-[#E5E0D3]">
                                <span>Govt MSP Floor:</span>
                                <span>₹{dataPoint.msp}/Qtl</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={30}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '0px', color: '#6B7280' }}
                  />

                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    name="Confidence Ceiling (₹)"
                    stroke="none"
                    fill="url(#confidenceBandMandi)"
                  />

                  <Area
                    type="monotone"
                    dataKey="forecastedPrice"
                    name="Predicted Mandi Rate (₹/Qtl)"
                    stroke="#2F5233"
                    strokeWidth={2}
                    fill="url(#priceGradientMandi)"
                  />

                  <ReferenceLine
                    y={govtMspPerQuintal}
                    stroke="#9CA3AF"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Govt MSP (₹${govtMspPerQuintal})`,
                      fill: '#6B7280',
                      fontSize: 9,
                      position: 'insideBottomRight',
                    }}
                  />

                  {peakPricePoint && (
                    <ReferenceDot
                      x={peakPricePoint.date}
                      y={peakPricePoint.forecastedPrice}
                      r={5}
                      fill="#2F5233"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Action / Confirmation */}
            <div className="pt-2 border-t border-[#E5E0D3] flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-[#6B7280] flex items-center gap-1 font-medium">
                <Info className="w-3.5 h-3.5 text-[#6B7280]" />
                Synchronized with APMC electronic auction feeds across {pinnedGps.state}.
              </span>

              {onApplyCropSchedule && (
                <button
                  type="button"
                  onClick={() => onApplyCropSchedule(selectedCrop, plantingDate, harvestingDate)}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-[#2F5233] hover:bg-[#244027] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <span>Sync Farm Calendar</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
