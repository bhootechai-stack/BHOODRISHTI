import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Map,
  Database,
  CloudSun,
  Stethoscope,
  Store,
  Compass,
  FileText,
  ShieldCheck,
  ChevronRight,
  User,
  Radio,
  LogIn,
  Satellite,
  Globe,
  MapPin,
  Settings,
  ChevronDown,
  Sliders,
  LogOut,
} from 'lucide-react';
import { IndianState, LandUnit, LatLng } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile } from '../services/dbApi';
import { PWAInstallButton } from './PWAInstallButton';
import { PALETTE } from '../utils/themeTokens';

interface SideNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: 'landing' | 'cockpit' | 'privacy' | 'terms';
  onOpenLanding: () => void;
  onOpenCockpit: () => void;
  onOpenNavigator?: () => void;
  onOpenOnboarding?: () => void;
  onOpenKrishiMitra: () => void;
  onOpenMandiRates?: () => void;
  onOpenLeafDoctor: () => void;
  onOpenWeather: () => void;
  onOpenDatabase: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onOpenAiCompanion?: () => void;
  onOpenLanguageModal?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenSettings?: () => void;
  user: UserProfile | null;
  selectedState: IndianState;
  onStateChange: (state: IndianState) => void;
  currentLocation: LatLng;
  activeUnit: LandUnit;
  healthScore: number;
}

export const SideNavDrawer: React.FC<SideNavDrawerProps> = ({
  isOpen,
  onClose,
  activeView,
  onOpenLanding,
  onOpenCockpit,
  onOpenNavigator,
  onOpenOnboarding,
  onOpenKrishiMitra,
  onOpenMandiRates,
  onOpenLeafDoctor,
  onOpenWeather,
  onOpenDatabase,
  onOpenProfile,
  onOpenLogin,
  onOpenAiCompanion,
  onOpenLanguageModal,
  onOpenPrivacy,
  onOpenTerms,
  onOpenSettings,
  user,
  selectedState,
  onStateChange,
  currentLocation,
  activeUnit,
  healthScore,
}) => {
  const { t } = useLanguage();
  const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40"
          />

          {/* Drawer Menu Surface */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[#F4F1E8] text-[#1E2B1F] h-full shadow-2xl border-r border-[#E6E1D3] flex flex-col z-10 overflow-hidden transition-colors"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 bg-[#FBFAF5] border-b border-[#E6E1D3] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] flex items-center justify-center relative shadow-xs">
                  <User className="w-5 h-5 text-[#2D5A36]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2D5A36] border-2 border-white rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-[#1E2B1F] tracking-tight">BhooTech</span>
                    <span className="text-[#2D5A36] font-bold">AI</span>
                  </div>
                  <span className="text-[10px] text-[#6B7266] font-medium flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-[#6B7266]" />
                    Better Crops. Brighter Future.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[#FBFAF5] hover:bg-[#F4F1E8] text-[#6B7266] hover:text-[#1E2B1F] flex items-center justify-center transition-colors cursor-pointer border border-[#E6E1D3]"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Farmer Account Badge / Quick Login */}
              {user ? (
                <div
                  onClick={() => {
                    onOpenProfile();
                    onClose();
                  }}
                  className="p-3 bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3] font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F] transition-colors">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-[#6B7266] font-medium font-mono">
                        {user.kisanId} • {user.primaryCrop || 'Wheat'} ({user.totalLandAcres || 2.5} Ac)
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </div>
              ) : (
                <div
                  onClick={() => {
                    onOpenLogin();
                    onClose();
                  }}
                  className="p-3 bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] rounded-xl cursor-pointer transition-all flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3] flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-[#2D5A36]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F]">{t('signInRegister')}</div>
                      <div className="text-[10px] text-[#6B7266]">{t('linkLiveGps')}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}

              {/* SECTION 1: PRIMARY ACTIONS */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B7266] px-1 flex items-center justify-between">
                  <span>{t('fastNavigation')}</span>
                  <span className="text-[9px] text-[#6B7266] font-mono font-semibold">{t('instantAccess')}</span>
                </div>

                {/* Primary Views: Overview vs Satellite Cockpit */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLanding) onOpenLanding();
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                      activeView === 'landing'
                        ? 'bg-[#2D5A36] text-white border-[#2D5A36] font-bold'
                        : 'bg-[#FBFAF5] hover:bg-[#FBFAF5] text-[#1E2B1F] border-[#E6E1D3] font-medium'
                    }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{t('overview')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCockpit) onOpenCockpit();
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
                      activeView === 'cockpit'
                        ? 'bg-[#2D5A36] text-white border-[#2D5A36] font-bold'
                        : 'bg-[#FBFAF5] hover:bg-[#FBFAF5] text-[#1E2B1F] border-[#E6E1D3] font-medium'
                    }`}
                  >
                    <Satellite className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{t('satelliteMap')}</span>
                  </button>
                </div>

                {/* 0. Navigate to Red Spot (Compass & HUD) - Reserved Alert Red */}
                {onOpenNavigator && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenNavigator();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#F8E3E0] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F8E3E0] border border-[#F8E3E0] text-[#C0392B] flex items-center justify-center">
                        <Compass className="w-4 h-4 text-[#C0392B]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>{t('navigateToRedSpot')}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F8E3E0] text-[#C0392B] border border-[#F8E3E0]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
                            {t('redSpot')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          {t('navRedSpotDesc')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* BhooSaathi AI Companion */}
                {onOpenAiCompanion && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAiCompanion();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#2D5A36]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>{t('bhooSaathiCompanion')}</span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#FBFAF5] text-[#2D5A36] border border-[#E6E1D3]">
                            {t('dialectVoice')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          {t('bhooSaathiDesc')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Setting Option */}
                <div className="rounded-xl border border-[#E6E1D3] bg-[#FBFAF5] overflow-hidden transition-all shadow-xs">
                  <div
                    onClick={() => setIsSettingsExpanded((prev) => !prev)}
                    className="w-full p-2.5 text-left flex items-center justify-between transition-all duration-150 cursor-pointer group hover:bg-[#FBFAF5]"
                    title="Toggle Settings: Regional Language & Farm Location"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4 text-[#6B7266]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>Settings</span>
                          <span className="text-[10px] text-[#6B7266] font-normal">
                            (सेटिंग्स)
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          Regional language, farm location &amp; preferences
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3]">
                        2 options
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6B7266] transition-transform duration-200 ${
                          isSettingsExpanded ? 'rotate-180 text-[#1E2B1F]' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Sub-Options */}
                  <AnimatePresence>
                    {isSettingsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-[#E6E1D3] bg-[#FBFAF5] p-2 space-y-1.5"
                      >
                        <div className="px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6B7266] flex items-center justify-between">
                          <span>Configured Options</span>
                          <span className="text-[#6B7266] font-mono">2 Active</span>
                        </div>

                        {/* 1. Regional Languages */}
                        {onOpenLanguageModal && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenLanguageModal();
                              onClose();
                            }}
                            className="w-full p-2.5 rounded-lg bg-[#FBFAF5] hover:bg-[#F4F1E8] border border-[#E6E1D3] text-left flex items-center justify-between transition-all cursor-pointer group shadow-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center shrink-0">
                                <Globe className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#1E2B1F] transition-colors">
                                  {t('regionalLanguages')}
                                </div>
                                <div className="text-[10px] text-[#6B7266]">
                                  {t('regionalLanguagesDesc')}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        )}

                        {/* 2. Setup Location & Regional Language */}
                        {onOpenOnboarding && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenOnboarding();
                              onClose();
                            }}
                            className="w-full p-2.5 rounded-lg bg-[#FBFAF5] hover:bg-[#F4F1E8] border border-[#E6E1D3] text-left flex items-center justify-between transition-all cursor-pointer group shadow-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-[#6B7266]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#1E2B1F] transition-colors">
                                  {t('setupLocationLang')}
                                </div>
                                <div className="text-[10px] text-[#6B7266]">
                                  {t('setupLocationLangDesc')}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        )}

                        {/* Direct shortcut to open Full Settings Modal */}
                        {onOpenSettings && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenSettings();
                              onClose();
                            }}
                            className="w-full py-1.5 px-2 text-center text-xs text-[#2D5A36] hover:text-[#244027] bg-[#FBFAF5] hover:bg-[#F4F1E8] rounded-lg border border-[#E6E1D3] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Sliders className="w-3 h-3 text-[#2D5A36]" />
                            <span>Open All App Preferences &amp; Units →</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 1. Krishi Mitra AI */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenKrishiMitra();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[#2D5A36]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                        <span>{t('krishiMitra')}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                          AI
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6B7266]">
                        {t('krishiMitraDesc')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Mandi Rates & Farm Schedule */}
                {onOpenMandiRates && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenMandiRates();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#6B7266]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>{t('mandiRates')}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3]">
                            APMC &amp; MSP
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          {t('mandiRatesDesc')}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Leaf Doctor */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenLeafDoctor();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-[#6B7266]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F]">
                        Leaf Doctor
                      </div>
                      <div className="text-[10px] text-[#6B7266]">
                        {t('leafDoctorDesc')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Weather Telemetry */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenWeather();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                      <CloudSun className="w-4 h-4 text-[#6B7266]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F]">
                        {t('localWeather')}
                      </div>
                      <div className="text-[10px] text-[#6B7266]">
                        {t('weatherDesc')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Interactive Map */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3] flex items-center justify-center">
                      <Map className="w-4 h-4 text-[#2D5A36]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F]">
                        {t('interactiveMap')}
                      </div>
                      <div className="text-[10px] text-[#6B7266]">
                        {t('interactiveMapDesc')}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                    Active
                  </span>
                </button>

                {/* Farm Database */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenDatabase();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                      <Database className="w-4 h-4 text-[#6B7266]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1E2B1F]">
                        {t('farmRegistry')}
                      </div>
                      <div className="text-[10px] text-[#6B7266]">
                        {t('farmRegistryDesc')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Privacy Policy */}
                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPrivacy();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4 text-[#6B7266]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>Privacy Policy (डेटा सुरक्षा)</span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          Kisan data rights &amp; encryption
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Terms & Conditions */}
                {onOpenTerms && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTerms();
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#FBFAF5] hover:bg-[#FBFAF5] border border-[#E6E1D3] text-left flex items-center justify-between transition-all duration-150 cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FBFAF5] text-[#6B7266] border border-[#E6E1D3] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#6B7266]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E2B1F] flex items-center gap-1.5">
                          <span>Terms &amp; Conditions (नियम एवं शर्तें)</span>
                        </div>
                        <div className="text-[10px] text-[#6B7266]">
                          Agronomic disclaimers &amp; subscriptions
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B7266] group-hover:text-[#1E2B1F] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* In-App Install Prompt */}
                <div className="pt-1">
                  <PWAInstallButton variant="full" className="w-full justify-center py-2 text-xs" />
                </div>
              </div>
            </div>

            {/* Footer & Legal */}
            <div className="p-3.5 bg-[#FBFAF5] border-t border-[#E6E1D3] text-center shrink-0 space-y-2">
              <div className="flex items-center justify-center gap-3 text-xs text-[#6B7266]">
                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenPrivacy();
                      onClose();
                    }}
                    className="hover:text-[#1E2B1F] font-medium transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                )}
                <span>•</span>
                {onOpenTerms && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenTerms();
                      onClose();
                    }}
                    className="hover:text-[#1E2B1F] font-medium transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[#6B7266]">
                BhooTech AI • Better Crops. Brighter Future.
              </p>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
