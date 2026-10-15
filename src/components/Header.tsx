import React from 'react';
import {
  Sprout,
  Menu,
  Bell,
  User,
} from 'lucide-react';
import { IndianState, LatLng } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile } from '../services/dbApi';

interface HeaderProps {
  onToggleDrawer: () => void;
  onOpenNavigator?: () => void;
  onOpenKrishiMitra: () => void;
  onOpenLeafDoctor: () => void;
  onOpenWeather: () => void;
  onOpenDatabase: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onOpenAiCompanion?: () => void;
  onOpenLanguageModal?: () => void;
  onOpenSettings?: () => void;
  user: UserProfile | null;
  selectedState: IndianState;
  currentLocation: LatLng;
  onPinpointLocation?: () => void;
  isLocating?: boolean;
  activeNav?: 'krishi' | 'leaf' | 'weather' | 'database' | 'companion' | null;
  activeView?: 'landing' | 'cockpit' | 'privacy' | 'terms';
  onSelectView?: (view: 'landing' | 'cockpit' | 'privacy' | 'terms') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleDrawer,
  onOpenKrishiMitra,
  onOpenProfile,
  onOpenLogin,
  onOpenLanguageModal,
  user,
  activeView = 'cockpit',
  onSelectView,
}) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageToggle = () => {
    if (onOpenLanguageModal) {
      onOpenLanguageModal();
    } else {
      setLanguage(language === 'en' ? 'hi' : 'en');
    }
  };

  const getSubtitle = () => {
    if (activeView === 'landing') return 'Dashboard Home';
    if (activeView === 'privacy') return 'Privacy Policy';
    if (activeView === 'terms') return 'Terms of Service';
    return 'Kisan Smart Cockpit';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#f6fbf5] border-b border-[#e5e9e4] shadow-[0_1px_8px_rgba(0,0,0,0.04)] h-16">
      <div className="h-16 px-3 sm:px-4 max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* LEFT: Leaf emblem + Full Brand Name 'BhooTech AI' + Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Hamburger trigger for side drawer */}
          <button
            type="button"
            onClick={onToggleDrawer}
            className="w-9 h-9 rounded-xl bg-[#ffffff] hover:bg-[#ebefea] border border-[#e5e9e4] text-[#181d1a] flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
            title="Open Menu"
            aria-label="Toggle Side Drawer"
          >
            <Menu className="w-4 h-4 text-[#181d1a]" />
          </button>

          {/* Small circular leaf logo emblem */}
          <div
            onClick={onSelectView ? () => onSelectView('landing') : undefined}
            className="w-8 h-8 rounded-full bg-[#183b1e] flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer"
            title="BhooTech AI"
          >
            <Sprout className="w-5 h-5 text-white" />
          </div>

          {/* Full Text BhooTech AI (No truncation) + Badge + Subtitle */}
          <div
            onClick={onSelectView ? () => onSelectView('landing') : undefined}
            className="flex flex-col min-w-0 cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-[#183b1e] whitespace-nowrap leading-none tracking-tight">
                BhooTech AI
              </span>
              <span className="bg-[#c4edc3] text-[#002108] text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Kisan Smart
              </span>
            </div>
            <span className="text-[11px] text-[#424841] font-semibold truncate leading-tight mt-0.5">
              {getSubtitle()}
            </span>
          </div>
        </div>

        {/* RIGHT: Language toggle chip (EN / हिंदी) + Notification bell + Circular profile avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Language Toggle Chip: EN / हिंदी */}
          <button
            type="button"
            onClick={handleLanguageToggle}
            aria-label="Switch Language"
            className="min-h-[38px] px-2.5 py-1 rounded-full bg-[#ebefea] hover:bg-[#e5e9e4] border border-[#e5e9e4] flex items-center justify-center gap-1 text-[#181d1a] transition-colors cursor-pointer shadow-xs"
            title="Toggle Language / भाषा चुनें"
          >
            <span
              className={`text-[11px] font-bold ${
                language === 'en' ? 'text-[#183b1e]' : 'text-[#727970]'
              }`}
            >
              EN
            </span>
            <span className="text-[10px] text-[#727970]">/</span>
            <span
              className={`text-[11px] font-bold ${
                language !== 'en' ? 'text-[#183b1e]' : 'text-[#727970]'
              }`}
            >
              हिंदी
            </span>
          </button>

          {/* Notification Bell Icon with Amber Alert Dot */}
          <button
            type="button"
            onClick={onOpenKrishiMitra}
            aria-label="Advisories and Alerts"
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#424841] hover:text-[#181d1a] hover:bg-[#ebefea] transition-colors relative cursor-pointer"
            title="Live Alerts & Agronomic Advisories"
          >
            <Bell className="w-5 h-5 text-[#424841]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8f4e00] ring-2 ring-[#f6fbf5] animate-pulse" />
          </button>

          {/* Circular Profile Avatar */}
          <button
            type="button"
            onClick={user ? onOpenProfile : onOpenLogin}
            aria-label="Farmer Profile"
            className="w-9 h-9 flex items-center justify-center rounded-full ring-1 ring-[#c2c8be] overflow-hidden bg-[#ffffff] hover:scale-105 transition-transform cursor-pointer shadow-xs"
            title={user ? `Profile: ${user.name}` : 'Login / Profile'}
          >
            {user ? (
              <div className="w-full h-full bg-[#c4edc3] text-[#002108] font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-4 h-4 text-[#424841]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
