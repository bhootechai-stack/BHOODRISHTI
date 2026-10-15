import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { SideNavDrawer } from './components/SideNavDrawer';
import { MapBoundaryHeatmap } from './components/MapBoundaryHeatmap';
import { KrishiMitraModal } from './components/KrishiMitraModal';
import { LeafDiagnosticModal } from './components/LeafDiagnosticModal';
import { WeatherModal } from './components/WeatherModal';
import { DatabaseModal } from './components/DatabaseModal';
import { LoginModal } from './components/LoginModal';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { MandiRatesModal } from './components/MandiRatesModal';
import { OnboardingModal } from './components/OnboardingModal';
import { FieldCompassOverlay } from './components/FieldCompassOverlay';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsAndConditionsPage } from './components/TermsAndConditionsPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AICompanionModal } from './components/AICompanionModal';
import { LanguageModal } from './components/LanguageModal';
import { SettingsModal } from './components/SettingsModal';
import { BottomNavBar, BottomNavTab } from './components/BottomNavBar';
import { LocationProvider, useLocation } from './context/LocationContext';
import { LocationGate } from './components/LocationGate';
import { IndianState, LatLng, WeatherData, HeatmapStats, LandUnit, HeatmapMode } from './types';
import { PRESET_FARMS, STATE_COORDINATES, getAccurateUserLocation } from './utils/geoUtils';
import { getResolvedLocationDetails } from './utils/locationLookup';
import {
  getPrimaryUnitForState,
  formatAreaInLocalUnit,
  getStateUnitsGroup,
  INDIAN_STATE_UNITS,
} from './data/indianUnits';
import {
  SavedFarm,
  UserProfile,
  getActiveUser,
  setActiveUser,
  fetchFarms,
  getCachedFarms,
} from './services/dbApi';
import {
  Sparkles,
  Stethoscope,
  CloudSun,
  Scale,
  Database,
  MapPin,
  ShieldCheck,
  Activity,
  Layers,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageCode } from './utils/translations';

export type AppView = 'landing' | 'cockpit' | 'privacy' | 'terms';

const getInitialView = (): AppView => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (
      path === '/privacy-policy' ||
      path === '/privacy' ||
      hash === '#/privacy-policy' ||
      hash === '#/privacy'
    ) {
      return 'privacy';
    }
    if (
      path === '/terms-and-conditions' ||
      path === '/terms' ||
      hash === '#/terms-and-conditions' ||
      hash === '#/terms'
    ) {
      return 'terms';
    }
    if (path === '/landing' || hash === '#/landing') {
      return 'landing';
    }
  }
  return 'cockpit';
};

function MainApp() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [activeUser, setActiveUserState] = useState<UserProfile | null>(() => getActiveUser());
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [userFarmsCount, setUserFarmsCount] = useState<number>(0);

  // Navigation and Modals State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState<boolean>(false);
  const [isKrishiMitraOpen, setIsKrishiMitraOpen] = useState<boolean>(false);
  const [isMandiRatesOpen, setIsMandiRatesOpen] = useState<boolean>(false);
  const [isLeafDoctorOpen, setIsLeafDoctorOpen] = useState<boolean>(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState<boolean>(false);
  const [databaseInitialTab, setDatabaseInitialTab] = useState<'farms' | 'reports' | 'telemetry' | 'structure' | 'diagnostics' | 'saveCurrent' | 'quota'>('farms');
  const [isAiCompanionOpen, setIsAiCompanionOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    const user = getActiveUser();
    return !user;
  });
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [navigatorTargetId, setNavigatorTargetId] = useState<string>('nearest-red-spot');
  const [targetMandiForRoute, setTargetMandiForRoute] = useState<{
    name: string;
    lat: number;
    lng: number;
    distanceKm?: number;
    commodity?: string;
    modalPrice?: number;
  } | null>(null);


  const [selectedState, setSelectedState] = useState<IndianState>(() => {
    const user = getActiveUser();
    return (user?.state as IndianState) || 'Punjab';
  });

  const [loadedFarmBoundary, setLoadedFarmBoundary] = useState<SavedFarm | null>(null);

  const [selectedUnit, setSelectedUnit] = useState<LandUnit>(() => {
    const user = getActiveUser();
    const st = (user?.state as IndianState) || 'Punjab';
    return getPrimaryUnitForState(st);
  });

  const { coords: liveGpsCoords, retryLocation: refreshLocation } = useLocation();

  const [currentLocation, setCurrentLocation] = useState<LatLng>(() => {
    if (liveGpsCoords && Number.isFinite(liveGpsCoords.lat) && Number.isFinite(liveGpsCoords.lng)) {
      return { lat: liveGpsCoords.lat, lng: liveGpsCoords.lng };
    }
    const user = getActiveUser();
    if (user?.location?.lat && user?.location?.lng && Number.isFinite(user.location.lat) && Number.isFinite(user.location.lng)) {
      return { lat: user.location.lat, lng: user.location.lng };
    }
    return { lat: 28.6139, lng: 77.209 };
  });

  useEffect(() => {
    if (liveGpsCoords && Number.isFinite(liveGpsCoords.lat) && Number.isFinite(liveGpsCoords.lng)) {
      setCurrentLocation({ lat: liveGpsCoords.lat, lng: liveGpsCoords.lng });
    }
  }, [liveGpsCoords?.lat, liveGpsCoords?.lng]);

  const [fieldAreaAcres, setFieldAreaAcres] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.areaAcres && Number(parsed.areaAcres) > 0) return Number(parsed.areaAcres);
      }
    } catch {}
    const user = getActiveUser();
    return user?.totalLandAcres || 2.5;
  });
  const [fieldAreaSqm, setFieldAreaSqm] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.areaSqm && Number(parsed.areaSqm) > 0) return Number(parsed.areaSqm);
      }
    } catch {}
    return 10117.14;
  });
  const [boundaryPoints, setBoundaryPoints] = useState<LatLng[]>(() => {
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.points && Array.isArray(parsed.points) && parsed.points.length >= 3) {
          return parsed.points;
        }
      }
    } catch {}
    return [];
  });
  const [heatmapStats, setHeatmapStats] = useState<HeatmapStats | null>(() => {
    try {
      const saved = localStorage.getItem('bhootech_active_farm_boundary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stats) return parsed.stats;
      }
    } catch {}
    return null;
  });
  const [activeHeatmapMode, setActiveHeatmapMode] = useState<HeatmapMode>('ndre');
  const [activeView, setActiveView] = useState<AppView>(() => getInitialView());
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleNavigateView = useCallback((targetView: AppView) => {
    setActiveView(targetView);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (targetView === 'privacy') targetPath = '/privacy-policy';
      else if (targetView === 'terms') targetPath = '/terms-and-conditions';
      else if (targetView === 'landing') targetPath = '/landing';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: targetView }, '', targetPath);
      }
    }
  }, []);

  // Listen for browser back / forward button changes
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path === '/privacy-policy' ||
        path === '/privacy' ||
        hash === '#/privacy-policy' ||
        hash === '#/privacy'
      ) {
        setActiveView('privacy');
      } else if (
        path === '/terms-and-conditions' ||
        path === '/terms' ||
        hash === '#/terms-and-conditions' ||
        hash === '#/terms'
      ) {
        setActiveView('terms');
      } else if (path === '/landing' || hash === '#/landing') {
        setActiveView('landing');
      } else {
        setActiveView('cockpit');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Pre-fetch and cache weather on load / location change
  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        if (!currentLocation || !Number.isFinite(currentLocation.lat) || !Number.isFinite(currentLocation.lng)) {
          console.error('App.tsx: fetchWeather aborted, currentLocation coordinates undefined or invalid', currentLocation);
          return;
        }
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${currentLocation.lat}&longitude=${currentLocation.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=sunrise,sunset,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        const current = data.current;
        const daily = data.daily;
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dailyForecast = (daily.time || []).slice(0, 3).map((timeStr: string, idx: number) => {
          const d = new Date(timeStr);
          return {
            date: timeStr,
            dayName: idx === 0 ? 'Today' : daysOfWeek[d.getDay()],
            tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? 32),
            tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
            rainChance: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
            code: daily.weather_code?.[idx] ?? 0,
          };
        });

        setWeatherData({
          temperature: Math.round(current.temperature_2m),
          apparentTemperature: Math.round(current.apparent_temperature),
          humidity: Math.round(current.relative_humidity_2m),
          precipitation: Number((current.precipitation ?? 0).toFixed(1)),
          rainChance: Math.round(daily.precipitation_probability_max?.[0] ?? 0),
          windSpeed: Math.round(current.wind_speed_10m),
          weatherCode: current.weather_code,
          conditionText: 'Fair / Partly Cloudy',
          sunrise: daily.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:12 AM',
          sunset: daily.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:45 PM',
          dailyForecast,
        });
      } catch (e) {
        console.log('Using pre-cached fallback weather');
      }
    };

    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [currentLocation?.lat, currentLocation?.lng]);

  // Sync user farm count
  const refreshUserFarms = useCallback(async (userId?: string) => {
    const farms = await fetchFarms(userId);
    setUserFarmsCount(farms.length);
  }, []);

  useEffect(() => {
    if (activeUser?.id) {
      refreshUserFarms(activeUser.id);
    }
  }, [activeUser?.id, refreshUserFarms]);

  const handleLoginSuccess = (user: UserProfile) => {
    setActiveUserState(user);
    setActiveUser(user);
    setIsLoginOpen(false);
    if (user.location) {
      setCurrentLocation({ lat: user.location.lat, lng: user.location.lng });
    } else if (user.state && STATE_COORDINATES[user.state as IndianState]) {
      setSelectedState(user.state as IndianState);
      setSelectedUnit(getPrimaryUnitForState(user.state as IndianState));
      setCurrentLocation(STATE_COORDINATES[user.state as IndianState]);
    }
    if (user.totalLandAcres) {
      setFieldAreaAcres(user.totalLandAcres);
    }
    refreshUserFarms(user.id);
  };

  const handleLogout = () => {
    setActiveUserState(null);
    setActiveUser(null);
    localStorage.removeItem('bhootech_onboarding_completed');
    setIsProfileOpen(false);
    setIsLoginOpen(false);
    setIsOnboardingOpen(true);
    setUserFarmsCount(0);
  };

  const handleBoundaryUpdate = useCallback(
    (points: LatLng[], areaSqm: number, stats: HeatmapStats) => {
      setBoundaryPoints(points);
      setFieldAreaSqm(areaSqm);
      setFieldAreaAcres(stats.totalAreaAcres);
      setHeatmapStats(stats);
      if (points && points.length >= 3) {
        const validPoints = points.filter((p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
        if (validPoints.length >= 3) {
          const sumLat = validPoints.reduce((acc, p) => acc + p.lat, 0);
          const sumLng = validPoints.reduce((acc, p) => acc + p.lng, 0);
          const centerCoord: LatLng = {
            lat: Number((sumLat / validPoints.length).toFixed(6)),
            lng: Number((sumLng / validPoints.length).toFixed(6)),
          };
          try {
            const boundaryRecord = {
              points: validPoints,
              areaSqm,
              areaAcres: stats.totalAreaAcres,
              stats,
              center: centerCoord,
              updatedAt: new Date().toISOString(),
            };
            localStorage.setItem('bhootech_active_farm_boundary', JSON.stringify(boundaryRecord));
          } catch {}

          const resolved = getResolvedLocationDetails(centerCoord);
          if (resolved.state) {
            setSelectedState((prevState) => {
              if (prevState !== resolved.state) {
                setSelectedUnit(getPrimaryUnitForState(resolved.state));
                return resolved.state;
              }
              return prevState;
            });
          }
        }
      }
    },
    []
  );


  const handleStateChange = (newState: IndianState) => {
    setSelectedState(newState);
    setSelectedUnit(getPrimaryUnitForState(newState));
    if (STATE_COORDINATES[newState]) {
      setCurrentLocation(STATE_COORDINATES[newState]);
    }
  };

  const handleLoadFarmToMap = (farm: SavedFarm) => {
    setLoadedFarmBoundary(farm);
    const farmCenter = farm.center || (farm.points && farm.points.length > 0 ? farm.points[0] : null);
    if (farmCenter) {
      setCurrentLocation(farmCenter);
      const resolved = getResolvedLocationDetails(farmCenter);
      const targetState = (farm.state as IndianState) || resolved.state;
      if (targetState) {
        setSelectedState(targetState);
        setSelectedUnit(getPrimaryUnitForState(targetState));
      }
    } else if (farm.state && STATE_COORDINATES[farm.state as IndianState]) {
      setSelectedState(farm.state as IndianState);
      setSelectedUnit(getPrimaryUnitForState(farm.state as IndianState));
    }
    if (farm.areaAcres) {
      setFieldAreaAcres(farm.areaAcres);
    }
  };

  const handleDeleteFarm = (id: string) => {
    if (loadedFarmBoundary && loadedFarmBoundary.id === id) {
      setLoadedFarmBoundary(null);
      setBoundaryPoints([]);
    }
    if (activeUser?.id) {
      refreshUserFarms(activeUser.id);
    }
  };

  const handlePinpointLocation = async () => {
    setIsLocating(true);
    try {
      let target = liveGpsCoords;
      if (!target || !Number.isFinite(target.lat) || !Number.isFinite(target.lng)) {
        await refreshLocation();
        target = liveGpsCoords;
      }

      if (target && Number.isFinite(target.lat) && Number.isFinite(target.lng)) {
        setIsLocating(false);
        const newPos = {
          lat: Number(target.lat.toFixed(6)),
          lng: Number(target.lng.toFixed(6)),
        };
        setCurrentLocation(newPos);
        const resolved = getResolvedLocationDetails(newPos);
        if (resolved?.state) {
          setSelectedState(resolved.state);
        }
      } else {
        const loc = await getAccurateUserLocation();
        setIsLocating(false);
        setCurrentLocation({
          lat: loc.lat,
          lng: loc.lng,
        });
      }
    } catch (err) {
      setIsLocating(false);
      console.warn('Geolocation failed or denied, using current center:', err);
    }
  };

  const handleOpenNavigator = (targetId: string = 'nearest-red-spot') => {
    setNavigatorTargetId(targetId);
    setIsNavigatorOpen(true);
  };

  const handleOnboardingComplete = (
    user: UserProfile,
    st: IndianState,
    lang: LanguageCode,
    coords?: LatLng
  ) => {
    setIsOnboardingOpen(false);
    setActiveUserState(user);
    setActiveUser(user);
    setSelectedState(st);
    setSelectedUnit(getPrimaryUnitForState(st));
    if (user.totalLandAcres) {
      setFieldAreaAcres(user.totalLandAcres);
    }
    if (coords) {
      setCurrentLocation(coords);
    } else if (user.location?.lat && user.location?.lng) {
      setCurrentLocation({ lat: user.location.lat, lng: user.location.lng });
    } else if (STATE_COORDINATES[st]) {
      setCurrentLocation(STATE_COORDINATES[st]);
    }
    refreshUserFarms(user.id);
  };


  // Compute calculated health score
  const healthScore = heatmapStats
    ? Math.round(heatmapStats.healthyPct * 0.9 + heatmapStats.uniformityScore * 0.1)
    : 84;

  // Active Bottom Nav Tab calculation
  const currentBottomTab: BottomNavTab = useMemo(() => {
    if (isDrawerOpen) return 'more';
    if (isDatabaseOpen) return 'my-farms';
    if (isLeafDoctorOpen) return 'ai-diagnosis';
    if (isKrishiMitraOpen) return 'reports';
    return 'home';
  }, [isDrawerOpen, isDatabaseOpen, isLeafDoctorOpen, isKrishiMitraOpen]);

  return (
    <div className="min-h-screen bg-[#f6fbf5] text-[#181d1a] flex flex-col font-sans antialiased overflow-x-hidden transition-colors duration-200">
      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />

      {/* Sleek Top Navigation Header with Hamburger */}
      <Header
        onToggleDrawer={() => setIsDrawerOpen(true)}
        onOpenNavigator={() => handleOpenNavigator('nearest-red-spot')}
        onOpenKrishiMitra={() => setIsKrishiMitraOpen(true)}
        onOpenLeafDoctor={() => setIsLeafDoctorOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAiCompanion={() => setIsAiCompanionOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={activeUser}
        selectedState={selectedState}
        currentLocation={currentLocation}
        onPinpointLocation={handlePinpointLocation}
        isLocating={isLocating}
        activeView={activeView}
        onSelectView={handleNavigateView}
        activeNav={
          isAiCompanionOpen ? 'companion' :
          isKrishiMitraOpen ? 'krishi' :
          isLeafDoctorOpen ? 'leaf' :
          isWeatherOpen ? 'weather' :
          isDatabaseOpen ? 'database' : null
        }
      />

      {/* PRIMARY APPLICATION VIEWPORT: PRIVACY / TERMS / LANDING OVERVIEW vs SATELLITE COCKPIT */}
      {activeView === 'privacy' ? (
        <PrivacyPolicyPage
          onBackToApp={() => handleNavigateView('cockpit')}
          onNavigateToTerms={() => handleNavigateView('terms')}
        />
      ) : activeView === 'terms' ? (
        <TermsAndConditionsPage
          onBackToApp={() => handleNavigateView('cockpit')}
          onNavigateToPrivacy={() => handleNavigateView('privacy')}
        />
      ) : activeView === 'landing' ? (
        <LandingPage
          onEnterCockpit={() => handleNavigateView('cockpit')}
          onOpenKrishiMitra={() => setIsKrishiMitraOpen(true)}
          onOpenMandiRates={() => setIsMandiRatesOpen(true)}
          onOpenLeafDoctor={() => setIsLeafDoctorOpen(true)}
          onOpenDatabase={() => {
            setDatabaseInitialTab('farms');
            setIsDatabaseOpen(true);
          }}
          onOpenAddFarm={() => {
            setDatabaseInitialTab('saveCurrent');
            setIsDatabaseOpen(true);
          }}
          onOpenSmartSensor={() => {
            setDatabaseInitialTab('telemetry');
            setIsDatabaseOpen(true);
          }}
          onRunAnalysis={() => handleNavigateView('cockpit')}
          onSetLocation={() => handleNavigateView('cockpit')}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenAiCompanion={() => setIsAiCompanionOpen(true)}
          onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
          onOpenPrivacy={() => handleNavigateView('privacy')}
          onOpenTerms={() => handleNavigateView('terms')}
          onOpenWeather={() => setIsWeatherOpen(true)}
          user={activeUser}
          selectedState={selectedState}
          currentCoords={currentLocation}
          selectedFarm={loadedFarmBoundary || (getCachedFarms().length > 0 ? getCachedFarms()[0] : null)}
          weather={weatherData}
          heatmapStats={heatmapStats}
        />
      ) : (
        /* CLEAN MAP-FIRST MAIN INTERFACE (Full-Featured Center Stage) */
        <main className="flex-1 w-full p-2 sm:p-3 lg:p-4 flex flex-col min-h-0 relative">
          <div className="flex-1 w-full rounded-[14px] overflow-hidden shadow-xs border border-[#e5e9e4] bg-[#FFFFFF] relative flex flex-col min-h-[580px] sm:min-h-[640px] lg:min-h-[720px]">
            <MapBoundaryHeatmap
              currentLocation={currentLocation}
              savedProfileLocation={activeUser?.location}
              onLocationChange={setCurrentLocation}
              onBoundaryUpdate={handleBoundaryUpdate}
              initialEstimatedAcres={fieldAreaAcres}
              onOpenDatabase={() => setIsDatabaseOpen(true)}
              selectedState={selectedState}
              selectedUnit={selectedUnit}
              onUnitChange={setSelectedUnit}
              loadedBoundaryFarm={loadedFarmBoundary}
              onClearLoadedFarm={() => setLoadedFarmBoundary(null)}
              activeHeatmapMode={activeHeatmapMode}
              onModeChange={(mode) => setActiveHeatmapMode(mode)}
              targetMandi={targetMandiForRoute}
              onClearTargetMandi={() => setTargetMandiForRoute(null)}
            />
          </div>
        </main>
      )}

      {/* Floating Upward Arrow (^) Drawer Toggle & Slide-Up Quick Launch Suite (placed above bottom nav) */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-20 sm:right-6 flex flex-col items-end pointer-events-auto">
        <AnimatePresence>
          {isBottomDrawerOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mb-3 w-72 sm:w-80 bg-white rounded-2xl border border-[#E5E0D3] shadow-xl p-3 text-[#1F2A1F] space-y-2 transition-colors"
            >
              <div className="flex items-center justify-between px-1.5 pb-2 border-b border-[#E5E0D3]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F5233]">
                  {t('quickAiTelemetry')}
                </span>
                <span className="text-[10px] text-[#6B7280] font-mono">BhooTech AI</span>
              </div>

              {/* 0. BhooSaathi AI Companion */}
              <button
                type="button"
                onClick={() => {
                  setIsAiCompanionOpen(true);
                  setIsBottomDrawerOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F4F0E6] border border-[#E5E0D3] transition-all flex items-center gap-3 cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#2F5233]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F2A1F]">
                      {t('bhooSaathiCompanion')}
                    </span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-white text-[#2F5233] border border-[#E5E0D3]">
                      {t('voice')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    12 Indian regional dialects &amp; voice conversation
                  </p>
                </div>
              </button>

              {/* 1. Krishi Mitra AI */}
              <button
                type="button"
                onClick={() => {
                  setIsKrishiMitraOpen(true);
                  setIsBottomDrawerOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F4F0E6] border border-[#E5E0D3] transition-all flex items-center gap-3 cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#2F5233]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F2A1F]">
                      {t('krishiMitra')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white text-[#2F5233] border border-[#E5E0D3]">
                      {t('liveAI')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    Best crop choices, Mandi rates &amp; 2-3D forecast
                  </p>
                </div>
              </button>

              {/* 2. Leaf Doctor */}
              <button
                type="button"
                onClick={() => {
                  setIsLeafDoctorOpen(true);
                  setIsBottomDrawerOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F4F0E6] border border-[#E5E0D3] transition-all flex items-center gap-3 cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4 text-[#2F5233]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F2A1F]">
                      {t('leafDoctor')}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white text-[#2F5233] border border-[#E5E0D3]">
                      {t('scanner')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    Pathogen classification &amp; ICAR prescriptions
                  </p>
                </div>
              </button>

              {/* 3. Weather Telemetry */}
              <button
                type="button"
                onClick={() => {
                  setIsWeatherOpen(true);
                  setIsBottomDrawerOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#F4F0E6] border border-[#E5E0D3] transition-all flex items-center gap-3 cursor-pointer group shadow-xs"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EAF0EB] text-[#2F5233] border border-[#E5E0D3] flex items-center justify-center shrink-0">
                  <CloudSun className="w-4 h-4 text-[#2F5233]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1F2A1F]">
                      {t('localWeather')}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#2F5233] border border-[#E5E0D3]">
                      {weatherData ? `${weatherData.temperature}°C` : t('live')}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate">
                    {t('spraySuitabilityDesc')}
                  </p>
                </div>
              </button>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Upward-Facing Arrow Button (^) at Extreme Bottom-Right */}
        <button
          type="button"
          onClick={() => setIsBottomDrawerOpen((prev) => !prev)}
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center shadow-xl transition-all cursor-pointer border active:scale-95 ${
            isBottomDrawerOpen
              ? 'bg-white hover:bg-[#F4F0E6] border-[#E5E0D3] text-[#1F2A1F] rotate-180'
              : 'bg-[#2F5233] hover:bg-[#244027] text-white border-[#2F5233]'
          }`}
          title={isBottomDrawerOpen ? 'Close Quick Launch Suite' : 'Open Quick Launch Suite'}
          aria-label="Toggle Quick Launch Drawer"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Slide-out Navigation Drawer */}
      <SideNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeView={activeView}
        onOpenLanding={() => handleNavigateView('landing')}
        onOpenCockpit={() => handleNavigateView('cockpit')}
        onOpenPrivacy={() => handleNavigateView('privacy')}
        onOpenTerms={() => handleNavigateView('terms')}
        onOpenNavigator={() => handleOpenNavigator('nearest-red-spot')}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenKrishiMitra={() => setIsKrishiMitraOpen(true)}
        onOpenMandiRates={() => setIsMandiRatesOpen(true)}
        onOpenLeafDoctor={() => setIsLeafDoctorOpen(true)}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAiCompanion={() => setIsAiCompanionOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={activeUser}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        currentLocation={currentLocation}
        activeUnit={selectedUnit}
        healthScore={healthScore}
      />

      {/* Standalone Field Compass & Farmer GPS Navigator Overlay */}
      {isNavigatorOpen && (
        <FieldCompassOverlay
          isOpen={isNavigatorOpen}
          onClose={() => setIsNavigatorOpen(false)}
          fieldBoundaryPoints={boundaryPoints}
          fieldCenter={currentLocation}
          userLocation={currentLocation}
          savedProfileLocation={activeUser?.location}
          initialTargetId={navigatorTargetId}
          onCenterMapOnField={() => setCurrentLocation(currentLocation)}
          onUserLocationUpdate={(pos) => setCurrentLocation(pos)}
        />
      )}

      {/* First-Time Onboarding Modal with GPS State & Language Detection */}
      <OnboardingModal
        isOpen={!activeUser || isOnboardingOpen}
        onClose={() => {
          if (activeUser) {
            setIsOnboardingOpen(false);
          }
        }}
        onComplete={handleOnboardingComplete}
      />

      {/* Standalone Krishi Mitra Modal (SIH Precision Engine & Mandi Intelligence) */}
      <KrishiMitraModal
        isOpen={isKrishiMitraOpen}
        onClose={() => setIsKrishiMitraOpen(false)}
        selectedFarm={loadedFarmBoundary || (getCachedFarms().length > 0 ? getCachedFarms()[0] : null)}
        hasSavedFarms={getCachedFarms().length > 0 || userFarmsCount > 0}
        boundaryPoints={boundaryPoints}
        weather={weatherData}
        heatmapStats={heatmapStats}
        selectedState={selectedState}
        fieldAreaAcres={fieldAreaAcres}
        currentLocation={currentLocation}
        activeUser={activeUser}
        selectedUnit={selectedUnit}
        onGoToAddFarm={() => {
          setIsKrishiMitraOpen(false);
          setIsDatabaseOpen(true);
        }}
        onRunAnalysis={() => {
          setIsKrishiMitraOpen(false);
          setActiveView('cockpit');
        }}
        onNavigateToMandi={(mandi) => {
          setIsKrishiMitraOpen(false);
          setTargetMandiForRoute({
            name: mandi.mandiName || 'APMC Mandi',
            lat: mandi.coordinates?.lat || currentLocation.lat + 0.05,
            lng: mandi.coordinates?.lng || currentLocation.lng + 0.05,
            distanceKm: mandi.distanceKm,
            commodity: 'Produce',
            modalPrice: mandi.currentPricePerQuintal,
          });
          handleOpenNavigator('nearest-mandi');
        }}
      />

      {/* Standalone Mandi Rates & Regional Farm Schedule Modal */}
      <MandiRatesModal
        isOpen={isMandiRatesOpen}
        onClose={() => setIsMandiRatesOpen(false)}
        currentLocation={currentLocation}
        selectedState={selectedState}
        activeUser={activeUser}
        fieldAreaAcres={fieldAreaAcres}
        onNavigateToMandi={(mandi) => {
          setIsMandiRatesOpen(false);
          setTargetMandiForRoute({
            name: mandi.mandiName || 'APMC Mandi',
            lat: mandi.coordinates?.lat || currentLocation.lat + 0.05,
            lng: mandi.coordinates?.lng || currentLocation.lng + 0.05,
            distanceKm: mandi.distanceKm,
            commodity: 'Produce',
            modalPrice: mandi.currentPricePerQuintal,
          });
          handleOpenNavigator('nearest-mandi');
        }}
      />

      {/* Standalone Leaf Doctor Modal (AI Disease & Pest Diagnostics) */}
      <LeafDiagnosticModal
        isOpen={isLeafDoctorOpen}
        onClose={() => setIsLeafDoctorOpen(false)}
        defaultCropName={activeUser?.primaryCrop || 'Wheat'}
        selectedState={selectedState}
        fieldAreaAcres={fieldAreaAcres}
        heatmapStats={heatmapStats}
      />

      {/* Standalone Weather & Atmospheric Risk Telemetry Modal */}
      <WeatherModal
        isOpen={isWeatherOpen}
        onClose={() => setIsWeatherOpen(false)}
        weather={weatherData}
        location={currentLocation}
        locationName={selectedState}
      />


      {/* Database Registry Modal */}
      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        initialTab={databaseInitialTab}
        user={activeUser}
        currentPoints={boundaryPoints}
        currentCenter={currentLocation}
        currentAreaAcres={fieldAreaAcres}
        currentAreaSqm={fieldAreaSqm}
        currentHealthScore={healthScore}
        selectedState={selectedState}
        onLoadFarmToMap={handleLoadFarmToMap}
        onDeleteFarm={handleDeleteFarm}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Farmer Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          if (activeUser) {
            setIsLoginOpen(false);
          }
        }}
        onLoginSuccess={handleLoginSuccess}
        isMandatory={!activeUser}
      />

      {/* Farmer Passbook Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={activeUser}
        onLogout={handleLogout}
        farmCount={userFarmsCount}
        onUpdateUser={(updatedUser) => {
          setActiveUserState(updatedUser);
          setActiveUser(updatedUser);
        }}
        onFlyToLocation={(loc) => {
          if (loc && Number.isFinite(loc.lat) && Number.isFinite(loc.lng)) {
            setCurrentLocation(loc);
          } else {
            console.error('App.tsx: onFlyToLocation aborted, received invalid coordinates', loc);
          }
        }}
      />

      {/* BhooSaathi AI Regional Dialect Companion Modal */}
      <AICompanionModal
        isOpen={isAiCompanionOpen}
        onClose={() => setIsAiCompanionOpen(false)}
        currentUser={activeUser}
        crop={activeUser?.primaryCrop || 'Wheat'}
        state={selectedState}
        fieldAreaAcres={fieldAreaAcres}
        healthyPct={heatmapStats?.healthyPct ?? 76}
        stressPct={heatmapStats ? Math.round(heatmapStats.moderateStressPct + heatmapStats.severeNonVegPct) : 24}
        onOpenCockpit={() => setActiveView('cockpit')}
        onOpenFieldAnalysis={() => setActiveView('cockpit')}
        onOpenWeather={() => setIsWeatherOpen(true)}
        onOpenMandi={() => setIsMandiRatesOpen(true)}
        onOpenLeafDoctor={() => setIsLeafDoctorOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
      />

      {/* Simplified Indian Regional Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Comprehensive Farmer Settings & System Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenPrivacy={() => handleNavigateView('privacy')}
        onOpenTerms={() => handleNavigateView('terms')}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        currentLocation={currentLocation}
        activeUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        user={activeUser}
        onOpenProfile={() => setIsProfileOpen(true)}
        onUpdateUser={(updatedUser) => {
          setActiveUserState(updatedUser);
          setActiveUser(updatedUser);
        }}
      />

      {/* Google Stitch Bottom Navigation Bar (5 tabs) */}
      <BottomNavBar
        activeTab={currentBottomTab}
        onSelectTab={() => {}}
        onNavigateHome={() => {
          setIsDatabaseOpen(false);
          setIsLeafDoctorOpen(false);
          setIsKrishiMitraOpen(false);
          setIsDrawerOpen(false);
          handleNavigateView('cockpit');
        }}
        onOpenMyFarms={() => {
          setIsLeafDoctorOpen(false);
          setIsKrishiMitraOpen(false);
          setIsDrawerOpen(false);
          setIsDatabaseOpen(true);
        }}
        onOpenAiDiagnosis={() => {
          setIsDatabaseOpen(false);
          setIsKrishiMitraOpen(false);
          setIsDrawerOpen(false);
          setIsLeafDoctorOpen(true);
        }}
        onOpenReports={() => {
          setIsDatabaseOpen(false);
          setIsLeafDoctorOpen(false);
          setIsDrawerOpen(false);
          setIsKrishiMitraOpen(true);
        }}
        onOpenMore={() => {
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}

function AppContent() {
  const { status, coords } = useLocation();
  const [initialLanguagePicked, setInitialLanguagePicked] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('bhootech_language'));
  });
  const [showInitialLangModal, setShowInitialLangModal] = useState<boolean>(() => {
    return !localStorage.getItem('bhootech_language');
  });

  // 1. Language selection if not yet configured
  if (showInitialLangModal && !initialLanguagePicked) {
    return (
      <LanguageModal
        isOpen={true}
        onClose={() => {
          setInitialLanguagePicked(true);
          setShowInitialLangModal(false);
        }}
      />
    );
  }

  // 2. Mandatory Gate: App content must not load until status is 'granted' and valid coords exist
  const isLocationGranted =
    status === 'granted' &&
    coords !== null &&
    Number.isFinite(coords?.lat) &&
    Number.isFinite(coords?.lng);

  if (!isLocationGranted) {
    return <LocationGate />;
  }

  // 3. Render Main Application
  return <MainApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

