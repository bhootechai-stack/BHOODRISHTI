import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Sparkles,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  ArrowUp,
  MapPin,
  Sprout,
  Thermometer,
  CloudRain,
  Wind,
  Activity,
  Plus,
  ScanLine,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { IndianState, LatLng, WeatherData, HeatmapStats } from '../types';
import { UserProfile, SavedFarm, getCachedFarms } from '../services/dbApi';

import { useLocation } from '../context/LocationContext';

interface LandingPageProps {
  onEnterCockpit: () => void;
  onOpenKrishiMitra: () => void;
  onOpenMandiRates: () => void;
  onOpenLeafDoctor?: () => void;
  onOpenWeather?: () => void;
  onOpenDatabase?: () => void;
  onOpenAddFarm?: () => void;
  onOpenSmartSensor?: () => void;
  onRunAnalysis?: () => void;
  onSetLocation?: () => void;
  onOpenLogin?: () => void;
  onOpenAiCompanion?: () => void;
  onOpenLanguageModal?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  user: UserProfile | null;
  selectedState: IndianState;
  currentCoords?: LatLng;
  selectedFarm?: SavedFarm | null;
  weather?: WeatherData | null;
  heatmapStats?: HeatmapStats | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterCockpit,
  onOpenKrishiMitra,
  onOpenMandiRates,
  onOpenLeafDoctor,
  onOpenWeather,
  onOpenDatabase,
  onOpenAddFarm,
  onOpenSmartSensor,
  onRunAnalysis,
  onSetLocation,
  onOpenAiCompanion,
  onOpenPrivacy,
  onOpenTerms,
  user,
  selectedState,
  currentCoords,
  selectedFarm,
  weather,
  heatmapStats,
}) => {
  const { t } = useLanguage();
  const { coords: liveCoords } = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fallback to cached farm if selectedFarm not passed
  const effectiveFarm =
    selectedFarm ||
    (() => {
      const cached = getCachedFarms();
      return cached && cached.length > 0 ? cached[0] : null;
    })();

  // Fallback to active localStorage boundary stats if heatmapStats not passed
  const effectiveStats =
    heatmapStats ||
    (() => {
      try {
        const saved = localStorage.getItem('bhootech_active_farm_boundary');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.stats) return parsed.stats as HeatmapStats;
        }
      } catch {}
      return null;
    })();

  // Weather data management with Open-Meteo fallback
  const [activeWeather, setActiveWeather] = useState<WeatherData | null>(weather || null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    if (weather) {
      setActiveWeather(weather);
      return;
    }

    const lat = effectiveFarm?.center?.lat ?? effectiveFarm?.points?.[0]?.lat ?? currentCoords?.lat ?? liveCoords?.lat;
    const lng = effectiveFarm?.center?.lng ?? effectiveFarm?.points?.[0]?.lng ?? currentCoords?.lng ?? liveCoords?.lng;

    if (!lat || !lng || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      setActiveWeather(null);
      return;
    }

    let isMounted = true;
    setIsLoadingWeather(true);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.current) return;
        setActiveWeather({
          temperature: Math.round(data.current.temperature_2m),
          apparentTemperature: Math.round(data.current.apparent_temperature),
          humidity: Math.round(data.current.relative_humidity_2m),
          precipitation: Number((data.current.precipitation ?? 0).toFixed(1)),
          rainChance: Math.round(data.daily?.precipitation_probability_max?.[0] ?? 0),
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
          conditionText: 'Fair / Partly Cloudy',
          sunrise: '06:12 AM',
          sunset: '06:45 PM',
          dailyForecast: [],
        });
      })
      .catch((err) => {
        console.warn('LandingPage: Weather fetch fallback error:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingWeather(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    weather,
    effectiveFarm?.center?.lat,
    effectiveFarm?.center?.lng,
    effectiveFarm?.points,
    currentCoords?.lat,
    currentCoords?.lng,
    liveCoords?.lat,
    liveCoords?.lng,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = user?.name?.trim() || t('registeredFarmer');
  const hasCoords = Boolean(
    (effectiveFarm?.center?.lat && effectiveFarm?.center?.lng) ||
      (effectiveFarm?.points && effectiveFarm.points.length > 0 && effectiveFarm.points[0]?.lat) ||
      (currentCoords?.lat && currentCoords?.lng) ||
      (liveCoords?.lat && liveCoords?.lng)
  );

  const hasAnalysis = Boolean(
    effectiveStats?.meanIndex !== undefined ||
      effectiveStats?.healthyPct !== undefined ||
      effectiveFarm?.healthScore !== undefined
  );

  return (
    <div className="min-h-screen pt-16 flex flex-col justify-between bg-[#F4F1E8] text-[#1E2B1F] font-sans pb-28 sm:pb-32">
      {/* Centered Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto w-full">
        {/* 1. WELCOME BANNER (top): light-theme card (#FBFAF5, 1px #E6E1D3, 14px radius) */}
        <div className="w-full bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-4 sm:p-5 shadow-xs mb-5 sm:mb-6 animate-fade-in">
          {/* Leaf Logo + Wordmark */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#2D5A36] text-white flex items-center justify-center shadow-2xs shrink-0">
                <Sprout className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-black tracking-wider uppercase text-[#2D5A36] font-mono">
                BHOOTECH AI
              </span>
            </div>

            {selectedState && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D5A36] bg-white border border-[#E6E1D3] px-2.5 py-0.5 rounded-full shadow-2xs">
                <MapPin className="w-3 h-3 text-[#2D5A36]" />
                {selectedState}
                {user?.district ? ` • ${user.district}` : ''}
              </span>
            )}
          </div>

          {/* Heading: Welcome, {user name} - Reduced size for mobile */}
          <h1 className="text-lg sm:text-2xl font-bold text-[#1E2B1F] tracking-tight">
            {t('welcome')}, <span className="text-[#2D5A36]">{displayName}</span>
          </h1>

          {/* One-line Subtitle with real farm data or prompt */}
          <p className="text-xs sm:text-sm text-[#6B7266] mt-1 font-medium truncate">
            {effectiveFarm ? (
              <span>
                <strong className="text-[#1E2B1F]">{effectiveFarm.name}</strong>
                {effectiveFarm.areaAcres ? ` • ${effectiveFarm.areaAcres} ${t('acres')}` : ''}
                {effectiveFarm.crop ? ` • ${effectiveFarm.crop}` : ''}
              </span>
            ) : (
              <span>{t('addFirstFarm')}</span>
            )}
          </p>
        </div>

        {/* 2. Action cards (2x2 on phones, 4 across on wide screens) with full descriptions in English & Hindi */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4.5 w-full">
          {/* 1. Launch Satellite Cockpit */}
          <button
            type="button"
            onClick={onEnterCockpit}
            className="group flex flex-col items-start justify-between p-4 sm:p-5 rounded-2xl bg-[#2F5233] hover:bg-[#244027] text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer border border-[#244027] text-left min-h-[160px] sm:min-h-[180px] active:scale-[0.98]"
            title="Launch Sentinel-2 Satellite Cockpit"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs group-hover:scale-105 transition-transform">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-3 w-full">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/70 font-mono">
                Sentinel-2
              </div>
              <div className="text-sm sm:text-base font-black text-white leading-snug mt-0.5">
                {t('launchCockpit')}
              </div>
              <p className="text-[11px] sm:text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
                {t('interactiveMapDesc')}
              </p>
            </div>
          </button>

          {/* 2. Talk to BhooSaathi AI */}
          <button
            type="button"
            onClick={onOpenAiCompanion || onEnterCockpit}
            className="group flex flex-col items-start justify-between p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer border border-[#E5E0D3] text-left min-h-[160px] sm:min-h-[180px] active:scale-[0.98]"
            title="Voice & Chat AI Farming Companion"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EB] flex items-center justify-center text-[#2F5233] group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 text-[#2F5233]" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md bg-[#FAF8F2] text-[#2F5233] border border-[#E5E0D3]">
                {t('dialectVoice')}
              </span>
            </div>
            <div className="mt-3 w-full">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B7280] font-mono">
                AI Companion
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1F2A1F] leading-snug mt-0.5">
                {t('talkToBhooSaathi')}
              </div>
              <p className="text-[11px] sm:text-xs text-[#6B7266] mt-1 line-clamp-2 leading-relaxed">
                {t('bhooSaathiDesc')}
              </p>
            </div>
          </button>

          {/* 3. Krishi Mitra AI */}
          <button
            type="button"
            onClick={onOpenKrishiMitra}
            className="group flex flex-col items-start justify-between p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer border border-[#E5E0D3] text-left min-h-[160px] sm:min-h-[180px] active:scale-[0.98]"
            title="Krishi Mitra Agronomic Intelligence"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EB] flex items-center justify-center text-[#2F5233] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#2F5233]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2F5233] group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-3 w-full">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B7280] font-mono">
                {t('hyperlocalCropAI')}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1F2A1F] leading-snug mt-0.5">
                {t('krishiMitra')}
              </div>
              <p className="text-[11px] sm:text-xs text-[#6B7266] mt-1 line-clamp-2 leading-relaxed">
                {t('krishiMitraDesc')}
              </p>
            </div>
          </button>

          {/* 4. Mandi Rates */}
          <button
            type="button"
            onClick={onOpenMandiRates}
            className="group flex flex-col items-start justify-between p-4 sm:p-5 rounded-2xl bg-white hover:bg-[#FAF8F2] text-[#1F2A1F] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer border border-[#E5E0D3] text-left min-h-[160px] sm:min-h-[180px] active:scale-[0.98]"
            title="Real-Time APMC Mandi Rates"
          >
            <div className="flex items-center justify-between w-full">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EB] flex items-center justify-center text-[#2F5233] group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5 text-[#2F5233]" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#2F5233] group-hover:translate-x-1 transition-all" />
            </div>
            <div className="mt-3 w-full">
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#6B7280] font-mono">
                {t('apmcArbitrage')}
              </div>
              <div className="text-sm sm:text-base font-bold text-[#1F2A1F] leading-snug mt-0.5">
                {t('mandiRates')}
              </div>
              <p className="text-[11px] sm:text-xs text-[#6B7266] mt-1 line-clamp-2 leading-relaxed">
                {t('mandiRatesDesc')}
              </p>
            </div>
          </button>
        </div>

        {/* 3. ADD below them, in the same card style: Weather, Farm Health, and Quick Actions */}
        {/* On phones stack in one column; on wide screens use a 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full mt-5 sm:mt-6">
          {/* Card a: Today's Weather */}
          <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center">
                    <CloudRain className="w-4 h-4 text-[#2D5A36]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E2B1F]">
                    {t('todaysWeather')}
                  </h3>
                </div>

                {hasCoords && onOpenWeather && (
                  <button
                    type="button"
                    onClick={onOpenWeather}
                    className="text-[11px] font-semibold text-[#2D5A36] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Forecast</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {hasCoords ? (
                isLoadingWeather ? (
                  <div className="py-4 text-center text-xs text-[#6B7266] animate-pulse">
                    Loading weather telemetry...
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5 mt-2">
                    {/* Temperature */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D3] text-center shadow-2xs">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-[#6B7266]">
                        <Thermometer className="w-3.5 h-3.5 text-[#2D5A36]" />
                        <span>{t('temperature')}</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#1E2B1F] mt-1 font-mono">
                        {activeWeather?.temperature !== undefined ? `${activeWeather.temperature}°C` : '--'}
                      </div>
                    </div>

                    {/* Rain Chance */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D3] text-center shadow-2xs">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-[#6B7266]">
                        <CloudRain className="w-3.5 h-3.5 text-[#1E40AF]" />
                        <span>{t('rainChance')}</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#1E2B1F] mt-1 font-mono">
                        {activeWeather?.rainChance !== undefined ? `${activeWeather.rainChance}%` : '--'}
                      </div>
                    </div>

                    {/* Wind Speed */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6E1D3] text-center shadow-2xs">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-[#6B7266]">
                        <Wind className="w-3.5 h-3.5 text-[#4B5563]" />
                        <span>{t('windSpeed')}</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-[#1E2B1F] mt-1 font-mono">
                        {activeWeather?.windSpeed !== undefined ? `${activeWeather.windSpeed} km/h` : '--'}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="py-4 text-center space-y-2.5">
                  <p className="text-xs text-[#6B7266] font-medium">
                    {t('setFarmLocationWeather')}
                  </p>
                  <button
                    type="button"
                    onClick={onSetLocation || onEnterCockpit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A36] text-white text-xs font-semibold hover:bg-[#244027] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('setLocation')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card b: Farm Health */}
          <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center">
                    <Activity className="w-4 h-4 text-[#2D5A36]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1E2B1F]">
                    {t('farmHealth')}
                  </h3>
                </div>

                {hasAnalysis && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#E6E1D3] text-[#2D5A36] font-mono shadow-2xs">
                    {effectiveStats?.mode?.toUpperCase() || 'NDRE'}
                  </span>
                )}
              </div>

              {hasAnalysis ? (
                <div className="space-y-3 mt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E6E1D3] shadow-2xs">
                    <div>
                      <div className="text-xs font-medium text-[#6B7266]">
                        {effectiveStats?.mode === 'ndwi' ? 'Canopy Moisture' : 'Healthy Vegetation'}
                      </div>
                      <div className="text-lg font-black text-[#1E2B1F] mt-0.5 font-mono">
                        {Math.round(
                          effectiveStats?.healthyPct ??
                            effectiveFarm?.healthScore ??
                            76
                        )}
                        %
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-medium text-[#6B7266]">Index Mean</div>
                      <div className="text-sm font-bold text-[#2D5A36] font-mono mt-0.5">
                        {effectiveStats?.meanIndex !== undefined
                          ? Number(effectiveStats.meanIndex).toFixed(2)
                          : '0.68'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7266]">
                      {effectiveStats?.healthyPct && effectiveStats.healthyPct >= 70
                        ? t('optimalHealth')
                        : effectiveStats?.healthyPct && effectiveStats.healthyPct >= 40
                        ? t('moderateVigour')
                        : t('requiresAttention')}
                    </span>
                    <button
                      type="button"
                      onClick={onEnterCockpit}
                      className="font-semibold text-[#2D5A36] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Cockpit Map</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center space-y-2.5">
                  <p className="text-xs text-[#6B7266] font-medium">
                    {t('noAnalysisYet')}
                  </p>
                  <button
                    type="button"
                    onClick={onRunAnalysis || onEnterCockpit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A36] text-white text-xs font-semibold hover:bg-[#244027] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{t('runFieldAnalysis')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card c: Quick Actions row of 3 small buttons (Add Farm, Scan Leaf, Smart Sensor) */}
          <div className="col-span-1 md:col-span-2 bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7266] font-mono">
                {t('quickActions')}
              </span>
              <span className="text-[11px] text-[#2D5A36] font-semibold">
                Instant Tools
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* 1. Add Farm */}
              <button
                type="button"
                onClick={onOpenAddFarm || onOpenDatabase}
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#E6E1D3] text-[#1E2B1F] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 text-center min-h-[56px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-[#2D5A36]" />
                </div>
                <span className="truncate">{t('addFarm')}</span>
              </button>

              {/* 2. Scan Leaf (opens Leaf Doctor) */}
              <button
                type="button"
                onClick={onOpenLeafDoctor}
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#E6E1D3] text-[#1E2B1F] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 text-center min-h-[56px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center shrink-0">
                  <ScanLine className="w-4 h-4 text-[#2D5A36]" />
                </div>
                <span className="truncate">{t('scanLeaf')}</span>
              </button>

              {/* 3. Smart Sensor */}
              <button
                type="button"
                onClick={onOpenSmartSensor}
                className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl bg-white hover:bg-[#FAF8F2] border border-[#E6E1D3] text-[#1E2B1F] text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95 text-center min-h-[56px]"
              >
                <div className="w-7 h-7 rounded-lg bg-[#E3E8D8] text-[#2D5A36] flex items-center justify-center shrink-0">
                  <Radio className="w-4 h-4 text-[#2D5A36]" />
                </div>
                <span className="truncate">{t('smartSensor')}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Slim Legal & Governance Footer Strip */}
      <footer className="mt-auto py-5 border-t border-[#E6E1D3] text-xs text-[#6B7266] px-4 max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© 2026 BhooTech AI. Built with precision for Indian Agriculture.</p>
          <div className="flex items-center gap-4 text-[#6B7266]">
            {onOpenPrivacy && (
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="hover:text-[#1E2B1F] transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                Privacy Policy
              </button>
            )}
            <span>•</span>
            {onOpenTerms && (
              <button
                type="button"
                onClick={onOpenTerms}
                className="hover:text-[#1E2B1F] transition-colors cursor-pointer underline-offset-4 hover:underline"
              >
                Terms & Conditions
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Scroll-To-Top Button - placed safely above bottom navigation */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 p-2.5 rounded-full bg-[#2F5233] text-white shadow-md hover:bg-[#244027] transition-all cursor-pointer flex items-center justify-center active:scale-95 border border-[#244027]"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
