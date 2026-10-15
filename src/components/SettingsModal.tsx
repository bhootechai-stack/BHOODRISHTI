import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Globe,
  MapPin,
  Ruler,
  Sun,
  Moon,
  ShieldCheck,
  FileText,
  ChevronRight,
  Check,
  Sparkles,
  Landmark,
} from 'lucide-react';
import { IndianState, LatLng, LandUnit } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { INDIAN_STATE_UNITS } from '../data/indianUnits';
import { ALL_INDIAN_STATES } from '../utils/geoUtils';
import { UserProfile } from '../services/dbApi';
import { GovernmentFarmerIdCard } from './GovernmentFarmerIdCard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLanguageModal?: () => void;
  onOpenOnboarding?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  selectedState: IndianState;
  onStateChange: (state: IndianState) => void;
  currentLocation: LatLng;
  activeUnit: LandUnit;
  onUnitChange: (unit: LandUnit) => void;
  user: UserProfile | null;
  onOpenProfile?: () => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenLanguageModal,
  onOpenOnboarding,
  onOpenPrivacy,
  onOpenTerms,
  selectedState,
  onStateChange,
  currentLocation,
  activeUnit,
  onUnitChange,
  user,
  onUpdateUser,
}) => {
  const { language, setLanguage, spokenDialectObj, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'govtid' | 'language' | 'location' | 'units'>('general');

  if (!isOpen) return null;

  // Available units for the current state
  const stateUnitGroup = INDIAN_STATE_UNITS.find((s) => s.state === selectedState);
  const availableUnits = stateUnitGroup?.units || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E5E0D3] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 text-[#1F2A1F]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E5E0D3] bg-[#FFFFFF] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                  <span>Settings & Preferences</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#FAF8F2] border border-[#E5E0D3] text-[#6B7280] font-medium">
                    सेटिंग्स
                  </span>
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Regional languages, GPS location, land units and app appearance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#6B7280] hover:text-[#1F2A1F] flex items-center justify-center transition-colors cursor-pointer border border-[#E5E0D3]"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-[#E5E0D3] bg-[#F7F4EC] gap-1 overflow-x-auto shrink-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'general'
                  ? 'border-[#2F5233] text-[#2F5233]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2A1F]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('govtid')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'govtid'
                  ? 'border-[#2F5233] text-[#2F5233]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2A1F]'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt ID (Agristack)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('language')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'language'
                  ? 'border-[#2F5233] text-[#2F5233]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2A1F]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Language & Dialects</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'location'
                  ? 'border-[#2F5233] text-[#2F5233]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2A1F]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Farm Location</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('units')}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'units'
                  ? 'border-[#2F5233] text-[#2F5233]'
                  : 'border-transparent text-[#6B7280] hover:text-[#1F2A1F]'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Land Units</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
            {/* TAB: GENERAL / OVERVIEW */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                {/* 1. Regional Language Quick Card */}
                <div className="p-4 rounded-xl border border-[#E5E0D3] bg-[#FAF8F2] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1F2A1F] flex items-center gap-2">
                          <span>Regional Languages & Dialects</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F4EC] text-[#6B7280] border border-[#E5E0D3]">
                            {languages.find((l) => l.code === language)?.nativeName || 'English'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          Voice AI speaks in {spokenDialectObj.name} ({spokenDialectObj.nativeName})
                        </p>
                      </div>
                    </div>

                    {onOpenLanguageModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenLanguageModal();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D3] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>Change</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Farm Location Quick Card */}
                <div className="p-4 rounded-xl border border-[#E5E0D3] bg-[#FAF8F2] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1F2A1F] flex items-center gap-2">
                          <span>Farm Location & Regional State</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F7F4EC] text-[#6B7280] border border-[#E5E0D3]">
                            {selectedState}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5 font-mono">
                          {currentLocation.lat.toFixed(4)}° N, {currentLocation.lng.toFixed(4)}° E
                        </p>
                      </div>
                    </div>

                    {onOpenOnboarding && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenOnboarding();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D3] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        <span>Re-run Setup</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Land Unit Quick Card */}
                <div className="p-4 rounded-xl border border-[#E5E0D3] bg-[#FAF8F2] transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
                        <Ruler className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1F2A1F]">
                          Land Measurement Unit
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          Active: <span className="font-semibold text-[#2F5233]">{activeUnit.name}</span> ({activeUnit.sqMeters} m²)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('units')}
                      className="text-xs text-[#2F5233] font-bold hover:underline cursor-pointer"
                    >
                      Configure Units →
                    </button>
                  </div>
                </div>

                {/* 4. Display Theme Card */}
                <div className="p-4 rounded-xl border border-[#E5E0D3] bg-[#FAF8F2] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1F2A1F]">
                        Color Theme
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        Currently using {theme === 'dark' ? 'Espresso Charcoal' : 'Sunlit Light'} mode
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D3] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold cursor-pointer transition-colors"
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>

                {/* 5. Government Farmer ID Showcase Card */}
                <div className="p-4 rounded-xl border border-[#E5E0D3] bg-[#FAF8F2] transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E5E0D3] text-[#2F5233] flex items-center justify-center shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1F2A1F] flex items-center gap-2">
                          <span>Government Farmer ID</span>
                          {user?.governmentFarmerId ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#6B7280] border border-[#E5E0D3]">
                              Pending Verification
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] text-[#2F5233] border border-[#E5E0D3]">
                              PM-KISAN / Agristack
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {user?.governmentFarmerId
                            ? `Linked ID: ${user.governmentFarmerId} • Direct Agristack sync in roadmap`
                            : 'Link your government ID for DBT & scheme eligibility showcase'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('govtid')}
                      className="px-3 py-1.5 rounded-lg bg-[#2F5233] hover:bg-[#6e8a74] text-[#F7F4EC] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      <span>{user?.governmentFarmerId ? 'View / Change' : 'Verify ID'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 6. Legal & Data Privacy Shortcuts */}
                <div className="pt-2 flex items-center justify-between text-xs text-[#6B7280] border-t border-[#E5E0D3]">
                  <div className="flex items-center gap-4">
                    {onOpenPrivacy && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenPrivacy();
                          onClose();
                        }}
                        className="hover:text-[#1F2A1F] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Privacy Policy</span>
                      </button>
                    )}
                    {onOpenTerms && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenTerms();
                          onClose();
                        }}
                        className="hover:text-[#1F2A1F] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Terms & Conditions</span>
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-[#6B7280]">BhooTech v2.6</span>
                </div>
              </div>
            )}

            {/* TAB: GOVERNMENT FARMER ID (AGRISTACK / PM-KISAN) */}
            {activeTab === 'govtid' && (
              <div className="space-y-4">
                <GovernmentFarmerIdCard
                  user={user}
                  onUpdateUser={onUpdateUser}
                  onBackToProfile={() => setActiveTab('general')}
                />
              </div>
            )}

            {/* TAB: LANGUAGE & DIALECTS */}
            {activeTab === 'language' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF8F2] border border-[#E5E0D3] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1F2A1F]">
                      12 Indian Languages Supported
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Choose your preferred interface language
                    </div>
                  </div>
                  {onOpenLanguageModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenLanguageModal();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D3] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Advanced Voice Settings
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLanguage(l.code)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        language === l.code
                          ? 'border-[#2F5233] bg-[#FAF8F2] ring-1 ring-[#2F5233]'
                          : 'border-[#E5E0D3] bg-[#FFFFFF] hover:bg-[#FAF8F2]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1F2A1F]">
                          {l.nativeName}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {l.name}
                        </div>
                      </div>
                      {language === l.code && (
                        <Check className="w-4 h-4 text-[#2F5233] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: FARM LOCATION */}
            {activeTab === 'location' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF8F2] border border-[#E5E0D3] rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1F2A1F]">
                      Current Region & GPS Coordinates
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Customizes Mandi rates, weather forecast and land revenue units
                    </div>
                  </div>
                  {onOpenOnboarding && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenOnboarding();
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D3] border border-[#E5E0D3] text-[#1F2A1F] text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Full Setup Wizard
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1F2A1F]">
                    Select Indian State / UT
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => onStateChange(e.target.value as IndianState)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E0D3] bg-[#F7F4EC] text-[#1F2A1F] text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-[#2F5233] cursor-pointer"
                  >
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5E0D3] space-y-1">
                  <div className="text-xs font-bold text-[#1F2A1F]">
                    GPS Coordinates
                  </div>
                  <div className="text-xs font-mono text-[#2F5233]">
                    Latitude: {currentLocation.lat.toFixed(6)} | Longitude: {currentLocation.lng.toFixed(6)}
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    To auto-detect via satellite GPS, use the Crosshair button on the top map toolbar.
                  </p>
                </div>
              </div>
            )}

            {/* TAB: LAND UNITS */}
            {activeTab === 'units' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF8F2] border border-[#E5E0D3] rounded-xl">
                  <div className="text-xs font-bold text-[#1F2A1F]">
                    State Land Revenue Units ({selectedState})
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    Select how field area is calculated and displayed across maps and reports
                  </div>
                </div>

                <div className="space-y-2">
                  {availableUnits.map((u) => {
                    const isSelected = activeUnit.id === u.id || activeUnit.name === u.name;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => onUnitChange(u)}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#2F5233] bg-[#FAF8F2] ring-1 ring-[#2F5233]'
                            : 'border-[#E5E0D3] bg-[#FFFFFF] hover:bg-[#FAF8F2]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1F2A1F] flex items-center gap-2">
                            <span>{u.name}</span>
                            {u.localName && (
                              <span className="text-[10px] text-[#6B7280]">
                                ({u.localName})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6B7280] mt-0.5">
                            {u.description} • 1 unit = {u.sqMeters.toLocaleString()} m²
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#2F5233] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-[#F7F4EC] border-t border-[#E5E0D3] flex items-center justify-between shrink-0">
            <span className="text-xs text-[#6B7280]">
              Changes are automatically saved locally
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2F5233] hover:bg-[#6e8a74] text-[#F7F4EC] text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Done (पूर्ण)
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
