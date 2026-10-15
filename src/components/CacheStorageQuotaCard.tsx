import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Database,
  Store,
  Sparkles,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { offlineAgriCache, StorageQuotaInfo } from '../services/offlineAgriCache';

interface CacheStorageQuotaCardProps {
  onRefreshParent?: () => void;
  variant?: 'compact' | 'detailed';
}

export const CacheStorageQuotaCard: React.FC<CacheStorageQuotaCardProps> = ({
  onRefreshParent,
  variant = 'detailed',
}) => {
  const [quotaInfo, setQuotaInfo] = useState<StorageQuotaInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<boolean>(false);
  const [cachedKeys, setCachedKeys] = useState<string[]>([]);

  const fetchQuota = useCallback(async () => {
    setLoading(true);
    try {
      const info = await offlineAgriCache.getStorageQuota();
      setQuotaInfo(info);

      if ('caches' in window) {
        const cache = await window.caches.open('bhootech-agricultural-data-v1');
        const keys = await cache.keys();
        setCachedKeys(keys.map((k) => k.url));
      }
    } catch (e) {
      console.warn('Error fetching cache quota:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  const handleClearCache = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    setLoading(true);
    const success = await offlineAgriCache.clearAgriCache();
    setConfirmClear(false);
    if (success) {
      setActionNotice('Agricultural offline cache cleared successfully.');
      await fetchQuota();
      onRefreshParent?.();
      setTimeout(() => setActionNotice(null), 3500);
    }
    setLoading(false);
  };

  if (!quotaInfo) return null;

  return (
    <div className="bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] p-4 sm:p-5 text-[#2F3A2E] shadow-[0_1px_3px_rgba(40,50,35,0.06)] space-y-4">
      {/* Top Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1D3]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-[#2D5A36]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-[#1E2B1F] tracking-tight">
                Offline Cache API Storage Quota
              </h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#E3E8D8] text-[#2D5A36] border border-[#E6E1D3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A36]" />
                Browser Cache API
              </span>
            </div>
            <p className="text-[11px] text-[#6B7266]">
              Local device storage consumed for offline APMC mandi rates, forecasts & crop advisories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={fetchQuota}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#FBFAF5] hover:bg-[#F4F0E6] text-[#2D5A36] text-xs font-semibold border border-[#D9D4C4] transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate Storage Quota"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#2D5A36]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer border ${
              confirmClear
                ? 'bg-[#C0392B] hover:bg-[#A93226] text-white border-[#C0392B]'
                : 'bg-[#FBFAF5] hover:bg-[#F8E3E0] text-[#6B7266] hover:text-[#C0392B] border-[#D9D4C4] hover:border-[#F8B4B4]'
            }`}
            title="Clear offline agricultural cached responses"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#C0392B]" />
            <span>{confirmClear ? 'Confirm Clear?' : 'Clear Cache'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="bg-[#E3E8D8] border border-[#E6E1D3] text-[#2D5A36] text-xs px-3 py-2 rounded-[8px] flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#2D5A36] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Agri Cache Storage */}
        <div className="p-3 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Agri Cache Size</span>
            <Database className="w-3.5 h-3.5 text-[#2D5A36]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[#2D5A36] font-mono">
            {quotaInfo.agriCacheFormatted}
          </div>
          <p className="text-[10px] text-[#6B7266]">
            {quotaInfo.mandiCount + quotaInfo.advisoryCount} cached datasets
          </p>
        </div>

        {/* Metric 2: Mandi Quotes & Price Horizons */}
        <div className="p-3 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mandi Rates</span>
            <Store className="w-3.5 h-3.5 text-[#2D5A36]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.mandiFormatted}
          </div>
          <p className="text-[10px] text-[#6B7266]">
            {quotaInfo.mandiCount} APMC market quotes
          </p>
        </div>

        {/* Metric 3: Crop Advisories */}
        <div className="p-3 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Advisories</span>
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A36]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.advisoryFormatted}
          </div>
          <p className="text-[10px] text-[#6B7266]">
            {quotaInfo.advisoryCount} disease & risk models
          </p>
        </div>

        {/* Metric 4: Device Total Storage Quota */}
        <div className="p-3 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-1">
          <div className="flex items-center justify-between text-[#6B7266]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Device Quota</span>
            <Smartphone className="w-3.5 h-3.5 text-[#6B7266]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-[#1E2B1F] font-mono">
            {quotaInfo.totalQuotaFormatted}
          </div>
          <p className="text-[10px] text-[#6B7266] truncate">
            {quotaInfo.totalUsageFormatted} used ({quotaInfo.usagePercentage}%)
          </p>
        </div>
      </div>

      {/* Storage Quota Progress Bar */}
      <div className="p-3.5 bg-[#FBFAF5] rounded-[14px] border border-[#E6E1D3] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#1E2B1F] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A36]" />
            <span>Local Storage Consumption (Origin Quota)</span>
          </span>
          <span className="font-mono text-[#2D5A36] font-bold text-[11px]">
            {quotaInfo.totalUsageFormatted} / {quotaInfo.totalQuotaFormatted}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 bg-[#E3E0D3] rounded-full overflow-hidden flex">
          {/* Mandi portion */}
          <div
            style={{ width: `${Math.min(100, Math.max(8, quotaInfo.mandiCount * 12))}%` }}
            className="h-full bg-[#2D5A36] transition-all duration-300"
            title={`Mandi Rates: ${quotaInfo.mandiFormatted}`}
          />
          {/* Advisory portion */}
          <div
            style={{ width: `${Math.min(100, Math.max(6, quotaInfo.advisoryCount * 10))}%` }}
            className="h-full bg-[#2D5A36]/80 transition-all duration-300"
            title={`Crop Advisories: ${quotaInfo.advisoryFormatted}`}
          />
          {/* Static App Shell portion */}
          <div
            style={{ width: '12%' }}
            className="h-full bg-[#6B7266]/40 transition-all duration-300"
            title={`App Shell & Static Assets: ${quotaInfo.staticCacheFormatted}`}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] text-[#6B7266] pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2D5A36]" />
              <span className="text-[#1E2B1F]">Mandi Intelligence ({quotaInfo.mandiFormatted})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2D5A36]/80" />
              <span className="text-[#1E2B1F]">Crop Advisories ({quotaInfo.advisoryFormatted})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#6B7266]" />
              <span>PWA Shell</span>
            </span>
          </div>

          <span className="text-[10px] text-[#6B7266] font-mono">
            Cache: {quotaInfo.agriCacheBytes > 0 ? 'Active' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Collapsible Inspection: Cached Endpoints */}
      {cachedKeys.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowKeys(!showKeys)}
            className="text-[11px] text-[#6B7266] hover:text-[#2D5A36] flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            {showKeys ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showKeys ? 'Hide' : 'Inspect'} Cached Agricultural Request URLs ({cachedKeys.length})</span>
          </button>

          {showKeys && (
            <div className="mt-2 p-3 bg-[#FBFAF5] rounded-[8px] border border-[#D9D4C4] font-mono text-[10px] text-[#2F3A2E] space-y-1.5 max-h-36 overflow-y-auto">
              {cachedKeys.map((keyUrl, idx) => (
                <div key={idx} className="flex items-center gap-2 truncate">
                  <span className="text-[#2D5A36] font-bold">GET</span>
                  <span className="truncate text-[#6B7266]">{keyUrl.replace(window.location.origin, '')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
