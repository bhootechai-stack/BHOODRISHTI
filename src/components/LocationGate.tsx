import React, { useState } from 'react';
import {
  Sprout,
  MapPin,
  Lock,
  AlertTriangle,
  RotateCw,
  Radio,
  ShieldAlert,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useLanguage } from '../context/LanguageContext';

export const LocationGate: React.FC = () => {
  const { status, requestLocation, retryLocation, errorDetail } = useLocation();
  const { t } = useLanguage();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleAction = async () => {
    setIsRetrying(true);
    try {
      if (status === 'prompt' || status === 'checking') {
        await requestLocation();
      } else {
        await retryLocation();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const isDenied = status === 'denied';
  const isUnavailable = status === 'unavailable';
  const isTimeout = status === 'timeout';
  const isInsecure = status === 'insecure';
  const isChecking = status === 'checking' && !isRetrying;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F4F1E8] flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-md bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] p-6 sm:p-8 shadow-sm flex flex-col items-center text-center animate-fade-in space-y-5">
        {/* Leaf Emblem Header */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#2D5A36] text-white flex items-center justify-center shadow-md">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FBFAF5] border border-[#E6E1D3] flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-[#2D5A36]" />
          </span>
        </div>

        {/* Brand Tagline */}
        <div className="space-y-1">
          <span className="text-[10px] font-black tracking-widest uppercase text-[#2D5A36] font-mono">
            BHOOTECH AI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#1E2B1F] tracking-tight">
            {t('locationPermissionRequired')}
          </h2>
        </div>

        {/* Description Body */}
        <p className="text-xs sm:text-sm text-[#6B7266] leading-relaxed">
          {t('locationPermissionDesc')}
        </p>

        {/* State 1: Denied Notice & Browser Settings Instruction */}
        {isDenied && (
          <div className="w-full p-4 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-left space-y-2.5 animate-fade-in">
            <div className="flex items-center gap-2 text-[#C0392B] font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('locationMandatoryNotice')}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-[#F8B4B4]/60 text-[11px] text-[#4A1510] leading-snug space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-[#7A1F18]">
                <Lock className="w-3.5 h-3.5" />
                <span>How to enable location:</span>
              </div>
              <p className="text-[11px] text-[#5C231E]">
                {t('locationDeniedSteps')}
              </p>
            </div>
          </div>
        )}

        {/* State 2: GPS Hardware Unavailable */}
        {isUnavailable && (
          <div className="w-full p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
              <Radio className="w-4 h-4 shrink-0" />
              <span>{t('turnOnGps')}</span>
            </div>
            <p className="text-[11px] text-[#78350F] leading-snug">
              {errorDetail || 'Device location service is turned off. Please toggle on GPS location in device settings.'}
            </p>
          </div>
        )}

        {/* State 3: GPS Timeout */}
        {isTimeout && (
          <div className="w-full p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-left space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t('locationTimeout')}</span>
            </div>
            <p className="text-[11px] text-[#78350F] leading-snug">
              {errorDetail || 'Satellite positioning signal took too long. Move outdoors or near an open window and retry.'}
            </p>
          </div>
        )}

        {/* State 4: Insecure Non-HTTPS */}
        {isInsecure && (
          <div className="w-full p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-left space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 text-[#C0392B] font-bold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('secureConnectionRequired')}</span>
            </div>
            <p className="text-[11px] text-[#7A1F18]">
              Modern web browsers restrict live GPS sensors to secure HTTPS connections.
            </p>
          </div>
        )}

        {/* Primary Action Button (No Skip, No Back option) */}
        <div className="w-full pt-2">
          <button
            type="button"
            onClick={handleAction}
            disabled={isRetrying || isInsecure}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2D5A36] hover:bg-[#244027] text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {isRetrying ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{t('checkingLocation')}</span>
              </>
            ) : isDenied || isUnavailable || isTimeout ? (
              <>
                <RotateCw className="w-4 h-4" />
                <span>{t('retryLocation')}</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>{t('allowLocation')}</span>
              </>
            )}
          </button>
        </div>

        {/* Small Privacy Assured Badge */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7266] font-medium pt-1">
          <Lock className="w-3 h-3 text-[#2D5A36]" />
          <span>Used exclusively for your field satellite analysis. Never shared.</span>
        </div>
      </div>
    </div>
  );
};
