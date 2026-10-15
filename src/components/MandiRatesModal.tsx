import React from 'react';
import { X, Store, Sparkles, MapPin } from 'lucide-react';
import { FarmScheduleMandiFinder } from './FarmScheduleMandiFinder';
import { LatLng, IndianState } from '../types';
import { UserProfile } from '../services/dbApi';
import { MandiMarketQuote } from '../types/hyperLocalAdvisory';
import { useLanguage } from '../context/LanguageContext';
import { PALETTE } from '../utils/themeTokens';

interface MandiRatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LatLng;
  selectedState: IndianState;
  activeUser: UserProfile | null;
  fieldAreaAcres?: number;
  onNavigateToMandi?: (mandi: MandiMarketQuote) => void;
}

export const MandiRatesModal: React.FC<MandiRatesModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  selectedState,
  activeUser,
  fieldAreaAcres,
  onNavigateToMandi,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const isCoordsValid = Boolean(currentLocation && Number.isFinite(currentLocation.lat) && Number.isFinite(currentLocation.lng));
  if (!isCoordsValid) {
    console.error('MandiRatesModal.tsx: currentLocation coordinates are undefined or invalid:', currentLocation);
  }
  const safeLat = isCoordsValid ? currentLocation.lat : 30.901;
  const safeLng = isCoordsValid ? currentLocation.lng : 75.8573;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4 bg-black/40 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#f6fbf5] border border-[#e5e9e4] text-[#181d1a] rounded-[14px] shadow-[0_1px_3px_rgba(40,50,35,0.06)] overflow-hidden my-auto flex flex-col max-h-[92vh] transition-colors">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#f6fbf5] text-[#181d1a] border-b border-[#e5e9e4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ebefea] text-[#2f5233] flex items-center justify-center border border-[#e5e9e4]">
              <Store className="w-5 h-5 text-[#2f5233]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-[#183b1e] tracking-tight">
                  {t('mandiRates')} &amp; {t('farmSchedule')}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c4edc3] text-[#002108] border border-[#a9d1a8]">
                  APMC Grounded
                </span>
              </div>
              <p className="text-xs text-[#727970] font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#2f5233]" />
                  {selectedState}
                </span>
                <span>•</span>
                <span>GPS: {isCoordsValid ? `${currentLocation.lat.toFixed(4)}°N, ${currentLocation.lng.toFixed(4)}°E` : 'Farm Location Pending'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#ffffff] hover:bg-[#ebefea] text-[#727970] hover:text-[#181d1a] border border-[#e5e9e4] flex items-center justify-center transition-all duration-150 cursor-pointer"
            title="Close Mandi Rates"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 bg-[#ffffff]">
          <FarmScheduleMandiFinder
            pinnedLocation={{
              lat: safeLat,
              lng: safeLng,
              state: selectedState,
              district: activeUser?.district,
              tehsil: activeUser?.tehsil,
              village: activeUser?.village,
            }}
            fieldAreaAcres={fieldAreaAcres || activeUser?.totalLandAcres || 2.5}
            activeCropName={activeUser?.primaryCrop}
            onNavigateToMandi={(mandi) => {
              onClose();
              if (onNavigateToMandi) {
                onNavigateToMandi(mandi);
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-[#E5E0D3] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#6B7280] flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#2F5233] inline-block" />
            Live APMC Electronic Auction Feeds &amp; CACP MSP Benchmarks
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF8F2] hover:bg-[#E5E0D3] text-[#1F2A1F] border border-[#E5E0D3] rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer"
          >
            {t('backToMap')}
          </button>
        </div>
      </div>
    </div>
  );
};
