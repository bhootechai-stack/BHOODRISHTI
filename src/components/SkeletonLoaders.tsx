import React from 'react';
import { Satellite, Sparkles, RefreshCw, Store } from 'lucide-react';

/**
 * Skeleton Loader for Crop Recommendation Cards (Top 3 Dynamic Cards)
 */
export const CropCardsSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#E3E0D3]" />
          <div className="space-y-1">
            <div className="h-3 w-40 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-2.5 w-56 bg-[#EEEADF] rounded-[6px]" />
          </div>
        </div>
        <div className="h-4 w-20 bg-[#E3E0D3] rounded-[6px]" />
      </div>

      {/* 3 Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-[14px] border border-[#E6E1D3] bg-[#FBFAF5] shadow-[0_1px_3px_rgba(40,50,35,0.06)] flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-[#E3E0D3] rounded-[6px]" />
                <div className="h-4 w-12 bg-[#E3E0D3] rounded-[6px]" />
              </div>
              <div className="h-4 w-32 bg-[#E3E0D3] rounded-[6px]" />
              <div className="h-3 w-full bg-[#EEEADF] rounded-[6px]" />
              <div className="h-3 w-4/5 bg-[#EEEADF] rounded-[6px]" />
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E6E1D3]">
              <div className="flex justify-between items-center">
                <div className="h-2.5 w-16 bg-[#E3E0D3] rounded-[6px]" />
                <div className="h-2.5 w-12 bg-[#E3E0D3] rounded-[6px]" />
              </div>
              <div className="h-2 w-full bg-[#E3E0D3] rounded-full overflow-hidden">
                <div className="h-full bg-[#2D5A36] w-3/4 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-[#6B7266] font-medium">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D5A36]" />
        <span>Synthesizing Soil NPK, Micro-Climate & Nearest Mandis...</span>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Mandi Rates & Farm Schedule
 */
export const MandiRatesSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 3 Summary Metric Blocks Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-2">
            <div className="h-3 w-28 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-6 w-32 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-2.5 w-36 bg-[#EEEADF] rounded-[6px]" />
          </div>
        ))}
      </div>

      {/* Hero Mandi Spotlight Card Skeleton */}
      <div className="p-4 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#E3E0D3]" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-[#E3E0D3] rounded-[6px]" />
              <div className="h-3 w-36 bg-[#EEEADF] rounded-[6px]" />
            </div>
          </div>
          <div className="h-8 w-32 bg-[#E3E0D3] rounded-[8px]" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-2.5 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] space-y-1.5">
              <div className="h-2.5 w-20 bg-[#E3E0D3] rounded-[6px]" />
              <div className="h-4 w-24 bg-[#E3E0D3] rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>

      {/* 3 Mini Mandi Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-2">
            <div className="h-3.5 w-28 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-5 w-20 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-2.5 w-32 bg-[#EEEADF] rounded-[6px]" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-[#6B7266] font-medium">
        <Store className="w-3.5 h-3.5 animate-spin text-[#2D5A36]" />
        <span>Connecting to APMC Agmarknet live auctions...</span>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Leaf Doctor Diagnostic Results
 */
export const LeafDoctorSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Banner */}
      <div className="p-4 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D3]">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-6 w-56 bg-[#E3E0D3] rounded-[6px]" />
            <div className="h-3 w-40 bg-[#EEEADF] rounded-[6px]" />
          </div>
          <div className="h-10 w-28 bg-[#E3E0D3] rounded-[8px]" />
        </div>

        {/* Confidence metric & multi-angle grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-2.5 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] space-y-1.5">
              <div className="h-2.5 w-16 bg-[#E3E0D3] rounded-[6px]" />
              <div className="h-4 w-20 bg-[#E3E0D3] rounded-[6px]" />
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Plan Tabs Skeleton */}
      <div className="p-4 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-3">
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-[#E3E0D3] rounded-[8px]" />
          <div className="h-8 w-32 bg-[#EEEADF] rounded-[8px]" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-[#E3E0D3] rounded-[6px]" />
          <div className="h-3 w-5/6 bg-[#EEEADF] rounded-[6px]" />
          <div className="h-3 w-4/6 bg-[#EEEADF] rounded-[6px]" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 py-1 text-[11px] text-[#6B7266] font-medium">
        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#2D5A36]" />
        <span>Correlating leaf tissue lesions against ICAR pathogen models...</span>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader for Map Satellite Tiles
 */
export const MapTileSkeleton: React.FC<{ message?: string; subMessage?: string }> = ({
  message = 'Loading Sentinel-2 Multi-Spectral Imagery...',
  subMessage = 'Streaming 10m L2A surface reflectance tiles from Copernicus',
}) => {
  return (
    <div className="absolute inset-0 z-[400] pointer-events-none flex items-center justify-center bg-black/20 transition-opacity duration-200">
      <div className="bg-[#FBFAF5] border border-[#E6E1D3] rounded-[14px] px-4 py-3 shadow-[0_1px_3px_rgba(40,50,35,0.06)] flex items-center gap-3 animate-pulse max-w-sm mx-4">
        <div className="w-8 h-8 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] flex items-center justify-center shrink-0">
          <Satellite className="w-4 h-4 text-[#2D5A36] animate-spin-slow" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#1E2B1F] truncate">{message}</p>
          <p className="text-[10px] text-[#6B7266] truncate">{subMessage}</p>
        </div>
      </div>
    </div>
  );
};
